import Icon from '../components/Icon.jsx';
import { exampleSession, guideSections } from '../content/session.js';
import { href } from '../lib/router.js';

function GuideSection({ section }) {
  const headingId = `guide-${section.id}`;
  return (
    <section className={`guide-section guide-section--${section.id}`} aria-labelledby={headingId}>
      <h2 id={headingId} tabIndex={-1}>{section.title}</h2>
      {section.paragraphs?.map((p, i) => <p key={i}>{p}</p>)}
      {section.list && (
        <ul className="tick-list">
          {section.list.map((item, i) => (
            <li key={i}>
              <Icon name="check" size={18} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      {section.steps && (
        <ol className="step-list">
          {section.steps.map((s, i) => (
            <li key={i}>
              <span className="step-list__num" aria-hidden="true">{i + 1}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
      {section.options && (
        <ul className="option-list">
          {section.options.map((o, i) => (
            <li key={i} className="option-list__item">
              <span className="option-list__icon"><Icon name={o.icon} size={22} /></span>
              <div>
                <h3>{o.title}</h3>
                <p>{o.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {section.phrases && (
        <ul className="phrase-list">
          {section.phrases.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      )}
    </section>
  );
}

// The three practical sections people look for most: arriving, choosing how to join, asking for help.
// The buttons scroll down the page (the URL hash is taken by routing) and move focus to the heading.
const JUMPS = [
  ['arrival', 'Your first few minutes'],
  ['options', 'Ways to take part'],
  ['help', 'Asking for help'],
];

function jumpTo(id) {
  const heading = document.getElementById(`guide-${id}`);
  if (!heading) return;
  heading.scrollIntoView({ block: 'start' });
  heading.focus({ preventScroll: true });
}

export default function SessionGuide() {
  return (
    <div className="screen screen--guide">
      <div className="screen-head">
        <a className="back-link" href={href('/')}>
          <Icon name="back" size={20} />
          Session
        </a>
      </div>
      <header className="guide-intro">
        <h1 tabIndex={-1}>A first session, step by step</h1>
        <p className="lead">What to expect at a proposed beginner-friendly session, from arriving to asking for help.</p>
        <div className="session-card" role="group" aria-label={`${exampleSession.label}: ${exampleSession.title}`}>
          <span className="tag">{exampleSession.label}</span>
          <p className="session-card__title">{exampleSession.title}</p>
          <ul>
            {exampleSession.points.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>
        <nav className="jump-links" aria-label="Jump to a section">
          {JUMPS.map(([id, label]) => (
            <button key={id} type="button" className="shortcut" onClick={() => jumpTo(id)}>
              {label}
            </button>
          ))}
        </nav>
      </header>
      {guideSections.map((s) => <GuideSection key={s.id} section={s} />)}
      <section className="guide-next" aria-labelledby="guide-next-title">
        <h2 id="guide-next-title">Practise before you go</h2>
        <p>Three short lessons cover the tiles, sets and one turn. They’re optional.</p>
        <div className="btn-row">
          <a className="btn btn--primary" href={href('/learn')}>Start the lessons</a>
          <a className="btn btn--secondary" href={href('/reference')}>Open reference</a>
        </div>
      </section>
    </div>
  );
}
