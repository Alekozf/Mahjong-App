import Tile from './Tile.jsx';
import { NUMERALS, listNames } from '../lib/tiles.js';

export function TileRow({ tiles, size = 'md', label, className = '' }) {
  return (
    <div className={`tile-row ${className}`} role="group" aria-label={label || listNames(tiles)}>
      {tiles.map((id, i) => <Tile key={`${id}-${i}`} id={id} size={size} decorative />)}
    </div>
  );
}

// With `columns`, wider screens show the groups side by side (like the three suits), each label
// above its own tiles. Phones always stack them.
export function TileGroups({ groups, compact = false, columns = false }) {
  return (
    <div
      className={`tile-groups ${compact ? 'tile-groups--compact' : ''} ${columns ? 'tile-groups--columns' : ''}`}
      style={columns ? { '--cols': groups.length } : undefined}
    >
      {groups.map((g, i) => (
        <div className="tile-group" key={i}>
          <div className="tile-group__label">
            <strong>{g.label}</strong>
            {g.detail && <span>{g.detail}</span>}
          </div>
          <TileRow tiles={g.tiles} size={compact ? 'sm' : 'md'} label={`${g.label}: ${listNames(g.tiles)}`} />
        </div>
      ))}
    </div>
  );
}

export function NumeralKey() {
  return (
    <dl className="numeral-key" aria-label="Chinese numerals 1 to 9">
      {NUMERALS.map((n, i) => (
        <div key={n}>
          <dt lang="zh-Hans">{n}</dt>
          <dd>{i + 1}</dd>
        </div>
      ))}
    </dl>
  );
}

// The four seats from above. Play goes anticlockwise: you, then right, opposite, left.
export function Seats() {
  return (
    <figure className="seats">
      <svg viewBox="0 0 240 200" role="img" aria-labelledby="seats-title">
        <title id="seats-title">
          Four players around a table. Turns pass counterclockwise: from you to the player on your right, then opposite, then left, then back to you.
        </title>
        <rect x="62" y="42" width="116" height="116" rx="18" fill="var(--sage-100)" stroke="var(--line-strong)" />
        <path d="M150 140 A44 44 0 0 0 150 60" fill="none" stroke="var(--green-700)" strokeWidth="3" strokeLinecap="round" markerEnd="url(#arr)" />
        <path d="M90 60 A44 44 0 0 0 90 140" fill="none" stroke="var(--green-700)" strokeWidth="3" strokeLinecap="round" markerEnd="url(#arr)" />
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="var(--green-700)" />
          </marker>
        </defs>
        <g className="seats__label">
          <text x="120" y="188" textAnchor="middle" className="seats__you">You</text>
          <text x="216" y="104" textAnchor="middle">Right</text>
          <text x="120" y="24" textAnchor="middle">Opposite</text>
          <text x="26" y="104" textAnchor="middle">Left</text>
        </g>
      </svg>
      <figcaption>Counterclockwise: after you, the player on your right plays next.</figcaption>
    </figure>
  );
}

// The small tile cluster on lesson cards and the session hero, with a few accent marks.
export function TileCluster({ tiles, size = 'md', accent = true }) {
  return (
    <div className={`cluster cluster--${tiles.length} cluster--${size}`} aria-hidden="true">
      {accent && (
        <>
          <svg className="cluster__spark" viewBox="0 0 40 40">
            <path d="M8 6 L12 15 M20 2 L20 12 M30 6 L26 15" stroke="var(--yellow-500)" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
          <svg className="cluster__star" viewBox="0 0 40 40">
            <path d="M20 2 C21.6 13 24 17 38 20 C24 23 21.6 27 20 38 C18.4 27 16 23 2 20 C16 17 18.4 13 20 2 Z" fill="var(--yellow-500)" />
          </svg>
        </>
      )}
      {tiles.map((id, i) => <Tile key={`${id}-${i}`} id={id} size={size} decorative className={`cluster__tile cluster__tile--${i}`} />)}
      <span className="cluster__shadow" />
    </div>
  );
}

// Session hero: three big tiles tipped onto the table, with sparks, a star and a few flowers.
// It's only decoration, so screen readers skip it.
export function HeroArt({ tiles = ['dots-4', 'bamboo-5', 'dragon-red'] }) {
  const flower = (cx, cy, r) => (
    <g fill="var(--coral-500)">
      <circle cx={cx} cy={cy - r} r={r * 0.78} />
      <circle cx={cx + r} cy={cy} r={r * 0.78} />
      <circle cx={cx} cy={cy + r} r={r * 0.78} />
      <circle cx={cx - r} cy={cy} r={r * 0.78} />
    </g>
  );
  return (
    <div className="hero-art" aria-hidden="true">
      <svg className="hero-art__deco" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid meet">
        <ellipse cx="200" cy="226" rx="148" ry="20" fill="var(--sage-200)" />
        <path d="M366 18 C368.5 35 373 39 390 41.5 C373 44 368.5 48 366 65 C363.5 48 359 44 342 41.5 C359 39 363.5 35 366 18 Z" fill="var(--yellow-500)" />
        {flower(22, 168, 8)}
        {flower(384, 150, 8)}
      </svg>
      <div className="hero-art__tiles">
        {tiles.map((id, i) => (
          <Tile key={`${id}-${i}`} id={id} size="xl" decorative className={`hero-art__tile hero-art__tile--${i}`} />
        ))}
      </div>
      {/* the sparks sit on a front layer so the tiles never cover them */}
      <svg className="hero-art__front" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid meet">
        <path d="M58 52 L47 31 M79 46 L79 21 M42 66 L21 58" stroke="var(--yellow-500)" strokeWidth="9" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function Visual({ visual }) {
  if (!visual) return null;
  if (visual.type === 'groups') return <TileGroups groups={visual.groups} compact={visual.compact} columns={visual.columns} />;
  if (visual.type === 'tiles') {
    return (
      <div className="visual-tiles">
        <TileRow tiles={visual.tiles} size="lg" />
        {visual.label && <p className="visual-tiles__label">{visual.label}</p>}
      </div>
    );
  }
  if (visual.type === 'hand') {
    const label = visual.label || 'Your hand';
    return (
      <figure className="hand-figure">
        <figcaption className="hand-label">{label}</figcaption>
        <div className="tile-row hand" role="group" aria-label={`${label}: ${listNames(visual.tiles)}`}>
          {visual.tiles.map((id, i) => (
            <span key={`${id}-${i}`} className={`hand__tile ${i === visual.highlight ? 'is-new' : ''}`}>
              {i === visual.highlight && <span className="tile-btn__badge" aria-hidden="true">New</span>}
              <Tile id={id} size="sm" decorative />
            </span>
          ))}
        </div>
      </figure>
    );
  }
  if (visual.type === 'seats') return <Seats />;
  if (visual.type === 'numerals') return <NumeralKey />;
  return null;
}
