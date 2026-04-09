# Pull Request Guidelines

Quick reference for contributing to Pomodoro Plant.

## Git Workflow

### 1. Set Up Your Local Repository

```bash
# Clone the repository (first time only)
git clone https://github.com/alissadb/pomodoro-plant.git
cd pomodoro-plant

# Or if you already have it cloned, navigate to it
cd pomodoro-plant
```

### 2. Start a New Feature

```bash
# Always start from the latest main branch
git checkout main
git pull origin main

# Create a new branch for your changes
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Make Your Changes

```bash
# Make your code changes
# Run tests to ensure everything works
npm test

# Stage your changes
git add .

# Commit with a descriptive Gitmoji message
git commit -m "✨ Add your feature description"
```

### 4. Push Your Branch

```bash
# Push your branch to GitHub
git push origin feature/your-feature-name

# If this is your first push for this branch
git push -u origin feature/your-feature-name
```

### 5. Create a Pull Request

1. Go to the repository on GitHub
2. Click "Compare & pull request" button
3. **Add a label** to categorize your change (see below)
4. Fill out the PR template
5. Submit the PR for review

#### PR Labels

**Add ONE label** to your PR to categorize the change and control versioning:

| Label | Use When |
|-------|----------|
| `feature` | Adding new functionality |
| `enhancement` | Improving existing features |
| `fix` / `bug` | Fixing bugs |
| `docs` | Documentation only |
| `refactor` | Code refactoring |
| `test` | Adding/updating tests |
| `chore` | Maintenance, dependencies |
| `ui` | UI/UX changes |
| `perf` | Performance improvements |
| `skip-release` | Skip release (WIP, internal changes) |

Labels determine version bumps in automated releases. See [release-workflow.md](./release-workflow.md) for details.

### 6. After PR is Merged

```bash
# Switch back to main
git checkout main

# Pull the latest changes (including your merged PR)
git pull origin main

# Delete your local feature branch
git branch -d feature/your-feature-name
```

## Quick Commands Reference

```bash
# Check current branch and status
git status

# See all branches
git branch -a

# Switch branches
git checkout branch-name

# View commit history
git log --oneline -10

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes (⚠️ careful!)
git reset --hard HEAD
```

## Before Submitting Your PR

- [ ] Code follows project style (see `styles.css`, existing `.js` files)
- [ ] All tests pass locally (`npm test`)
- [ ] New features have tests added
- [ ] Manual testing completed in browser
- [ ] Documentation updated if needed
- [ ] Commit messages follow Gitmoji convention (see `.agents/commit-conventions.md`)
- [ ] Branch is up to date with `main`
- [ ] **PR has appropriate label** (feature, fix, docs, etc.)

## Testing Your Changes

### Run Tests
```bash
npm test
```

### Local Development Server
```bash
# Using npm
npm run dev

# Or using Make
make serve

# Or using Python
python -m http.server 8000
```

Test your changes by completing focus sessions, switching plants, and adjusting settings.

## Need Help?

- Check the [README.md](../README.md) for project overview
- Review [commit-conventions.md](./commit-conventions.md) for commit message format
- See existing PRs for examples
- Open an issue if you have questions

## Common Issues

### "Your branch is behind 'origin/main'"
```bash
git checkout main
git pull origin main
git checkout your-branch
git merge main
```

### "Merge conflicts"
```bash
# Open conflicted files and resolve conflicts
# Look for <<<<<<< HEAD markers
git add .
git commit -m "🔀 Merge main into feature branch"
```

### "Tests failing on CI but pass locally"
- Make sure you've committed all changes
- Check if your branch is up to date with main
- Review the GitHub Actions logs for specific errors
