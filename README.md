# Pomodoro Plant

Grow a virtual plant while staying focused with the Pomodoro technique.

[![Test and Deploy](https://github.com/alissadb/pomodoro-plant/actions/workflows/deploy.yml/badge.svg)](https://github.com/alissadb/pomodoro-plant/actions/workflows/deploy.yml)

**🚀 [Live Demo](https://alissadb.github.io/pomodoro-plant/)**

## Features

- 25-min focus sessions, 5-min short breaks, 15-min long breaks (every 4th cycle)
- Choose from 3 plants: Snake Plant, ZZ Plant, or Begonia
- Visual growth stages as you complete focus sessions
- Adjustable growth goal (default: 10 rounds = 250 minutes)
- Browser notifications + sound chimes
- Installable PWA with offline support
- Local data persistence

## Quick Start

**Run locally:**
```bash
python -m http.server 8000
# or: make serve
```

**Run tests:**
```bash
npm test
```

**Install on mobile:**
- iOS: Open in Safari → Share → Add to Home Screen
- Android: Open in Chrome → Menu → Install app

## Development

```
app.js              # App orchestration (UI + module wiring)
pomodoro-core.js    # Pure domain functions (modes, stages, goals)
app-state-core.js   # State transitions + sanitization
timer-controller.js # Timer loop lifecycle (start/stop/tick)
state-storage.js    # localStorage adapter (debounced/immediate save)
notifications.js    # Browser notifications + completion chime
plant-renderer.js   # Plant SVG rendering (snake, zz, begonia, fallback)
styles.css          # Design system + visual styling
tests/              # 28 automated tests
```

## Architecture Notes

- `app.js` coordinates modules and DOM events, but keeps business rules in core/state modules.
- `pomodoro-core.js` and `app-state-core.js` remain framework-agnostic and easy to unit test.
- Rendering, timer, notifications, and persistence are isolated behind dedicated modules to keep the codebase KISS, SOLID, and DRY.
