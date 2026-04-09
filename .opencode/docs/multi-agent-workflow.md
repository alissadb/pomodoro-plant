<!-- NOTE: Critical summaries of this file are inline in ~/.config/opencode/AGENTS.md and ~/.claude/CLAUDE.md. Update both if changing constraints. -->

# Multi-Agent Workflow

## When to Use

Use the multi-agent workflow when **any** of these apply:
- 3+ files need changes
- API or schema changes involved
- Estimated work exceeds 30 minutes
- Cross-cutting concerns (touching multiple subsystems)

For smaller changes, work directly — no need for the full workflow.

## Skills That Complement Agents

Agents (@check, @simplify, @make, @test, @debug) absorb relevant skill techniques directly. These skills add value in situations agents don't cover:

- `brainstorming` — early exploration before planning. Label output "proposal" before @check review
- `receiving-code-review` — handling feedback from humans or external reviewers (pushback framework, YAGNI checks)
- `executing-plans` / `subagent-driven-development` — alternative orchestration when you want batch checkpoints or spec compliance review (instead of @make's task-at-a-time approach)
- `dispatching-parallel-agents` — parallel investigation/research (not task execution)
- `test-driven-development` — core TDD process absorbed into `@test` + `@make` TDD mode. Use skill directly only when working outside the multi-agent workflow.

Skills with no agent overlap (always use directly):
- `pdf`, `data-scientist`, `scientific-slides`, `code-documentation-code-explain`

## Workflow Steps

0. **Setup** — Get task context from Linear via `@pm`, set up worktree
1. **Plan** — Main agent creates plan with conditional Test Design section
2. **Review** — `@check` (incl. testability) + `@simplify` review plan (parallel)
3. **Split** — Main agent breaks plan into discrete tasks for `@make`
4. **Review** — `@check` reviews task split for completeness and coverage
5. **Write Tests** — `@test` writes failing tests per task, verifies RED with structured failure codes
6. **Implement** — `@make` in TDD mode (validates RED → implements GREEN), escalates test issues via caller → `@check` → `@test`
7. **Review** — `@check` + `@simplify` review implementation (parallel)

## Decision Table

| Condition | Action |
|-----------|--------|
| Task changes public API, fixes bug, adds business logic | Include Test Design in plan. `@test` writes tests. |
| Task is config-only, decorator swap, import reorg, or docs | Skip Test Design in plan. `@test` may return NOT_TESTABLE. |
| `@test` returns TESTS_READY + `escalate_to_check: false` | Proceed directly to `@make`. |
| `@test` returns TESTS_READY + `escalate_to_check: true` | Route tests to `@check` for light review before `@make`. |
| `@test` returns NOT_TESTABLE | Route to `@check` for sign-off, then `@make` in standard mode. |
| `@test` returns BLOCKED | Investigate. Revise task spec or fix environment. |
| `@make` flags test quality concern | Caller → `@check` (diagnose) → `@test` (fix) → `@make`. |

### Merging check + simplify

When both review the same artifact, the main agent merges findings. **Precedence:** `@check` safety/correctness findings are hard constraints. If `@simplify` recommends removing something `@check` flags as needed, `@check` wins. Note conflicts explicitly in the merged action plan.

## Setup Phase

Before starting work, establish context and workspace:

1. **Get task from Linear** — Use `@pm` to fetch issue details:
   - Issue title & description (task context)
   - Acceptance criteria (if in description)
   - Git branch name (for worktree)
   - Labels/priority (for context)

2. **No issue exists?** — Ask user if they want to create one via `@pm`. If declined, ask for a branch name to use.

3. **Set up worktree** — Run from the repo root (e.g., `~/repos/veo/sunstone`), **not** from inside an existing worktree:
   ```bash
   git fetch origin
   # Replace any "/" with "-" to avoid subdirectories
   git worktree add <branch-name> -b <branch-name> master
   ```

   **If worktree already exists:** Warn the user and confirm before proceeding.

4. **Change working directory** to the new worktree before proceeding to Plan.

## Task Splitting for @make

When splitting a plan into tasks for `@make`, each task must include:

| Required | Description |
|----------|-------------|
| **Task** | Clear description of what to implement |
| **Acceptance Criteria** | Specific, testable criteria (checkbox format) |
| **Code Context** | Actual code snippets, not just file paths |
| **Files to Modify** | Explicit list including new files with "(create)" |
| **Test File** | Path for test file (colocated pattern), e.g., "sunstone/config/tests/test_validate.py (create)" |

| Optional | Description |
|----------|-------------|
| **Test Design** | Key behaviors to verify, edge cases, what NOT to test (from plan, when applicable) |
| **Pseudo-code** | Approach suggestions or inspiration |
| **Constraints** | Patterns to follow, style requirements |
| **Integration Contract** | For tasks touching shared interfaces |

### Integration Contract

Include when a task:
- Adds/changes function signatures or APIs
- Modifies config keys or data structures
- Has dependencies on other tasks in the plan

Format:
```
**Integration Contract:**
- Public interfaces: [signatures, endpoints, config keys affected]
- Invariants: [assumptions other code relies on]
- Task interactions: [which other tasks depend on this]
```

### Task Size Guidelines

Good tasks are:
- Completable in ~10-30 minutes
- Single coherent change
- Clear boundaries (you know when done)
- Testable in isolation

**Split if:** Multiple unrelated files, multiple features, or "and" in description.

### What @make Cannot Do

- File renames/deletions (main agent handles)
- Git operations (main agent handles)
- Kubernetes deployments (main agent handles)
- New dependencies without explicit approval

### Example Task Format

```
## Task
Add a `validate_config()` function that checks required fields exist.

## Acceptance Criteria
- [ ] Function raises `ConfigError` if `api_key` missing
- [ ] Function raises `ConfigError` if `endpoint` missing
- [ ] Function returns `True` if valid
- [ ] Unit tests cover all three cases

## Test Design
- `validate_config()` raises `ConfigError` when `api_key` is missing
- `validate_config()` raises `ConfigError` when `endpoint` is missing
- `validate_config()` returns `True` for valid config with all fields
- Do NOT test: Config dataclass field defaults (trivial)

## Code Context
\`\`\`python
# src/config.py (current)
@dataclass
class Config:
    api_key: str
    endpoint: str
    timeout: int = 30

class ConfigError(Exception):
    pass
\`\`\`

## Files to Modify
- `src/config.py` — add `validate_config()` function

## Test File
- `src/config/tests/test_validate_config.py` (create)

## Constraints
- Follow existing error handling pattern (raise with descriptive message)
- Keep function pure (no side effects)
```
