// In-progress lesson positions live in sessionStorage: they survive a refresh or a trip to the
// reference, but not a new visit. Failures are ignored; the app works without it.
// Each saved run is rebuilt by sanitiseRun: invalid runs are dropped one by one, valid ones kept.
import { sanitiseRun } from './lesson.js';

export const RUNS_KEY = 'mahjong-companion:runs';

function getStore(store) {
  if (store !== undefined) return store;
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

export function loadRuns(lessons, store) {
  const runs = {};
  try {
    const s = getStore(store);
    const raw = s ? s.getItem(RUNS_KEY) : null;
    const data = raw ? JSON.parse(raw) : null;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return runs;
    for (const lesson of lessons) {
      const run = sanitiseRun(lesson, data[lesson.id]);
      if (run) runs[lesson.id] = run;
    }
  } catch {
    /* unreadable: start without saved positions */
  }
  return runs;
}

export function saveRuns(runs, store) {
  try {
    getStore(store)?.setItem(RUNS_KEY, JSON.stringify(runs));
  } catch {
    /* storage unavailable: positions are kept in memory only */
  }
}
