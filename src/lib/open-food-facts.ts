export type ProductLookup = {
  barcode: string;
  name: string;
  brand: string;
  ingredients: string;
};

export function normalizeBarcode(value: string) {
  const barcode = value.replace(/\D/g, "");
  return barcode.length >= 8 && barcode.length <= 14 ? barcode : null;
}

export function parseOpenFoodFactsProduct(payload: unknown): ProductLookup | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as Record<string, unknown>;
  const product = data.product;
  if (!product || typeof product !== "object") return null;
  const row = product as Record<string, unknown>;
  const barcode = normalizeBarcode(String(row.code ?? data.code ?? ""));
  if (!barcode) return null;
  const ingredients = [row.ingredients_text_nl, row.ingredients_text_en, row.ingredients_text]
    .find((value) => typeof value === "string" && value.trim().length > 0);
  return {
    barcode,
    name: typeof row.product_name === "string" ? row.product_name.trim() : "",
    brand: typeof row.brands === "string" ? row.brands.trim() : "",
    ingredients: typeof ingredients === "string" ? ingredients.trim() : "",
  };
}
