import { describe, expect, it } from "vitest";
import { cleanRecognizedLabelText, readableLabelText } from "@/lib/label-ocr";

describe("label OCR quality", () => {
  it("accepts a plausible ingredient list", () => {
    expect(readableLabelText("Ingrediënten: tomaat, water, basilicum, olijfolie, zout en peper.", 78)).toBe(true);
  });
  it("rejects low-confidence symbol-heavy OCR", () => {
    expect(readableLabelText("RAT : |: ¢ Pac #4 % ' iy 4 i # == 7 FAY 4 i.", 48)).toBe(false);
  });
  it("normalizes OCR spacing", () => {
    expect(cleanRecognizedLabelText("Ingrediënten  :  tomaat ,  water")).toBe("Ingrediënten: tomaat, water");
  });
});
