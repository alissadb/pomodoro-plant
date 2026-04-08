# .agents Directory

This directory contains development conventions and guidelines optimized for both human contributors and AI coding assistants.

## Files

- **`commit-conventions.md`** - Gitmoji-based commit message format inspired by FastAPI
- **`pr-guidelines.md`** - Complete git workflow and pull request process
- **`git-workflow.md`** - Automated workflow for commit + push + PR creation
- **`pre-commit-setup.md`** - Pre-commit hooks installation and configuration
- **`release-workflow.md`** - Release and versioning process

## Purpose

These files help:

1. **Contributors** - Understand project conventions and workflow
2. **AI Assistants** - Generate commits and PRs that match project standards
3. **Maintainers** - Keep consistent code quality and style

## Quick Links

- [Commit Conventions](./commit-conventions.md) - How to write commit messages
- [PR Guidelines](./pr-guidelines.md) - How to contribute code
- [Git Workflow](./git-workflow.md) - Automated commit + push + PR workflow
- [Pre-commit Setup](./pre-commit-setup.md) - Installing pre-commit hooks
- [PR Template](../.github/pull_request_template.md) - What to include in PRs

## Quick Start for AI Assistants

**To create a complete contribution flow:**
```
"Create a commit, push, and open a PR"
```

This triggers the workflow in `git-workflow.md` which handles:
- Intelligent file staging
- Gitmoji-compliant commit messages
- Branch creation if needed
- Push with upstream tracking
- PR creation with proper formatting

## Philosophy

Inspired by [FastAPI](https://github.com/fastapi/fastapi), we believe in:

- Clear, semantic commit messages using Gitmoji
- Lightweight but structured contribution process
- Automated testing and CI/CD
- Meaningful human review over automated PRs
