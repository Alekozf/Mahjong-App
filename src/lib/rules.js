// Working out which set some tiles make, using the MCR definitions (§3.4.12–3.4.14, §3.4.19):
// a Chow is three numbers in a row in one suit, a Pung is three identical tiles, a Kong is
// four, and a pair is two.
import { parseTile } from './tiles.js';

const identical = (tiles) => tiles.every((t) => t.suit === tiles[0].suit && t.value === tiles[0].value);

export function isPair(ids) {
  return ids.length === 2 && identical(ids.map(parseTile));
}

export function isPung(ids) {
  return ids.length === 3 && identical(ids.map(parseTile));
}

export function isKong(ids) {
  return ids.length === 4 && identical(ids.map(parseTile));
}

export function isChow(ids) {
  if (ids.length !== 3) return false;
  const tiles = ids.map(parseTile);
  if (tiles.some((t) => t.honour)) return false;
  if (!tiles.every((t) => t.suit === tiles[0].suit)) return false;
  const v = tiles.map((t) => t.value).sort((a, b) => a - b);
  return v[1] === v[0] + 1 && v[2] === v[1] + 1;
}

// Which set do these tiles make? Null if none.
export function classifySet(ids) {
  if (isChow(ids)) return 'chow';
  if (isPung(ids)) return 'pung';
  if (isKong(ids)) return 'kong';
  if (isPair(ids)) return 'pair';
  return null;
}

// Why three chosen tiles are (or aren't) a Chow: 'chow', 'honour', 'mixed-suits',
// 'not-consecutive', 'identical' or 'wrong-count'.
export function chowReason(ids) {
  if (ids.length !== 3) return 'wrong-count';
  const tiles = ids.map(parseTile);
  if (tiles.some((t) => t.honour)) return 'honour';
  if (!tiles.every((t) => t.suit === tiles[0].suit)) return 'mixed-suits';
  if (identical(tiles)) return 'identical';
  return isChow(ids) ? 'chow' : 'not-consecutive';
}

// Why three chosen tiles are (or aren't) a Pung: 'pung', 'same-number', 'chow',
// 'not-identical' or 'wrong-count'.
export function pungReason(ids) {
  if (ids.length !== 3) return 'wrong-count';
  if (isPung(ids)) return 'pung';
  if (isChow(ids)) return 'chow';
  const tiles = ids.map(parseTile);
  if (!tiles.some((t) => t.honour) && tiles.every((t) => t.value === tiles[0].value)) return 'same-number';
  return 'not-identical';
}
