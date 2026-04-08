# Pomodoro Plant

[![Test and Deploy](https://github.com/alissadb/pomodoro-plant/actions/workflows/deploy.yml/badge.svg)](https://github.com/alissadb/pomodoro-plant/actions/workflows/deploy.yml)

A lightweight Pomodoro web app where your chosen plant grows as you focus.

**[🚀 Live Demo](https://alissadb.github.io/pomodoro-plant/)**

## Features

- Full Pomodoro cycle:
  - Focus: 25 minutes
  - Short break: 5 minutes
  - Long break: 15 minutes every 4 completed focus sessions
- Manual start after each interval
- Adjustable growth target by rounds (default: 10 rounds = 250 minutes)
- Plant selector with 8 choices:
  - Monstera deliciosa variegata
  - Strelitzia nicolai
  - Begonia maculata (Polka Dot)
  - Epipremnum aureum (Pothos)
  - Sansevieria trifasciata (Snake Plant)
  - Spathiphyllum wallisii (Peace Lily)
  - Zamioculcas zamiifolia (ZZ Plant)
  - Chlorophytum comosum (Spider Plant)
- Stylized procedural SVG plant growth stages
- Browser notifications + chime sound on interval completion
- Last 8 session events history
- Local persistence via `localStorage`
- Installable as a PWA (Add to Home Screen)
- Configurable growth target by round count (default: 10 rounds)
- 28 comprehensive tests ensuring reliability

## Quick Start

### Deploy to GitHub Pages

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions.

**TL;DR:**
1. Create a GitHub repo named `pomodoro-plant`
2. Push this code to the `main` branch
3. Enable GitHub Pages with "GitHub Actions" as the source
4. Your app will be live at `https://<username>.github.io/pomodoro-plant/`

## Run Locally

### Using Make (Recommended)

```bash
make serve    # Start development server on http://localhost:8000
make test     # Run all 28 tests
make dev      # Run server in background, then run tests
```

### Using Python directly

### Using Python directly

From project root:

```bash
python -m http.server 8000
# Or with uv:
uv run python -m http.server 8000
```

Open: `http://localhost:8000`

## Run Tests

All 28 tests (covering core logic and state management):

```bash
npm test
```

Tests cover:
- Timer logic and state transitions
- Growth calculations and stage progression
- Plant selection and normalization
- Data sanitization and localStorage recovery
- Edge cases and boundary conditions

## Install on Mobile (PWA)

## Install on Mobile (PWA)

### iPhone/iPad (Safari):

1. Open the app in Safari
2. Tap the Share button
3. Choose **Add to Home Screen**
4. Launch it from your home screen like a native app

### Android (Chrome):

1. Open the app in Chrome
2. Tap the three-dot menu
3. Choose **Add to Home screen** or **Install app**
4. Launch from your app drawer

**Note:** Works offline after first visit! Growth progress syncs via localStorage.

## Project Structure

- `index.html` - Main UI structure
- `styles.css` - Responsive styles and plant visuals
- `app.js` - Timer logic, DOM manipulation, plant rendering, and persistence
- `pomodoro-core.js` - Pure functions (time formatting, mode cycling, stage calculation)
- `app-state-core.js` - State management functions (sanitization, transitions)
- `sw.js` - Service worker for offline caching (PWA)
- `manifest.webmanifest` - PWA manifest for installability
- `tests/` - Comprehensive test suite (28 tests)
- `.github/workflows/deploy.yml` - CI/CD pipeline (test + deploy)

## Technology Stack

- **Vanilla JavaScript** (ES modules) - No frameworks, fast and lightweight
- **CSS Custom Properties** - Theme variables for easy customization
- **Service Worker** - Offline-first PWA with caching
- **Node.js test runner** - Zero dependencies, built-in testing
- **GitHub Actions** - Automated testing and deployment

## Development Workflow

1. **Make changes** to your code
2. **Test locally:** `make serve` and `npm test`
3. **Commit and push** to `main` branch
4. **GitHub Actions** automatically:
   - Runs all 28 tests
   - Deploys to GitHub Pages (if tests pass)
5. **Visit your live site** at `https://<username>.github.io/pomodoro-plant/`

## Notes

## Notes

- Growth increases only after a completed 25-minute focus session
- Notifications require browser permission (will prompt on first timer completion)
- All data is stored locally in your browser (nothing sent to servers)
- Service worker caches assets for offline use
- Compatible with modern browsers (Chrome, Firefox, Safari, Edge)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Commit: `git commit -m "Description of changes"`
6. Push: `git push origin feature-name`
7. Open a Pull Request

## License

MIT - Feel free to use this project however you'd like!

---

**Happy focusing! 🌱**
