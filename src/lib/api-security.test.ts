import { describe, expect, it } from "vitest";
import {
  FixedWindowRateLimiter,
  PayloadTooLargeError,
  isAllowedOrigin,
  readJsonBody,
  rejectOversizedBody,
} from "./api-security";

describe("API security", () => {
  it("accepts same-origin and server-side requests", () => {
    expect(isAllowedOrigin(new Request("https://app.example/api", { headers: { origin: "https://app.example" } }))).toBe(true);
    expect(isAllowedOrigin(new Request("https://app.example/api"))).toBe(true);
  });

  it("rejects cross-origin and malformed origins", () => {
    expect(isAllowedOrigin(new Request("https://app.example/api", { headers: { origin: "https://evil.example" } }))).toBe(false);
    expect(isAllowedOrigin(new Request("https://app.example/api", { headers: { origin: "not a url" } }))).toBe(false);
  });

  it("limits repeated calls and resets the window", () => {
    const limiter = new FixedWindowRateLimiter();
    expect(limiter.check("key", 2, 1_000, 1_000).allowed).toBe(true);
    expect(limiter.check("key", 2, 1_000, 1_100).allowed).toBe(true);
    expect(limiter.check("key", 2, 1_000, 1_200).allowed).toBe(false);
    expect(limiter.check("key", 2, 1_000, 2_001).allowed).toBe(true);
  });

  it("rejects declared and streamed oversized JSON", async () => {
    const declared = new Request("https://app.example/api", {
      method: "POST",
      headers: { "content-length": "101" },
      body: "{}",
    });
    expect(rejectOversizedBody(declared, 100)?.status).toBe(413);

    const streamed = new Request("https://app.example/api", { method: "POST", body: JSON.stringify({ value: "x".repeat(200) }) });
    await expect(readJsonBody(streamed, 50)).rejects.toBeInstanceOf(PayloadTooLargeError);
  });

  it("reads valid bounded JSON", async () => {
    const request = new Request("https://app.example/api", { method: "POST", body: JSON.stringify({ ok: true }) });
    await expect(readJsonBody<{ ok: boolean }>(request, 100)).resolves.toEqual({ ok: true });
  });
});
