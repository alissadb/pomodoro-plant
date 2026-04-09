# Git Workflow Automation Guide

Quick reference for creating commits, pushing changes, and opening pull requests in this repository.

---

## ⚠️ CRITICAL RULE: Never Push Directly to Main

**ALL changes MUST go through a feature branch and PR.**

✅ **Correct workflow:**
```
main → feature branch → commit → push → PR → merge
```

❌ **Never do this:**
```
main → commit → push (BLOCKED)
```

---

## Quick Commands

### Option 1: Manual Git Flow
```bash
# Create feature branch FIRST
git checkout -b feature/my-feature

# Stage changes
git add .

# Commit with Gitmoji
git commit -m "✨ Add feature description"

# Push to feature branch
git push -u origin feature/my-feature

# Create PR
gh pr create --title "Title" --body "Description"
```

### Option 2: Automated Flow (Recommended)
Ask OpenCode to:
```
"Create a commit, push, and open a PR"
```

**Important:** If you're currently on the main branch, first ask OpenCode to create a feature branch, or create one manually before committing.

---

## Workflow: Commit + Push + PR

When you ask OpenCode to create a commit, push, and PR, it will:

1. **Check current branch** - If on main/master, create feature branch automatically
2. **Verify branch protection** - Ensure not pushing directly to main
3. **Stage relevant files** - Add modified files to staging area
4. **Create commit** - Following Gitmoji conventions
5. **Push to feature branch** - With upstream tracking if needed
6. **Create pull request** - Using `gh` CLI with proper format

---

## Commit Message Format

### Required: Gitmoji Prefix

All commits MUST start with a Gitmoji emoji. See `.agents/commit-conventions.md` for full list.

**Common patterns:**
```
✨ Add new feature
🐛 Fix bug
📝 Update documentation
♻️ Refactor code
✅ Add or update tests
🔧 Update configuration
💄 Update UI/styles
⚡ Improve performance
🔒 Fix security issue
```

### Structure

```
<emoji> <imperative description>

[Optional body paragraphs]
[Explaining the why, not the what]

[Optional footers like "Closes #123"]
```

**Example:**
```
✨ Add keyboard shortcuts for timer control

Adds Space (start/pause), R (reset), and S (skip) keyboard shortcuts.
Ignores shortcuts when user is typing in input fields.

Closes #45
```

---

## Branch Naming

Follow these conventions:

```
feature/<description>    # New features
fix/<description>        # Bug fixes
docs/<description>       # Documentation updates
refactor/<description>   # Code refactoring
test/<description>       # Test additions
chore/<description>      # Maintenance tasks
```

**Examples:**
```
feature/keyboard-shortcuts
fix/timer-race-condition
docs/update-contributing
refactor/modularize-state
test/add-integration-tests
```

---

## Pull Request Format

### Title
Should match the main commit message (with Gitmoji):
```
✨ Add keyboard shortcuts for timer control
```

### Body Template

```markdown
## Summary
- Brief bullet points of what changed
- Focus on user-facing impact
- Keep it concise (1-3 bullets)

## Changes
- Technical details of implementation
- Files modified
- Approach taken

## Testing
- How to test the changes
- Steps to reproduce
- Expected behavior

## Related Issues
Closes #123
Fixes #456
```

---

## Step-by-Step Workflow

### 1. Ensure You're On a Feature Branch (REQUIRED)

**⚠️ NEVER commit directly to main/master.**

```bash
# Check current branch
git branch --show-current

# If on main, CREATE FEATURE BRANCH FIRST
git checkout -b feature/my-feature
```

**Branch naming format:**
```
feature/<description>    # For new features
fix/<description>        # For bug fixes
docs/<description>       # For documentation
refactor/<description>   # For code refactoring
```

**Safety Check:**
- Always verify you're on a feature branch before committing
- If on main/master, create a feature branch immediately
- Branch name should be descriptive of your changes

