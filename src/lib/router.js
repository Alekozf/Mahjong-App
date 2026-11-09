// Routes live in the URL hash, so the app works on GitHub Pages under any repo name,
// survives a refresh and works with the back and forward buttons.
import { useEffect, useState } from 'react';

// "#/learn/meet-the-tiles?from=x" becomes { path: '/learn/meet-the-tiles', segments: [...], query: { from: 'x' } }
export function parseHash(hash) {
  const raw = (hash || '').replace(/^#/, '') || '/';
  const [pathPart, queryPart = ''] = raw.split('?');
  const path = '/' + pathPart.split('/').filter(Boolean).join('/');
  const query = Object.fromEntries(new URLSearchParams(queryPart));
  return { path, segments: path.split('/').filter(Boolean), query };
}

export function matchRoute(hash) {
  const { segments, query } = parseHash(hash);
  const [a, b] = segments;
  if (!a) return { name: 'session', query };
  if (a === 'session' && b === 'guide' && segments.length === 2) return { name: 'guide', query };
  if (a === 'session' && segments.length === 1) return { name: 'session', query };
  if (a === 'learn' && !b) return { name: 'learn', query };
  if (a === 'learn' && b && segments.length === 2) return { name: 'lesson', lessonId: b, query };
  if (a === 'reference' && segments.length <= 2) return { name: 'reference', section: b || null, query };
  return { name: 'not-found', query };
}

export const href = (path) => `#${path}`;

export function navigate(path) {
  window.location.hash = path;
}

export function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return { hash, route: matchRoute(hash) };
}
