import type { SymptomType } from "@/lib/types";

/**
 * Maag-darmcategorieën uit HealthKit (HKCategoryTypeIdentifier), iOS 13.6+.
 * Bron: Apple's Symptom Type Identifiers, groep Abdominal and Gastrointestinal.
 * Er is geen type voor winderigheid of FODMAP.
 */
export const HEALTHKIT_GI_CATEGORIES = [
  "abdominalCramps",
  "bloating",
  "constipation",
  "diarrhea",
  "heartburn",
  "nausea",
  "vomiting",
] as const;

export type HealthKitGiCategory = (typeof HEALTHKIT_GI_CATEGORIES)[number];

/** Labels van HKCategoryValueSeverity. Geen numerieke ruwe waarden: die schrijft deze stap niet. */
export const HEALTHKIT_SEVERITIES = [
  "notPresent",
  "mild",
  "moderate",
  "severe",
  "unspecified",
] as const;

export type HealthKitSeverity = (typeof HEALTHKIT_SEVERITIES)[number];

export type SymptomMappingStatus = "direct" | "explicit_only" | "unsupported";

export interface SymptomHealthKitMapping {
  symptomType: SymptomType;
  status: SymptomMappingStatus;
  /** Gezet bij een directe naamsmatch. Nog steeds niet schrijfbaar in deze stap. */
  category: HealthKitGiCategory | null;
  /** Categorieën die alleen na een aparte, uitdrukkelijke keuze in aanmerking komen. */
  choices: readonly HealthKitGiCategory[];
  /** Staat in deze stap altijd uit. Een directe match is geen toestemming om te schrijven. */
  automaticWrite: false;
}

export interface SymptomSyncDraft {
  symptomType: SymptomType;
  severity: number;
  experiencedAt: string;
}

export type HealthSyncStatus = "disabled" | "unavailable";

export interface HealthSyncResult {
  status: HealthSyncStatus;
  /** Aantal HealthKit-samples dat is geschreven. In deze stap altijd 0. */
  wrote: 0;
}

/**
 * Brug naar een toekomstige native implementatie.
 * De webimplementatie en de uitgeschakelde vlag voeren geen I/O uit.
 */
export interface HealthSyncClient {
  readonly platform: "web" | "ios";
  isFeatureEnabled(): boolean;
  isBridgeAvailable(): boolean;
  requestConsent(categories: readonly HealthKitGiCategory[]): Promise<HealthSyncResult>;
  revokeConsent(categories: readonly HealthKitGiCategory[]): Promise<HealthSyncResult>;
  writeSymptoms(entries: readonly SymptomSyncDraft[]): Promise<HealthSyncResult>;
}