---

### 2. Stage Changes

OpenCode will intelligently stage:
- Modified source files
- Updated tests
- Documentation changes
- Configuration updates

**Excluded by default:**
- `node_modules/`
- Build artifacts
- Temporary files
- `.env` files

---

### 3. Create Commit

OpenCode will:
1. Analyze changed files
2. Draft appropriate commit message with Gitmoji
3. Use imperative mood ("Add feature" not "Added feature")
4. Keep title under 72 characters
5. Add detailed body if needed

**Review before committing:**
- Message accurately describes changes
- Gitmoji matches change type
- No sensitive data staged

---

### 4. Push to Remote

```bash
# First push on new branch
git push -u origin feature/my-feature

# Subsequent pushes
git push
```

OpenCode handles `-u` flag automatically for new branches.

---

### 5. Create Pull Request

Using `gh` CLI:

```bash
gh pr create \
  --title "✨ Add keyboard shortcuts" \
  --body "$(cat <<'EOF'
## Summary
- Add Space, R, and S keyboard shortcuts
- Improves accessibility for power users

## Changes
- Added keydown listener in app.js
- Shortcuts only active when not typing in inputs

## Testing
- Press Space to start/pause timer
- Press R to reset
- Press S to skip interval
EOF
)"
```

**OpenCode will:**
- Generate PR title from commits
- Create summary from git log and diffs
- Include testing instructions
- Link related issues if found

---

## Best Practices

### Before Committing

✅ **Do:**
- Run tests (`npm test`)
- Review staged changes (`git diff --staged`)
- Ensure commit message is descriptive
- Check for secrets or credentials
- Verify Gitmoji is appropriate

❌ **Don't:**
- Commit untested code
- Include debugging statements
- Commit commented-out code
- Stage generated files
- Commit secrets or API keys

---

### Before Creating PR

✅ **Do:**
- Ensure branch is up to date with main
- All tests pass locally
- Pre-commit hooks pass
- Commit messages are clean
- Changes are focused (one feature per PR)

❌ **Don't:**
- Mix unrelated changes
- Leave TODO comments in code
- Skip testing instructions in PR body
- Forget to link related issues

---

## Common Scenarios

### Scenario 1: Simple Bug Fix

```
User: "Fix the timer bug and create a PR"

OpenCode will:
1. Check current branch (create feature branch if on main)
2. Stage bug fix changes
3. Create commit: "🐛 Fix timer race condition"
4. Push to remote
5. Create PR with:
   - Title: "🐛 Fix timer race condition"
   - Body: Bug description, fix approach, testing steps
```

---

### Scenario 2: Multiple Commits on Branch

```
User: "Create a PR for my feature branch"

OpenCode will:
1. Verify branch has unpushed commits
2. Push all commits to remote
3. Analyze ALL commits on branch (not just latest)
4. Create PR summarizing entire feature
5. Include all related changes in PR body
```

---

### Scenario 3: Feature with Tests

```
User: "Add keyboard shortcuts feature, write tests, commit and create PR"

OpenCode will:
1. Implement keyboard shortcuts in app.js
2. Write tests in tests/app.test.js
3. Run tests to verify
4. Stage all changes
5. Create commit: "✨ Add keyboard shortcuts for timer control"
6. Create commit: "✅ Add tests for keyboard shortcuts"
7. Push both commits
8. Create PR summarizing both commits
```

---

## Troubleshooting

### Issue: Pre-commit Hook Fails

**Symptoms:**
```
Commit rejected by pre-commit hook
```

**Solution:**
```bash
# Run hooks manually to see errors
pre-commit run --all-files

# Fix issues (usually formatting or linting)
npm test

# Try commit again
```

---

### Issue: Commit Message Rejected (No Gitmoji)

**Symptoms:**
```
Error: Commit message must start with a Gitmoji emoji
```

