# Commit Message Conventions

This project uses **Gitmoji** for semantic commit messages, inspired by [FastAPI](https://github.com/fastapi/fastapi).

## Format

```
<emoji> <description> (#PR-number)
```

### Examples

```
✨ Add timer sound notification feature (#12)
🐛 Fix plant growth stage calculation bug
📝 Update README with new QA testing panel
♻️ Refactor timer-controller for better testability
✅ Add tests for notification module
```

## Common Emoji Prefixes

**Note:** Pre-commit hooks validate that commits start with one of the emojis listed below. The validation ensures consistency across the project.

### Features & Fixes
- ✨ `:sparkles:` - New feature
- 🐛 `:bug:` - Bug fix
- 🚑 `:ambulance:` - Critical hotfix
- ⚡ `:zap:` - Performance improvement
- 🔒 `:lock:` - Security fix

### Code Quality
- ♻️ `:recycle:` - Refactor code
- 🎨 `:art:` - Improve code structure/format
- 🔥 `:fire:` - Remove code or files
- 🚨 `:rotating_light:` - Fix linter warnings

### Documentation
- 📝 `:memo:` - Add or update documentation
- 💡 `:bulb:` - Add or update comments
- ✏️ `:pencil2:` - Fix typos

### Testing
- ✅ `:white_check_mark:` - Add or update tests
- 🧪 `:test_tube:` - Add a failing test
- ✔️ `:heavy_check_mark:` - Make tests pass

### UI & Assets
- 💄 `:lipstick:` - Add or update UI and style files
- 🖼️ `:framed_picture:` - Add or update assets

### Configuration & DevOps
- 🔧 `:wrench:` - Add or update configuration files
- 🔨 `:hammer:` - Add or update development scripts
- 👷 `:construction_worker:` - Add or update CI/CD
- 🚀 `:rocket:` - Deploy stuff
- 📦 `:package:` - Add or update compiled files or packages

### Dependencies
- ⬆️ `:arrow_up:` - Upgrade dependencies
- ⬇️ `:arrow_down:` - Downgrade dependencies
- ➕ `:heavy_plus_sign:` - Add a dependency
- ➖ `:heavy_minus_sign:` - Remove a dependency

### Project Management
- 🔖 `:bookmark:` - Release/Version tags
- 🎉 `:tada:` - Begin a project
- 🚧 `:construction:` - Work in progress

## Tips for Good Commit Messages

1. **Use imperative mood**: "Add feature" not "Added feature"
2. **Be specific**: "Fix timer pause bug" not "Fix bug"
3. **Reference issues**: Include issue numbers when relevant
4. **Keep title concise**: Aim for 50 characters or less for the title (72 character hard limit)
5. **Add details in body**: Use multi-line commits for complex changes (wrap body at 72 characters)

### Multi-line Example

```
✨ Add customizable timer durations

- Allow users to set custom focus/break times
- Add settings panel with duration sliders
- Persist custom settings to localStorage
- Update QA panel to test custom durations

Closes #15
```

## Git Workflow

Before making any commits, always start from the latest `main` branch:

```bash
# Switch to main branch
git checkout main

# Pull the latest changes
git pull origin main

# Create a new branch for your work
git checkout -b feature/your-feature-name
```

See [pr-guidelines.md](./pr-guidelines.md) for complete git workflow documentation.

## Branch Naming Convention

Use descriptive branch names with prefixes:

```
feature/<description>    # New features
fix/<description>        # Bug fixes
docs/<description>       # Documentation updates
refactor/<description>   # Code refactoring
test/<description>       # Test additions
```

### Examples

```
feature/timer-sound-options
fix/plant-growth-stage-bug
docs/update-contributing-guide
refactor/modularize-state-management
test/add-notification-tests
```

## Resources

- [Gitmoji Guide](https://gitmoji.dev) - Full emoji reference
- [Conventional Commits](https://www.conventionalcommits.org) - Alternative standard
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/) - Best practices
