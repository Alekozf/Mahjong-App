// Finished lessons are saved in localStorage. If storage is blocked (private browsing, strict
// settings) or the data is corrupted, the app falls back to an empty record instead of crashing.

export const STORAGE_KEY = 'mahjong-companion:progress';
export const STORAGE_VERSION = 1;

export const emptyProgress = () => ({ version: STORAGE_VERSION, completed: {} });

function getStore(store) {
  if (store !== undefined) return store;
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null; // just touching localStorage can throw when it's blocked
  }
}

// Keep only lesson ids we know and dates that look right.
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

// Returns true if the save worked.
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
  // Replaying a lesson keeps the date you first finished it.
  if (progress.completed[lessonId]) return progress;
  return { ...progress, completed: { ...progress.completed, [lessonId]: now.toISOString() } };
}

// Clear the saved record, or overwrite it with an empty one if removing it fails. Returns true
// only when nothing is left saved, so a reload stays reset.
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
