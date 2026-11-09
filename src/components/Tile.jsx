// Original SVG mahjong tiles (drawn for this project). Faces follow standard MCR tile designs:
// Dots = circles, Bamboo = sticks (1 Bamboo as a bird), Characters = numeral over 萬,
// Winds 東 南 西 北, Dragons 中 (red), 發 (green) and a framed White Dragon.
import { memo } from 'react';
import { parseTile, NUMERALS, WIND_GLYPHS, DRAGON_GLYPHS } from '../lib/tiles.js';

const C = { blue: 'var(--tile-blue)', red: 'var(--tile-red)', green: 'var(--tile-green)', ink: 'var(--tile-ink)', face: 'var(--tile-face)' };

// A dot for 2–9 Dots: the plain three-ring circle, plus a fine ivory line inside the coloured band
// that echoes the outer ring of the 1 Dots medallion (a light accent that keeps dots easy to count).
function Dot({ cx, cy, r, color }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} />
      <circle cx={cx} cy={cy} r={r * 0.83} fill="none" stroke={C.face} strokeWidth={r * 0.07} opacity="0.85" />
      <circle cx={cx} cy={cy} r={r * 0.64} fill={C.face} />
      <circle cx={cx} cy={cy} r={r * 0.34} fill={color} />
    </g>
  );
}

// Layouts: [cx, cy, colour] in the 60 x 80 tile, face centre (30, 36).
const B = C.blue, R = C.red, G = C.green;
const DOTS = {
  2: { r: 9.5, pts: [[30, 20, G], [30, 52, B]] },
  3: { r: 8.5, pts: [[16, 17, B], [30, 36, R], [44, 55, G]] },
  4: { r: 9, pts: [[18, 21, B], [42, 21, G], [18, 51, G], [42, 51, B]] },
  5: { r: 8, pts: [[17, 18, B], [43, 18, G], [30, 36, R], [17, 54, G], [43, 54, B]] },
  6: { r: 7.5, pts: [[19, 15, G], [41, 15, G], [19, 38, R], [41, 38, R], [19, 57, R], [41, 57, R]] },
  7: { r: 6.5, pts: [[15, 12, G], [30, 19, G], [45, 26, G], [19, 42, R], [41, 42, R], [19, 58, R], [41, 58, R]] },
  8: { r: 6.8, pts: [[19, 12, B], [41, 12, B], [19, 28, B], [41, 28, B], [19, 44, B], [41, 44, B], [19, 60, B], [41, 60, B]] },
  9: { r: 7, pts: [[15, 16, B], [30, 16, B], [45, 16, B], [15, 36, R], [30, 36, R], [45, 36, R], [15, 56, G], [30, 56, G], [45, 56, G]] },
};

// 1 Dots: the large ornamental circle. Outer ring, a green disc with 16 U-shaped ivory petals
// (open towards the centre), an ivory ring and a red centre with a four-petal ivory clover.
const PETAL = 'M-1.6 -10.8L-2.4 -14.4A2.4 2.4 0 0 1 2.4 -14.4L1.6 -10.8Z';
const PETAL_SLOT = 'M-0.6 -10.4V-14.2A0.6 0.6 0 0 1 0.6 -14.2V-10.4Z';
const CLOVER_LEAF = 'M0.75 0.75C0.75 3.6 1.5 5 3 5.1A2.25 2.25 0 0 0 5.1 3C5 1.5 3.6 0.75 0.75 0.75Z';

