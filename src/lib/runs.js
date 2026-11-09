// Where you're up to in each lesson is kept in sessionStorage, so it survives a refresh or a
// trip to the reference, but not a new visit. If storage fails the app just carries on.
// Each saved run is checked by sanitiseRun: bad ones are dropped, good ones kept.
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
    /* can't read it: start without saved positions */
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
