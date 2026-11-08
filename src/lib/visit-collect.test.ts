import { afterEach, describe, expect, it } from "vitest";
import { privacyNotice } from "@/lib/privacy";
import {
  DEFAULT_VISIT_COLLECT_URL,
  buildVisitPayload,
  deliverVisit,
  sanitizeVisitPath,
  shouldReportPageView,
  visitCollectUrl,
  type VisitTransport,
} from "@/lib/visit-collect";

const symptomId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const production = {
  nodeEnv: "production",
  vercelEnv: "production",
  hostname: "www.fodmaptracker.eu",
};

describe("cookieless visit payload", () => {
  it("keeps public paths and strips queries, hashes and record ids", () => {
    expect(sanitizeVisitPath("/")).toBe("/");
    expect(sanitizeVisitPath("/dashboard")).toBe("/dashboard");
    expect(sanitizeVisitPath("/privacy?email=a@b.nl#token")).toBe("/privacy");
    expect(sanitizeVisitPath(`/klachten/${symptomId}/bewerken?error=buikpijn`)).toBe("/klachten/:id/bewerken");
    expect(sanitizeVisitPath("/klachten/buikpijn/bewerken")).toBe("/klachten/:id/bewerken");
    expect(sanitizeVisitPath("/koppelen/A1B2C3D4E5F6")).toBe("/koppelen/:id");
    expect(sanitizeVisitPath("/professional/client/" + symptomId)).toBe("/professional/client/:id");
    expect(sanitizeVisitPath("/recepten/nieuw")).toBe("/recepten/nieuw");
    expect(sanitizeVisitPath(`/recepten/${symptomId}`)).toBe("/recepten/:id");
    expect(sanitizeVisitPath("/voeding/42/bewerken")).toBe("/voeding/:id/bewerken");
    expect(sanitizeVisitPath("/api/product/8712345678901")).toBe("/api/product/:id");
    expect(sanitizeVisitPath("/nl/artikels/samen-bouwen-aan-fodmap-tracker")).toBe("/nl/artikels/samen-bouwen-aan-fodmap-tracker");
    expect(sanitizeVisitPath("/nl/artikels/AbCdEfGhIjKlMnOpQrStUvWx")).toBe("/nl/artikels/:id");

    const payload = buildVisitPayload(
      `https://www.fodmaptracker.eu/voeding/${symptomId}/bewerken?notitie=buikpijn`,
      `https://www.fodmaptracker.eu/klachten/${symptomId}/bewerken?error=buikpijn`,
    );
    expect(payload).toEqual({
      site: "fodmap",
      path: "/voeding/:id/bewerken",
      referrer: "https://www.fodmaptracker.eu/klachten/:id/bewerken",
    });
    expect(JSON.stringify(payload)).not.toContain(symptomId);
    expect(JSON.stringify(payload)).not.toContain("buikpijn");
    expect(JSON.stringify(payload)).not.toContain("?");
  });

  it("omits an empty or unsafe referrer", () => {
    expect(buildVisitPayload("/login", "")).toEqual({ site: "fodmap", path: "/login" });
    expect(sanitizeVisitPath("?email=a@b.nl")).toBe("/");
    expect(sanitizeVisitPath("/%")).toBe("/:id");
    expect(sanitizeVisitPath("https://[")).toBe("/");
    expect(buildVisitPayload("/login", "javascript:alert(1)")).toEqual({ site: "fodmap", path: "/login" });
    expect(buildVisitPayload("/login", "niet een url")).toEqual({ site: "fodmap", path: "/login" });
    expect(buildVisitPayload("/login", "https://user:secret@evil.example/in")).toEqual({ site: "fodmap", path: "/login" });
  });
});

