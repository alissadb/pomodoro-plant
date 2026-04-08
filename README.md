# Pomodoro Plant

Grow a virtual plant while staying focused with a lightweight Pomodoro timer.

[![Test and Deploy](https://github.com/alissadb/pomodoro-plant/actions/workflows/deploy.yml/badge.svg)](https://github.com/alissadb/pomodoro-plant/actions/workflows/deploy.yml)

## Live Demo

**🚀 [https://alissadb.github.io/pomodoro-plant/](https://alissadb.github.io/pomodoro-plant/)**

## Features

- Full Pomodoro cycle:
  - Focus: 25 minutes
  - Short break: 5 minutes
  - Long break: 15 minutes every 4 completed focus sessions
- Manual start after each interval
- Adjustable growth target by rounds (default: 10 rounds = 250 minutes)
- Plant selector with 3 choices:
  - Monstera deliciosa variegata
  - Strelitzia nicolai
  - Begonia maculata (Polka Dot)
- Visual growth progression and stage updates
- Browser notifications + completion chime
- Recent session history
- Installable PWA (Add to Home Screen)
- Offline caching via service worker
- Local persistence via `localStorage`

## Run Locally

From project root:

```bash
uv run python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Optional helper commands:

```bash
make serve
make test
```

## Tests

Run all tests:

```bash
npm test
```

Current suite: 28 passing tests.

## Install on Mobile (PWA)

### iPhone / iPad (Safari)

1. Open the app URL in Safari.
2. Tap Share.
3. Select **Add to Home Screen**.
4. Launch from your home screen.

### Android (Chrome)

1. Open the app URL in Chrome.
2. Open browser menu.
3. Tap **Install app** or **Add to Home screen**.

## iOS Compatibility Notes

- Use the HTTPS deployed URL (required for full PWA behavior).
- If updates seem stale, close app tabs, refresh once in Safari, then relaunch.
- Service worker cache is versioned in `sw.js`.

## Project Structure

- `index.html` - App layout and controls
- `styles.css` - Visual design and responsive styles
- `app.js` - UI behavior, timer flow, rendering, notifications
- `pomodoro-core.js` - Pure core functions
- `app-state-core.js` - State sanitization and transition helpers
- `manifest.webmanifest` - PWA manifest
- `sw.js` - Service worker cache logic
- `assets/` - App icons/assets
- `tests/` - Automated tests
- `.github/workflows/deploy.yml` - CI/CD test + deploy pipeline
- `DEPLOYMENT.md` - Deployment guide

## Notes

- Growth increases after each completed focus round.
- Switching plants does not reset progress.
- Long breaks trigger after every 4 completed focus rounds (including skipped focus rounds).
- Data stays in the browser and is not sent to a backend.
