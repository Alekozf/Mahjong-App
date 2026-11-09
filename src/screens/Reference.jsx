import { TopBar } from '../components/Shell.jsx';
import { TileRow, NumeralKey, Seats } from '../components/Visuals.jsx';
import Icon from '../components/Icon.jsx';
import { referenceSections } from '../content/reference.js';
import { getLesson } from '../content/lessons.js';
import { href } from '../lib/router.js';

function More({ more }) {
  if (!more) return null;
  return (
    <details className="more">
      <summary>
        <span>{more.title}</span>
        <Icon name="chevron" size={18} className="more__chevron" />
      </summary>
      <ul>
        {more.points.map((p, i) => <li key={i}>{p}</li>)}
      </ul>
    </details>
  );
}

function RefSection({ section }) {
  const headingId = `ref-${section.id}-title`;
  return (
    <section className="ref-section" id={`ref-${section.id}`} aria-labelledby={headingId}>
      <h2 id={headingId} tabIndex={-1}>{section.title}</h2>
      <p className="ref-section__summary">{section.summary}</p>

      {section.blocks && (
        <div className="ref-blocks">
          {section.blocks.map((b) => (
            <div className="ref-block" key={b.label}>
              <div className="ref-block__text">
                <h3>{b.label}</h3>
                <p>{b.text}</p>
              </div>
              <TileRow tiles={b.tiles} size={b.tiles.length > 4 ? 'xs' : 'sm'} label={`${b.label}: ${b.tiles.length} tiles`} className="ref-block__tiles" />
              {b.numerals && <NumeralKey />}
            </div>
          ))}
        </div>
      )}

      {section.steps && (
        <div className="ref-turn">
          <ol className="step-list step-list--compact">
            {section.steps.map((s, i) => (
              <li key={i}>
                <span className="step-list__num" aria-hidden="true">{i + 1}</span>
                <p>{s}</p>
              </li>
            ))}
          </ol>
          {section.seats && <Seats />}
        </div>
      )}

      {section.calls && (
        <dl className="calls">
          {section.calls.map((c) => (
            <div className="call" key={c.name}>
              <dt>
                {c.name}
                {c.zh && (
                  <span className="call__zh">
                    <span lang="zh-Hans">{c.zh}</span> <span lang="zh-Latn-pinyin">{c.pinyin}</span>
                  </span>
                )}
              </dt>
              <dd>
                <span className="call__from">From: {c.from}</span>
                <span>{c.text}</span>
              </dd>
            </div>
          ))}
        </dl>
      )}

      {section.essentials && (
        <ul className="tick-list">
          {section.essentials.map((e, i) => (
            <li key={i}>
              <Icon name="check" size={18} />
              <span>{e}</span>
            </li>
          ))}
        </ul>
      )}

      <More more={section.more} />
    </section>
  );
}

export default function Reference({ from }) {
  const fromLesson = from ? getLesson(from) : null;
  return (
    <div className="screen screen--reference">
      {fromLesson ? (
        <div className="return-bar">
          <a className="btn btn--primary btn--small" href={href(`/learn/${fromLesson.id}`)}>
            <Icon name="back" size={18} />
            Back to lesson
          </a>
          <span>Your place in “{fromLesson.title}” is kept.</span>
        </div>
      ) : (
        <TopBar />
      )}
      <header className="ref-head">
        <h1 tabIndex={-1}>Quick reference</h1>
        <p className="lead">The essentials of MCR, for a reminder at the table.</p>
      </header>
      {/* kept outside the header so it can stick while you scroll, on screens with room for it */}
      <nav className={`shortcuts ${fromLesson ? 'shortcuts--below-return' : ''}`} aria-label="Reference sections">
          {referenceSections.map((s) => (
            <a key={s.id} className="shortcut" href={href(`/reference/${s.id}${fromLesson ? `?from=${fromLesson.id}` : ''}`)}>
              {s.title}
            </a>
          ))}
      </nav>
      {referenceSections.map((s) => <RefSection key={s.id} section={s} />)}
    </div>
  );
}
