"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { useEffect, useState } from "react";
import { VisitorTracker } from "@/components/VisitorTracker";
import {
  ANALYTICS_CONSENT_KEY,
  parseAnalyticsConsent,
  validGtmContainerId,
  type AnalyticsConsent,
} from "@/lib/marketing-consent";

const gtmId = validGtmContainerId(process.env.NEXT_PUBLIC_GTM_ID);

function clearVisitorIdentifiers() {
  try { localStorage.removeItem("fodmap_tracker_visitor"); } catch { /* Storage may be blocked. */ }
  try { sessionStorage.removeItem("fodmap_tracker_session"); } catch { /* Storage may be blocked. */ }
}

// This component is rendered only by the isolated marketing root layout.
// Navigating to any public/account or patient root layout forces a full reload.
export function MarketingConsent() {
  const [ready, setReady] = useState(false);
  const [consent, setConsent] = useState<AnalyticsConsent | null>(null);
  const [showChoices, setShowChoices] = useState(false);

  useEffect(() => {
    let previous: AnalyticsConsent | null = null;
    try {
      previous = parseAnalyticsConsent(localStorage.getItem(ANALYTICS_CONSENT_KEY));
    } catch { /* Storage may be blocked. Default remains no tracking. */ }
    if (previous !== "accepted") clearVisitorIdentifiers();
    // On later visits the user may already have consented. Remove potentially
    // identifying query parameters before mounting any analytics scripts.
    const requestedPreferences = new URLSearchParams(window.location.search).has("cookie-settings");
    if (previous === "accepted" && (window.location.search || window.location.hash)) {
      window.history.replaceState(window.history.state, "", window.location.pathname);
    }
    setConsent(previous);
    setShowChoices(!previous || requestedPreferences);
    setReady(true);
  }, []);

  function choose(value: AnalyticsConsent) {
    try { localStorage.setItem(ANALYTICS_CONSENT_KEY, value); } catch { /* Still honor this choice for this page. */ }
    if (value === "rejected") clearVisitorIdentifiers();

    // Never include query parameters or fragments in third-party page URLs.
    // A URL can accidentally contain identifying information.
    window.history.replaceState(window.history.state, "", window.location.pathname);
    setConsent(value);
    setShowChoices(false);
  }

  if (!ready) return null;

  return (
    <>
      {consent === "accepted" && !showChoices && (
        <>
          <VisitorTracker />
          <Analytics beforeSend={event => {
            try {
              const url = new URL(event.url);
              return url.pathname === "/" ? { ...event, url: `${url.origin}/` } : null;
            } catch { return null; }
          }} />
          <SpeedInsights beforeSend={event => {
            try {
              const url = new URL(event.url);
              return url.pathname === "/" ? { ...event, url: `${url.origin}/`, route: "/" } : null;
            } catch { return null; }
          }} />
          {gtmId && (
            <Script id="fodmap-marketing-gtm" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});`}
            </Script>
          )}
        </>
      )}

      {showChoices ? (
        <section className="cookie-choice-panel" aria-label="Cookievoorkeuren">
          <div>
            <h2>Jouw privacy telt</h2>
            <p>
              Noodzakelijke opslag houdt de website werkend. Alleen als je toestemming geeft,
              meten we bezoeken aan deze publieke startpagina met onze bezoekersteller,
              Vercel en Google Tag Manager. We meten geen patiëntpagina’s of dagboekinhoud.
              Je kunt je keuze later aanpassen. Lees onze <a href="/privacy">privacyverklaring</a>.
            </p>
          </div>
          <div className="cookie-choice-actions">
            <button type="button" className="cookie-choice-secondary" onClick={() => choose("rejected")}>Alleen noodzakelijk</button>
            <button type="button" className="cookie-choice-primary" onClick={() => choose("accepted")}>Analytics toestaan</button>
          </div>
        </section>
      ) : (
        <a className="cookie-settings-link" href="/?cookie-settings=1">Cookievoorkeuren</a>
      )}
    </>
  );
}
