import { describe, expect, it } from "vitest";
import { dietJourneyStage, eliminationSchedule } from "@/lib/diet-phase";

describe("eliminationSchedule", () => {
  it("uses the personal planned end date inclusively", () => {
    const phase = { started_at: "2026-11-03", planned_end_at: "2026-11-16" };
    expect(eliminationSchedule(phase, "2026-11-10")).toEqual({
      currentDay: 8,
      plannedDays: 14,
      complete: false,
      plannedEnd: "2026-11-16",
    });
    expect(eliminationSchedule(phase, "2026-11-17").complete).toBe(true);
  });

  it("keeps 28 days as a fallback for older records", () => {
    const result = eliminationSchedule(
      { started_at: "2026-11-03", planned_end_at: null },
      "2026-11-30",
    );
    expect(result.plannedDays).toBe(28);
    expect(result.currentDay).toBe(28);
  });
});

describe("dietJourneyStage", () => {
  const empty = { hasEliminationHistory: false, hasActiveChallenge: false, toleranceCount: 0 };
  it("follows the user's saved progress", () => {
    expect(dietJourneyStage(null, empty)).toBe("not_started");
    expect(dietJourneyStage("elimination", empty)).toBe("elimination");
    expect(dietJourneyStage(null, { ...empty, hasEliminationHistory: true })).toBe("reintroduction_ready");
    expect(dietJourneyStage("reintroduction", empty)).toBe("reintroduction");
    expect(dietJourneyStage(null, { ...empty, toleranceCount: 2 })).toBe("maintenance");
  });
});
