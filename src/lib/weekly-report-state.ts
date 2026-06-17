// Helpers to control when the weekly report entry / auto-popup appears.
// Rules:
//  - Only on Mondays.
//  - Only once per ISO week (per browser, until user clears storage).

export function isoWeekKey(d = new Date()): string {
  // ISO week: shift to Thursday of current week, year + week number.
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((+tmp - +yearStart) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

const STORAGE_KEY = "goaly_weekly_report_seen";

export function isMonday(d = new Date()): boolean {
  return d.getDay() === 1;
}

export function hasSeenThisWeek(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) === isoWeekKey();
}

export function markSeenThisWeek(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, isoWeekKey());
}

/** Should we surface the weekly report entry on Home right now? */
export function shouldShowWeeklyEntry(): boolean {
  return isMonday() && !hasSeenThisWeek();
}
