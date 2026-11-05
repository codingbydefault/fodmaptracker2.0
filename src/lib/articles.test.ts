import { describe, expect, it } from "vitest";
import { containsFodmapThreshold, getArticles, ingredientLine, isThresholdSentence, publicFodmapItems, renderArticleText, sanitizeArticleBody, type Article } from "@/lib/articles";

describe("published articles", () => {
  const articles = getArticles();

  it("loads 11 articles in nl, fr, de and en", () => {
    expect(new Set(articles.map(article => article.slug)).size).toBe(11);
    for (const lang of ["nl", "fr", "de", "en"] as const) {
      expect(articles.filter(article => article.lang === lang)).toHaveLength(11);
    }
    expect(articles.filter(article => article.category === "recept")).toHaveLength(24);
    expect(articles.filter(article => article.category === "gids")).toHaveLength(20);
  });

  it("shows a FODMAP status label and no number for each ingredient", () => {
    for (const article of articles.filter(item => item.category === "recept")) {
      const items = publicFodmapItems(article);
      expect(items.length).toBeGreaterThan(0);
      for (const item of items) {
        expect(`${item.name} ${item.label}`).not.toMatch(/\d/);
        expect(item).not.toHaveProperty("amount");
        expect(item).not.toHaveProperty("low_fodmap_limit");
      }
    }
  });

  it("fails if a low_fodmap_limit or another numeric threshold is rendered", () => {
    for (const article of articles) {
      const rendered = renderArticleText(article);
      expect(rendered).not.toMatch(/low_fodmap_limit/i);
      expect(rendered).not.toMatch(/fodmap_limit|serving_limit|threshold_g|numeric_limit/i);
      expect(containsFodmapThreshold(rendered)).toBe(false);
    }

    const recipe = articles.find(article => article.category === "recept" && article.lang === "nl");
    expect(recipe).toBeTruthy();
    const poisoned = {
      ...recipe!,
      summary: "Sojasaus is low tot 75 g volgens Monash.",
      body: "Een portie is low tot 40 g in de Monash-app.\n\n## Bronnen\n\n- [sojasaus tot 2 el volgens de Monash-app](https://example.com)",
      fodmap_per_serving: [{ name: "Sojasaus", amount: 14, unit: "g" as const, status: "low" as const, low_fodmap_limit: 75 }],
    } as unknown as Article;
    const rendered = renderArticleText(poisoned);
    expect(rendered).not.toMatch(/low_fodmap_limit/i);
    expect(rendered).not.toContain("low tot 75 g");
    expect(rendered).not.toContain("tot 40 g");
    expect(rendered).not.toContain("tot 2 el");
    expect(JSON.stringify(publicFodmapItems(poisoned))).not.toMatch(/\d|low_fodmap_limit/);
    expect(isThresholdSentence("Sojasaus is low tot 75 g volgens Monash.")).toBe(true);
    expect(isThresholdSentence("Bak 14 g olie in 12 tot 14 minuten.")).toBe(false);
    expect(sanitizeArticleBody(poisoned.body)).not.toContain("tot 2 el");
  });

  it("keeps recipe amounts on the ingredient card", () => {
    const recipe = articles.find(article => article.slug === "recept-low-fodmap-lumpia-shanghai" && article.lang === "nl");
    expect(recipe?.ingredients?.[0] && ingredientLine(recipe.ingredients[0], "nl")).toContain("400");
    expect(recipe?.ingredients?.[0].name).toBe("varkensgehakt");
  });
});
