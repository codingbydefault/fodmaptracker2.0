import { describe, expect, it } from "vitest";
import {
  analyzeIngredientText,
  consolidatedIngredientLines,
  stackingSignals,
} from "@/lib/fodmap-guide";
import type { WeeklyMenuEntry } from "@/lib/types";
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

  it("combines matching ingredients and converts compatible units", () => {
    const entry = (
      id: string,
      title: string,
      ingredients: string,
      date: string,
    ) =>
      ({
        id,
        planned_for: date,
        recipe: { title, ingredients },
        curated_recipe: null,
      }) as WeeklyMenuEntry;
    const result = consolidatedIngredientLines([
      entry("a", "Pasta", "500 g tomaten, gehalveerd\n1½ el olijfolie", "2026-11-02"),
      entry("b", "Soep", "0,5 kg tomaten, in blokjes\n2 el olijfolie", "2026-11-03"),
    ]);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          line: "1.000 g tomaten",
          recipe: "Pasta · Soep",
        }),
        expect.objectContaining({ line: "3,5 el olijfolie" }),
      ]),
    );
  });

  it("keeps non-numeric ingredient lines instead of guessing", () => {
    const entries = [
      {
        id: "a",
        planned_for: "2026-11-02",
        recipe: { title: "Pasta", ingredients: "Peper en zout" },
        curated_recipe: null,
      } as WeeklyMenuEntry,
    ];
    expect(consolidatedIngredientLines(entries)[0].line).toBe("Peper en zout");
  });

  it("ignores preparation descriptions when combining ingredients", () => {
    const entry = (id: string, title: string, ingredients: string) =>
      ({
        id,
        planned_for: "2026-11-02",
        recipe: { title, ingredients },
        curated_recipe: null,
      }) as WeeklyMenuEntry;
    const result = consolidatedIngredientLines([
      entry("a", "Omelet", "10 g fijne bieslook\n500 g aardappelen in stukjes"),
      entry("b", "Puree", "15 g verse bieslook, fijngehakt\n0,5 kg geschilde aardappel"),
    ]);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ line: "25 g bieslook" }),
        expect.objectContaining({ line: "1.000 g aardappelen" }),
      ]),
    );
  });
});
