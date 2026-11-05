import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Brand } from "@/components/Brand";
import { PublicFooter } from "@/components/PublicFooter";
import { articleCopy } from "@/lib/article-copy";
import { articlePath, articlesIn, articlesPath, articleUrl, hreflangMap, isArticleLanguage } from "@/lib/articles";
import { languageInfo, languages, type AppLanguage } from "@/lib/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return languages.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isArticleLanguage(lang)) return {};
  const copy = articleCopy[lang];
  const canonical = articleUrl(lang);
  return {
    title: copy.overviewTitle,
    description: copy.overviewBody,
    alternates: { canonical, languages: hreflangMap() },
    openGraph: {
      title: copy.overviewTitle,
      description: copy.overviewBody,
      url: canonical,
      locale: languageInfo[lang].locale.replace("-", "_"),
      type: "website",
    },
  };
}

export default async function ArticleIndexPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ categorie?: string; tag?: string }> }) {
  const { lang } = await params;
  if (!isArticleLanguage(lang)) notFound();
  const query = await searchParams;
  const copy = articleCopy[lang];
  const all = articlesIn(lang);
  const tags = [...new Set(all.flatMap(article => article.tags))].sort((a, b) => a.localeCompare(b, lang));
  const category = query.categorie === "recept" || query.categorie === "gids" ? query.categorie : "";
  const tag = query.tag && tags.includes(query.tag) ? query.tag : "";
  const articles = all.filter(article => (!category || article.category === category) && (!tag || article.tags.includes(tag)));
  return (
    <main className="app-shell" style={{ maxWidth: 980 }}>
      <Brand />
      <header style={{ margin: "28px 0 18px" }}>
        <div className="eyebrow">{copy.latestEyebrow}</div>
        <h1 className="page-title">{copy.overviewTitle}</h1>
        <p className="subtle" style={{ maxWidth: 640 }}>{copy.overviewBody}</p>
        <div className="quick-links" aria-label={copy.languages}>
          {languages.map(code => <Link key={code} href={articlesPath(code)} aria-current={code === lang ? "page" : undefined}>{languageInfo[code].label}</Link>)}
        </div>
      </header>
      <form className="card article-filters" action={articlesPath(lang)}>
        <div className="field">
          <label htmlFor="categorie">{copy.category}</label>
          <select id="categorie" name="categorie" defaultValue={category}>
            <option value="">{copy.allCategories}</option>
            <option value="gids">{copy.guides}</option>
            <option value="recept">{copy.recipes}</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="tag">{copy.tag}</label>
          <select id="tag" name="tag" defaultValue={tag}>
            <option value="">{copy.allTags}</option>
            {tags.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <button className="btn" type="submit">{copy.apply}</button>
        {(category || tag) && <Link className="btn btn-secondary" href={articlesPath(lang)}>{copy.clear}</Link>}
      </form>
      {articles.length === 0 ? <p className="card empty">{copy.empty}</p> : (
        <div className="article-grid">
          {articles.map(article => (
            <Link className="card article-card" key={article.slug} href={articlePath(lang, article.slug)}>
              <span className="eyebrow">{article.category === "recept" ? copy.recipes : copy.guides} · {article.reading_time_minutes} {copy.minutes}</span>
              <span className="section-title" style={{ display: "block", marginTop: 8 }}>{article.title}</span>
              <span className="subtle" style={{ display: "block", marginTop: 6, fontSize: 13 }}>{article.summary}</span>
              <span className="recipe-badges">{article.tags.slice(0, 3).map(item => <span className="pill" key={item}>{item}</span>)}</span>
            </Link>
          ))}
        </div>
      )}
      <section className="card" style={{ marginTop: 22 }}>
        <h2 className="section-title">{copy.trackTitle}</h2>
        <p>{copy.trackBody}</p>
        <Link className="btn" href="/registreren">{copy.signup} →</Link>
      </section>
      <PublicFooter lang={lang} />
    </main>
  );
}
