import type { SymptomType } from "@/lib/types";
import type { HealthKitSeverity, SymptomHealthKitMapping } from "@/lib/apple-health/types";

/**
 * Voorstel, geen schrijfactie. `automaticWrite` blijft false zolang er geen
 * goedgekeurde bridge is. Vrije tekst wordt niet gelezen of geclassificeerd.
 */
export const SYMPTOM_HEALTHKIT_MAPPING = {
  opgeblazen: {
    symptomType: "opgeblazen",
    status: "direct",
    category: "bloating",
    choices: [],
    automaticWrite: false,
  },
  misselijkheid: {
    symptomType: "misselijkheid",
    status: "direct",
    category: "nausea",
    choices: [],
    automaticWrite: false,
  },
  buikpijn: {
    symptomType: "buikpijn",
    status: "explicit_only",
    category: null,
    choices: ["abdominalCramps"],
    automaticWrite: false,
  },
  stoelgang: {
    symptomType: "stoelgang",
    status: "explicit_only",
    category: null,
    choices: ["constipation", "diarrhea"],
    automaticWrite: false,
  },
  anders: {
    symptomType: "anders",
    status: "explicit_only",
    category: null,
    choices: [],
    automaticWrite: false,
  },
  winderigheid: {
    symptomType: "winderigheid",
    status: "unsupported",
    category: null,
    choices: [],
    automaticWrite: false,
  },
} as const satisfies Record<SymptomType, SymptomHealthKitMapping>;

export function symptomHealthKitMapping(symptomType: SymptomType): SymptomHealthKitMapping {
  return SYMPTOM_HEALTHKIT_MAPPING[symptomType];
}

/**
 * Voorstel om de app-schaal 0–10 later in HKCategoryValueSeverity te leggen.
 * 0 = niet aanwezig, 1–3 mild, 4–6 matig, 7–10 ernstig.
 * Ongeldige waarden geven null terug, niet "unspecified": dat is zelf ook een HealthKit-waarde.
 * Deze functie schrijft niets.
 */
export function proposeHealthKitSeverity(severity: number): HealthKitSeverity | null {
  if (!Number.isInteger(severity) || severity < 0 || severity > 10) return null;
  if (severity === 0) return "notPresent";
  if (severity <= 3) return "mild";
  if (severity <= 6) return "moderate";
  return "severe";
}
