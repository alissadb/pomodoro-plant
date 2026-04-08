# Release Workflow Guide

This project uses **automated releases** that trigger after every PR merge to `main`.

## Overview

- **Automated:** Releases happen automatically after PR merge
- **Versioning:** Semantic versioning (0.x.x → 1.0.0) based on PR labels
- **Release Notes:** Auto-generated with emoji prefixes and PR links
- **No Manual Work:** Everything is automatic after PR is labeled and merged

## How It Works

### 1. PR Creation
When creating a PR, add **ONE label** to categorize the change:

| Label | Emoji | Version Bump | Use When |
|-------|-------|--------------|----------|
| `feature` | ✨ | MINOR | Adding new functionality |
| `enhancement` | 🚀 | MINOR | Improving existing features |
| `fix` | 🐛 | PATCH | Fixing bugs |
| `docs` | 📝 | PATCH | Documentation only |
| `refactor` | ♻️ | PATCH | Code refactoring |
| `test` | ✅ | PATCH | Adding/updating tests |
| `chore` | 🔧 | PATCH | Maintenance, dependencies |
| `ui` | 💄 | PATCH | UI/UX changes |
| `perf` | ⚡ | PATCH | Performance improvements |
| `breaking` | 🚨 | MINOR* | Breaking changes |
| `skip-release` | 🚫 | None | Skip release entirely |

*In 0.x.x mode, breaking changes bump MINOR instead of MAJOR

### 2. PR Merge
When you merge a PR:
1. **Release Drafter** workflow runs (~10 seconds)
   - Reads PR label
   - Determines version bump
   - Updates draft release with emoji-prefixed entry

2. **Auto-Publish** workflow runs (~5 seconds)
   - Publishes the draft release
   - Creates git tag (e.g., `v0.1.0`)

3. **Deploy** workflow runs (existing)
   - Deploys to GitHub Pages

**Total time:** ~30 seconds from merge to published release 🚀

### 3. Release Published
The new release appears at:
- GitHub Releases page: https://github.com/alissadb/pomodoro-plant/releases
- Git tag created: `v0.x.x`
- Badge in README updates automatically

## Version Strategy

### Current: Pre-1.0 Mode (0.x.x)
We're currently in **pre-1.0 development**, meaning:
- Breaking changes bump MINOR (0.0.1 → 0.1.0), not MAJOR
- We stay in 0.x.x range until manually deciding to go 1.0.0

**Version Bumping:**
- `feature`, `enhancement`, `breaking` → 0.0.1 → 0.1.0
- `fix`, `docs`, `chore`, etc. → 0.0.1 → 0.0.2

### Future: Post-1.0 Mode
After manually releasing 1.0.0:
- Breaking changes will bump MAJOR (1.0.0 → 2.0.0)
- Features bump MINOR (1.0.0 → 1.1.0)
- Fixes bump PATCH (1.0.0 → 1.0.1)

## Release Notes Format

Release notes are automatically formatted like this:

```markdown
## What's Changed

### ✨ Features
- Add custom timer duration settings (#15) by @alissadb

### 🐛 Bug Fixes
- Fix plant growth calculation bug (#16) by @alissadb

### 📝 Documentation
- Update README with new features (#17) by @alissadb

**Full Changelog**: https://github.com/alissadb/pomodoro-plant/compare/v0.0.1...v0.1.0
```

## Commands & Utilities

### Check Current Version
```bash
npm run version
# Output: Current version: 0.0.1
```

### View Changelog
```bash
npm run changelog
# Opens: https://github.com/alissadb/pomodoro-plant/releases
```

### Setup Labels (One-Time)
```bash
./scripts/setup-labels.sh
```

## Workflows

### `.github/workflows/release-drafter.yml`
- **Trigger:** PR merge to main
- **Purpose:** Updates draft release with new changes
- **Permissions:** `contents: write`, `pull-requests: read`

### `.github/workflows/auto-publish.yml`
- **Trigger:** After release-drafter completes
- **Purpose:** Publishes draft release automatically
- **Permissions:** `contents: write`

### `.github/release-drafter.yml`
- **Configuration file** defining:
  - Label-to-category mapping
  - Version bump rules
  - Release note template
  - Emoji prefixes

## Edge Cases

### Multiple PRs Merged Quickly
- Both PRs included in same release
- Higher version priority wins (MINOR > PATCH)
- Example: PR #1 (fix) + PR #2 (feature) = v0.1.0 with both changes

### PR Without Label
- Defaults to PATCH bump (conservative)
- Appears in "Other Changes" category
- Can edit release after publishing if needed

### Documentation-Only Changes
- Add `docs` label → PATCH bump (v0.0.1 → v0.0.2)
- OR add `skip-release` label to skip entirely

### Workflow Failure
- Deployment continues normally (independent workflow)
- Can manually retry from Actions tab
- Or push another commit to trigger again

## Skipping a Release

To prevent a release from being created:
1. Add `skip-release` label to PR
2. Change won't appear in release notes
3. No version bump occurs

Useful for:
- Work-in-progress features
- Internal changes not worth releasing
- Draft/experimental code

## Going to 1.0.0

When ready to declare the project production-ready:

1. **Manual release creation:**
   - Go to GitHub Releases
   - Click "Draft a new release"
   - Tag: `v1.0.0`
   - Write release notes highlighting 1.0 features
   - Publish

2. **Update configuration:**
   Edit `.github/release-drafter.yml`:
   ```yaml
   version-resolver:
     major:
       labels:
         - breaking  # Now breaking → v2.0.0
   ```

3. **Communicate:**
   - Blog post or announcement
   - Update README "stable" badge
   - Notify users of 1.0 status

## Troubleshooting

### Release not created
Check:
- PR had a label (not `skip-release`)
- Workflows are enabled (Settings → Actions)
- Check Actions tab for errors

### Wrong version number
- Check which label was used
- Can delete release and tag, push again
- Or manually edit release

### Want to edit release notes
- Go to GitHub Releases
- Click "Edit" on published release
- Make changes, save

## Best Practices

### For Maintainers
1. **Always label PRs** before merging
2. **Review draft** occasionally (though it auto-publishes)
3. **Check Actions tab** if something seems wrong
4. **Communicate breaking changes** in PR description

### For Contributors
1. **Read PR template** for label guidance
2. **Choose appropriate label** for your change
3. **One PR, one label** (primary change type)
4. **Follow commit conventions** (Gitmoji)

## Files Reference

```
.github/
├── release-drafter.yml           # Release configuration
├── workflows/
│   ├── release-drafter.yml       # Update draft workflow
│   ├── auto-publish.yml          # Publish workflow
│   └── deploy.yml                # Deployment (unchanged)
└── pull_request_template.md      # PR template (updated with labels)

scripts/
└── setup-labels.sh               # Label creation script

CHANGELOG.md                      # Changelog (informational)
package.json                      # Version tracking
```

## Resources

- [Release Drafter Documentation](https://github.com/release-drafter/release-drafter)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Gitmoji Guide](https://gitmoji.dev)

## Support

If you have questions or issues with the release process:
1. Check this guide
2. Look at recent releases for examples
3. Check GitHub Actions logs
4. Open an issue with the `question` label

---

**Remember:** Releases happen automatically. Just label your PRs correctly and merge! 🎉
