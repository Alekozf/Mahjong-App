# Mahjong: session companion

A small web app that helps people get ready for their first mahjong session at uni.

**Try it:** https://alekozf.github.io/Mahjong-App/

## Why it exists

Turning up to a new club activity for the first time is hard, especially if you're going alone, you're new to the country, or you don't know the game. Getting through the door is only half of it. You also want to feel OK once you sit down at the table.

The app was designed with mainland Chinese international students in Australia in mind: people who'd like to join a social activity at uni but aren't sure what to expect. Being Chinese doesn't mean you already know mahjong, so the app assumes nothing. It's for anyone who's curious, whatever their background or experience.

## What's in it

- **Session.** What a beginner-friendly session looks like, what happens in your first few minutes, the different ways you can join in (play with someone explaining, watch a round first, or bring a friend), a few handy phrases for asking for help, and what to expect at the table.
- **Learn.** Three short lessons: *Meet the tiles*, *Build a combination* and *Try a guided turn*. They're optional, can be done in any order, and wrong answers just mean "try again", with a quick explanation either way.
- **Reference.** A quick rules guide to keep open during a game: tiles, pairs and sets, your turn, calls and winning.

It works on a phone or a computer, saves your progress in your browser, and needs no account or sign-up.

The session in the app is an example of how a beginner-friendly session could run. It isn't a real event, and the app isn't run by any club or university. It's an independent student proposal, made by Alexander Fitzsimons for Assessment 3 of Cross-Cultural Design Strategy at the University of Canberra. The rules follow MCR (the Mahjong Competition Rules).

## Run it yourself

You'll need [Node.js](https://nodejs.org) 20.19 or newer.

- **On Windows:** double-click `preview.cmd`. It installs what it needs, builds the app and opens it in your browser.
- **Anywhere else:**

  ```bash
  npm install
  npm run dev       # start a local copy that reloads as you edit
  npm test          # run the tests
  npm run build     # make the production version in dist/
  ```

- **Offline copy:** `npm run build:standalone` makes a single file, `standalone/mahjong.html`, that opens with a double-click, no internet needed.

## How it's made

React and Vite, with plain JavaScript and CSS. There's no server or tracking, and nothing leaves your browser. The lesson text lives in `src/content/` and the lesson logic in `src/lib/`, which is also where the tests are.

Every push to `main` runs the tests and publishes the app to GitHub Pages (see `.github/workflows/deploy.yml`).

## Credits

- Tile artwork is original, drawn for this app.
- Interface font: Nunito (SIL Open Font License 1.1).
- Tile characters: a small subset of Noto Serif SC (SIL Open Font License 1.1, see `src/assets/fonts/NotoSerifSC-OFL.txt`).
