export const INACTIVITY_LIMIT_MS = 10 * 60 * 1000;
export const INACTIVITY_WARNING_MS = 60 * 1000;
export const LAST_ACTIVITY_KEY = "lastActivityAt";

const ACTIVITY_WRITE_THROTTLE_MS = 5000;
let lastWriteAt = 0;

export function markSessionActivity(force = false) {
  if (!localStorage.getItem("token")) return;

  const now = Date.now();
  if (!force && now - lastWriteAt < ACTIVITY_WRITE_THROTTLE_MS) return;

  lastWriteAt = now;
  localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
}

export function clearSessionActivity() {
  lastWriteAt = 0;
  localStorage.removeItem(LAST_ACTIVITY_KEY);
}

export function startSession() {
  markSessionActivity(true);
}

export function getLastActivityAt() {
  const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function isSessionExpiredByInactivity() {
  const token = localStorage.getItem("token");
  if (!token) return false;
  const lastActivityAt = getLastActivityAt();
  if (!lastActivityAt) return false;
  return Date.now() - lastActivityAt >= INACTIVITY_LIMIT_MS;
}
