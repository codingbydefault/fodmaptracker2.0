import { normalizeBarcode, parseOpenFoodFactsProduct } from "@/lib/open-food-facts";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const barcode = normalizeBarcode((await params).code);
  if (!barcode) return Response.json({ error: "Ongeldige barcode." }, { status: 400 });

  try {
    const fields = "code,product_name,brands,ingredients_text,ingredients_text_nl,ingredients_text_en";
    const response = await fetch(`https://world.openfoodfacts.org/api/v3/product/${barcode}.json?fields=${fields}`, {
      headers: { "User-Agent": "Fodmap-Tracker/1.0 (https://fodmaptracker20.vercel.app)" },
      next: { revalidate: 86400 },
    });
    if (response.status === 404) return Response.json({ error: "Product niet gevonden." }, { status: 404 });
    if (!response.ok) throw new Error(`Open Food Facts: ${response.status}`);
    const product = parseOpenFoodFactsProduct(await response.json());
    if (!product) return Response.json({ error: "Product niet gevonden." }, { status: 404 });
    return Response.json(product, { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
  } catch {
    return Response.json({ error: "Productinformatie is tijdelijk niet beschikbaar." }, { status: 502 });
  }
}
