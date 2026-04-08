#!/bin/bash
set -e

# GitHub Label Setup Script for Pomodoro Plant
# This script creates all required labels for automated releases

REPO="alissadb/pomodoro-plant"

echo "🏷️  Setting up GitHub labels for $REPO"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo ""
    echo "Please install it:"
    echo "  macOS: brew install gh"
    echo "  Linux: See https://github.com/cli/cli#installation"
    echo ""
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo ""
    echo "Please run: gh auth login"
    echo ""
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"
echo ""

# Function to create or update label
create_label() {
    local name=$1
    local color=$2
    local description=$3
    
    # Check if label exists
    if gh label list -R "$REPO" | grep -q "^$name"; then
        echo "⚠️  Label '$name' already exists, updating..."
        gh label edit "$name" -R "$REPO" -c "$color" -d "$description" 2>/dev/null || true
    else
        echo "➕ Creating label '$name'..."
        gh label create "$name" -R "$REPO" -c "$color" -d "$description"
    fi
}

echo "Creating labels..."
echo ""

# Feature & Enhancement
create_label "feature" "0E8A16" "New feature"
create_label "enhancement" "84b6eb" "Improvement to existing feature"

# Bug Fixes
create_label "fix" "d73a4a" "Bug fix"
# Note: 'bug' label usually exists by default

# Documentation
create_label "docs" "0075ca" "Documentation"
# Note: 'documentation' label usually exists by default

# Code Quality
create_label "refactor" "fbca04" "Code refactoring"
create_label "test" "bfd4f2" "Tests"
create_label "chore" "d4c5f9" "Maintenance/internal"

# UI & Performance
create_label "ui" "fef2c0" "UI/UX changes"
create_label "perf" "5319e7" "Performance improvement"

# Breaking & Dependencies
create_label "breaking" "b60205" "Breaking change"
create_label "dependencies" "0366d6" "Dependency updates"

# Special
create_label "skip-release" "cccccc" "Don't include in release notes"

echo ""
echo "✅ All labels created successfully!"
echo ""
echo "📋 Label Summary:"
echo "   - feature (✨) → MINOR version bump"
echo "   - enhancement (🚀) → MINOR version bump"
echo "   - fix, bug (🐛) → PATCH version bump"
echo "   - docs (📝) → PATCH version bump"
echo "   - refactor (♻️) → PATCH version bump"
echo "   - test (✅) → PATCH version bump"
echo "   - chore (🔧) → PATCH version bump"
echo "   - ui (💄) → PATCH version bump"
echo "   - perf (⚡) → PATCH version bump"
echo "   - breaking (🚨) → MINOR version bump (0.x.x)"
echo "   - dependencies (⬆️) → PATCH version bump"
echo "   - skip-release (🚫) → No release"
echo ""
echo "🎉 Setup complete! You can now use these labels on your PRs."
echo ""
echo "View labels at: https://github.com/$REPO/labels"
