import { describe, expect, it } from 'vitest';
import { evaluate, lessonReducer, initialLessonState, isActivity } from './lesson.js';
import { lessons, getLesson } from '../content/lessons.js';
import { parseTile } from './tiles.js';
import { isChow, isPung, isPair } from './rules.js';

const run = (lesson, actions, start = initialLessonState()) => actions.reduce((s, a) => lessonReducer(lesson, s, a), start);

/** The correct action sequence for one step. */
function solve(step) {
  if (step.kind === 'choice') return [{ type: 'select-option', id: step.answer }, { type: 'check' }, { type: 'continue' }];
  if (step.kind === 'select') {
    // Find a correct combination by brute force so the test doesn't hard-code answers.
    const n = step.tiles.length;
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) {
      if (evaluate(step, [a, b, c]).correct) {
        return [{ type: 'toggle-tile', index: a }, { type: 'toggle-tile', index: b }, { type: 'toggle-tile', index: c }, { type: 'check' }, { type: 'continue' }];
      }
    }
    throw new Error(`No correct answer for ${step.title}`);
  }
  return [{ type: 'continue' }];
}

describe('lesson content integrity', () => {
  it('has three lessons with unique ids', () => {
    expect(lessons).toHaveLength(3);
    expect(new Set(lessons.map((l) => l.id)).size).toBe(3);
  });

  it('uses only valid tile ids', () => {
    const ids = [];
    for (const l of lessons) {
      ids.push(...l.illustration);
      for (const s of l.steps) {
        for (const v of [s.visual, s.display]) {
          if (v?.tiles) ids.push(...v.tiles);
          if (v?.groups) v.groups.forEach((g) => ids.push(...g.tiles));
        }
        s.options?.forEach((o) => { if (o.tile) ids.push(o.tile); if (o.tiles) ids.push(...o.tiles); });
        if (s.tiles) ids.push(...s.tiles);
      }
    }
    expect(() => ids.forEach(parseTile)).not.toThrow();
  });

  it('gives every wrong option an explanation', () => {
    for (const l of lessons) for (const s of l.steps) {
      if (s.kind !== 'choice') continue;
      expect(s.options.some((o) => o.id === s.answer), `${s.title} answer exists`).toBe(true);
      for (const o of s.options) {
        if (o.id === s.answer) continue;
        expect(evaluate(s, o.id).message, `${s.title} / ${o.id}`).toBeTruthy();
      }
    }
  });

  it('has exactly one valid set in each select activity', () => {
    for (const l of lessons) for (const s of l.steps) {
      if (s.kind !== 'select') continue;
      let count = 0;
      const n = s.tiles.length;
      for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) {
        if (evaluate(s, [a, b, c]).correct) count++;
      }
      // Duplicate tiles (three West Winds) count once as one combination of indexes.
      expect(count, s.title).toBe(1);
    }
  });

  it('has a consistent example hand in lesson 2 (four sets and a pair, 14 tiles)', () => {
    const step = getLesson('build-a-combination').steps.find((s) => s.title.startsWith('A complete hand'));
    const groups = step.visual.groups;
    expect(groups.flatMap((g) => g.tiles)).toHaveLength(14);
    const sets = groups.filter((g) => isChow(g.tiles) || isPung(g.tiles));
    const pairs = groups.filter((g) => isPair(g.tiles));
    expect(sets).toHaveLength(4);
    expect(pairs).toHaveLength(1);
    groups.forEach((g) => expect(g.label.toLowerCase()).toBe(isChow(g.tiles) ? 'chow' : isPung(g.tiles) ? 'pung' : 'pair'));
  });

  it('keeps lesson 3 tile counts consistent: 13 before the draw, 14 after', () => {
    const l = getLesson('try-a-guided-turn');
    const before = l.steps.find((s) => s.display?.type === 'hand').display.tiles;
    const after = l.steps.find((s) => s.layout === 'hand').options.map((o) => o.tile);
    expect(before).toHaveLength(13);
    expect(after).toHaveLength(14);
    // after = before + the drawn tile
    const counts = (arr) => arr.reduce((m, t) => ({ ...m, [t]: (m[t] || 0) + 1 }), {});
    const diff = { ...counts(after) };
    for (const [t, n] of Object.entries(counts(before))) diff[t] -= n;
    expect(Object.entries(diff).filter(([, n]) => n !== 0)).toEqual([['characters-5', 1]]);
    // no tile appears more than four times (MCR §3.5.5)
    Object.values(counts(after)).forEach((n) => expect(n).toBeLessThanOrEqual(4));
  });

  it('shows the post-draw hand after the correct draw, matching the discard step (AUD-006)', () => {
    const l = getLesson('try-a-guided-turn');
    const draw = l.steps.find((s) => s.display?.type === 'hand');
    const discard = l.steps.find((s) => s.layout === 'hand');
    expect(draw.displayAfter.tiles).toEqual(discard.options.map((o) => o.tile));
    expect(draw.displayAfter.tiles[draw.displayAfter.highlight]).toBe('characters-5');
    expect(draw.display.label).toMatch(/13 tiles/);
    expect(draw.displayAfter.label).toMatch(/14 tiles/);
    expect(discard.handLabel).toMatch(/14 tiles/);
    expect(discard.handLabelAfter).toMatch(/13 tiles/);
    expect(discard.options[Number(discard.answer)].tile).toBe('wind-north');
  });
});

