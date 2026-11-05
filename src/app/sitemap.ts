import type { MetadataRoute } from "next";
import { articleUrl, getArticles } from "@/lib/articles";
import { languages } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const overviews = languages.map(lang => ({ url: articleUrl(lang), changeFrequency: "weekly" as const, priority: 0.8 }));
  const articles = getArticles().map(article => ({ url: articleUrl(article.lang, article.slug), changeFrequency: "monthly" as const, priority: article.category === "recept" ? 0.7 : 0.6 }));
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    ...overviews,
    ...articles,
    { url: `${base}/registreren`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/wachtwoord-vergeten`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/voorwaarden`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/account-verwijderen`, changeFrequency: "yearly", priority: 0.4 },
  ];
}
