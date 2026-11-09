// Lesson logic, kept away from the UI so it's easy to test.
import { chowReason, pungReason } from './rules.js';

export const isActivity = (step) => step.kind === 'choice' || step.kind === 'select';

// Check an answer: an option id for choice steps, or a list of tile positions for select steps.
export function evaluate(step, answer) {
  if (step.kind === 'choice') {
    if (answer == null) return { correct: false, message: '' };
    const correct = answer === step.answer;
    return {
      correct,
      message: correct ? step.correct : (step.wrong && step.wrong[answer]) || step.wrongDefault,
    };
  }
  if (step.kind === 'select') {
    const picked = Array.isArray(answer) ? answer : [];
    if (picked.length !== step.count) return { correct: false, message: `Select ${step.count} tiles, then check.` };
    const ids = picked.map((i) => step.tiles[i]);
    const reason = step.goal === 'chow' ? chowReason(ids) : pungReason(ids);
    const correct = reason === step.goal;
    return { correct, message: correct ? step.correct : step.reasons[reason] || step.reasons.default };
  }
  return { correct: true, message: '' };
}

// Could this even be an answer to the step? (Right type, a real option, positions in range.)
export function isValidAnswer(step, answer) {
  if (step.kind === 'choice') return typeof answer === 'string' && step.options.some((o) => o.id === answer);
  if (step.kind === 'select') {
    return (
      Array.isArray(answer) &&
      answer.length <= step.count &&
      new Set(answer).size === answer.length &&
      answer.every((i) => Number.isInteger(i) && i >= 0 && i < step.tiles.length)
    );
  }
  return false;
}

// Rebuild a saved lesson run. Saved data can't be trusted, so only what the lesson could really
// produce is kept, and feedback text always comes from the lesson content, never from storage.
// Returns null if nothing usable is left, and the lesson starts fresh.
export function sanitiseRun(lesson, raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const { step } = raw;
  if (!Number.isInteger(step) || step < 0 || step >= lesson.steps.length) return null;

  // Only keep finished activities whose saved answer really is correct.
  const cleared = {};
  if (raw.cleared && typeof raw.cleared === 'object' && !Array.isArray(raw.cleared)) {
    for (const [key, entry] of Object.entries(raw.cleared)) {
      const index = Number(key);
      const s = lesson.steps[index];
      if (!Number.isInteger(index) || String(index) !== key || !s || !isActivity(s)) continue;
      const answer = entry && typeof entry === 'object' ? entry.answer : undefined;
      if (!isValidAnswer(s, answer)) continue;
      const result = evaluate(s, answer);
      if (result.correct) cleared[index] = { answer, message: result.message };
    }
  }

  // The current step's answer and status have to match what the lesson says about that answer.
  const current = lesson.steps[step];
  let answer = null, status = 'idle', message = '';
  if (isActivity(current) && raw.answer != null && isValidAnswer(current, raw.answer)) {
    answer = raw.answer;
    if (raw.status === 'correct' || raw.status === 'wrong') {
      const result = evaluate(current, answer);
      if (result.message && result.correct === (raw.status === 'correct')) {
        status = raw.status;
        message = result.message;
      }
    }
  }

  // "Finished" only counts if every activity was actually answered correctly.
  const allCleared = lesson.steps.every((s, i) => !isActivity(s) || cleared[i]);
  const finished = raw.finished === true && allCleared && step === lesson.steps.length - 1;

  return { step, answer, status, message, finished, cleared };
}

// You can move on from an explanation any time, and from an activity once you've got it right.
export const canContinue = (step, status) => !isActivity(step) || status === 'correct';

export const initialLessonState = () => ({ step: 0, answer: null, status: 'idle', message: '', finished: false, cleared: {} });

// Show a step as it was left: a cleared activity reopens with its correct answer and feedback.
function openStep(state, index) {
  const done = state.cleared[index];
  return done
    ? { ...state, step: index, answer: done.answer, status: 'correct', message: done.message, finished: false }
    : { ...state, step: index, answer: null, status: 'idle', message: '', finished: false };
}

// One lesson run. A wrong answer never moves you on, and Continue only works after a right one.
// Actions: select-option, toggle-tile, check, retry, continue, back, restart.
export function lessonReducer(lesson, state, action) {
  const step = lesson.steps[state.step];
  switch (action.type) {
    case 'select-option':
      if (state.status === 'correct') return state;
      return { ...state, answer: action.id, status: 'idle', message: '' };
    case 'toggle-tile': {
      if (state.status === 'correct') return state;
      const current = Array.isArray(state.answer) ? state.answer : [];
      const has = current.includes(action.index);
      if (!has && current.length >= step.count) return state; // can't pick more tiles than the step asks for
      const next = has ? current.filter((i) => i !== action.index) : [...current, action.index];
      return { ...state, answer: next, status: 'idle', message: '' };
    }
    case 'check': {
      if (!isActivity(step) || state.status === 'correct') return state;
      const result = evaluate(step, state.answer);
      if (!result.message) return state;
      return { ...state, status: result.correct ? 'correct' : 'wrong', message: result.message };
    }
    case 'retry':
      return { ...state, answer: null, status: 'idle', message: '' };
    case 'continue': {
      if (state.finished || !canContinue(step, state.status)) return state;
      const cleared = isActivity(step)
        ? { ...state.cleared, [state.step]: { answer: state.answer, message: state.message } }
        : state.cleared;
      const next = { ...state, cleared };
      if (state.step >= lesson.steps.length - 1) return { ...next, finished: true };
      return openStep(next, state.step + 1);
    }
    case 'back':
      if (state.finished) return openStep(state, state.step);
      if (state.step === 0) return state;
      return openStep(state, state.step - 1);
    case 'restart':
      return initialLessonState();
    default:
      return state;
  }
}
