import { describe, expect, it } from 'vitest';
import { isChow, isPung, isPair, isKong, classifySet, chowReason, pungReason } from './rules.js';
import { parseTile, tileName } from './tiles.js';

describe('tiles', () => {
  it('names tiles in plain English', () => {
    expect(tileName('dots-5')).toBe('5 Dots');
    expect(tileName('wind-north')).toBe('North Wind');
    expect(tileName('dragon-white')).toBe('White Dragon');
  });
  it('rejects unknown ids so content mistakes fail loudly', () => {
    expect(() => parseTile('dots-10')).toThrow();
    expect(() => parseTile('flower-1')).toThrow();
    expect(() => parseTile('wind-up')).toThrow();
  });
});

describe('sets (MCR §3.4.12–3.4.14, §3.4.19)', () => {
  it('recognises a Chow in any order', () => {
    expect(isChow(['bamboo-3', 'bamboo-4', 'bamboo-5'])).toBe(true);
    expect(isChow(['characters-8', 'characters-6', 'characters-7'])).toBe(true);
  });
  it('rejects runs that skip, wrap, mix suits or use honours', () => {
    expect(isChow(['bamboo-2', 'bamboo-4', 'bamboo-6'])).toBe(false);
    expect(isChow(['characters-8', 'characters-9', 'characters-1'])).toBe(false);
    expect(isChow(['dots-3', 'bamboo-4', 'characters-5'])).toBe(false);
    expect(isChow(['wind-east', 'wind-south', 'wind-west'])).toBe(false);
    expect(isChow(['dots-4', 'dots-4', 'dots-4'])).toBe(false);
  });
  it('recognises Pung, Kong and pair', () => {
    expect(isPung(['dragon-red', 'dragon-red', 'dragon-red'])).toBe(true);
    expect(isPung(['dots-5', 'bamboo-5', 'characters-5'])).toBe(false);
    expect(isKong(['wind-west', 'wind-west', 'wind-west', 'wind-west'])).toBe(true);
    expect(isPair(['dots-8', 'dots-8'])).toBe(true);
    expect(isPair(['dots-8', 'dots-9'])).toBe(false);
  });
  it('classifies sets', () => {
    expect(classifySet(['dots-7', 'dots-8', 'dots-9'])).toBe('chow');
    expect(classifySet(['dots-7', 'dots-7', 'dots-7'])).toBe('pung');
    expect(classifySet(['dots-7', 'dots-7'])).toBe('pair');
    expect(classifySet(['dots-7', 'wind-east'])).toBe(null);
  });
  it('explains why a selection is not a Chow', () => {
    expect(chowReason(['characters-6', 'characters-7', 'characters-8'])).toBe('chow');
    expect(chowReason(['characters-6', 'dragon-red', 'characters-8'])).toBe('honour');
    expect(chowReason(['characters-6', 'dots-3', 'characters-8'])).toBe('mixed-suits');
    expect(chowReason(['characters-6', 'characters-8', 'characters-9'])).toBe('not-consecutive');
  });
  it('explains why a selection is not a Pung', () => {
    expect(pungReason(['wind-west', 'wind-west', 'wind-west'])).toBe('pung');
    expect(pungReason(['dots-5', 'bamboo-5', 'characters-5'])).toBe('same-number');
    expect(pungReason(['wind-west', 'dots-5', 'wind-west'])).toBe('not-identical');
  });
});
