export const DEFAULT_VISIT_COLLECT_URL = "https://www.codedbydefault.com/api/collect";
export const VISIT_COLLECT_SITE = "fodmap" as const;

const ID_PLACEHOLDER = ":id";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NUMERIC_ID_PATTERN = /^\d+$/;
const INVITE_CODE_PATTERN = /^[0-9a-f]{12}$/i;
const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const HYPHENATED_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)+$/;
const PUBLISHABLE_SEGMENT_PATTERN = /^[\p{L}\p{N}_.-]+$/u;
const MAX_SEGMENT_LENGTH = 80;
const MAX_PATH_LENGTH = 180;
const MAX_REFERRER_LENGTH = 300;
const PRODUCTION_VERCEL_HOST = "fodmaptracker20.vercel.app";

export type VisitCollectPayload = {
  site: typeof VISIT_COLLECT_SITE;
  path: string;
  referrer?: string;
};

export type VisitTransport = {
  sendBeacon?: (url: string, body: string) => boolean;
  fetch: (url: string, init: RequestInit) => Promise<unknown>;
};

export type VisitReportContext = {
  nodeEnv: string | undefined;
  vercelEnv: string | undefined;
  hostname: string;
  doNotTrack?: string | null;
  globalPrivacyControl?: boolean;
};

function pathnameOnly(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "/";
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      return new URL(trimmed).pathname || "/";
    } catch {
      return "/";
    }
  }
  return trimmed.split(/[?#]/, 1)[0] || "/";
}

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment).trim();
  } catch {
    return ID_PLACEHOLDER;
  }
}

function hideSegment(segments: string[], index: number) {
  if (index >= 0 && index < segments.length && segments[index]) segments[index] = ID_PLACEHOLDER;
}

function scrubKnownDynamicSegments(segments: string[]): string[] {
  const next = [...segments];
  if (next[0] === "klachten" && next[2] === "bewerken") hideSegment(next, 1);
  if (next[0] === "koppelen") hideSegment(next, 1);
  if (next[0] === "professional" && next[1] === "client") hideSegment(next, 2);
  if (next[0] === "recepten" && next[1] === "uitgelicht") hideSegment(next, 2);
  if (next[0] === "recepten" && next[2] === "bewerken") hideSegment(next, 1);
  if (next[0] === "recepten" && next[1] && next[1] !== "nieuw" && next[1] !== "uitgelicht") hideSegment(next, 1);
  if (next[0] === "voeding" && next[2] === "bewerken") hideSegment(next, 1);
  if (next[0] === "api" && next[1] === "product") hideSegment(next, 2);
  return next;
}

function looksLikeOpaqueToken(segment: string): boolean {
  if (HYPHENATED_SLUG_PATTERN.test(segment) && !/\d{4,}/.test(segment)) return false;
  if (segment.length >= 20 && /^[A-Za-z0-9_-]+$/.test(segment)) return true;
  return segment.length >= 16 && /\d/.test(segment) && /^[A-Za-z0-9_-]+$/.test(segment);
}

function looksLikeIdentifier(segment: string): boolean {
  return UUID_PATTERN.test(segment)
    || NUMERIC_ID_PATTERN.test(segment)
    || INVITE_CODE_PATTERN.test(segment)
    || JWT_PATTERN.test(segment)
    || /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(segment)
    || looksLikeOpaqueToken(segment)
    || segment.includes("@");
}

function publishableSegment(segment: string): boolean {
  return segment === ID_PLACEHOLDER
    || (segment.length > 0
      && segment.length <= MAX_SEGMENT_LENGTH
      && PUBLISHABLE_SEGMENT_PATTERN.test(segment)
      && !looksLikeIdentifier(segment));
}

export function sanitizeVisitPath(input: string): string {
  const raw = pathnameOnly(input);
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const segments = withSlash.split("/").filter(Boolean).map(decodeSegment);
  const scrubbed = scrubKnownDynamicSegments(segments).map(segment => (
    publishableSegment(segment) ? segment : ID_PLACEHOLDER
  ));
  const path = `/${scrubbed.join("/")}`;
  if (!path.startsWith("/") || path.length > MAX_PATH_LENGTH) return "/:id";
  return path;
}

export function sanitizeVisitReferrer(referrer: string): string | undefined {
  const value = referrer.trim();
  if (!value) return undefined;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return undefined;
  }
  if ((url.protocol !== "https:" && url.protocol !== "http:") || url.username || url.password) return undefined;
  const safe = `${url.origin}${sanitizeVisitPath(url.pathname)}`;
  if (safe.includes("?") || safe.includes("#") || safe.includes("@") || safe.length > MAX_REFERRER_LENGTH) return undefined;
  return safe;
}

export function buildVisitPayload(pathname: string, referrer = ""): VisitCollectPayload | null {
  const path = sanitizeVisitPath(pathname);
  if (!path.startsWith("/") || path.includes("?") || path.includes("#") || path.includes("@")) return null;
  const safeReferrer = sanitizeVisitReferrer(referrer);
  return safeReferrer
    ? { site: VISIT_COLLECT_SITE, path, referrer: safeReferrer }
    : { site: VISIT_COLLECT_SITE, path };
}

export function visitCollectUrl(configured?: string | null): string {
  const value = (configured ?? process.env.NEXT_PUBLIC_VISIT_COLLECT_URL ?? "").trim();
  if (!value) return DEFAULT_VISIT_COLLECT_URL;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return DEFAULT_VISIT_COLLECT_URL;
    const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
    return `${url.origin}${path}${url.search}`;
  } catch {
    return DEFAULT_VISIT_COLLECT_URL;
  }
}

function normalizedHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/:\d+$/, "").replace(/^\[|\]$/g, "");
}

function isLocalHostname(hostname: string): boolean {
  const host = normalizedHostname(hostname);
  return host === "localhost"
    || host === "127.0.0.1"
    || host === "::1"
    || host === "0.0.0.0"
    || host.endsWith(".local")
    || host.endsWith(".localhost");
}

function isPreviewHostname(hostname: string): boolean {
  const host = normalizedHostname(hostname);
  return host.endsWith(".vercel.app") && host !== PRODUCTION_VERCEL_HOST;
}

export function shouldReportPageView(input: VisitReportContext): boolean {
  if (input.globalPrivacyControl === true) return false;
  const doNotTrack = (input.doNotTrack ?? "").trim().toLowerCase();
  if (doNotTrack === "1" || doNotTrack === "yes") return false;
  if (input.nodeEnv !== "production") return false;
  if ((input.vercelEnv ?? "").trim().toLowerCase() !== "production") return false;
  if (!input.hostname || isLocalHostname(input.hostname) || isPreviewHostname(input.hostname)) return false;
  return true;
}

export async function deliverVisit(url: string, payload: VisitCollectPayload, transport: VisitTransport): Promise<void> {
  try {
    const body = JSON.stringify(payload);
    try {
      if (transport.sendBeacon?.(url, body) === true) return;
    } catch {
      // A missing document or a blocked beacon falls through to fetch.
    }
    await transport.fetch(url, {
      method: "POST",
      body,
      keepalive: true,
      credentials: "omit",
      mode: "cors",
    });
  } catch {
    // Counting must never surface a network or serialization error.
  }
}
