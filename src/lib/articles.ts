import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { articleCopy, fodmapStatusLabels } from "@/lib/article-copy";
import { languageInfo, languages, type AppLanguage } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

const contentRoot = path.join(process.cwd(), "content", "articles");

export const fodmapStatuses = ["low", "portie-telt", "onzeker", "vermijden", "swap"] as const;
export type FodmapStatus = (typeof fodmapStatuses)[number];

const ingredientSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  unit: z.enum(["g", "ml"]),
  note: z.string().optional(),
  group: z.string().optional(),
}).strict();

const stepSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
}).strict();

const fodmapSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  unit: z.enum(["g", "ml"]),
  status: z.enum(fodmapStatuses),
}).strict();

const articleSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  lang: z.enum(languages),
  date: z.string().min(4),
  author: z.string().min(1),
  reading_time_minutes: z.number().int().positive(),
  summary: z.string().min(1),
  tags: z.array(z.string().min(1)),
  category: z.enum(["recept", "gids", "nieuws"]),
  image: z.string().min(1).optional(),
  image_alt: z.string().min(1).optional(),
  servings: z.number().int().positive().optional(),
  prep_time: z.string().optional(),
  cook_time: z.string().optional(),
  estimated_fields: z.array(z.string()).optional(),
  ingredients: z.array(ingredientSchema).optional(),
  steps: z.array(stepSchema).optional(),
  fodmap_per_serving: z.array(fodmapSchema).optional(),
}).superRefine((value, ctx) => {
  if (value.category !== "recept") return;
  for (const key of ["servings", "prep_time", "cook_time", "ingredients", "steps", "fodmap_per_serving"] as const) {
    if (value[key] == null) ctx.addIssue({ code: "custom", path: [key], message: "Verplicht voor recepten." });
  }
});

export type Ingredient = z.infer<typeof ingredientSchema>;
export type RecipeStep = z.infer<typeof stepSchema>;
export type Article = z.infer<typeof articleSchema> & { body: string };

export type PublicFodmapItem = { name: string; status: FodmapStatus; label: string };

