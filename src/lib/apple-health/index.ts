export { createHealthSyncClient, getHealthSyncClient } from "@/lib/apple-health/client";
export type { HealthSyncOptions } from "@/lib/apple-health/client";
export { isAppleHealthFeatureEnabled } from "@/lib/apple-health/feature";
export { iosHealthKitBridge } from "@/lib/apple-health/ios-bridge";
export { proposeHealthKitSeverity, symptomHealthKitMapping, SYMPTOM_HEALTHKIT_MAPPING } from "@/lib/apple-health/mapping";
export {
  HEALTHKIT_GI_CATEGORIES,
  HEALTHKIT_SEVERITIES,
} from "@/lib/apple-health/types";
export type {
  HealthKitGiCategory,
  HealthKitSeverity,
  HealthSyncClient,
  HealthSyncResult,
  HealthSyncStatus,
  SymptomHealthKitMapping,
  SymptomMappingStatus,
  SymptomSyncDraft,
} from "@/lib/apple-health/types";
