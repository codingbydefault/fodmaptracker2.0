import type { DietPhase } from "@/lib/types";

const DAY_MS = 86_400_000;

function utcDate(value: string) {
  const date = value.slice(0, 10);
  return new Date(`${date}T00:00:00Z`).getTime();
}

export function eliminationSchedule(
  phase: Pick<DietPhase, "started_at" | "planned_end_at">,
  today: string,
) {
  const start = utcDate(phase.started_at);
  const fallbackEnd = start + 27 * DAY_MS;
  const end = phase.planned_end_at ? utcDate(phase.planned_end_at) : fallbackEnd;
  const plannedDays = Math.max(1, Math.round((end - start) / DAY_MS) + 1);
  const rawDay = Math.max(1, Math.floor((utcDate(today) - start) / DAY_MS) + 1);
  return {
    currentDay: Math.min(rawDay, plannedDays),
    plannedDays,
    complete: rawDay > plannedDays,
    plannedEnd: new Date(end).toISOString().slice(0, 10),
  };
}
