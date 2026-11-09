// Lesson completion saved in localStorage. Versioned, validated, and never allowed to crash the app:
// blocked storage (private modes, strict settings) or corrupted data fall back to an empty record.

export const STORAGE_KEY = 'mahjong-companion:progress';
export const STORAGE_VERSION = 1;

export const emptyProgress = () => ({ version: STORAGE_VERSION, completed: {} });

function getStore(store) {
  if (store !== undefined) return store;
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null; // Accessing localStorage itself can throw when storage is blocked.
  }
}

/** Keep only lesson ids we know about and ISO-like date strings. */
export function sanitiseProgress(data, knownIds) {
  const clean = emptyProgress();
  if (!data || typeof data !== 'object' || data.version !== STORAGE_VERSION) return clean;
  const completed = data.completed;
  if (!completed || typeof completed !== 'object' || Array.isArray(completed)) return clean;
  for (const [id, when] of Object.entries(completed)) {
    if (knownIds && !knownIds.includes(id)) continue;
    if (typeof when === 'string' && !Number.isNaN(Date.parse(when))) clean.completed[id] = when;
  }
  return clean;
}

export function loadProgress(knownIds, store) {
  const s = getStore(store);
  if (!s) return { progress: emptyProgress(), available: false };
  try {
    const raw = s.getItem(STORAGE_KEY);
    if (!raw) return { progress: emptyProgress(), available: true };
    return { progress: sanitiseProgress(JSON.parse(raw), knownIds), available: true };
  } catch {
    return { progress: emptyProgress(), available: false };
  }
}

/** Returns true when the write succeeded. */
export function saveProgress(progress, store) {
  const s = getStore(store);
  if (!s) return false;
  try {
    s.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function markComplete(progress, lessonId, now = new Date()) {
  // Replaying keeps the first completion date: replay never erases a record.
  if (progress.completed[lessonId]) return progress;
  return { ...progress, completed: { ...progress.completed, [lessonId]: now.toISOString() } };
}

/**
 * Clear the saved record. If removing it fails, overwrite it with an empty record instead.
 * Returns true only when the saved state is now genuinely empty (so a reload stays reset).
 */
export function clearProgress(store) {
  const s = getStore(store);
  if (!s) return false;
  try {
    s.removeItem(STORAGE_KEY);
    return true;
  } catch {
    try {
      s.setItem(STORAGE_KEY, JSON.stringify(emptyProgress()));
      return true;
    } catch {
      return false;
    }
  }
}
