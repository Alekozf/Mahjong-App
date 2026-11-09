import { useEffect, useRef, useState } from 'react';
import { TopBar } from '../components/Shell.jsx';
import { TileCluster } from '../components/Visuals.jsx';
import Icon from '../components/Icon.jsx';
import { href, navigate } from '../lib/router.js';

function ProgressBar({ done, total }) {
  return (
    <div className="progress" role="group" aria-label={`${done} of ${total} lessons complete`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`progress__seg ${i < done ? 'is-done' : ''}`} />
      ))}
    </div>
  );
}

function LessonCard({ lesson, completed, inProgress, isNext, onOpen, onRestart }) {
  const titleId = `lesson-${lesson.id}-title`;
  // The suggested lesson gets the filled button and the others get outlined ones. Nothing is
  // locked, and the lessons can be done in any order.
  let action;
  if (inProgress) action = { label: 'Resume lesson', run: () => onOpen(lesson.id) };
  else if (completed) action = { label: 'Replay lesson', run: () => onRestart(lesson.id) };
  else action = { label: 'Start lesson', run: () => onOpen(lesson.id) };
  action.primary = isNext;

  return (
    <article className={`lesson-card ${completed ? 'is-complete' : ''} ${isNext ? 'is-next' : ''}`} aria-labelledby={titleId}>
      <div className="lesson-card__art">
        <TileCluster tiles={lesson.illustration} size="md" />
      </div>
      <div className="lesson-card__head">
        <p className="lesson-card__num">
          Lesson {lesson.number}
          {isNext && <span className="lesson-card__hint"> · Suggested next</span>}
        </p>
        <h2 id={titleId}>{lesson.title}</h2>
      </div>
      <div className="lesson-card__body">
        <p>{lesson.outcome}</p>
        <div className="lesson-card__foot">
          {completed && (
            <span className="status status--done">
              <Icon name="check" size={16} />
              Completed
            </span>
          )}
          {inProgress && !completed && <span className="status">In progress</span>}
          <button
            type="button"
            className={`btn ${action.primary ? 'btn--primary' : 'btn--secondary'} btn--small`}
            onClick={() => {
              action.run();
              navigate(`/learn/${lesson.id}`);
            }}
            aria-describedby={titleId}
          >
            {action.label}
          </button>
        </div>
      </div>
    </article>
  );
}

// What the settings panel says after a reset. If it failed, don't pretend the progress is gone.
const RESET_MESSAGES = {
  saved: 'Progress reset.',
  visit: 'Progress reset for this visit. This browser wasn’t saving progress, so there was nothing stored to clear.',
  failed: 'Progress is cleared for this visit, but this browser wouldn’t clear the saved record, so your old progress may come back when you reload. Try again, or clear this site’s data in your browser settings.',
};