**Solution:**
Ensure commit message starts with an emoji. See `.agents/commit-conventions.md` for options.

```bash
# Bad
git commit -m "Add feature"

# Good
git commit -m "✨ Add feature"
```

---

### Issue: Branch Behind Main

**Symptoms:**
```
Your branch is behind 'origin/main' by 5 commits
```

**Solution:**
```bash
# Update main
git checkout main
git pull

# Rebase feature branch
git checkout feature/my-feature
git rebase main

# Force push (only if you haven't shared branch)
git push --force-with-lease
```

---

### Issue: PR Creation Fails

**Symptoms:**
```
gh: command not found
```

**Solution:**
Install GitHub CLI:
```bash
# macOS
brew install gh

# Authenticate
gh auth login
```

---

## Advanced: Custom PR Templates

### With Heredoc (for complex bodies)

```bash
gh pr create --title "✨ Feature title" --body "$(cat <<'EOF'
## Summary
- Feature overview

## Changes
- Technical details

## Testing
- Test instructions

## Screenshots
![Screenshot](url)

Closes #123
EOF
)"
```

---

### With Issue Reference

```bash
gh pr create \
  --title "🐛 Fix issue #123" \
  --body "Fixes the bug described in #123" \
  --assignee @me \
  --label bug,priority-high
```

---

### Draft PR

```bash
gh pr create \
  --title "🚧 WIP: Feature in progress" \
  --body "Work in progress, not ready for review" \
  --draft
```

---

## Verification Checklist

Before asking OpenCode to create commit + push + PR:

- [ ] All changes are intentional and tested
- [ ] Tests pass locally (`npm test`)
- [ ] No debugging code or console.logs
- [ ] No secrets or credentials in staged files
- [ ] Branch name follows conventions
- [ ] Changes are focused (single feature/fix)
- [ ] Documentation updated if needed

---

## Quick Reference: Git Commands

```bash
# Status and info
git status                    # Show working tree status
git log --oneline -10         # Last 10 commits
git diff                      # Unstaged changes
git diff --staged             # Staged changes

# Branching
git checkout -b feature/name  # Create and switch to branch
git branch -d feature/name    # Delete local branch
git push -d origin branch     # Delete remote branch

# Staging
git add .                     # Stage all changes
git add file.js               # Stage specific file
git restore --staged file.js  # Unstage file

# Committing
git commit -m "✨ Message"    # Commit staged changes
git commit --amend            # Amend last commit (use carefully!)

# Pushing
git push                      # Push to tracked remote
git push -u origin branch     # Set upstream and push
git push --force-with-lease   # Safe force push

# Pull requests
gh pr create                  # Interactive PR creation
gh pr list                    # List PRs
gh pr view 123                # View PR #123
gh pr checks                  # View CI status
```

---

## Integration with OpenCode

### Typical OpenCode Workflow

**User request:**
```
"I've fixed the timer bug. Create a commit, push, and open a PR"
```

**OpenCode will:**
```
1. Run: git branch --show-current
   → If on main: WARN user and ask to create feature branch first
   → If on feature branch: proceed with commit

2. Run: git status
3. Run: git diff [to understand changes]
4. Run: git log --oneline -5 [to check commit history]

5. Stage: git add [relevant files]
6. Commit: git commit -m "🐛 Fix timer race condition in timer-controller"

7. Check remote: git branch -vv
8. Push: git push -u origin fix/timer-race-condition
   → NEVER pushes to main/master

9. Create PR: gh pr create --title "..." --body "..."
10. Return: PR URL to user
```

**Critical Safety Check:**
- Step 1 always checks if on main/master
- If on main, OpenCode will warn you to create a feature branch first
- This prevents accidental commits to main

---

### What OpenCode Won't Do (Without Explicit Request)

- Amend existing commits
- Force push to any branch
- Push directly to main/master ⚠️ **NEVER**
- Delete branches
- Merge PRs automatically
- Skip pre-commit hooks
- Commit files in `.gitignore`

