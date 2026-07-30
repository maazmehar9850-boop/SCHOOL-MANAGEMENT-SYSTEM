const store = new Map();

export function getCached(key) {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    store.delete(key);
    return null;
  }
  return hit.value;
}

export function setCached(key, value, ttlMs = 30000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export async function cachedFetch(key, fetcher, ttlMs = 30000) {
  const hit = getCached(key);
  if (hit !== null) return hit;

  const value = await fetcher();
  return setCached(key, value, ttlMs);
}

export function clearCache(prefix = "") {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (String(key).startsWith(prefix)) store.delete(key);
  }
}
