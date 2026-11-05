import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleMarkdown } from "@/components/ArticleMarkdown";
import { Brand } from "@/components/Brand";
import { PublicFooter } from "@/components/PublicFooter";
import { articleCopy } from "@/lib/article-copy";
import { articleParams, articlePath, articleUrl, articlesPath, formatDuration, getArticle, groupIngredients, hreflangMap, ingredientLine, isArticleLanguage, publicFodmapItems, recipeJsonLd, sanitizeArticleBody, translationsOf, type Article } from "@/lib/articles";
import { languageInfo, type AppLanguage } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return articleParams();
}

function placeholder(article: Article) {
  return article.image ?? "/articles/placeholder.svg";
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isArticleLanguage(lang)) return {};
  const article = getArticle(lang, slug);
  if (!article) return {};
  const canonical = articleUrl(lang, slug);
  const image = placeholder(article);
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical, languages: hreflangMap(slug) },
    openGraph: {
      title: article.title,
      description: article.summary,
      url: canonical,
      type: "article",
      locale: languageInfo[lang].locale.replace("-", "_"),
      images: [{ url: image.startsWith("http") ? image : `${siteUrl()}${image}`, alt: article.image_alt ?? article.title }],
    },
  };
}

function MetaValue({ approximate, children }: { approximate: boolean; children: string }) {
  return <span className="pill">{approximate ? `≈ ${children}` : children}</span>;
}

export default async function ArticlePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isArticleLanguage(lang)) notFound();
  const article = getArticle(lang, slug);
  if (!article) notFound();
  const copy = articleCopy[lang];
  const body = sanitizeArticleBody(article.body).replace(/^# .+\n+/, "");
  const json = article.category === "recept" ? recipeJsonLd(article) : null;
  const estimated = new Set(article.estimated_fields ?? []);
  return (
    <main className="app-shell article-page" style={{ maxWidth: 820 }}>
      <Brand />
      <p className="footer-note" style={{ marginTop: 18 }}><Link href={articlesPath(lang)}>← {copy.back}</Link></p>
      <img className="article-hero" src={placeholder(article)} alt={article.image_alt ?? copy.placeholderLabel} />
      <header>
        <div className="eyebrow">{article.category === "recept" ? copy.recipes : copy.guides} · {article.reading_time_minutes} {copy.minutes}</div>
        <h1 className="page-title">{article.title}</h1>
        <p className="subtle" style={{ maxWidth: 680 }}>{sanitizeArticleBody(article.summary)}</p>
        <div className="quick-links" aria-label={copy.languages}>
          {translationsOf(slug).map(item => (
            <Link key={item.lang} href={articlePath(item.lang, slug)} hrefLang={languageInfo[item.lang].locale} aria-current={item.lang === lang ? "page" : undefined}>
              {languageInfo[item.lang].label}
            </Link>
          ))}
        </div>
      </header>
      <p className="notice" role="note">{copy.disclaimer}</p>
      {article.category === "recept" && article.ingredients && article.steps && (
        <article className="recipe-sheet">
          <div className="quick-links">
            {article.servings != null && <MetaValue approximate={estimated.has("servings")}>{`${article.servings} ${copy.servings}`}</MetaValue>}
            {article.prep_time && <MetaValue approximate={estimated.has("prep_time")}>{`${formatDuration(article.prep_time)} ${copy.prep}`}</MetaValue>}
            {article.cook_time && <MetaValue approximate={estimated.has("cook_time")}>{`${formatDuration(article.cook_time)} ${copy.cook}`}</MetaValue>}
          </div>
          <section className="card">
            <h2 className="section-title">{copy.ingredients}</h2>
            {groupIngredients(article.ingredients).map(group => (
              <div key={group.name ?? "all"}>
                {group.name && <h3 className="eyebrow" style={{ marginTop: 16 }}>{group.name}</h3>}
                <ul className="ingredient-list">
                  {group.items.map(item => <li key={`${group.name ?? ""}-${item.name}-${item.amount}`}>{ingredientLine(item, lang as AppLanguage)}</li>)}
                </ul>
              </div>
            ))}
          </section>
          <section className="card">
            <h2 className="section-title">{copy.steps}</h2>
            <ol className="step-list">
              {article.steps.map(step => <li key={step.title}><strong>{step.title}</strong><p>{step.text}</p></li>)}
            </ol>
          </section>
          <section className="card">
            <h2 className="section-title">{copy.fodmap}</h2>
            <p className="subtle">{copy.fodmapNote}</p>
            <ul className="fodmap-status-list">
              {publicFodmapItems(article).map(item => (
                <li key={item.name}><span>{item.name}</span><span className={`pill status-${item.status}`}>{item.label}</span></li>
              ))}
            </ul>
          </section>
        </article>
      )}
      <ArticleMarkdown markdown={body} />
      <section className="card">
        <h2 className="section-title">{copy.trackTitle}</h2>
        <p>{copy.trackBody}</p>
        <Link className="btn" href="/registreren">{copy.signup} →</Link>
      </section>
      <PublicFooter lang={lang} />
      {json && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json).replace(/</g, "\\u003c") }} />}
    </main>
  );
}
