import { describe, expect, it } from 'vitest';
import { matchRoute } from './router.js';

describe('hash routes', () => {
  it('maps the five screen types', () => {
    expect(matchRoute('').name).toBe('session');
    expect(matchRoute('#/').name).toBe('session');
    expect(matchRoute('#/session/guide').name).toBe('guide');
    expect(matchRoute('#/learn').name).toBe('learn');
    expect(matchRoute('#/learn/meet-the-tiles')).toMatchObject({ name: 'lesson', lessonId: 'meet-the-tiles' });
    expect(matchRoute('#/reference')).toMatchObject({ name: 'reference', section: null });
  });
  it('reads reference sections and the lesson to return to', () => {
    expect(matchRoute('#/reference/calls?from=try-a-guided-turn')).toMatchObject({
      name: 'reference',
      section: 'calls',
      query: { from: 'try-a-guided-turn' },
    });
  });
  it('tolerates trailing slashes and rejects unknown paths', () => {
    expect(matchRoute('#/learn/').name).toBe('learn');
    expect(matchRoute('#/nope').name).toBe('not-found');
    expect(matchRoute('#/learn/a/b').name).toBe('not-found');
  });
});
