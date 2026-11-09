# Mahjong: session companion

A mobile-first web app for people going to their first in-person university mahjong session. It explains what a proposed beginner-friendly session involves, offers three short optional lessons, and gives a quick rules reference (MCR, Mahjong Competition Rules).

Built for Assessment 3 (Cross-Cultural Design Strategy, University of Canberra) by Alexander Fitzsimons. It is an independent student proposal, not an official service of any club or university.

## Quick preview

- **Double-click `preview.cmd`** (Windows). It installs packages on the first run, builds the app and opens it in your browser. Keep its window open while you use the app; close it to stop.
- **No Node at all?** Run `npm run build:standalone` once. It creates `standalone/mahjong.html`, a single self-contained file (code, styles, fonts and icon inside) that opens by double-clicking and works offline. Progress saves in that browser as normal.

`dist/index.html` from the normal build can't be double-clicked: browsers block its separate script files on `file://` pages. Use one of the two options above, or `npm run preview`.

## Run it

Needs Node 20.19+ or 22.12+.

```bash
npm install
npm run dev               # development server with live reload at http://localhost:5173
npm start                 # build, then open the production preview in your browser
npm test                  # unit tests: rules, lesson logic, storage, routes
npm run build             # production build in dist/
npm run preview           # open the last production build in your browser
npm run build:standalone  # single-file copy in standalone/mahjong.html
```

## Screens

| Route | Screen |
| --- | --- |
| `#/` | Session overview (default) |
| `#/session/guide` | Session guide |
| `#/learn` | Learn overview: three lessons, progress, reset |
| `#/learn/<lesson-id>` | Lesson player |
| `#/reference`, `#/reference/<section>` | Quick reference with section shortcuts |

## How it's built

React 19 + Vite, plain JavaScript and CSS. No backend, accounts, tracking or external APIs.

```
src/
  content/      lessons.js, reference.js, session.js   all teaching text, separate from UI
  lib/          tiles.js     tile model and names
                rules.js     Chow / Pung / Kong / pair recognition
                lesson.js    lesson engine (pure reducer: select, check, retry, continue, back)
                storage.js   versioned localStorage progress with safe fallbacks
                router.js    hash routing
                *.test.js    unit tests (Vitest)
  components/   Tile.jsx (original SVG tiles), Visuals.jsx, Icon.jsx, Shell.jsx
  screens/      SessionOverview, SessionGuide, LearnOverview, LessonPlayer, Reference, NotFound
  styles/       tokens.css (design tokens), app.css
```

- **Lessons are data.** Each step is `explain`, `choice` or `select`. Feedback for every wrong option lives beside the content. The reducer never advances on a wrong answer, keeps correct feedback until Continue, and reopens cleared steps as answered when you go back.
- **Progress.** Completion is saved in `localStorage` (`mahjong-companion:progress`, version 1) and validated on load. In-progress lesson positions are kept in `sessionStorage`, so leaving for the reference or refreshing keeps your place. Blocked or corrupted storage falls back to an empty record and the app keeps working.
- **Routing.** Hash routes work on any static host and subpath, survive refresh and support back/forward.
- **Assets.** `base: './'` makes every asset URL relative, so the build runs at `https://<user>.github.io/<repo>/` without hard-coding the repository name.

## Deploy to GitHub Pages

The workflow in `.github/workflows/deploy.yml` runs the unit tests, builds and publishes `dist/` on every push to `main`.

1. Push this folder to the repository's `main` branch.
2. In the repository: **Settings › Pages › Build and deployment › Source: GitHub Actions**.
3. Wait for the "Deploy to GitHub Pages" action to finish. The live URL appears in the action summary (normally `https://<user>.github.io/<repo>/`).

## Credits

- Rules content follows the Mahjong Competition Rules (MCR) rulebook.
- Tile artwork is original SVG drawn for this project.
- Interface font: Nunito, via `@fontsource-variable/nunito` (SIL Open Font License 1.1).
- Tile glyphs: a subset of Noto Serif SC (SIL Open Font License 1.1; licence in `src/assets/fonts/NotoSerifSC-OFL.txt`).