const perPortionHeading = /^(#{2,6})\s+.*(?:per portie|per serving|par portion|pro portion)\b/i;
const thresholdKey = /low_fodmap_limit|fodmap_limit|serving_limit|threshold_g|numeric_limit|\blimit\b\s*[:=]\s*\d/i;
const quantityThenLimit = /(?:tot|up to|jusqu['’]?à|bis|maximaal|maximum|max\.?)\s+\d+(?:[.,]\d+)?\s*(?:g|ml|el|tl|tbsp|tsp)\b[^.\n]{0,80}\b(?:monash|fodmap|low)\b/i;
const limitThenQuantity = /\b(?:monash|low(?:\s|-)?fodmap|grens|limiet|limite|grenze)\b[^.\n]{0,80}\d+(?:[.,]\d+)?\s*(?:g|ml|el|tl|tbsp|tsp)\b/i;

export function isNewsCategory(category: string) {
  return category === "gids" || category === "nieuws";
}

export function isArticleLanguage(value: string): value is AppLanguage {
  return (languages as readonly string[]).includes(value);
}

export function articlesPath(lang: AppLanguage) {
  return `/${lang}/artikels`;
}

export function articlePath(lang: AppLanguage, slug: string) {
  return `/${lang}/artikels/${slug}`;
}

export function articleUrl(lang: AppLanguage, slug?: string) {
  return `${siteUrl()}${slug ? articlePath(lang, slug) : articlesPath(lang)}`;
}

function asDateString(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  return String(value ?? "");
}

export function isThresholdSentence(sentence: string) {
  return thresholdKey.test(sentence) || quantityThenLimit.test(sentence) || limitThenQuantity.test(sentence);
}

export function stripPerPortionSection(markdown: string) {
  const lines = markdown.split("\n");
  const kept: string[] = [];
  let skipping = false;
  let skipLevel = 6;
  for (const line of lines) {
    const heading = /^(#{2,6})\s+/.exec(line);
    if (heading) {
      const level = heading[1].length;
      if (skipping && level <= skipLevel) skipping = false;
      if (!skipping && perPortionHeading.test(line)) {
        skipping = true;
        skipLevel = level;
        continue;
      }
    }
    if (!skipping) kept.push(line);
  }
  return kept.join("\n");
}

export function stripThresholdSentences(markdown: string) {
  return markdown.split("\n").map(line => {
    if (line.trim().startsWith("|") || line.trim().startsWith("#")) return line;
    const parts = line.split(/(?<=[.!?;:])\s+/);
    return parts.filter(part => !isThresholdSentence(part)).join(" ");
  }).join("\n");
}

export function sanitizeArticleBody(markdown: string) {
  return stripThresholdSentences(stripPerPortionSection(markdown)).replace(/\n{3,}/g, "\n\n").trim();
}

export function formatDuration(value: string) {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?$/.exec(value);
  if (!match) return value;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const parts: string[] = [];
  if (hours) parts.push(`${hours} h`);
  if (minutes) parts.push(`${minutes} min`);
  return parts.join(" ") || value;
}

export function formatAmount(amount: number, lang: AppLanguage) {
  return new Intl.NumberFormat(languageInfo[lang].locale, { maximumFractionDigits: 2 }).format(amount);
}

export function ingredientLine(item: Ingredient, lang: AppLanguage) {
  const amount = `${formatAmount(item.amount, lang)} ${item.unit}`;
  return item.note ? `${amount} ${item.name} (${item.note})` : `${amount} ${item.name}`;
}

export function groupIngredients(items: Ingredient[]) {
  const groups: { name: string | null; items: Ingredient[] }[] = [];
  for (const item of items) {
    const name = item.group ?? null;
    const current = groups[groups.length - 1];
    if (current && current.name === name) current.items.push(item);
    else groups.push({ name, items: [item] });
  }
  return groups;
}

export function publicFodmapItems(article: Pick<Article, "lang" | "fodmap_per_serving">): PublicFodmapItem[] {
  return (article.fodmap_per_serving ?? []).map(item => ({
    name: item.name,
    status: item.status,
    label: fodmapStatusLabels[article.lang][item.status],
  }));
}

export function recipeJsonLd(article: Article) {
  if (article.category !== "recept" || !article.ingredients || !article.steps) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: article.title,
    description: sanitizeArticleBody(article.summary),
    inLanguage: languageInfo[article.lang].locale,
    datePublished: article.date,
    author: { "@type": "Organization", name: article.author },
    recipeYield: String(article.servings),
    prepTime: article.prep_time,
    cookTime: article.cook_time,
    recipeIngredient: article.ingredients.map(item => ingredientLine(item, article.lang)),
    recipeInstructions: article.steps.map(step => ({ "@type": "HowToStep", name: step.title, text: step.text })),
    ...(article.image ? { image: article.image.startsWith("http") ? article.image : `${siteUrl()}${article.image}` } : {}),
  };
}

export function articleJsonLd(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: sanitizeArticleBody(article.summary),
    inLanguage: languageInfo[article.lang].locale,
    datePublished: article.date,
    author: { "@type": "Organization", name: article.author },
  };
}

export function renderArticleText(article: Article) {
  const copy = articleCopy[article.lang];
  const fodmap = publicFodmapItems(article).map(item => `${item.name} ${item.label}`);
  const ingredients = (article.ingredients ?? []).map(item => ingredientLine(item, article.lang));
  const steps = (article.steps ?? []).flatMap(step => [step.title, step.text]);
  const json = JSON.stringify(article.category === "recept" ? recipeJsonLd(article) : articleJsonLd(article));
  return [
    article.title,
    sanitizeArticleBody(article.summary),
    copy.disclaimer,
    ...ingredients,
    ...steps,
    ...fodmap,
    sanitizeArticleBody(article.body),
    json,
  ].join("\n");
}

export function containsFodmapThreshold(text: string) {
  if (thresholdKey.test(text)) return true;
  return text.split(/(?<=[.!?;:])\s+|\n/).some(part => isThresholdSentence(part));
}

function readArticle(filePath: string, folderSlug: string, fileLang: AppLanguage): Article {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const data = articleSchema.parse({ ...parsed.data, date: asDateString(parsed.data.date) });
  if (data.slug !== folderSlug) throw new Error(`${filePath}: slug ${data.slug} hoort bij map ${folderSlug}`);
  if (data.lang !== fileLang) throw new Error(`${filePath}: lang ${data.lang} hoort bij bestand ${fileLang}.md`);
  return { ...data, body: parsed.content };
}

let cached: Article[] | null = null;

export function getArticles(): Article[] {
  if (cached) return cached;
  const articles: Article[] = [];
  for (const folder of fs.readdirSync(contentRoot, { withFileTypes: true })) {
    if (!folder.isDirectory() || folder.name === "gen2") continue;
    for (const lang of languages) {
      const filePath = path.join(contentRoot, folder.name, `${lang}.md`);
      if (!fs.existsSync(filePath)) continue;
      articles.push(readArticle(filePath, folder.name, lang));
    }
  }
  cached = articles.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, a.lang));
  return cached;
}

export function getArticle(lang: AppLanguage, slug: string) {
  return getArticles().find(article => article.lang === lang && article.slug === slug) ?? null;
}

export function articlesIn(lang: AppLanguage) {
  return getArticles().filter(article => article.lang === lang);
}

export function translationsOf(slug: string) {
  return getArticles().filter(article => article.slug === slug);
}

export function articleParams() {
  return getArticles().map(article => ({ lang: article.lang, slug: article.slug }));
}

export function hreflangMap(slug?: string) {
  const languagesForSlug = slug ? translationsOf(slug) : languages.map(lang => ({ lang }));
  const map: Record<string, string> = {};
  for (const item of languagesForSlug) {
    map[languageInfo[item.lang].locale] = articleUrl(item.lang, slug);
  }
  map["x-default"] = articleUrl("nl", slug);
  return map;
}
