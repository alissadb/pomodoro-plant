# Pomodoro Plant

Grow a virtual plant while staying focused with the Pomodoro technique.

[![Test and Deploy](https://github.com/alissadb/pomodoro-plant/actions/workflows/deploy.yml/badge.svg)](https://github.com/alissadb/pomodoro-plant/actions/workflows/deploy.yml)

**🚀 [Live Demo](https://alissadb.github.io/pomodoro-plant/)**

## Features

- 25-min focus sessions, 5-min short breaks, 15-min long breaks (every 4th cycle)
- Choose from 3 plants: Monstera, Strelitzia, or Begonia
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
app.js              # Main app logic
pomodoro-core.js    # Pure functions (timer, modes, stages)
app-state-core.js   # State management
styles.css          # Design & plant visuals
tests/              # 28 automated tests
```
