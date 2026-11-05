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
      <a href="/?cookie-settings=1">Cookievoorkeuren</a>
    </footer>
  );
}
