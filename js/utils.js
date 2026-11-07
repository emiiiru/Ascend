const DAY_MS = 86_400_000;

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** Local calendar date as YYYY-MM-DD (not UTC, so "today" matches the user's day). */
export function toISODate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseISODate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(fromISO, toISO) {
  return Math.round((parseISODate(toISO) - parseISODate(fromISO)) / DAY_MS);
}

const allLogs = (plans) => plans.flatMap((p) => p.log ?? []);

/** Numbers shown on the dashboard tiles. */
export function computeStats(plans, today = toISODate()) {
  const log = allLogs(plans);
  const uniqueDays = new Set(log);

  const thisWeek = log.filter((d) => {
    const diff = daysBetween(d, today);
    return diff >= 0 && diff <= 6;
  }).length;

  // Streak = consecutive days with at least one workout. If nothing is done
  // yet today, the streak is still alive and counts back from yesterday.
  let streak = 0;
  const cursor = parseISODate(today);
  if (!uniqueDays.has(toISODate(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (uniqueDays.has(toISODate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { activePlans: plans.length, total: log.length, thisWeek, streak };
}

/** Workout counts for the last 7 days (oldest first) for the dashboard chart. */
export function lastSevenDays(plans, today = toISODate()) {
  const log = allLogs(plans);
  const cursor = parseISODate(today);
  cursor.setDate(cursor.getDate() - 6);

  const days = [];
  for (let i = 0; i < 7; i += 1) {
    const iso = toISODate(cursor);
    days.push({
      iso,
      label: cursor.toLocaleDateString(undefined, { weekday: "short" }),
      count: log.filter((d) => d === iso).length,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}
