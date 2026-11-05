import { describe, expect, it } from "vitest";
import { parseAnalyticsConsent, validGtmContainerId } from "./marketing-consent";

describe("marketing analytics consent", () => {
  it("is opt-in only", () => {
    expect(parseAnalyticsConsent(null)).toBeNull();
    expect(parseAnalyticsConsent("unknown")).toBeNull();
    expect(parseAnalyticsConsent("rejected")).toBe("rejected");
    expect(parseAnalyticsConsent("accepted")).toBe("accepted");
  });

  it("rejects invalid or injectable container identifiers", () => {
    expect(validGtmContainerId(undefined)).toBeNull();
    expect(validGtmContainerId("GTM-ABC1234")).toBe("GTM-ABC1234");
    expect(validGtmContainerId("G-ABC1234")).toBeNull();
    expect(validGtmContainerId("GTM-ABC<script>")).toBeNull();
  });
});