function OneDot() {
  return (
    <g transform="translate(30 36)">
      <circle r="19.8" fill="none" stroke={C.green} strokeWidth="1.3" />
      <circle r="17.9" fill={C.green} />
      {Array.from({ length: 16 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 22.5})`}>
          <path d={PETAL} fill={C.face} />
          <path d={PETAL_SLOT} fill={C.green} />
        </g>
      ))}
      <circle r="9.3" fill={C.face} />
      <circle r="7.7" fill={C.red} />
      {[0, 90, 180, 270].map((a) => <path key={a} d={CLOVER_LEAF} transform={`rotate(${a})`} fill={C.face} />)}
    </g>
  );
}

function Dots({ value }) {
  if (value === 1) return <OneDot />;
  const { r, pts } = DOTS[value];
  return <g>{pts.map(([cx, cy, col], i) => <Dot key={i} cx={cx} cy={cy} r={r} color={col} />)}</g>;
}

// Bamboo sticks are built from jointed segments, as in Alexander's reference sheet: each segment is
// waisted (flared ends, narrow middle), filled with the suit colour, outlined a shade darker, with a
// faint highlight. A "stick" is two segments stacked; 2–9 Bamboo are arrangements of sticks.
// Segments are filled with the suit colours lightened slightly (about 18% towards the tile face) so
// the sticks sit level with the Dots and Characters, and outlined in the full suit colour.
const FILL = {
  [C.green]: 'var(--tile-green-stick)',
  [C.blue]: 'var(--tile-blue-stick)',
  [C.red]: 'var(--tile-red-stick)',
};

function Segment({ x, y1, y2, color, w }) {
  const ym = (y1 + y2) / 2;
  const h = w / 2, waist = w * 0.3;
  const d = `M${x - h} ${y1}H${x + h}Q${x + waist} ${ym} ${x + h} ${y2}H${x - h}Q${x - waist} ${ym} ${x - h} ${y1}Z`;
  return (
    <g>
      <path d={d} fill={FILL[color]} stroke={color} strokeWidth={w * 0.15} strokeLinejoin="round" />
      <path d={`M${x - w * 0.14} ${y1 + 1.8}V${y2 - 1.8}`} stroke={C.face} strokeWidth={w * 0.08} strokeLinecap="round" opacity="0.45" />
    </g>
  );
}

function Stick({ x, y1, y2, color, w = 6, rot = 0, segments = 2 }) {
  const mid = (y1 + y2) / 2;
  const gap = 0.5;
  const seg = (y2 - y1 - gap * (segments - 1)) / segments;
  return (
    <g transform={rot ? `rotate(${rot} ${x} ${mid})` : undefined}>
      {Array.from({ length: segments }, (_, i) => {
        const a = y1 + i * (seg + gap);
        return <Segment key={i} x={x} y1={a} y2={a + seg} color={color} w={w} />;
      })}
    </g>
  );
}

// [x, y1, y2, colour, rotation?] — colours and arrangement follow the reference sheet.
const BAMBOO = {
  2: [[30, 6, 34, G], [30, 38, 66, B]],
  3: [[30, 6, 34, B], [18, 38, 66, G], [42, 38, 66, G]],
  4: [[18, 6, 34, G], [18, 38, 66, G], [42, 6, 34, B], [42, 38, 66, B]],
  5: [[15, 6, 34, G], [15, 38, 66, B], [45, 6, 34, G], [45, 38, 66, B], [30, 23, 49, R]],
  6: [[15, 6, 34, G], [30, 6, 34, G], [45, 6, 34, G], [15, 38, 66, B], [30, 38, 66, B], [45, 38, 66, B]],
  7: [[30, 4, 23, R], [15, 26, 45.5, G], [15, 47.5, 67, G], [30, 26, 45.5, B], [30, 47.5, 67, B], [45, 26, 45.5, G], [45, 47.5, 67, G]],
  // 8 Bamboo: uprights at each side (green above, blue below) and short jointed diagonals forming
  // a Λ above and a V below a central diamond (MCR rulebook p. 7; reference sheet).
  // Each diagonal runs (19, 30.5) to (27.5, 18.5) and mirrors: length 14.7, angle 35.3°.
  8: [
    [23.25, 17.15, 31.85, G, 35.3], [36.75, 17.15, 31.85, G, -35.3],
    [23.25, 41.15, 55.85, B, -35.3], [36.75, 41.15, 55.85, B, 35.3],
    [12.5, 6, 34, G], [47.5, 6, 34, G], [12.5, 38, 66, B], [47.5, 38, 66, B],
  ],
  9: [
    [15, 4, 24, B], [15, 26, 46, B], [15, 48, 68, B],
    [30, 4, 24, R], [30, 26, 46, R], [30, 48, 68, R],
    [45, 4, 24, G], [45, 26, 46, G], [45, 48, 68, G],
  ],
};

// 1 Bamboo (v4, to Alexander's reference): a line-drawn songbird facing left, perched on a leafy
// branch between two red five-petal blossoms. Blue outline, curling red crest, green eye, striped
// breast, hatched wing, long blue-and-red tail. Coordinates are in the 60 x 80 tile.
function Blossom({ cx, cy, r = 6 }) {
  const petal = `M0 ${-r * 0.24}C${-r * 0.62} ${-r * 0.36} ${-r * 0.66} ${-r * 0.98} 0 ${-r}C${r * 0.66} ${-r * 0.98} ${r * 0.62} ${-r * 0.36} 0 ${-r * 0.24}Z`;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d={petal} fill={C.red} />
          <path d={`M0 ${-r * 0.45}V${-r * 0.75}M${-r * 0.16} ${-r * 0.52}L${-r * 0.1} ${-r * 0.72}M${r * 0.16} ${-r * 0.52}L${r * 0.1} ${-r * 0.72}`} stroke={C.face} strokeWidth="0.5" strokeLinecap="round" />
        </g>
      ))}
      <circle r={r * 0.17} fill={C.red} />
    </g>
  );
}

// A leaf outline from base (x1, y1) to tip (x2, y2), w = half-width, with a midrib.
function Leaf({ x1, y1, x2, y2, w }) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const nx = (-(y2 - y1) / len) * w, ny = ((x2 - x1) / len) * w;
  return (
    <path
      d={`M${x1} ${y1}Q${mx + nx} ${my + ny} ${x2} ${y2}Q${mx - nx * 0.6} ${my - ny * 0.6} ${x1} ${y1}M${x1} ${y1}Q${mx + nx * 0.3} ${my + ny * 0.3} ${x2} ${y2}`}
      fill="none"
      stroke={C.green}
      strokeWidth="1"
      strokeLinejoin="round"
    />
  );
}

const BREAST = [
  [26.9, 29.8, 37.4, C.green],
  [28.7, 29.2, 39.2, C.red],
  [30.5, 29.0, 39.8, C.red],
  [32.3, 29.2, 39.4, C.red],
];

function Bird() {
  const s = (color, w) => ({ fill: 'none', stroke: color, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' });
  return (
    <g>
      {/* branch, flower stem and leaves */}
      <path d="M5 25.6C11 26.4 16 31 21 37C25.6 42.4 29.8 46 34.6 48.6" {...s(C.green, 1.4)} />
      <path d="M16.4 29.6C15.8 27.6 16.2 25.6 17.4 23.8" {...s(C.green, 1.1)} />
      <Leaf x1={17.4} y1={35.2} x2={4.2} y2={32.6} w={3.4} />
      <Leaf x1={19.6} y1={37.2} x2={9} y2={50} w={4.4} />
      <Leaf x1={28.8} y1={46.6} x2={16.2} y2={59} w={4.4} />
      <path d="M28.8 47.4C26.6 51.4 25.4 56.6 26 63" {...s(C.green, 1.1)} />
      <Blossom cx={17.4} cy={17.2} r={6.8} />
      <Blossom cx={37.2} cy={55.8} r={6.8} />

      {/* tail: plain strokes, as in the reference. Short blue lines tucked under the body, and two
          long lines from the wing tip running blue, then red to the end. */}
      <path d="M34.6 41.4L47.6 50.6M38.6 41L48 50M43.4 42.6L48.2 50.4" {...s(C.blue, 1.05)} />
      <path d="M47.2 44.8L49 50.2M49.2 44.6L50.8 49.8" {...s(C.blue, 1.05)} />
      <path d="M49 50.2L51.6 61.8M50.8 49.8L54 60.8" {...s(C.red, 1.05)} />

      {/* legs on the branch */}
      <path d="M30 40.8L29.6 45M32.8 41.2L32.6 46.4" {...s(C.blue, 1.2)} />

      {/* body: head and back, front and belly */}
      <path d="M28.8 20.6C31 19.3 34.5 19.6 36.3 21.8C37.6 23.4 37.6 26 37.6 28.4" {...s(C.blue, 1.35)} />
      <path d="M27.4 22.4C28.3 23.4 28.5 24.6 27.6 26C26 28.2 24.8 30.6 24.8 33.6C24.8 37.6 28 40.6 32 40.8C34 40.9 35.4 40.2 36.6 39.3" {...s(C.blue, 1.35)} />
      {BREAST.map(([x, y1, y2, col]) => (
        <path key={x} d={`M${x} ${y1}C${x - 0.7} ${y1 + 3} ${x - 0.3} ${y2 - 3} ${x + 0.5} ${y2}`} {...s(col, 1)} />
      ))}

      {/* wing with hatching */}
      <path d="M35.4 29.6C33.8 30.6 33.6 33.6 35 35.8C36.4 38 39 39.8 42.6 41.2L49 43.4C46.8 40.6 44.6 36.6 42.4 33.4C41 31.2 39.4 29.4 37.4 29.2Z" {...s(C.blue, 1.3)} />
      <path d="M36 32.2L40.6 31.9M35.7 34.6L42.2 34.3M37.2 37L43.8 37.3M40.4 39L46.4 42" {...s(C.blue, 0.9)} />

      {/* crest, open beak and eye */}
      <path d="M29 20.2C28 18.2 29.4 16.4 31 17.2C33 18.6 35 19.4 37.5 18.6C39.4 18 40.4 17.2 41.6 16.9" {...s(C.red, 1.4)} />
      <path d="M28.8 20.6L24.4 20L27.4 22.4" {...s(C.red, 1.3)} />
      <circle cx="32.2" cy="24.3" r="1.25" fill={C.green} />
    </g>
  );
}

function Bamboo({ value }) {
  if (value === 1) return <Bird />;
  const w = value === 8 ? 5.4 : value >= 7 ? 5.6 : 6.4;
  return <g>{BAMBOO[value].map(([x, y1, y2, col, rot], i) => <Stick key={i} x={x} y1={y1} y2={y2} color={col} rot={rot} w={w} />)}</g>;
}

const glyph = { fontFamily: 'var(--font-tile)', textAnchor: 'middle', fontWeight: 700 };

function Characters({ value }) {
  return (
    <g style={glyph}>
      <text x="30" y="31" fontSize="23" fill={C.ink}>{NUMERALS[value - 1]}</text>
      <text x="30" y="63" fontSize="27" fill={C.red}>萬</text>
    </g>
  );
}

function Honour({ tile }) {
  if (tile.suit === 'wind') {
    return <text x="30" y="50" fontSize="38" fill={C.ink} style={glyph}>{WIND_GLYPHS[tile.value]}</text>;
  }
  if (tile.value === 'white') {
    return (
      <g fill="none" stroke={C.blue}>
        <rect x="12" y="11" width="36" height="50" rx="3" strokeWidth="3" />
        <rect x="17" y="16" width="26" height="40" rx="1.5" strokeWidth="1.5" />
      </g>
    );
  }
  return (
    <text x="30" y="51" fontSize="40" fill={tile.value === 'red' ? C.red : C.green} style={glyph}>
      {DRAGON_GLYPHS[tile.value]}
    </text>
  );
}

function Face({ tile }) {
  if (tile.suit === 'dots') return <Dots value={tile.value} />;
  if (tile.suit === 'bamboo') return <Bamboo value={tile.value} />;
  if (tile.suit === 'characters') return <Characters value={tile.value} />;
  return <Honour tile={tile} />;
}

/**
 * A single tile. When `decorative` is true it is hidden from assistive tech
 * (use when a parent control already carries the tile's name).
 */
function Tile({ id, size = 'md', decorative = false, className = '' }) {
  const tile = parseTile(id);
  const a11y = decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': tile.name };
  return (
    <svg className={`tile tile--${size} ${className}`} viewBox="0 0 60 80" focusable="false" {...a11y}>
      <rect x="0" y="0" width="60" height="80" rx="10" fill="var(--tile-back)" />
      <rect x="1.5" y="1.5" width="57" height="70" rx="8.5" fill="var(--tile-face)" />
      <rect x="1.5" y="1.5" width="57" height="70" rx="8.5" fill="none" stroke="var(--tile-edge)" strokeWidth="1" />
      <Face tile={tile} />
    </svg>
  );
}

export default memo(Tile);
