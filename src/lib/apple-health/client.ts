import { isAppleHealthFeatureEnabled } from "@/lib/apple-health/feature";
import { iosHealthKitBridge } from "@/lib/apple-health/ios-bridge";
import type { HealthSyncClient, HealthSyncResult, HealthSyncStatus } from "@/lib/apple-health/types";

function inertClient(status: HealthSyncStatus, enabled: boolean): HealthSyncClient {
  const result: HealthSyncResult = { status, wrote: 0 };
  return {
    platform: "web",
    isFeatureEnabled: () => enabled,
    isBridgeAvailable: () => false,
    requestConsent: async () => result,
    revokeConsent: async () => result,
    writeSymptoms: async () => result,
  };
}

export interface HealthSyncOptions {
  env?: Readonly<Record<string, string | undefined>>;
  /**
   * Toekomstige iOS-bridge. Alleen gebruikt als de vlag exact "true" is
   * en `platform` "ios" is. De meegeleverde bridge in deze repository is null.
   */
  native?: HealthSyncClient | null;
}

/**
 * Geeft altijd een client terug die in deze stap geen HealthKit aanroept
 * en niets bewaart. Zonder vlag wordt een meegegeven bridge niet aangeraakt.
 */
export function createHealthSyncClient(options: HealthSyncOptions = {}): HealthSyncClient {
  const enabled = isAppleHealthFeatureEnabled(options.env);
  if (!enabled) return inertClient("disabled", false);

  const native = "native" in options ? options.native : iosHealthKitBridge;
  if (native?.platform === "ios") return native;
  return inertClient("unavailable", true);
}

export function getHealthSyncClient(): HealthSyncClient {
  return createHealthSyncClient();
}
