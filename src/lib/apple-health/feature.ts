const FEATURE_FLAG = "NEXT_PUBLIC_FEATURE_APPLE_HEALTH";

/**
 * Alleen de letterlijke waarde "true" zet de shell aan.
 * Afwezig, leeg, "false", "1" en "TRUE" blijven uit.
 * De variabele is publiek en geen geheim. Deze stap zet haar nergens in een deployment.
 */
export function isAppleHealthFeatureEnabled(
  env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  return env[FEATURE_FLAG] === "true";
}