---

## Safety Features

OpenCode follows these safety protocols:

✅ **Always:**
- Checks current branch before any operation
- **Warns if on main/master and asks to create feature branch** ⚠️
- Reviews staged files before commit
- Verifies tests pass
- Uses Gitmoji conventions
- Uses `--force-with-lease` instead of `--force`
- Pushes to feature branch, never to main

❌ **Never:**
- Commits directly to main/master without explicit override ⚠️ **BLOCKED**
- Pushes to main/master without PR ⚠️ **BLOCKED**
- Commits secrets or credentials
- Force pushes to main/master
- Skips pre-commit hooks (unless explicitly requested)
- Amends commits already pushed to remote
- Deletes branches without confirmation

---

## Examples

### Example 1: Quick Fix

**User:** "Fix the localStorage crash and create a PR"

**OpenCode:**
```bash
# 1. Checks current branch - assumes already on feature branch
# If on main, will prompt to create one first

# 2. [Makes code changes]

# 3. Stages and commits
git add src/state-storage.js
git commit -m "🐛 Fix localStorage crash with try-catch error handling

Wraps localStorage operations in try-catch to prevent crashes
when quota is exceeded or in private browsing mode.

Fixes #42"

# 4. Pushes
git push -u origin fix/localstorage-crash

# 5. Creates PR
gh pr create --title "🐛 Fix localStorage crash" --body "$(cat <<'EOF'
## Summary
- Adds error handling to prevent crashes when localStorage fails

## Changes
- Wrapped localStorage.setItem() in try-catch
- Added error logging
- Handles quota exceeded and private browsing gracefully

## Testing
- Tested in private browsing mode
- Tested with localStorage quota exceeded
- All existing tests pass

Fixes #42
EOF
)"
```

**Output:** `https://github.com/alissadb/pomodoro-plant/pull/123`

---

### Example 2: Feature with Multiple Commits

**User:** "I've added keyboard shortcuts and tests. Create a PR"

**OpenCode:**
```bash
# 1. Verifies current branch
git branch --show-current  # feature/keyboard-shortcuts

# 2. Checks commits
git log main..HEAD --oneline
# Shows:
# abc123 ✅ Add tests for keyboard shortcuts
# def456 ✨ Add keyboard shortcuts for timer control

# 3. Pushes
git push origin feature/keyboard-shortcuts

# 4. Creates PR analyzing BOTH commits
gh pr create --title "✨ Add keyboard shortcuts" --body "$(cat <<'EOF'
## Summary
- Add Space, R, and S keyboard shortcuts for timer control
- Improves accessibility and efficiency for power users

## Changes
- Added keydown event listener in app.js
- Space: start/pause timer
- R: reset current timer
- S: skip current interval
- Shortcuts disabled when typing in input fields
- Comprehensive test coverage added

## Testing
- Press Space to toggle timer
- Press R to reset
- Press S to skip
- Verify shortcuts ignored when typing in inputs
- All 32 tests passing (4 new tests added)

Closes #45
EOF
)"
```

---

## Related Documentation

- `.agents/commit-conventions.md` - Full Gitmoji reference
- `.agents/pr-guidelines.md` - Detailed PR workflow
- `CONTRIBUTING.md` - Contribution guidelines

---

## Summary

**To create commit + push + PR with OpenCode:**

Simply say:
```
"Create a commit, push, and open a PR"
```

OpenCode will handle:
✅ Intelligent file staging
✅ Gitmoji-compliant commit messages
✅ Pushing with upstream tracking
✅ PR creation with proper formatting
✅ Safety checks and validations

**Manual alternative:**
```bash
git add .
git commit -m "✨ Add feature"
git push -u origin feature/my-feature
gh pr create --title "✨ Add feature" --body "Description"
```

---

*Last updated: 2026-04-08*
