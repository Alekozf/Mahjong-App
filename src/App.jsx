import { useCallback, useEffect, useRef, useState } from 'react';
import { useHashRoute } from './lib/router.js';
import { loadProgress, saveProgress, markComplete, clearProgress, emptyProgress } from './lib/storage.js';
import { initialLessonState, lessonReducer } from './lib/lesson.js';
import { loadRuns, saveRuns } from './lib/runs.js';
import { lessons, lessonIds, getLesson } from './content/lessons.js';
import { MainNav } from './components/Shell.jsx';
import SessionOverview from './screens/SessionOverview.jsx';
import SessionGuide from './screens/SessionGuide.jsx';
import LearnOverview from './screens/LearnOverview.jsx';
import LessonPlayer from './screens/LessonPlayer.jsx';
import Reference from './screens/Reference.jsx';
import NotFound from './screens/NotFound.jsx';

const sectionOf = (route) => {
  if (route.name === 'session' || route.name === 'guide') return 'session';
  if (route.name === 'learn' || route.name === 'lesson') return 'learn';
  if (route.name === 'reference') return 'reference';
  return null;
};

export default function App() {
  const { hash, route } = useHashRoute();
  const [{ progress, available }, setProgressState] = useState(() => loadProgress(lessonIds));
  const [runs, setRuns] = useState(() => loadRuns(lessons));
  const firstRender = useRef(true);

  useEffect(() => saveRuns(runs), [runs]);

  // When the screen changes, move focus to its heading so keyboard and screen-reader users start at the top.
  useEffect(() => {
    const deepLinkedSection = route.name === 'reference' && route.section;
    if (firstRender.current) {
      firstRender.current = false;
      if (!deepLinkedSection) return; // a fresh load already starts at the top
    }
    const target = route.name === 'reference' && route.section ? document.getElementById(`ref-${route.section}`) : null;
    if (target) {
      target.scrollIntoView({ block: 'start' });
      target.querySelector('h2')?.focus({ preventScroll: true });
      return;
    }
    window.scrollTo(0, 0);
    document.querySelector('main h1')?.focus({ preventScroll: true });
  }, [hash]); // eslint-disable-line react-hooks/exhaustive-deps

  const dispatchLesson = useCallback((lessonId, action) => {
    const lesson = getLesson(lessonId);
    setRuns((prev) => ({ ...prev, [lessonId]: lessonReducer(lesson, prev[lessonId] || initialLessonState(), action) }));
  }, []);

  const completeLesson = useCallback((lessonId) => {
    setProgressState((prev) => {
      const next = markComplete(prev.progress, lessonId);
      if (next === prev.progress) return prev;
      return { progress: next, available: saveProgress(next) };
    });
  }, []);

  // Replay or restart always goes back to step 1. Finished lessons stay finished.
  const restartLesson = useCallback((lessonId) => {
    setRuns((prev) => ({ ...prev, [lessonId]: initialLessonState() }));
  }, []);

  // Opening a lesson picks up where you left off, or starts fresh.
  const openLesson = useCallback((lessonId) => {
    setRuns((prev) => (prev[lessonId] && !prev[lessonId].finished ? prev : { ...prev, [lessonId]: initialLessonState() }));
  }, []);

  // Clear progress. Returns 'saved' if the reset will last after a reload, 'visit' if the
  // browser wasn't saving anything anyway, or 'failed' if the saved progress couldn't be cleared.
  const resetProgress = useCallback(() => {
    const result = clearProgress() ? 'saved' : available ? 'failed' : 'visit';
    setProgressState({ progress: emptyProgress(), available: result === 'saved' });
    setRuns({});
    return result;
  }, [available]);

  let screen;
  switch (route.name) {
    case 'session':
      screen = <SessionOverview />;
      break;
    case 'guide':
      screen = <SessionGuide />;
      break;
    case 'learn':
      screen = (
        <LearnOverview
          lessons={lessons}
          progress={progress}
          runs={runs}
          storageAvailable={available}
          onOpen={openLesson}
          onRestart={restartLesson}
          onReset={resetProgress}
        />
      );
      break;
    case 'lesson': {
      const lesson = getLesson(route.lessonId);
      screen = lesson ? (
        <LessonPlayer
          key={lesson.id}
          lesson={lesson}
          state={runs[lesson.id] || initialLessonState()}
          dispatch={(action) => dispatchLesson(lesson.id, action)}
          onComplete={completeLesson}
          onRestart={restartLesson}
          onOpen={openLesson}
          progress={progress}
        />
      ) : (
        <NotFound />
      );
      break;
    }
    case 'reference':
      screen = <Reference section={route.section} from={getLesson(route.query.from) ? route.query.from : null} />;
      break;
    default:
      screen = <NotFound />;
  }

  const focused = route.name === 'lesson';
  // Skip link: the URL hash is used for routing, so focus <main> directly rather than jumping to #main.
  const skip = (e) => {
    e.preventDefault();
    document.getElementById('main')?.focus();
  };

  return (
    <div className={`app ${focused ? 'app--focused' : ''}`}>
      <a className="skip-link" href="#main" onClick={skip}>Skip to content</a>
      {!focused && <MainNav current={sectionOf(route)} />}
      <main className="main" id="main" tabIndex={-1}>
        {screen}
      </main>
    </div>
  );
}
