import { describe, expect, it } from "vitest";
import type { SymptomType } from "@/lib/types";
import {
  createHealthSyncClient,
  getHealthSyncClient,
  iosHealthKitBridge,
  isAppleHealthFeatureEnabled,
  proposeHealthKitSeverity,
  SYMPTOM_HEALTHKIT_MAPPING,
  symptomHealthKitMapping,
} from "@/lib/apple-health";
import type { HealthSyncClient, SymptomSyncDraft } from "@/lib/apple-health";

const symptomTypes = Object.keys(SYMPTOM_HEALTHKIT_MAPPING) as SymptomType[];

const draft: SymptomSyncDraft = {
  symptomType: "opgeblazen",
  severity: 8,
  experiencedAt: "2026-11-14T08:00:00.000Z",
};

function throwingBridge(): HealthSyncClient {
  const fail = () => {
    throw new Error("native bridge werd aangeroepen");
  };
  return {
    platform: "ios",
    isFeatureEnabled: fail,
    isBridgeAvailable: fail,
    requestConsent: fail,
    revokeConsent: fail,
    writeSymptoms: fail,
  };
}

describe("Apple Health featurevlag", () => {
  it("staat uit zonder variabele en bij elke waarde behalve de letterlijke string true", () => {
    for (const value of [undefined, "", "false", "0", "1", "TRUE", "yes", " true"]) {
      expect(isAppleHealthFeatureEnabled({ NEXT_PUBLIC_FEATURE_APPLE_HEALTH: value })).toBe(false);
    }
    expect(isAppleHealthFeatureEnabled({})).toBe(false);
    expect(isAppleHealthFeatureEnabled({ NEXT_PUBLIC_FEATURE_APPLE_HEALTH: "true" })).toBe(true);
  });

  it("leest standaard de procesomgeving en blijft uit als de vlag daar ontbreekt", () => {
    const previous = process.env.NEXT_PUBLIC_FEATURE_APPLE_HEALTH;
    delete process.env.NEXT_PUBLIC_FEATURE_APPLE_HEALTH;
    try {
      expect(isAppleHealthFeatureEnabled()).toBe(false);
      expect(getHealthSyncClient().isFeatureEnabled()).toBe(false);
      expect(getHealthSyncClient().platform).toBe("web");
    } finally {
      if (previous === undefined) delete process.env.NEXT_PUBLIC_FEATURE_APPLE_HEALTH;
      else process.env.NEXT_PUBLIC_FEATURE_APPLE_HEALTH = previous;
    }
  });
});

describe("uitgeschakelde health-sync", () => {
  it("negeert een native bridge zolang de vlag uit staat", async () => {
    const client = createHealthSyncClient({
      env: {},
      native: throwingBridge(),
    });

    expect(client.platform).toBe("web");
    expect(client.isBridgeAvailable()).toBe(false);
    await expect(client.requestConsent(["bloating"])).resolves.toEqual({ status: "disabled", wrote: 0 });
    await expect(client.revokeConsent(["nausea"])).resolves.toEqual({ status: "disabled", wrote: 0 });
    await expect(client.writeSymptoms([draft])).resolves.toEqual({ status: "disabled", wrote: 0 });
  });

  it("schrijft ook met de vlag aan niets zolang de bridge null is", async () => {
    expect(iosHealthKitBridge).toBeNull();
    const client = createHealthSyncClient({
      env: { NEXT_PUBLIC_FEATURE_APPLE_HEALTH: "true" },
    });

    expect(client.platform).toBe("web");
    expect(client.isFeatureEnabled()).toBe(true);
    expect(client.isBridgeAvailable()).toBe(false);
    await expect(client.writeSymptoms([draft])).resolves.toEqual({ status: "unavailable", wrote: 0 });
    await expect(client.requestConsent(["heartburn"])).resolves.toEqual({ status: "unavailable", wrote: 0 });
  });

  it("geeft het iOS-plug-inpunt alleen door als de vlag aan staat", async () => {
    let writes = 0;
    const native: HealthSyncClient = {
      platform: "ios",
      isFeatureEnabled: () => true,
      isBridgeAvailable: () => true,
      requestConsent: async () => ({ status: "unavailable", wrote: 0 }),
      revokeConsent: async () => ({ status: "unavailable", wrote: 0 }),
      writeSymptoms: async () => {
        writes += 1;
        return { status: "unavailable", wrote: 0 };
      },
    };

    const enabled = createHealthSyncClient({
      env: { NEXT_PUBLIC_FEATURE_APPLE_HEALTH: "true" },
      native,
    });
    expect(enabled).toBe(native);
    await enabled.writeSymptoms([draft]);
    expect(writes).toBe(1);

    const webPlatform: HealthSyncClient = { ...native, platform: "web" };
    const rejected = createHealthSyncClient({
      env: { NEXT_PUBLIC_FEATURE_APPLE_HEALTH: "true" },
      native: webPlatform,
    });
    expect(rejected.platform).toBe("web");
    expect(rejected.isBridgeAvailable()).toBe(false);
  });
});

describe("symptoommapping", () => {
  it("dekt elk symptoomtype en schrijft er geen automatisch weg", () => {
    expect(symptomTypes).toEqual([
      "opgeblazen",
      "misselijkheid",
      "buikpijn",
      "stoelgang",
      "anders",
      "winderigheid",
    ]);

    for (const symptomType of symptomTypes) {
      const mapping = symptomHealthKitMapping(symptomType);
      expect(mapping.automaticWrite).toBe(false);
      expect(mapping.symptomType).toBe(symptomType);
    }

    expect(symptomHealthKitMapping("opgeblazen")).toMatchObject({ status: "direct", category: "bloating" });
    expect(symptomHealthKitMapping("misselijkheid")).toMatchObject({ status: "direct", category: "nausea" });
    expect(symptomHealthKitMapping("buikpijn").choices).toEqual(["abdominalCramps"]);
    expect(symptomHealthKitMapping("stoelgang").choices).toEqual(["constipation", "diarrhea"]);
    expect(symptomHealthKitMapping("stoelgang").category).toBeNull();
    expect(symptomHealthKitMapping("anders").choices).toEqual([]);
    expect(symptomHealthKitMapping("winderigheid")).toMatchObject({ status: "unsupported", category: null, choices: [] });
  });

  it("zet alleen gehele ernst 0 tot 10 om naar een HealthKit-label", () => {
    expect(proposeHealthKitSeverity(0)).toBe("notPresent");
    expect(proposeHealthKitSeverity(1)).toBe("mild");
    expect(proposeHealthKitSeverity(3)).toBe("mild");
    expect(proposeHealthKitSeverity(4)).toBe("moderate");
    expect(proposeHealthKitSeverity(6)).toBe("moderate");
    expect(proposeHealthKitSeverity(7)).toBe("severe");
    expect(proposeHealthKitSeverity(10)).toBe("severe");
    for (const value of [-1, 11, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(proposeHealthKitSeverity(value)).toBeNull();
    }
  });
});
