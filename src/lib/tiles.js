// Tiles. Ids look like "dots-5", "bamboo-1", "characters-9", "wind-east" or "dragon-red".
// Names and counts follow the Mahjong Competition Rules (2014, 2nd ed.), §3.5.5.

export const SUITS = ['dots', 'bamboo', 'characters'];
export const WINDS = ['east', 'south', 'west', 'north'];
export const DRAGONS = ['red', 'green', 'white'];

export const NUMERALS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
export const WIND_GLYPHS = { east: '東', south: '南', west: '西', north: '北' };
export const DRAGON_GLYPHS = { red: '中', green: '發', white: '' };

const SUIT_NAMES = { dots: 'Dots', bamboo: 'Bamboo', characters: 'Characters' };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Turn a tile id into { id, kind, suit, value, name }. Unknown ids throw, so typos in the content show up straight away.
export function parseTile(id) {
  const [kind, raw] = String(id).split('-');
  if (SUITS.includes(kind)) {
    const value = Number(raw);
    if (!Number.isInteger(value) || value < 1 || value > 9) throw new Error(`Unknown tile id: ${id}`);
    return { id, kind, suit: kind, value, honour: false, name: `${value} ${SUIT_NAMES[kind]}` };
  }
  if (kind === 'wind' && WINDS.includes(raw)) {
    return { id, kind, suit: 'wind', value: raw, honour: true, name: `${cap(raw)} Wind` };
  }
  if (kind === 'dragon' && DRAGONS.includes(raw)) {
    return { id, kind, suit: 'dragon', value: raw, honour: true, name: `${cap(raw)} Dragon` };
  }
  throw new Error(`Unknown tile id: ${id}`);
}

export const tileName = (id) => parseTile(id).name;

// Tile names as a phrase: "6 Characters, 7 Characters and 8 Characters".
export function listNames(ids) {
  const names = ids.map(tileName);
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}
