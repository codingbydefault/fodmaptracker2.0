import type { Metadata } from "next";
import { requireUser } from "@/lib/data";
import { getDocumentLocale } from "@/lib/document-language";
import { isHalloweenToday } from "@/lib/seasonal";
import { siteMetadata, siteViewport } from "@/lib/site-metadata";
import type { Viewport } from "next";
import "../globals.css";

export const metadata: Metadata = { ...siteMetadata, robots: { index: false, follow: false } };
export const viewport: Viewport = siteViewport;

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const locale = await getDocumentLocale();
  return (
    <html lang={locale}>
      <body className={isHalloweenToday() ? "halloween-theme" : undefined}>{children}</body>
    </html>
  );
}
