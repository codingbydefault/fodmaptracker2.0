import type { Metadata, Viewport } from "next";
import { getDocumentLocale } from "@/lib/document-language";
import { isHalloweenToday } from "@/lib/seasonal";
import { siteMetadata, siteViewport } from "@/lib/site-metadata";
import "../globals.css";

export const metadata: Metadata = siteMetadata;
export const viewport: Viewport = siteViewport;

export default async function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getDocumentLocale();
  return (
    <html lang={locale}>
      <body className={isHalloweenToday() ? "halloween-theme" : undefined}>{children}</body>
    </html>
  );
}
