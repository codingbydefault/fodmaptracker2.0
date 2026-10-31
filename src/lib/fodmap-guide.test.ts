import { describe, expect, it } from "vitest";
import { analyzeIngredientText, stackingSignals } from "@/lib/fodmap-guide";
describe("fodmap guide", () => {
  it("flags hidden ingredients without declaring safety", () => {
    const result = analyzeIngredientText("cichoreiwortel, uienpoeder, xylitol");
    expect(result.map((x) => x.label)).toEqual(
      expect.arrayContaining([
        "ui of uienpoeder",
        "inuline, cichorei of FOS",
        "polyolzoetstof",
      ]),
    );
  });
  it("signals multiple attention points", () => {
    expect(stackingSignals("appel\nhoning\nknoflook").showWarning).toBe(true);
  });
});
