import Image from "next/image";
import Link from "next/link";
import { articleCopy } from "@/lib/article-copy";
import { articlePath, articlesIn, articlesPath } from "@/lib/articles";
import type { AppLanguage } from "@/lib/i18n";

export function LatestArticles({ lang = "nl", carousel = false }: { lang?: AppLanguage; carousel?: boolean }) {
  const copy = articleCopy[lang];
  const articles = carousel ? articlesIn(lang) : articlesIn(lang).slice(0, 4);
  return (
    <section style={{ marginTop: 28 }}>
      <div className="eyebrow">{copy.latestEyebrow}</div>
      <h2 className="page-title" style={{ fontSize: 32 }}>{copy.latestTitle}</h2>
      <p className="subtle" style={{ maxWidth: 560 }}>{copy.latestBody}</p>
      <div className={carousel ? "article-carousel" : "article-grid"}>
        {articles.map(article => (
          <Link className="card article-card" key={article.slug} href={articlePath(article.lang, article.slug)}>
            {article.image && (
              <span className="article-card-media">
                <Image
                  className="article-card-image"
                  src={article.image}
                  alt={article.image_alt ?? article.title}
                  fill
                  sizes="(max-width: 720px) 100vw, 380px"
                />
              </span>
            )}
            <span className="eyebrow">{article.category === "recept" ? copy.recipes : copy.guides}</span>
            <span className="section-title" style={{ display: "block", marginTop: 8 }}>{article.title}</span>
            <span className="subtle" style={{ display: "block", marginTop: 6, fontSize: 13 }}>{article.summary}</span>
          </Link>
        ))}
      </div>
      <p className="footer-note"><Link href={articlesPath(lang)} style={{ color: "var(--green)", fontWeight: 700 }}>{copy.allArticles} →</Link></p>
    </section>
  );
}
