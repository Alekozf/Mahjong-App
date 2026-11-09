import { useEffect, useRef } from 'react';
import Tile from '../components/Tile.jsx';
import Icon from '../components/Icon.jsx';
import { Visual, TileRow, TileCluster } from '../components/Visuals.jsx';
import { isActivity } from '../lib/lesson.js';
import { listNames, tileName } from '../lib/tiles.js';
import { href } from '../lib/router.js';
import { lessons } from '../content/lessons.js';

const LETTERS = 'ABCD';

function optionState(selected, status) {
  if (!selected) return '';
  if (status === 'correct') return 'is-correct';
  if (status === 'wrong') return 'is-wrong';
  return 'is-selected';
}

// A small mark in the corner of a chosen tile: a dot while selected, a tick if right, a cross if
// not. It's only visual; screen readers get the same from aria-pressed and the feedback text.
function StateMark({ status }) {
  return (
    <span className={`tile-mark tile-mark--${status}`} aria-hidden="true">
      {status === 'correct' && <Icon name="check" size={13} />}
      {status === 'wrong' && <Icon name="close" size={12} />}
    </span>
  );
}

function ChoiceOptions({ step, state, dispatch }) {
  const locked = state.status === 'correct';
  const pick = (id) => dispatch({ type: 'select-option', id });

  if (step.layout === 'text') {
    return (
      <div className="choices choices--text" role="group" aria-label="Answers">
        {step.options.map((o) => {
          const selected = state.answer === o.id;
          return (
            <button key={o.id} type="button" className={`choice ${optionState(selected, state.status)}`} aria-pressed={selected} disabled={locked && !selected} onClick={() => pick(o.id)}>
              <span className="choice__mark" aria-hidden="true" />
              <span>{o.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (step.layout === 'groups') {
    return (
      <div className="choices choices--groups" role="group" aria-label="Answers">
        {step.options.map((o, i) => {
          const selected = state.answer === o.id;
          return (
            <button key={o.id} type="button" className={`choice choice--group ${optionState(selected, state.status)}`} aria-pressed={selected} disabled={locked && !selected} onClick={() => pick(o.id)} aria-label={`Option ${LETTERS[i]}: ${listNames(o.tiles)}`}>
              <span className="choice__letter" aria-hidden="true">{LETTERS[i]}</span>
              <TileRow tiles={o.tiles} size="sm" />
              {selected && <StateMark status={state.status} />}
            </button>
          );
        })}
      </div>
    );
  }

  // 'tiles' and 'hand': every option is a single tile button.
  const hand = step.layout === 'hand';
  // In the hand layout the caption gives the hand's size before and after the discard, so the
  // picture always matches the feedback.
  const handLabel = hand ? (locked && step.handLabelAfter) || step.handLabel || 'Your hand' : null;
  return (
    <>
      {hand && <p className="hand-label" id="hand-label">{handLabel}</p>}
      <div
        className={`choices ${hand ? 'choices--hand' : 'choices--tiles'}`}
        role="group"
        aria-label={hand ? undefined : 'Answers'}
        aria-labelledby={hand ? 'hand-label' : undefined}
      >
        {step.options.map((o, i) => {
          const selected = state.answer === o.id;
          const isNew = hand && step.handHighlight === i;
          // After a correct discard the tile leaves the hand (hidden in place, so the options
          // don't shift) and shows up in its own group below.
          const discarded = hand && locked && selected;
          return (
            <button
              key={o.id}
              type="button"
              className={`tile-btn ${optionState(selected, state.status)} ${isNew ? 'is-new' : ''} ${discarded ? 'is-discarded' : ''}`}
              aria-pressed={selected}
              disabled={locked && !selected}
              onClick={() => pick(o.id)}
              aria-label={`${tileName(o.tile)}${isNew ? ', just drawn' : ''}${discarded ? ', discarded' : ''}`}
            >
              {isNew && <span className="tile-btn__badge" aria-hidden="true">New</span>}
              {selected && !discarded && <StateMark status={state.status} />}
              <Tile id={o.tile} size={hand ? 'sm' : 'lg'} decorative />
            </button>
          );
        })}
      </div>
      {hand && locked && state.answer != null && (
        <div className="discard-pile" role="group" aria-label={`Discarded: ${tileName(step.options.find((o) => o.id === state.answer).tile)}`}>
          <span className="discard-pile__label">Discarded</span>
          <Tile id={step.options.find((o) => o.id === state.answer).tile} size="sm" decorative />
        </div>
      )}
    </>
  );
}

function SelectTiles({ step, state, dispatch }) {
  const picked = Array.isArray(state.answer) ? state.answer : [];
  const locked = state.status === 'correct';
  return (
    <>
      <div className="choices choices--select" role="group" aria-label={`Tiles to choose from. Select ${step.count}.`}>
        {step.tiles.map((id, i) => {
          const selected = picked.includes(i);
          const full = !selected && picked.length >= step.count;
          return (
            <button
              key={i}
              type="button"
              className={`tile-btn ${optionState(selected, state.status)}`}
              aria-pressed={selected}
              disabled={(locked && !selected) || full}
              onClick={() => dispatch({ type: 'toggle-tile', index: i })}
              aria-label={tileName(id)}
            >
              {selected && <StateMark status={state.status} />}
              <Tile id={id} size="lg" decorative />
            </button>
          );
        })}
      </div>
      <p className="select-count" aria-live="polite">
        {picked.length} of {step.count} selected
        {picked.length >= step.count && state.status === 'idle' ? '. Tap a selected tile to change your choice.' : ''}
      </p>
    </>
  );
}

function Feedback({ state }) {
  // Always rendered so screen readers announce changes.
  return (
    <div className={`feedback ${state.status === 'correct' ? 'feedback--correct' : ''} ${state.status === 'wrong' ? 'feedback--wrong' : ''}`} role="status" aria-live="polite">
      {state.status !== 'idle' && state.message && (
        <>
          <p className="feedback__title">
            <Icon name={state.status === 'correct' ? 'check' : 'retry'} size={20} />
            {state.status === 'correct' ? 'That’s it' : 'Not quite'}
          </p>
          <p className="feedback__msg">{state.message}</p>
        </>
      )}
    </div>
  );
}

function Completion({ lesson, onRestart, onOpen, progress }) {
  const next = lessons.find((l) => l.number === lesson.number + 1);
  // Count this lesson as done right away (it's saved a moment later), so the heading doesn't
  // change after a screen reader has already read it out.
  const allDone = lessons.every((l) => l.id === lesson.id || progress.completed[l.id]);
  const headingRef = useRef(null);
  // Completion replaces the step (and its heading), so focus its own heading when it appears.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);
  return (
    <div className="completion">
      <TileCluster tiles={lesson.illustration} size="lg" />
      <h1 ref={headingRef} tabIndex={-1}>{allDone ? 'Introduction complete' : 'Lesson complete'}</h1>
      <p className="lead">
        {allDone
          ? 'You’ve finished all three lessons: enough to join a beginner table with support. When you arrive, tell your host you’ve done the basics so they can find you a table at the right pace.'
          : `You’ve finished “${lesson.title}”. You can replay it any time.`}
      </p>
      <div className="btn-stack">
        <a className="btn btn--primary btn--block" href={href('/learn')}>Back to lessons</a>
        {next && !allDone && (
          <a className="btn btn--secondary btn--block" href={href(`/learn/${next.id}`)} onClick={() => onOpen(next.id)}>
            Next: {next.title}
          </a>
        )}
        {allDone && <a className="btn btn--secondary btn--block" href={href('/session/guide')}>See the session guide</a>}
        <button type="button" className="text-link" onClick={() => onRestart(lesson.id)}>
          <Icon name="retry" size={18} />
          Replay this lesson
        </button>
      </div>
    </div>
  );
}

export default function LessonPlayer({ lesson, state, dispatch, onComplete, onRestart, onOpen, progress }) {
  const step = lesson.steps[state.step];
  const total = lesson.steps.length;
  const headingRef = useRef(null);
  const firstStep = useRef(true);

  useEffect(() => {
    if (state.finished) onComplete(lesson.id);
  }, [state.finished, lesson.id, onComplete]);

  // Move focus to each new step's heading. App already does this for the first step, and the
  // completion screen handles its own.
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    window.scrollTo(0, 0);
    if (!state.finished) headingRef.current?.focus({ preventScroll: true });
  }, [state.step, state.finished]);

  const activity = isActivity(step);
  // A step can show a different picture once answered correctly (e.g. the hand after drawing).
  const display = state.status === 'correct' && step.displayAfter ? step.displayAfter : step.display;
  const hasAnswer = step.kind === 'select' ? Array.isArray(state.answer) && state.answer.length === step.count : state.answer != null;

  let main;
  if (!activity || state.status === 'correct') main = { label: 'Continue', action: 'continue', disabled: false };
  else if (state.status === 'wrong') main = { label: 'Try again', action: 'retry', disabled: false };
  else main = { label: 'Check answer', action: 'check', disabled: !hasAnswer };

  return (
    <div className="player">
      <header className="player-bar">
        <div className="player-bar__inner">
        <a className="icon-btn" href={href('/learn')}>
          <Icon name="close" size={22} />
          <span className="visually-hidden">Exit lesson. Your place is kept.</span>
        </a>
        <div className="player-bar__progress">
          <span className="player-bar__label">
            {state.finished ? 'Lesson complete' : `Step ${state.step + 1} of ${total}`}
            <span className="visually-hidden">, {lesson.title}</span>
          </span>
          <div className="progress progress--steps" aria-hidden="true">
            {lesson.steps.map((_, i) => (
              <span key={i} className={`progress__seg ${state.finished || i < state.step ? 'is-done' : ''} ${!state.finished && i === state.step ? 'is-current' : ''}`} />
            ))}
          </div>
        </div>
        <a className="ref-btn" href={href(`/reference?from=${lesson.id}`)}>
          <Icon name="reference" size={20} />
          <span>Reference</span>
        </a>
        </div>
      </header>

      {state.finished ? (
        <Completion lesson={lesson} onRestart={onRestart} onOpen={onOpen} progress={progress} />
      ) : (
        <>
          <div className="player-body">
            <p className="eyebrow">{lesson.title}</p>
            <h1 ref={headingRef} tabIndex={-1}>{step.title}</h1>
            {step.body?.map((p, i) => <p key={i} className="player-text">{p}</p>)}
            {step.prompt && <p className="prompt">{step.prompt}</p>}
            {step.visual && <div className="player-visual"><Visual visual={step.visual} /></div>}
            {display && <div className="player-visual player-visual--display"><Visual visual={display} /></div>}
            {step.aside && <div className="player-aside"><Visual visual={step.aside} /></div>}
            {step.kind === 'choice' && <ChoiceOptions step={step} state={state} dispatch={dispatch} />}
            {step.kind === 'select' && <SelectTiles step={step} state={state} dispatch={dispatch} />}
            {step.note && (
              <p className="note">
                <Icon name="info" size={18} />
                {step.note}
              </p>
            )}
          </div>

          <div className="player-foot">
            <div className="player-foot__inner">
              {activity && <Feedback state={state} />}
              <div className="player-foot__actions">
                {state.step > 0 && (
                  <button type="button" className="btn btn--secondary btn--icon" onClick={() => dispatch({ type: 'back' })}>
                    <Icon name="back" size={20} />
                    <span className="visually-hidden">Previous step</span>
                  </button>
                )}
                <button type="button" className="btn btn--primary btn--grow" disabled={main.disabled} onClick={() => dispatch({ type: main.action })}>
                  {main.label}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
