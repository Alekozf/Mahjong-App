import Icon from './Icon.jsx';
import Tile from './Tile.jsx';
import { href } from '../lib/router.js';

const DESTINATIONS = [
  { id: 'session', label: 'Session', icon: 'session', path: '/' },
  { id: 'learn', label: 'Learn', icon: 'learn', path: '/learn' },
  { id: 'reference', label: 'Reference', icon: 'reference', path: '/reference' },
];

export function Brand() {
  return (
    <a className="brand" href={href('/')} aria-label="Mahjong, session home">
      <Tile id="dragon-green" size="mark" decorative />
      <span className="brand__name">Mahjong</span>
    </a>
  );
}

/** Bottom bar on phones, side rail on wider screens. Same markup, two layouts. */
export function MainNav({ current }) {
  return (
    <nav className="main-nav" aria-label="Main">
      <div className="main-nav__brand"><Brand /></div>
      <ul>
        {DESTINATIONS.map((d) => (
          <li key={d.id}>
            <a className="main-nav__link" href={href(d.path)} aria-current={current === d.id ? 'page' : undefined}>
              <Icon name={d.icon} size={26} />
              <span>{d.label}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="main-nav__note">An independent student proposal. Not affiliated with any club or university.</p>
    </nav>
  );
}

export function TopBar({ children }) {
  return (
    <header className="top-bar">
      <Brand />
      {children}
    </header>
  );
}
