const STORAGE_KEY = "app_notifications";
const SEEN_STORAGE_KEY = "app_seen_notifications";
const MAX_NOTIFICATIONS = 20;
const EVENT_NAME = "app:notifications-changed";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readNotifications() {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function writeNotifications(items) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: items }));
}

export function getNotifications() {
  return readNotifications();
}

export function pushNotification({ type = "info", message }) {
  if (!message) return [];

  const nextItems = [
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    },
    ...readNotifications(),
  ].slice(0, MAX_NOTIFICATIONS);

  writeNotifications(nextItems);
  return nextItems;
}

export function markAllNotificationsRead() {
  const nextItems = readNotifications().map((item) => ({ ...item, read: true }));
  writeNotifications(nextItems);
  return nextItems;
}

export function clearNotifications() {
  writeNotifications([]);
}

export function getSeenNotificationIds() {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(SEEN_STORAGE_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function markNotificationIdsSeen(ids = []) {
  if (!canUseStorage() || ids.length === 0) return getSeenNotificationIds();

  const nextIds = Array.from(new Set([...getSeenNotificationIds(), ...ids])).slice(-100);
  window.localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(nextIds));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: readNotifications() }));
  return nextIds;
}

export function subscribeToNotifications(callback) {
  const handler = (event) => {
    callback(event.detail || readNotifications());
  };

  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
