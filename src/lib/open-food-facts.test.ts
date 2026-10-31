import { describe, expect, it } from "vitest";
import { normalizeBarcode, parseOpenFoodFactsProduct } from "./open-food-facts";

describe("Open Food Facts productgegevens", () => {
  it("normaliseert gangbare barcodes", () => {
    expect(normalizeBarcode("3017 6204 22003")).toBe("3017620422003");
    expect(normalizeBarcode("123")).toBeNull();
    expect(normalizeBarcode("123456789012345")).toBeNull();
  });

  it("geeft voorrang aan Nederlandse ingrediënten", () => {
    expect(parseOpenFoodFactsProduct({
      code: "3017620422003",
      product: { code: "3017620422003", product_name: "Test", brands: "Merk", ingredients_text_nl: "Suiker, cacao", ingredients_text_en: "Sugar, cocoa" },
    })).toEqual({ barcode: "3017620422003", name: "Test", brand: "Merk", ingredients: "Suiker, cacao" });
  });

  it("verwerkt een gevonden product zonder ingrediënten", () => {
    expect(parseOpenFoodFactsProduct({ product: { code: "3017620422003", product_name: "Test" } })?.ingredients).toBe("");
  });

  it("weigert een ongeldig antwoord", () => {
    expect(parseOpenFoodFactsProduct({ status: "failure" })).toBeNull();
  });
});
