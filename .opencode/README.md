# Multi-Agent Workflow Setup

This project has been configured with the multi-agent workflow system from [this gist](https://gist.github.com/ppries/f07fd6316bbd45807dd7a1896555b05b).

## What's Installed

### Agents (`.opencode/agents/`)

Four specialized agents that work together to plan, review, test, and implement features:

- **`@check`** — Design reviewer that identifies risks, gaps, and flaws
  - Read-only (no write/edit/bash)
  - Uses GitHub Copilot `github-copilot/gpt-5.3-codex`
  - Reviews for: assumptions, failure modes, edge cases, security, testability
  
- **`@simplify`** — Complexity reviewer that spots overengineering
  - Read-only (no write/edit/bash)
  - Uses GitHub Copilot `github-copilot/gpt-5.3-codex`
  - Reviews for: YAGNI violations, unnecessary abstraction, premature optimization
  
- **`@test`** — TDD test author
  - Can write test files only (strict file constraint)
  - Sandboxed bash (test runners only)
  - Uses GitHub Copilot `github-copilot/gpt-5.3-codex`
  - Writes failing tests (RED), verifies failure codes, hands off to @make
  
- **`@make`** — Task implementor
  - Can write/edit production code
  - Sandboxed bash (no git, pip, network)
  - Uses GitHub Copilot `github-copilot/gpt-5.3-codex`
  - Implements in TDD mode (RED→GREEN) when tests provided

### Commands (`.opencode/commands/`)

- **`/workflow`** — Fire-and-forget autonomous workflow
  - Takes a task description or GitHub issue number
  - Runs: Plan → Review → Split → Test → Implement → Final Review → PR
  - Adapted for standard git branches (not worktrees)
  - No Linear integration (simplified from original gist)
  
- **`/review`** — Standalone code review
  - Reviews: uncommitted changes, commits, branches, PRs, or plans
  - Dispatches `@check` and `@simplify` in parallel
  - Works as a general-purpose review command

### Documentation (`.opencode/docs/`)

- **`multi-agent-workflow.md`** — Reference guide
  - When to use the workflow
  - Task splitting format for `@make`
  - Integration contracts
  - Decision tables

## How to Use

### Quick Review

Review your current uncommitted changes:
```bash
/review
```

Review a specific commit, branch, or PR:
```bash
/review a1b2c3d              # commit hash
/review feature-dark-mode    # branch name
/review 42                   # PR number
/review @plan.md             # plan file
```

### Full Workflow

Run the complete autonomous workflow:
```bash
/workflow "Add dark mode toggle with persistence"
/workflow 42  # GitHub issue number
```

The workflow will:
1. Ask for branch name confirmation
2. Create feature branch
3. Generate implementation plan
4. Get plan reviewed by @check and @simplify
5. Split into discrete tasks
6. Write failing tests for each task (@test)
7. Implement to make tests pass (@make)
8. Final review of full implementation
9. Commit, push, create draft PR

### Manual Agent Usage

You can also invoke agents directly:

```bash
@check review this plan: <paste plan>
@simplify review this code for complexity
@test write tests for <task description>
@make implement <task with acceptance criteria>
```

## Customization

### Adapting for Your Project

The workflow has been customized for this pomodoro project:
- Uses standard git branches (not worktrees)
- No Linear integration (you can add GitHub Issues support)
- Test file patterns: `tests/**/*.test.js`, `tests/**/*.js`
- Uses `npm test` for test verification
- Follows Gitmoji commit conventions

### If You Want to Customize Further

Edit these files:
- `.opencode/commands/workflow.md` — Workflow phases and logic
- `.opencode/agents/*.md` — Individual agent behavior
- `AGENTS.md` — System prompt context

### Optional: Global Bash Permissions

The agents have bash permissions in their frontmatter, but you can add global safety rails in `~/.config/opencode/opencode.json`:

```json
{
  "permission": {
    "bash": {
      "*": "deny",          // Default deny
      "ls *": "allow",      // Allow safe commands
      "git status": "allow"
    }
  }
}
```

Agent-specific permissions will override global ones.

## Differences from Original Gist

This implementation **excludes** the following from the original gist:
- **`@pm` agent** — Linear CLI integration (not needed)
- **Git worktrees** — Uses standard branch workflow instead
- **Bare clone setup** — Uses regular git repository

These features were removed because you don't use Linear and prefer standard git workflow.

## Testing the Setup

Try a simple review:
```bash
/review
```

This should dispatch both `@check` and `@simplify` to review your current changes.

## Troubleshooting

**Agents not found:**
- Restart OpenCode to pick up new agent files

**Bash commands blocked:**
- Check agent frontmatter for `permission.bash` configuration
- Agents have sandboxed bash access defined in their .md files

**Models not available:**
- Ensure each agent `model:` value matches an available provider/model pair in your setup
- For GitHub Copilot, use fully qualified model IDs (for example `github-copilot/gpt-5.3-codex`)
- If needed, adjust agent frontmatter to a model you have access to

## Further Reading

- Original gist: https://gist.github.com/ppries/f07fd6316bbd45807dd7a1896555b05b
- OpenCode docs: https://opencode.ai/docs
- Multi-agent workflow guide: `.opencode/docs/multi-agent-workflow.md`
