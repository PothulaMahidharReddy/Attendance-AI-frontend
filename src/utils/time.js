/**
 * utils/time.js
 * IST (UTC+5:30) date/time formatting helpers.
 */

const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

/** Convert a UTC ISO string to an IST Date object. */
export function toIST(isoStr) {
  if (!isoStr) return null;
  return new Date(new Date(isoStr).getTime() + IST_OFFSET_MS);
}

/** Format a UTC ISO string as IST time: "09:20:03 AM" */
export function fmtTime(isoStr) {
  const d = toIST(isoStr);
  if (!d) return 'Not Recorded';
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/** Format a UTC ISO string as IST date: "2025-07-29" */
export function fmtDate(isoStr) {
  const d = toIST(isoStr);
  if (!d) return 'N/A';
  return d.toISOString().slice(0, 10);
}

/**
 * Compute work duration between two UTC ISO strings.
 * Returns "6h 11m" or null if either is missing.
 */
export function workDuration(loginIso, logoutIso) {
  if (!loginIso || !logoutIso) return null;
  const secs = (new Date(logoutIso) - new Date(loginIso)) / 1000;
  if (secs <= 0) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return `${h}h ${m}m`;
}
