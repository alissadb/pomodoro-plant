# Contributing to Pomodoro Plant

Thank you for your interest in contributing to Pomodoro Plant! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Project Architecture](#project-architecture)
- [Need Help?](#need-help)

## Code of Conduct

Be respectful, inclusive, and considerate. We're all here to learn and build something useful together.

## Getting Started

### Prerequisites

- Git installed
- Node.js and npm (for running tests)
- A modern web browser
- Basic knowledge of JavaScript, HTML, and CSS

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR-USERNAME/pomodoro-plant.git
cd pomodoro-plant
```

3. Add the upstream remote:

```bash
git remote add upstream https://github.com/alissadb/pomodoro-plant.git
```

### Install Dependencies

```bash
npm install
```

### Set Up Pre-commit Hooks (Recommended)

Pre-commit hooks automatically check code quality before commits:

```bash
# Install pre-commit
pip install pre-commit

# Install git hooks
pre-commit install
pre-commit install --hook-type commit-msg
```

See [`.agents/pre-commit-setup.md`](.agents/pre-commit-setup.md) for detailed setup instructions.

### Run Locally

```bash
# Start a local server
npm run dev

# Or use Make
make serve

# Or use Python
python -m http.server 8000
```

Open http://localhost:8000 in your browser.

## Development Workflow

We follow a standard GitHub flow. See [`.agents/pr-guidelines.md`](.agents/pr-guidelines.md) for detailed instructions.

### Quick Start

```bash
# 1. Start from latest main
git checkout main
git pull upstream main

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes and commit
git add .
git commit -m "✨ Add your feature description"

# 4. Push your branch
git push origin feature/your-feature-name

# 5. Create a Pull Request on GitHub
```

## Commit Conventions

We use **Gitmoji** for semantic commit messages, inspired by [FastAPI](https://github.com/fastapi/fastapi).

### Format

```
<emoji> <description> (#PR-number)
```

### Common Examples

```bash
✨ Add timer sound notification feature
🐛 Fix plant growth stage calculation bug
📝 Update README with QA testing panel
♻️ Refactor timer-controller for better testability
✅ Add tests for notification module
💄 Improve plant rendering styling
```

See [`.agents/commit-conventions.md`](.agents/commit-conventions.md) for the complete emoji reference.

## Pull Request Process

1. **Fill out the PR template** - Provide clear description and testing steps
2. **Ensure all tests pass** - Run `npm test` locally
3. **Test manually** - Verify changes in browser by running the local dev server
4. **Keep PRs focused** - One feature/fix per PR
5. **Reference issues** - Link related issues in your PR description

See the [PR template](.github/pull_request_template.md) for what to include.

## Testing Guidelines

### Run Tests

```bash
npm test
```

### Manual Testing

```bash
# Start local server
npm run dev

# Open in browser
open http://localhost:8000
```

Test plant changes by:
- Completing focus sessions to verify growth stages render correctly
- Switching between plant types
- Adjusting the round goal to test different growth rates

### Test Coverage

- New features should include tests
- Bug fixes should include regression tests
- Aim to maintain or improve test coverage

## Project Architecture

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

### Design Principles

- **KISS** (Keep It Simple, Stupid) - Favor simplicity over complexity
- **SOLID** - Follow SOLID principles for maintainability
- **DRY** (Don't Repeat Yourself) - Avoid code duplication
- **Separation of Concerns** - Keep domain logic separate from UI

## Code Style

### JavaScript

- Use ES6+ features
- Prefer `const` over `let`, avoid `var`
- Use descriptive variable and function names
- Add JSDoc comments for public functions
- Follow existing code patterns

### CSS

- Use existing CSS variables for colors
- Follow BEM-like naming for new components
- Mobile-first responsive design
- Maintain dark mode compatibility

### HTML

- Semantic HTML5 elements
- Accessible markup (ARIA labels where needed)
- Progressive enhancement approach

## What to Contribute

### Good First Issues

Look for issues labeled `good first issue` - these are great for newcomers!

### Ideas for Contributions

- **Features**: Timer customization, new plant types, sound options
- **Bug fixes**: Check the issue tracker
- **Documentation**: Improve README, add code comments
- **Tests**: Add missing test coverage
- **Accessibility**: Improve keyboard navigation, screen reader support
- **Performance**: Optimize rendering, reduce bundle size
- **UI/UX**: Design improvements, animations

## Need Help?

- **Questions?** Open a [GitHub Discussion](https://github.com/alissadb/pomodoro-plant/discussions)
- **Bug report?** Open an [Issue](https://github.com/alissadb/pomodoro-plant/issues)
- **Documentation:**
  - [PR Guidelines](.agents/pr-guidelines.md)
  - [Commit Conventions](.agents/commit-conventions.md)

## Recognition

Contributors will be recognized in the project! Your contributions are valued and appreciated.

---

**Thank you for contributing to Pomodoro Plant!** 🌱⏱️
