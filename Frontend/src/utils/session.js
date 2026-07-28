export const INACTIVITY_LIMIT_MS = 10 * 60 * 1000;
export const INACTIVITY_WARNING_MS = 60 * 1000;
export const LAST_ACTIVITY_KEY = "lastActivityAt";

export function markSessionActivity() {
  if (!localStorage.getItem("token")) return;
  localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
}

export function clearSessionActivity() {
  localStorage.removeItem(LAST_ACTIVITY_KEY);
}

export function startSession() {
  markSessionActivity();
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