describe('lesson progression', () => {
  it('wrong answers never advance and allow retry', () => {
    const lesson = getLesson('meet-the-tiles');
    const s1 = run(lesson, [{ type: 'continue' }]); // explanation step
    expect(s1.step).toBe(1);
    const wrong = run(lesson, [{ type: 'select-option', id: 'a' }, { type: 'check' }], s1);
    expect(wrong.status).toBe('wrong');
    expect(wrong.message).toMatch(/Dots/);
    const stuck = run(lesson, [{ type: 'continue' }], wrong);
    expect(stuck.step).toBe(1); // still on the same step
    const retried = run(lesson, [{ type: 'retry' }], wrong);
    expect(retried).toMatchObject({ status: 'idle', answer: null, step: 1 });
  });

  it('keeps correct feedback until Continue is pressed', () => {
    const lesson = getLesson('meet-the-tiles');
    const s = run(lesson, [{ type: 'continue' }, { type: 'select-option', id: 'b' }, { type: 'check' }]);
    expect(s).toMatchObject({ step: 1, status: 'correct' });
    // further selections are ignored once correct
    expect(run(lesson, [{ type: 'select-option', id: 'a' }], s).answer).toBe('b');
    expect(run(lesson, [{ type: 'continue' }], s).step).toBe(2);
  });

  it('does not check without an answer', () => {
    const lesson = getLesson('meet-the-tiles');
    const s = run(lesson, [{ type: 'continue' }, { type: 'check' }]);
    expect(s.status).toBe('idle');
  });

  it('limits a select activity to the required number of tiles', () => {
    const lesson = getLesson('build-a-combination');
    const s = run(lesson, [{ type: 'continue' }, ...[0, 1, 2, 3].map((index) => ({ type: 'toggle-tile', index }))]);
    expect(s.answer).toEqual([0, 1, 2]);
    expect(run(lesson, [{ type: 'toggle-tile', index: 1 }], s).answer).toEqual([0, 2]);
  });

  it('every lesson can be completed by correct answers, and only then', () => {
    for (const lesson of lessons) {
      let state = initialLessonState();
      lesson.steps.forEach((step, i) => {
        expect(state.step).toBe(i);
        expect(state.finished).toBe(false);
        state = run(lesson, solve(step), state);
      });
      expect(state.finished, lesson.id).toBe(true);
      expect(Object.keys(state.cleared)).toHaveLength(lesson.steps.filter(isActivity).length);
    }
  });

  it('reopens a cleared activity as answered when going back', () => {
    const lesson = getLesson('meet-the-tiles');
    const s = run(lesson, [...solve(lesson.steps[0]), ...solve(lesson.steps[1])]);
    expect(s.step).toBe(2);
    const back = run(lesson, [{ type: 'back' }], s);
    expect(back).toMatchObject({ step: 1, status: 'correct', answer: 'b' });
    expect(run(lesson, [{ type: 'continue' }], back).step).toBe(2);
  });

  it('restart returns to the first step', () => {
    const lesson = getLesson('meet-the-tiles');
    const s = run(lesson, [...solve(lesson.steps[0]), { type: 'restart' }]);
    expect(s).toEqual(initialLessonState());
  });
});
