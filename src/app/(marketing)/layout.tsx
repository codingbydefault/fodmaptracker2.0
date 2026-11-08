import type { Metadata, Viewport } from "next";
import { MarketingConsent } from "@/components/MarketingConsent";
import { PageVisitCollector } from "@/components/PageVisitCollector";
import { getDocumentLocale } from "@/lib/document-language";
import { isHalloweenToday } from "@/lib/seasonal";
import { siteMetadata, siteViewport } from "@/lib/site-metadata";
import "../globals.css";

export const metadata: Metadata = siteMetadata;
export const viewport: Viewport = siteViewport;

export default async function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getDocumentLocale();
  return (
    <html lang={locale}>
      <body className={isHalloweenToday() ? "halloween-theme" : undefined}>
        <PageVisitCollector vercelEnv={process.env.VERCEL_ENV} />
        {children}
        <MarketingConsent />
      </body>
    </html>
  );
}
