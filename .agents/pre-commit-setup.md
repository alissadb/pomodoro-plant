# Pre-commit Setup Guide

This project uses [pre-commit](https://pre-commit.com/) to automatically check code quality before commits.

## What It Does

The pre-commit hooks will automatically:
- ✅ Remove trailing whitespace
- ✅ Fix end-of-file issues
- ✅ Validate YAML and JSON files
- ✅ Lint JavaScript with ESLint
- ✅ Format code with Prettier
- ✅ Run tests before commit
- ✅ Validate Gitmoji commit messages

## Installation

### 1. Install pre-commit

```bash
# Using pip
pip install pre-commit

# Or using Homebrew (macOS)
brew install pre-commit
```

### 2. Install git hooks

```bash
cd pomodoro-plant
pre-commit install
pre-commit install --hook-type commit-msg
```

### 3. (Optional) Run on all files

```bash
pre-commit run --all-files
```

## Usage

### Automatic (Recommended)

Once installed, pre-commit runs automatically when you `git commit`.

If hooks fail:
1. Review the errors
2. Fix the issues (many are auto-fixed)
3. Stage the fixed files: `git add .`
4. Commit again: `git commit -m "✨ Your message"`

### Manual

Run hooks manually on staged files:

```bash
pre-commit run
```

Run on all files:

```bash
pre-commit run --all-files
```

Run specific hook:

```bash
pre-commit run eslint --all-files
pre-commit run prettier --all-files
```

## Skipping Hooks (Not Recommended)

If you need to skip pre-commit (emergencies only):

```bash
git commit --no-verify -m "✨ Your message"
```

⚠️ **Warning:** Only use `--no-verify` if absolutely necessary. CI will still run checks.

## Updating Hooks

Update to the latest versions:

```bash
pre-commit autoupdate
```

## Troubleshooting

### "command not found: pre-commit"

Install pre-commit (see step 1 above).

### "No module named 'pre_commit'"

```bash
pip install --upgrade pre-commit
```

### Hooks are too slow

Disable the test hook for faster commits:

Edit `.pre-commit-config.yaml` and comment out the `run-tests` hook:

```yaml
# - id: run-tests
#   name: Run Node.js tests
#   ...
```

You can still run tests manually with `npm test`.

### ESLint/Prettier errors

Install Node.js dependencies:

```bash
npm install
```

## Configuration Files

- `.pre-commit-config.yaml` - Pre-commit hook configuration
- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier formatting rules

## More Information

- [Pre-commit Documentation](https://pre-commit.com/)
- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)
