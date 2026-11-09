// Lesson engine: pure functions so answer logic can be tested without the UI.
import { chowReason, pungReason } from './rules.js';

export const isActivity = (step) => step.kind === 'choice' || step.kind === 'select';

/** Check an answer. `answer` is an option id (choice) or an array of tile indexes (select). */
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

/** Is `answer` a well-formed answer for this step (right type, known option, indexes in range)? */
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

/**
 * Rebuild a lesson run from untrusted saved data (sessionStorage). Only shapes the lesson can
 * produce survive; feedback text is always regenerated from the reviewed lesson content, never
 * taken from storage. Returns null when the run can't be recovered (caller starts fresh).
 */
export function sanitiseRun(lesson, raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const { step } = raw;
  if (!Number.isInteger(step) || step < 0 || step >= lesson.steps.length) return null;

  // Cleared activities: keep an entry only if its saved answer really is correct.
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

  // The current step: answer and status must agree with what the content says about that answer.
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

/** A step can be left only once it is understood: explanations always, activities only after a correct answer. */
export const canContinue = (step, status) => !isActivity(step) || status === 'correct';

export const initialLessonState = () => ({ step: 0, answer: null, status: 'idle', message: '', finished: false, cleared: {} });

// Show a step as it was left: a cleared activity reopens with its correct answer and feedback.
function openStep(state, index) {
  const done = state.cleared[index];
  return done
    ? { ...state, step: index, answer: done.answer, status: 'correct', message: done.message, finished: false }
    : { ...state, step: index, answer: null, status: 'idle', message: '', finished: false };
}

/**
 * Reducer for one lesson run. Wrong answers never advance; Continue only works after a correct answer.
 * Actions: select-option, toggle-tile, check, retry, continue, back, restart.
 */
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
      if (!has && current.length >= step.count) return state; // already holding the maximum
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