export default function LearnOverview({ lessons, progress, runs, storageAvailable, onOpen, onRestart, onReset }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  // 'idle' | 'confirming' | 'saved' | 'visit' | 'failed'
  const [phase, setPhase] = useState('idle');
  const [focusTarget, setFocusTarget] = useState(null);
  const resetBtn = useRef(null);
  const cancelBtn = useRef(null);
  const statusRef = useRef(null);
  const done = lessons.filter((l) => progress.completed[l.id]).length;
  const allDone = done === lessons.length;
  // Just a suggestion: a lesson you've started comes first, otherwise the first one you haven't finished.
  const isStarted = (l) => {
    const run = runs[l.id];
    return Boolean(run && !run.finished && (run.step > 0 || run.status !== 'idle'));
  };
  const nextId = (lessons.find((l) => isStarted(l) && !progress.completed[l.id]) || lessons.find(isStarted) || lessons.find((l) => !progress.completed[l.id]))?.id;

  // Move focus when the confirmation opens or closes, so keyboard and screen-reader users
  // aren't left stranded when the button they were on disappears.
  useEffect(() => {
    if (!focusTarget) return;
    const el = { reset: resetBtn, cancel: cancelBtn, status: statusRef }[focusTarget].current;
    el?.focus();
    setFocusTarget(null);
  }, [focusTarget]);

  const confirmReset = () => {
    setPhase(onReset());
    setFocusTarget('status');
  };

  const resultMessage = RESET_MESSAGES[phase] || '';

  return (
    <div className="screen screen--learn">
      <TopBar>
        <span className="chip">MCR basics</span>
      </TopBar>
      <header className="learn-head">
        <h1 tabIndex={-1}>Learn at your pace</h1>
        <p className="lead">Practise before you join the table. All three lessons are optional, so start anywhere.</p>
      </header>

      <div className="progress-panel">
        <div className="progress-panel__row">
          <p className="progress-panel__label">
            <strong>{done} of {lessons.length}</strong> lessons complete
          </p>
          <button
            type="button"
            className="icon-btn"
            aria-expanded={settingsOpen}
            aria-controls="progress-settings"
            onClick={() => {
              setSettingsOpen((o) => !o);
              setPhase('idle');
            }}
          >
            <Icon name="settings" size={20} />
            <span className="visually-hidden">Progress settings</span>
          </button>
        </div>
        <ProgressBar done={done} total={lessons.length} />
        {settingsOpen && (
          <div className="settings" id="progress-settings">
            <p>
              {storageAvailable
                ? 'Progress is saved in this browser only. Nothing is sent anywhere.'
                : 'This browser isn’t saving progress, so completion resets when you close the app.'}
            </p>
            {phase === 'idle' && (
              <button
                ref={resetBtn}
                type="button"
                className="btn btn--secondary btn--small"
                onClick={() => {
                  setPhase('confirming');
                  setFocusTarget('cancel');
                }}
                disabled={done === 0}
              >
                Reset progress
              </button>
            )}
            {phase === 'confirming' && (
              <div className="confirm" role="group" aria-labelledby="confirm-reset-text">
                <p id="confirm-reset-text"><strong>Clear all lesson completion?</strong> This can’t be undone.</p>
                <div className="btn-row">
                  <button type="button" className="btn btn--danger btn--small" onClick={confirmReset}>Yes, reset</button>
                  <button
                    ref={cancelBtn}
                    type="button"
                    className="btn btn--secondary btn--small"
                    onClick={() => {
                      setPhase('idle');
                      setFocusTarget('reset');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <p ref={statusRef} tabIndex={-1} className={`settings__status ${phase === 'failed' ? 'is-warning' : ''}`} role="status">
              {resultMessage}
            </p>
            {phase === 'failed' && (
              <button type="button" className="btn btn--secondary btn--small" onClick={confirmReset}>
                Try clearing again
              </button>
            )}
          </div>
        )}
      </div>

      {allDone && (
        <section className="complete-banner" aria-labelledby="intro-complete">
          <h2 id="intro-complete">Introduction complete</h2>
          <p>You’ve covered the tiles, the sets and one turn: enough to sit down at a beginner table with support. When you arrive, tell your host you’ve done the basics so they can find you a table at the right pace.</p>
          <div className="btn-row">
            <a className="btn btn--primary btn--small" href={href('/session/guide')}>See the session guide</a>
            <a className="btn btn--secondary btn--small" href={href('/reference')}>Open reference</a>
          </div>
        </section>
      )}

      <div className="lesson-list">
        {lessons.map((l) => {
          const run = runs[l.id];
          const inProgress = Boolean(run && !run.finished && (run.step > 0 || run.status !== 'idle'));
          return (
            <LessonCard
              key={l.id}
              lesson={l}
              completed={Boolean(progress.completed[l.id])}
              inProgress={inProgress}
              isNext={l.id === nextId}
              onOpen={onOpen}
              onRestart={onRestart}
            />
          );
        })}
      </div>

      <a className="ref-strip" href={href('/reference')}>
        <Icon name="reference" size={24} />
        <span>Need a reminder? Open the quick reference</span>
      </a>
    </div>
  );
}
