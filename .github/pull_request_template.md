## PR Label (Required for Release Notes)

**⚠️ Please add ONE label to this PR to categorize the change:**

- `feature` ✨ - New feature (e.g., add custom timers) → **MINOR** version bump
- `enhancement` 🚀 - Improvement to existing feature → **MINOR** version bump
- `fix` or `bug` 🐛 - Bug fix → **PATCH** version bump
- `docs` 📝 - Documentation only → **PATCH** version bump
- `refactor` ♻️ - Code refactoring (no functional change) → **PATCH** version bump
- `test` ✅ - Add or update tests → **PATCH** version bump
- `chore` 🔧 - Maintenance/dependencies → **PATCH** version bump
- `ui` 💄 - UI/UX changes → **PATCH** version bump
- `perf` ⚡ - Performance improvement → **PATCH** version bump
- `breaking` 🚨 - Breaking change → **MINOR** version bump (0.x.x)
- `skip-release` 🚫 - Don't include in release notes

**Note:** Labels determine version bumping and release note categories. A release is automatically created after merging.

---

## Description

Please provide a clear and concise description of what this PR does.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Refactor (code change that neither fixes a bug nor adds a feature)
- [ ] Documentation update
- [ ] Tests
- [ ] Performance improvement
- [ ] UI/Style update

## Checklist

- [ ] My code follows the project's code style
- [ ] I have tested these changes locally
- [ ] I have added/updated tests (if applicable)
- [ ] All tests pass (`npm test`)
- [ ] I have verified plant rendering works correctly (if applicable)
- [ ] I have tested using the QA panel for plant changes (if applicable)
- [ ] I have updated documentation (if needed)

## How to Test

Please describe the steps to test your changes:

1. 
2. 
3. 

## Screenshots/Demo (Optional)

If your PR includes UI changes or new visual features, please add screenshots or a short demo.

## Related Issues

Closes #
Relates to #

---

**Note:** This project uses [Gitmoji](https://gitmoji.dev) commit conventions. See `.agents/commit-conventions.md` for guidelines.
