import { describe, expect, it } from 'vitest';
import { loadProgress, saveProgress, markComplete, clearProgress, sanitiseProgress, emptyProgress, STORAGE_KEY } from './storage.js';

const ids = ['meet-the-tiles', 'build-a-combination', 'try-a-guided-turn'];

function memoryStore(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: (k) => { delete data[k]; },
    data,
  };
}

const throwingStore = {
  getItem() { throw new Error('SecurityError'); },
  setItem() { throw new Error('QuotaExceededError'); },
  removeItem() { throw new Error('SecurityError'); },
};

describe('progress storage', () => {
  it('saves and reloads completion', () => {
    const store = memoryStore();
    const p = markComplete(emptyProgress(), 'meet-the-tiles', new Date('2026-11-09T10:00:00Z'));
    expect(saveProgress(p, store)).toBe(true);
    const { progress, available } = loadProgress(ids, store);
    expect(available).toBe(true);
    expect(progress.completed).toEqual({ 'meet-the-tiles': '2026-11-09T10:00:00.000Z' });
  });

  it('keeps the first completion date when a lesson is replayed', () => {
    const first = markComplete(emptyProgress(), 'meet-the-tiles', new Date('2026-11-09T10:00:00Z'));
    const again = markComplete(first, 'meet-the-tiles', new Date('2026-11-10T10:00:00Z'));
    expect(again).toBe(first);
  });

  it('reset clears the saved record', () => {
    const store = memoryStore();
    saveProgress(markComplete(emptyProgress(), 'meet-the-tiles'), store);
    expect(clearProgress(store)).toBe(true);
    expect(store.data[STORAGE_KEY]).toBeUndefined();
    expect(loadProgress(ids, store).progress).toEqual(emptyProgress());
  });

  it('survives corrupted JSON', () => {
    const store = memoryStore({ [STORAGE_KEY]: '{not json' });
    const { progress, available } = loadProgress(ids, store);
    expect(progress).toEqual(emptyProgress());
    expect(available).toBe(false);
  });

  it('ignores old versions, unknown lessons and bad dates', () => {
    expect(sanitiseProgress({ version: 0, completed: { 'meet-the-tiles': '2026-01-01' } }, ids)).toEqual(emptyProgress());
    expect(sanitiseProgress({ version: 1, completed: [] }, ids)).toEqual(emptyProgress());
    const clean = sanitiseProgress({ version: 1, completed: { 'meet-the-tiles': '2026-11-09T10:00:00Z', hacked: '2026-11-09', 'try-a-guided-turn': 'yesterday' } }, ids);
    expect(clean.completed).toEqual({ 'meet-the-tiles': '2026-11-09T10:00:00Z' });
  });

  it('falls back to overwriting the record when removal fails (AUD-004)', () => {
    const store = memoryStore();
    saveProgress(markComplete(emptyProgress(), 'meet-the-tiles'), store);
    store.removeItem = () => { throw new Error('SecurityError'); };
    expect(clearProgress(store)).toBe(true);
    expect(loadProgress(ids, store).progress).toEqual(emptyProgress()); // a reload stays reset
  });

  it('reports failure when the record can be neither removed nor overwritten (AUD-004)', () => {
    const store = memoryStore();
    saveProgress(markComplete(emptyProgress(), 'meet-the-tiles'), store);
    store.removeItem = () => { throw new Error('SecurityError'); };
    store.setItem = () => { throw new Error('QuotaExceededError'); };
    expect(clearProgress(store)).toBe(false);
    expect(loadProgress(ids, store).progress.completed).toHaveProperty('meet-the-tiles'); // still saved: UI must not claim otherwise
  });

  it('does not crash when storage is blocked', () => {
    expect(loadProgress(ids, throwingStore)).toEqual({ progress: emptyProgress(), available: false });
    expect(saveProgress(emptyProgress(), throwingStore)).toBe(false);
    expect(clearProgress(throwingStore)).toBe(false);
    expect(loadProgress(ids, null).available).toBe(false);
  });
});
