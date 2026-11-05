import { headers } from "next/headers";
import { isArticleLanguage } from "@/lib/articles";
import { languageInfo } from "@/lib/i18n";
import { getRequestLanguage } from "@/lib/request-language";

export async function getDocumentLocale() {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  const language = isArticleLanguage(segment) ? segment : await getRequestLanguage();
  return languageInfo[language].locale;
}
