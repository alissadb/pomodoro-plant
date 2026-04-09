# AGENTS.md

High-signal guidance for working in this repository.

## ⚠️ CRITICAL: Git Workflow

**NEVER push directly to main/master. ALL changes go through feature branches and PRs.**

```bash
# ✅ CORRECT: Always create a feature branch first
git checkout -b feature/my-feature
git commit -m "✨ Add feature"
git push -u origin feature/my-feature
gh pr create

# ❌ WRONG: Never commit/push directly to main
git checkout main
git commit -m "✨ Add feature"  # BLOCKED
git push                         # BLOCKED
```

**When asked to "create a commit and PR":**
1. Check current branch
2. If on main → automatically create feature branch
3. Commit to feature branch
4. Push feature branch
5. Create PR to main

See `.agents/git-workflow.md` for full automation details.

---

## Commands

**Dev server:**
```bash
make serve          # Uses uv run python -m http.server 8000 (kills port 8000 first)
npm run dev         # Uses python3 -m http.server 8000
python -m http.server 8000
```

**Tests:**
```bash
npm test            # Node.js test runner (node --test)
```

**Pre-commit setup:**
```bash
pip install pre-commit
pre-commit install
pre-commit install --hook-type commit-msg  # Required for Gitmoji validation
```

## Commit Conventions

**Gitmoji required.** Commit messages MUST start with an emoji or pre-commit hook will reject them.

Common patterns:
- `✨ Add feature`
- `🐛 Fix bug`
- `📝 Update docs`
- `♻️ Refactor code`
- `✅ Add tests`
- `🔧 Update config`
- `💄 Update UI/styles`

See `.agents/commit-conventions.md` for full list. Use imperative mood. Keep under 50 chars.

## Testing

- **Test framework:** Node.js native test runner (`node --test`)
- **Test files:** `tests/app-state-core.test.js`, `tests/pomodoro-core.test.js`
- **28 tests total** covering core domain logic
- New features need tests; bug fixes need regression tests

## Architecture

Vanilla JS PWA with modular separation:

```
src/
├── app.js              # UI orchestration, DOM wiring
├── pomodoro-core.js    # Pure domain logic (modes, stages, timers)
├── app-state-core.js   # State transitions, sanitization
├── timer-controller.js # Timer lifecycle (start/stop/tick)
├── state-storage.js    # localStorage wrapper (debounced saves)
├── notifications.js    # Browser notifications + chimes
├── plant-renderer.js   # SVG generation (snake, zz, begonia)
└── styles/styles.css
```

**Key constraints:**
- `pomodoro-core.js` and `app-state-core.js` are framework-agnostic, pure functions
- `app.js` coordinates modules but delegates business logic to core modules
- ES6 modules (`type: "module"` in package.json)
- No build step, no bundler, no dependencies

## Code Quality

**Pre-commit runs automatically:**
1. Prettier (auto-formats JS/CSS/HTML/JSON/MD)
2. ESLint (auto-fixes JS)
3. `npm test` (must pass before commit)
4. Gitmoji validation (rejects commits without emoji prefix)

**Excludes:** `.snap` files, `.svg` files, `sw.js`, `*.min.*`, `node_modules/`

**Prettier:** Semi-colons on, single quotes, 2 spaces, 80 char width, arrow parens avoid  
**ESLint:** Standard config, unused vars warn, console allowed

## CI/CD

**`.github/workflows/ci.yml`:**
1. Run tests on PRs to ensure quality before merge

**`.github/workflows/deploy.yml`:**
1. Run tests on every push to main
2. Deploy to GitHub Pages only if tests pass

**Other workflows:** `auto-publish.yml`, `release-drafter.yml` (see `.agents/release-workflow.md` for details)

## Storage

**Key:** `"pomodoro-plant-state-v5"`  
**Module:** `state-storage.js` exports `createStateStorage()`  
**Debounced:** Auto-saves on state changes (debounced), immediate save on critical events

## Documentation

**Existing guides in `.agents/`:**
- `commit-conventions.md` – Full Gitmoji reference
- `pr-guidelines.md` – Git workflow, branch naming, PR labels
- `pre-commit-setup.md` – Pre-commit installation details
- `release-workflow.md` – Release and versioning process
- `git-workflow.md` – Automated workflow for commit + push + PR creation

**CONTRIBUTING.md** and **README.md** are canonical. Trust them for workflow and architecture overview.

## Gotchas

- **Make uses `uv run`**: `make serve` wraps Python with `uv run`, not plain `python3`
- **Port killing**: `make serve` and `make dev` kill processes on port 8000 before starting
- **Pre-commit required for commits**: Without `pre-commit install --hook-type commit-msg`, Gitmoji validation won't run and direct commits will fail in CI mindset
- **No lockfile**: No `package-lock.json` or `npm` dependencies (tests use Node.js built-ins only)
