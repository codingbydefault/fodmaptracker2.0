export const DEFAULT_TIME_ZONE = "Europe/Amsterdam";

export function safeTimeZone(timeZone: string | null | undefined): string {
  if (!timeZone) return DEFAULT_TIME_ZONE;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return timeZone;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

export function zonedCalendarDate(timeZone: string, now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: safeTimeZone(timeZone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addCalendarDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

export function mondayOfWeek(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return addCalendarDays(isoDate, -((weekday + 6) % 7));
}

export function weekDates(mondayIso: string): string[] {
  return Array.from({ length: 7 }, (_, index) =>
    addCalendarDays(mondayIso, index),
  );
}

export function formatCalendarDate(
  isoDate: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
  locale = "nl-NL",
): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: safeTimeZone(timeZone),
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}
