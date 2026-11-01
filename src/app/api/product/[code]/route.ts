import { normalizeBarcode, parseOpenFoodFactsProduct } from "@/lib/open-food-facts";
import { createClient } from "@/lib/supabase/server";
import { optimizeUploadedImage } from "@/lib/image-processing";

const countryCode = (value: string | null) => /^[A-Z]{2}$/.test(value ?? "") ? value! : "NL";
const saveErrors = new Set([
  "De productcatalogus kon niet worden bijgewerkt.",
  "De etiketfoto kon niet privé worden opgeslagen.",
  "De foto kon niet aan het product worden gekoppeld.",
]);

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const barcode = normalizeBarcode((await params).code);
  if (!barcode) return Response.json({ error: "Ongeldige barcode." }, { status: 400 });
  const country = countryCode(new URL(request.url).searchParams.get("country")?.toUpperCase() ?? null);
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: catalogProduct } = await supabase.from("product_catalog").select("ingredients_text").eq("barcode", barcode).eq("country_code", country).maybeSingle();
    if (catalogProduct) return Response.json(
      { barcode, name: "Product herkend", brand: `Gedeelde catalogus · ${country}`, ingredients: catalogProduct.ingredients_text },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
    const fields = "code,product_name,brands,ingredients_text,ingredients_text_nl,ingredients_text_en";
    const response = await fetch(`https://world.openfoodfacts.org/api/v3/product/${barcode}.json?fields=${fields}&cc=${country.toLowerCase()}&lc=nl`, {
      headers: { "User-Agent": "Fodmap-Tracker/1.0 (https://fodmaptracker20.vercel.app)" }, next: { revalidate: 86400 },
    });
    if (response.status === 404) return Response.json({ error: "Product niet gevonden." }, { status: 404 });
    if (!response.ok) throw new Error(`Open Food Facts: ${response.status}`);
    const product = parseOpenFoodFactsProduct(await response.json());
    if (!product) return Response.json({ error: "Product niet gevonden." }, { status: 404 });
    if (user && product.ingredients) await supabase.from("product_catalog").upsert({ barcode, country_code: country, ingredients_text: product.ingredients, source: "open_food_facts", created_by: user.id }, { onConflict: "barcode,country_code", ignoreDuplicates: true });
    return Response.json(product, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
  } catch {
    return Response.json({ error: "Productinformatie is tijdelijk niet beschikbaar." }, { status: 502 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const barcode = normalizeBarcode((await params).code);
  if (!barcode) return Response.json({ error: "Ongeldige barcode." }, { status: 400 });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Log opnieuw in om dit product te bewaren." }, { status: 401 });
    const form = await request.formData();
    const photo = form.get("photo");
    const ingredients = String(form.get("ingredients") ?? "").trim();
    const country = countryCode(String(form.get("country") ?? "").toUpperCase());
    if (!(photo instanceof File) || photo.size === 0 || ingredients.length < 3 || ingredients.length > 4000) return Response.json({ error: "De foto of herkenning is niet geldig." }, { status: 400 });
    let { data: product } = await supabase.from("product_catalog").select("id").eq("barcode", barcode).eq("country_code", country).maybeSingle();
    if (!product) {
      const inserted = await supabase.from("product_catalog").insert({ barcode, country_code: country, ingredients_text: ingredients, created_by: user.id }).select("id").single();
      if (inserted.error) {
        const retry = await supabase.from("product_catalog").select("id").eq("barcode", barcode).eq("country_code", country).maybeSingle();
        if (!retry.data) throw new Error("De productcatalogus kon niet worden bijgewerkt.");
        product = retry.data;
      } else product = inserted.data;
    }
    const optimized = await optimizeUploadedImage(photo, 5 * 1024 * 1024);
    const { data: previous } = await supabase.from("product_scan_evidence").select("photo_path").eq("user_id", user.id).eq("product_id", product.id).maybeSingle();
    const photoPath = `${user.id}/${barcode}-${crypto.randomUUID()}.webp`;
    const { error: uploadError } = await supabase.storage.from("label-photos").upload(photoPath, optimized, { contentType: "image/webp", upsert: false });
    if (uploadError) throw new Error("De etiketfoto kon niet privé worden opgeslagen.");
    const { error: saveError } = await supabase.from("product_scan_evidence").upsert({ user_id: user.id, product_id: product.id, photo_path: photoPath }, { onConflict: "product_id,user_id" });
    if (saveError) { await supabase.storage.from("label-photos").remove([photoPath]); throw new Error("De foto kon niet aan het product worden gekoppeld."); }
    if (previous?.photo_path) await supabase.storage.from("label-photos").remove([previous.photo_path]);
    return Response.json({ saved: true });
  } catch (error) {
    const message = error instanceof Error && saveErrors.has(error.message) ? error.message : "Het product kon niet worden bewaard.";
    console.error("[product-save]", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: message }, { status: 500 });
  }
}
