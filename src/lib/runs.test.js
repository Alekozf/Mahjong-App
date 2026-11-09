// AUD-001: saved lesson runs are untrusted input. These tests check that malformed runs are
// rebuilt or dropped individually, and that valid runs still resume exactly.
import { describe, expect, it } from 'vitest';
import { sanitiseRun, initialLessonState, lessonReducer } from './lesson.js';
import { loadRuns, RUNS_KEY } from './runs.js';
import { lessons, getLesson } from '../content/lessons.js';

const tiles = getLesson('meet-the-tiles'); // step 1: choice, answer 'b'
const combo = getLesson('build-a-combination'); // step 1: select a Chow, indexes 0, 2, 5

const store = (value) => ({ getItem: (k) => (k === RUNS_KEY ? (typeof value === 'string' ? value : JSON.stringify(value)) : null) });
const run = (lesson, actions) => actions.reduce((s, a) => lessonReducer(lesson, s, a), initialLessonState());

describe('sanitiseRun', () => {
  it('recovers the audit payload (object-valued message) without trusting it', () => {
    const r = sanitiseRun(tiles, { step: 1, status: 'wrong', message: { invalid: true } });
    expect(r).toEqual({ step: 1, answer: null, status: 'idle', message: '', finished: false, cleared: {} });
  });

  it('rebuilds feedback from content instead of saved text', () => {
    const r = sanitiseRun(tiles, { step: 1, answer: 'a', status: 'wrong', message: '<b>injected</b>' });
    expect(r.status).toBe('wrong');
    expect(r.message).toMatch(/4 Dots/);
  });

  it('rejects statuses that disagree with the answer', () => {
    expect(sanitiseRun(tiles, { step: 1, answer: 'a', status: 'correct' }).status).toBe('idle');
    expect(sanitiseRun(tiles, { step: 1, answer: 'b', status: 'wrong' }).status).toBe('idle');
    expect(sanitiseRun(tiles, { step: 1, answer: 'b', status: 'finished' }).status).toBe('idle');
  });

  it('drops answers of the wrong shape or out of range', () => {
    expect(sanitiseRun(tiles, { step: 1, answer: 'z', status: 'wrong' }).answer).toBe(null);
    expect(sanitiseRun(tiles, { step: 1, answer: ['b'], status: 'wrong' }).answer).toBe(null);
    expect(sanitiseRun(combo, { step: 1, answer: [0, 99] }).answer).toBe(null);
    expect(sanitiseRun(combo, { step: 1, answer: [0, 0, 1] }).answer).toBe(null);
    expect(sanitiseRun(combo, { step: 1, answer: [0, 1, 2, 3] }).answer).toBe(null);
    expect(sanitiseRun(combo, { step: 1, answer: [0, 1.5] }).answer).toBe(null);
    expect(sanitiseRun(combo, { step: 0, answer: 'x' }).answer).toBe(null); // explanation step takes no answer
  });

  it('keeps a valid partial selection on a select step', () => {
    expect(sanitiseRun(combo, { step: 1, answer: [0, 2] })).toMatchObject({ answer: [0, 2], status: 'idle' });
  });

  it('discards a run with an invalid step', () => {
    for (const step of [-1, 99, 1.5, '1', null]) expect(sanitiseRun(tiles, { step })).toBe(null);
    for (const raw of [null, 'x', 3, [], undefined]) expect(sanitiseRun(tiles, raw)).toBe(null);
  });

  it('keeps only cleared entries whose saved answer is correct', () => {
    const r = sanitiseRun(tiles, {
      step: 3,
      cleared: { 1: { answer: 'b', message: 'fake' }, 2: { answer: '9' }, 0: { answer: 'x' }, '01': { answer: 'b' }, foo: {}, 4: null },
    });
    expect(Object.keys(r.cleared)).toEqual(['1']);
    expect(r.cleared[1].message).toMatch(/6 Bamboo/);
  });

  it('only accepts finished when every activity was cleared on the last step', () => {
    expect(sanitiseRun(tiles, { step: 4, finished: true }).finished).toBe(false);
    const done = run(tiles, [
      { type: 'continue' },
      { type: 'select-option', id: 'b' }, { type: 'check' }, { type: 'continue' },
      { type: 'select-option', id: '5' }, { type: 'check' }, { type: 'continue' },
      { type: 'continue' },
      { type: 'select-option', id: 'c' }, { type: 'check' }, { type: 'continue' },
    ]);
    expect(done.finished).toBe(true);
    const roundTrip = sanitiseRun(tiles, JSON.parse(JSON.stringify(done)));
    expect(roundTrip).toEqual(done);
  });

  it('round-trips a valid unfinished run exactly, including answer state', () => {
    const mid = run(combo, [{ type: 'continue' }, { type: 'toggle-tile', index: 0 }, { type: 'toggle-tile', index: 1 }]);
    expect(sanitiseRun(combo, JSON.parse(JSON.stringify(mid)))).toEqual(mid);
    const wrong = run(combo, [{ type: 'continue' }, ...[0, 1, 2].map((index) => ({ type: 'toggle-tile', index })), { type: 'check' }]);
    expect(sanitiseRun(combo, JSON.parse(JSON.stringify(wrong)))).toEqual(wrong);
  });
});

describe('loadRuns', () => {
  it('recovers from the audit payload and keeps other valid runs', () => {
    const valid = run(combo, [{ type: 'continue' }]);
    const runs = loadRuns(lessons, store({
      'meet-the-tiles': { step: 1, status: 'wrong', message: { invalid: true } },
      'build-a-combination': valid,
      'try-a-guided-turn': { step: 'x' },
      unknown: { step: 0 },
    }));
    expect(runs['meet-the-tiles']).toMatchObject({ step: 1, status: 'idle', message: '' });
    expect(runs['build-a-combination']).toEqual(valid);
    expect(runs['try-a-guided-turn']).toBeUndefined();
    expect(runs.unknown).toBeUndefined();
  });

  it('returns nothing for unreadable or non-object data', () => {
    for (const v of ['{not json', '[1,2]', 'null', '"text"', '42']) expect(loadRuns(lessons, store(v))).toEqual({});
    expect(loadRuns(lessons, { getItem() { throw new Error('blocked'); } })).toEqual({});
    expect(loadRuns(lessons, null)).toEqual({});
  });
});
