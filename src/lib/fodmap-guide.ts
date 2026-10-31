import type { FodmapGroup, WeeklyMenuEntry } from "@/lib/types";
export const fodmapGroups: FodmapGroup[] = [
  "fructans",
  "gos",
  "lactose",
  "fructose",
  "sorbitol",
  "mannitol",
];
export const fodmapGroupNames: Record<FodmapGroup, string> = {
  fructans: "Fructanen",
  gos: "GOS",
  lactose: "Lactose",
  fructose: "Overtollige fructose",
  sorbitol: "Sorbitol",
  mannitol: "Mannitol",
};
const signals: { pattern: RegExp; label: string; group: FodmapGroup }[] = [
  {
    pattern: /\b(ui|uien|uienpoeder|onion|shallot|sjalot)\b/i,
    label: "ui of uienpoeder",
    group: "fructans",
  },
  {
    pattern: /\b(knoflook|knoflookpoeder|garlic)\b/i,
    label: "knoflook",
    group: "fructans",
  },
  {
    pattern: /\b(inuline|inulin|cichorei|chicory|fos|fructo-oligosacchar)/i,
    label: "inuline, cichorei of FOS",
    group: "fructans",
  },
  {
    pattern: /\b(honing|honey|agave|fructose[- ]?siroop|high fructose)\b/i,
    label: "fructoserijke zoetstof",
    group: "fructose",
  },
  {
    pattern: /\b(melkpoeder|melk|milk|lactose|wei|whey)\b/i,
    label: "mogelijk lactosehoudend ingrediënt",
    group: "lactose",
  },
  {
    pattern:
      /\b(sorbitol|e420|xylitol|e967|mannitol|e421|maltitol|e965|isomalt|e953)\b/i,
    label: "polyolzoetstof",
    group: "sorbitol",
  },
  {
    pattern: /\b(appel|apple|peer|pear)\b/i,
    label: "appel of peer",
    group: "sorbitol",
  },
  {
    pattern: /\b(kikkererwt|chickpea|linzen|lentil|bonen|beans)\b/i,
    label: "peulvrucht; portie en verwerking tellen",
    group: "gos",
  },
];
export function analyzeIngredientText(value: string) {
  const text = value.slice(0, 4000);
  return signals
    .filter((signal) => signal.pattern.test(text))
    .map(({ label, group }) => ({ label, group }));
}
export function ingredientLines(entries: WeeklyMenuEntry[]) {
  return entries.flatMap((entry) => {
    const recipe = entry.recipe ?? entry.curated_recipe;
    if (!recipe) return [];
    return recipe.ingredients
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => ({
        id: `${entry.id}-${index}`,
        line,
        recipe: recipe.title,
        date: entry.planned_for,
      }));
  });
}
export function stackingSignals(ingredients: string) {
  const hits = analyzeIngredientText(ingredients);
  const groups = [...new Set(hits.map((hit) => hit.group))];
  return { hits, groups, showWarning: hits.length >= 2 };
}