describe("production gate", () => {
  it("reports only on a production deployment and honors Do Not Track and Global Privacy Control", () => {
    expect(shouldReportPageView(production)).toBe(true);
    expect(shouldReportPageView({ ...production, hostname: "fodmaptracker20.vercel.app" })).toBe(true);
    expect(shouldReportPageView({ ...production, hostname: "FODMAPTRACKER20.VERCEL.APP" })).toBe(true);
    expect(shouldReportPageView({ ...production, doNotTrack: "1" })).toBe(false);
    expect(shouldReportPageView({ ...production, doNotTrack: "yes" })).toBe(false);
    expect(shouldReportPageView({ ...production, doNotTrack: "0" })).toBe(true);
    expect(shouldReportPageView({ ...production, globalPrivacyControl: true })).toBe(false);
    expect(shouldReportPageView({ ...production, nodeEnv: "development" })).toBe(false);
    expect(shouldReportPageView({ ...production, vercelEnv: "preview" })).toBe(false);
    expect(shouldReportPageView({ ...production, vercelEnv: undefined })).toBe(false);
    expect(shouldReportPageView({ ...production, hostname: "localhost" })).toBe(false);
    expect(shouldReportPageView({ ...production, hostname: "127.0.0.1" })).toBe(false);
    expect(shouldReportPageView({ ...production, hostname: "fodmaptracker20-git-feature-team.vercel.app" })).toBe(false);
  });

  it("uses the codedbydefault endpoint unless a public https URL is configured", () => {
    const previous = process.env.NEXT_PUBLIC_VISIT_COLLECT_URL;
    delete process.env.NEXT_PUBLIC_VISIT_COLLECT_URL;
    expect(visitCollectUrl()).toBe(DEFAULT_VISIT_COLLECT_URL);
    expect(visitCollectUrl("https://collect.example/hit")).toBe("https://collect.example/hit");
    expect(visitCollectUrl("http://collect.example/hit")).toBe(DEFAULT_VISIT_COLLECT_URL);
    expect(visitCollectUrl("not a url")).toBe(DEFAULT_VISIT_COLLECT_URL);
    if (previous === undefined) delete process.env.NEXT_PUBLIC_VISIT_COLLECT_URL;
    else process.env.NEXT_PUBLIC_VISIT_COLLECT_URL = previous;
  });
});

describe("delivery", () => {
  const payload = { site: "fodmap" as const, path: "/privacy" };

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_VISIT_COLLECT_URL;
  });

  it("sends the JSON body as a string via sendBeacon and does not also fetch", async () => {
    const calls: string[] = [];
    const transport: VisitTransport = {
      sendBeacon: (url, body) => {
        calls.push(`${url} ${body}`);
        return true;
      },
      fetch: () => {
        throw new Error("fetch should not run when sendBeacon accepts the ping");
      },
    };
    await deliverVisit(DEFAULT_VISIT_COLLECT_URL, payload, transport);
    expect(calls).toEqual([`${DEFAULT_VISIT_COLLECT_URL} ${JSON.stringify(payload)}`]);
  });

  it("falls back to fetch keepalive when sendBeacon is missing or rejects the ping", async () => {
    const requests: Array<{ url: string; init: RequestInit }> = [];
    const transport: VisitTransport = {
      sendBeacon: () => false,
      fetch: (url, init) => {
        requests.push({ url, init });
        return Promise.resolve();
      },
    };
    await deliverVisit(DEFAULT_VISIT_COLLECT_URL, payload, transport);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe(DEFAULT_VISIT_COLLECT_URL);
    expect(requests[0]?.init.method).toBe("POST");
    expect(requests[0]?.init.keepalive).toBe(true);
    expect(requests[0]?.init.body).toBe(JSON.stringify(payload));
    expect(typeof requests[0]?.init.body).toBe("string");

    const failing: VisitTransport = {
      fetch: () => Promise.reject(new Error("offline")),
    };
    await expect(deliverVisit(DEFAULT_VISIT_COLLECT_URL, payload, failing)).resolves.toBeUndefined();
  });
});

describe("privacy notice", () => {
  it("marks the cookieless counter as a draft for Gomez", () => {
    const text = JSON.stringify(privacyNotice("nl"));
    expect(text).toContain("Concept voor Gomez");
    expect(text.toLowerCase()).toContain("cookieloze");
    expect(text).toContain("www.codedbydefault.com");
    expect(text).toContain("Do Not Track");
    expect(text).toContain("Global Privacy Control");
  });
});
