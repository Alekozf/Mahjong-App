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

  // Move focus to the new screen's heading so keyboard and screen-reader users land at the top.
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

  // Explicit replay or restart: always back to step 1 (completion records are kept).
  const restartLesson = useCallback((lessonId) => {
    setRuns((prev) => ({ ...prev, [lessonId]: initialLessonState() }));
  }, []);

  // Ordinary navigation to a lesson: resume an unfinished run, otherwise start fresh.
  const openLesson = useCallback((lessonId) => {
    setRuns((prev) => (prev[lessonId] && !prev[lessonId].finished ? prev : { ...prev, [lessonId]: initialLessonState() }));
  }, []);

  /**
   * Clear completion in memory, then try to clear the saved record.
   * Returns 'saved' (reset will survive a reload), 'visit' (storage isn't in use, so
   * nothing was saved to begin with) or 'failed' (the saved record could not be cleared).
   */
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
  // Skip link: hash routing owns the URL hash, so focus <main> directly instead of following "#main".
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
