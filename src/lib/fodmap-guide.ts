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

export type ShoppingIngredient = {
  id: string;
  line: string;
  recipe: string;
  date: string;
};

const fractionValues: Record<string, number> = {
  "¼": 0.25,
  "½": 0.5,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};

const unitAliases: Record<string, { unit: string; multiplier: number }> = {
  g: { unit: "g", multiplier: 1 },
  gram: { unit: "g", multiplier: 1 },
  kg: { unit: "g", multiplier: 1000 },
  ml: { unit: "ml", multiplier: 1 },
  cl: { unit: "ml", multiplier: 10 },
  l: { unit: "ml", multiplier: 1000 },
  liter: { unit: "ml", multiplier: 1000 },
  tl: { unit: "tl", multiplier: 1 },
  theelepel: { unit: "tl", multiplier: 1 },
  theelepels: { unit: "tl", multiplier: 1 },
  el: { unit: "el", multiplier: 1 },
  eetlepel: { unit: "el", multiplier: 1 },
  eetlepels: { unit: "el", multiplier: 1 },
  stuk: { unit: "stuks", multiplier: 1 },
  stuks: { unit: "stuks", multiplier: 1 },
};

function parseAmount(raw: string) {
  const compact = raw.trim();
  const fraction = compact.at(-1);
  const fractionValue = fraction ? fractionValues[fraction] : undefined;
  const whole = fractionValue === undefined ? compact : compact.slice(0, -1);
  const numeric = whole ? Number(whole.replace(",", ".")) : 0;
  return Number.isFinite(numeric) ? numeric + (fractionValue ?? 0) : null;
}

function normalizeIngredientName(value: string) {
  const normalized = value
    .split(/\s+[–—]\s+|[,;(]/, 1)[0]
    .toLocaleLowerCase("nl-NL")
    .replace(
      /^(?:verse?|fijne?|fijngehakte?|fijn\s+gesneden|fijngesneden|gehakte?|gesneden|geraspte?|geschilde?|gepureerde?|gekookte?|vastkokende?)\s+/,
      "",
    )
    .replace(
      /\s+(?:in\s+(?:kleine\s+|dunne\s+|dikke\s+)?(?:stukjes|stukken|blokjes|plakjes|sneetjes|partjes|parten|reepjes|ringen)|fijngehakt|fijngesneden|gesneden|geraspt|geschild|gepureerd)$/,
      "",
    )
    .replace(/[.–—-]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const canonicalNames: Record<string, string> = {
    aardappel: "aardappelen",
    bieslook: "bieslook",
  };
  return canonicalNames[normalized] ?? normalized;
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 2 }).format(
    value,
  );
}

function formatShoppingQuantity(amount: number, unit: string) {
  if (unit === "g" && amount >= 1000) {
    return `${formatAmount(amount / 1000)} kg`;
  }
  if (unit === "ml" && amount >= 1000) {
    return `${formatAmount(amount / 1000)} l`;
  }
  return `${formatAmount(amount)} ${unit}`;
}

/**
 * Combines exact ingredient names when their units are compatible. Lines that
 * cannot be parsed are retained verbatim instead of being estimated.
 */
export function consolidatedIngredientLines(
  entries: WeeklyMenuEntry[],
): ShoppingIngredient[] {
  const parsed = ingredientLines(entries);
  const groups = new Map<
    string,
    {
      amount: number;
      unit: string;
      name: string;
      recipes: Set<string>;
      dates: string[];
    }
  >();
  const unparsedGroups = new Map<
    string,
    { line: string; recipes: Set<string>; dates: string[] }
  >();

  function addUnparsed(item: ShoppingIngredient) {
    const compact = item.line.replace(/\s+/g, " ").trim();
    const seasoning = /^(?:naar smaak\s+)?(?:peper en zout|zout en (?:zwarte )?peper)$/i.test(
      compact,
    );
    const line = seasoning ? "Peper en zout naar smaak" : compact;
    const key = line.toLocaleLowerCase("nl-NL");
    const existing = unparsedGroups.get(key) ?? {
      line,
      recipes: new Set<string>(),
      dates: [],
    };
    existing.recipes.add(item.recipe);
    existing.dates.push(item.date);
    unparsedGroups.set(key, existing);
  }

  for (const item of parsed) {
    const match = item.line.match(
      /^(\d+(?:[.,]\d+)?(?:[¼½¾⅓⅔⅛⅜⅝⅞])?|[¼½¾⅓⅔⅛⅜⅝⅞])\s*(g|gram|kg|ml|cl|l|liter|tl|theelepels?|el|eetlepels?|stuks?)?\s+(.+)$/i,
    );
    if (!match) {
      addUnparsed(item);
      continue;
    }
    const amount = parseAmount(match[1]);
    const alias = match[2]?.toLocaleLowerCase("nl-NL");
    const converted = alias
      ? unitAliases[alias]
      : { unit: "stuks", multiplier: 1 };
    const name = normalizeIngredientName(match[3]);
    if (amount === null || !converted || !name) {
      addUnparsed(item);
      continue;
    }
    const key = `${name}|${converted.unit}`;
    const existing = groups.get(key) ?? {
      amount: 0,
      unit: converted.unit,
      name,
      recipes: new Set<string>(),
      dates: [],
    };
    existing.amount += amount * converted.multiplier;
    existing.recipes.add(item.recipe);
    existing.dates.push(item.date);
    groups.set(key, existing);
  }

  const combined = [...groups.entries()].map(([key, group]) => ({
    id: `combined-${key}`,
    line: `${formatShoppingQuantity(group.amount, group.unit)} ${group.name}`,
    recipe: [...group.recipes].join(" · "),
    date: group.dates.sort()[0] ?? "",
  }));
  const unparsed = [...unparsedGroups.entries()].map(([key, group]) => ({
    id: `unparsed-${key}`,
    line: group.line,
    recipe: [...group.recipes].join(" · "),
    date: group.dates.sort()[0] ?? "",
  }));
  return [...combined, ...unparsed].sort((a, b) =>
    a.line.localeCompare(b.line, "nl-NL"),
  );
}
export function stackingSignals(ingredients: string) {
  const hits = analyzeIngredientText(ingredients);
  const groups = [...new Set(hits.map((hit) => hit.group))];
  return { hits, groups, showWarning: hits.length >= 2 };
}
