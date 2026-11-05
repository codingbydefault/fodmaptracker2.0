import Link from "next/link";
import { articleCopy } from "@/lib/article-copy";
import { articlesPath } from "@/lib/articles";
import type { AppLanguage } from "@/lib/i18n";

export function PublicFooter({ lang = "nl" }: { lang?: AppLanguage }) {
  const copy = articleCopy[lang];
  return (
    <footer className="footer-note">
      <Link href={articlesPath(lang)}>{copy.articles}</Link>
      {" · "}
      <Link href="/registreren">{copy.signup}</Link>
      {" · "}
      <Link href="/voorwaarden">Voorwaarden</Link>
      {" · "}
      <Link href="/privacy">Privacy</Link>
      {" · "}
      <a href="/?cookie-settings=1">Cookievoorkeuren</a>
      <br />
      <span>Gemaakt en beheerd door CodedByDefault · KvK 42171617 · btw NL005557496B77</span>
    </footer>
  );
}
