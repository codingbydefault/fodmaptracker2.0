import { describe, expect, it } from "vitest";
import { dailyPhaseTip } from "@/lib/phase-daily-tips";

describe("dailyPhaseTip", () => {
  it("offers 25 different tips per phase in a stable daily rotation", () => {
    for (const stage of ["elimination", "reintroduction", "maintenance"] as const) {
      const values = new Set(Array.from({ length: 25 }, (_, index) => {
        const date = new Date(Date.UTC(2026, 0, index + 1)).toISOString().slice(0, 10);
        return dailyPhaseTip("nl", stage, "user-1", date);
      }));
      expect(values.size).toBe(25);
    }
    expect(dailyPhaseTip("en", "elimination", "user-1", "2026-11-03"))
      .toBe(dailyPhaseTip("en", "elimination", "user-1", "2026-11-03"));
  });
});
