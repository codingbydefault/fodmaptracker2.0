"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  buildVisitPayload,
  deliverVisit,
  shouldReportPageView,
  visitCollectUrl,
  type VisitTransport,
} from "@/lib/visit-collect";

// Cookieless production pageview ping. This stays separate from the
// consent-based VisitorTracker: no cookie, no storage id, and no query or record id.
function browserTransport(): VisitTransport | null {
  if (typeof navigator === "undefined" || typeof fetch !== "function") return null;
  const sendBeacon = typeof navigator.sendBeacon === "function"
    ? (url: string, body: string) => navigator.sendBeacon(url, body)
    : undefined;
  return { sendBeacon, fetch: (url, init) => fetch(url, init) };
}

function trackingOptOut(): { doNotTrack: string | null; globalPrivacyControl: boolean } {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };
  const legacyWindow = window as Window & { doNotTrack?: string | null };
  return {
    doNotTrack: nav.doNotTrack ?? legacyWindow.doNotTrack ?? nav.msDoNotTrack ?? null,
    globalPrivacyControl: nav.globalPrivacyControl === true,
  };
}

export function PageVisitCollector({ vercelEnv }: { vercelEnv?: string }) {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    try {
      const current = pathname?.startsWith("/") ? pathname : window.location.pathname;
      if (!current || lastPath.current === current) return;
      const privacy = trackingOptOut();
      if (!shouldReportPageView({
        nodeEnv: process.env.NODE_ENV,
        vercelEnv,
        hostname: window.location.hostname,
        doNotTrack: privacy.doNotTrack,
        globalPrivacyControl: privacy.globalPrivacyControl,
      })) return;
      const payload = buildVisitPayload(current, document.referrer);
      const transport = browserTransport();
      if (!payload || !transport) return;
      lastPath.current = current;
      void deliverVisit(visitCollectUrl(), payload, transport);
    } catch {
      // Counting must never break the page.
    }
  }, [pathname, vercelEnv]);

  return null;
}
