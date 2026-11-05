export const ANALYTICS_CONSENT_KEY = "fodmap_analytics_consent_v1";

export type AnalyticsConsent = "accepted" | "rejected";

export function parseAnalyticsConsent(value: string | null): AnalyticsConsent | null {
  return value === "accepted" || value === "rejected" ? value : null;
}

export function validGtmContainerId(value: string | undefined): string | null {
  const id = value?.trim();
  return id && /^GTM-[A-Z0-9]+$/.test(id) ? id : null;
}
