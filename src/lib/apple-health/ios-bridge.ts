import type { HealthSyncClient } from "@/lib/apple-health/types";

/**
 * Plug-inpunt voor een toekomstige Capacitor- of Swift-bridge naar HealthKit.
 *
 * Blijft null. Deze module importeert geen native plugin en roept geen
 * HealthKit-API aan. Een latere iOS-build kan hier een HealthSyncClient
 * met platform "ios" teruggeven, en alleen dan als de featurevlag aan staat
 * én de DPIA, de MDR-check en de goedkeuring van Gomez rond zijn.
 */
export const iosHealthKitBridge: HealthSyncClient | null = null;
