---
description: "Fire-and-forget multi-agent workflow: plan, test, implement, PR (adapted for standard git workflow)"
agent: build
---

You are executing the autonomous multi-agent workflow. Run all phases without waiting for user input. The user has walked away.

**Task reference:** $ARGUMENTS (optional - can be a GitHub issue number, branch name, or description)

---

## Phase 1: Task Context

Determine what to work on:

1. If `$ARGUMENTS` is a number (e.g., `42`): fetch GitHub issue with `gh issue view $ARGUMENTS --json title,body,labels`
2. If `$ARGUMENTS` is a description: use it as the task description directly
3. If `$ARGUMENTS` is empty: ask user for task description, then proceed

Extract or derive:
- Task title and description
- Acceptance criteria (from issue body or user input)
- Branch name suggestion: `feature/<slugified-title>` or `fix/<slugified-title>`

Ask user to confirm branch name or provide alternative.

---

## Phase 2: Branch Setup

1. Ensure we're on `main` branch: `git checkout main`
2. Pull latest: `git pull origin main`
3. Create and checkout feature branch: `git checkout -b <branch-name>`
4. Verify clean state: `git status --porcelain` should be empty

---

## Phase 3: Plan

Analyze the codebase. Create a detailed implementation plan addressing the task requirements and acceptance criteria.

The plan should include:
- Problem summary (from task context)
- Proposed approach with rationale
- Files to modify (with brief description of changes)
- New files to create
- Risks and open questions
- **Test Design (conditional — include for non-trivial tasks):**
  - Key behaviors to verify (what tests should assert)
  - Edge cases and error conditions worth testing
  - What explicitly should NOT be tested (prevents bloat)
  - Testability concerns (heavy external deps, timing-dependent behavior, etc.)

  **Include Test Design for:** Public API changes, bug fixes with behavioral impact, new features with business logic, multi-module changes.
  **Skip Test Design for:** Config-only changes, decorator swaps, import reorganization, documentation.
  When skipped, `@test` derives test cases directly from acceptance criteria.

---

## Phase 4: Review Plan

Dispatch `@check` and `@simplify` in parallel to review the plan.

Reviewers should evaluate testability:
- `@check`: Is the design testable? Are the right behaviors identified? (Review Framework §8)
- `@simplify`: Is the test scope appropriate? Over-testing proposed?

**Merge rules:**
- `@check` safety/correctness findings are hard constraints
- If `@simplify` recommends removing something `@check` flags as needed, `@check` wins
- Note conflicts explicitly

**Review loop (max 3 cycles):**
1. Send plan to both reviewers
2. Merge findings
3. If verdict is ACCEPTABLE from both (or JUSTIFIED COMPLEXITY from `@simplify`): proceed to Phase 5
4. If BLOCK or NEEDS WORK: revise the plan addressing findings, then re-review
5. **Convergence detection:** if reviewers return the same findings as the previous cycle, stop the loop early
6. If still unresolved after 3 cycles: note unresolved blockers and proceed anyway (they will be documented in the PR)

---

## Phase 5: Split into Tasks

Break the approved plan into discrete tasks for `@make`. Each task needs:

| Required | Description |
|----------|-------------|
| **Task** | Clear description of what to implement |
| **Acceptance Criteria** | Specific, testable criteria (checkbox format) |
| **Code Context** | Actual code snippets from the codebase, not just file paths |
| **Files to Modify** | Explicit list, mark new files with "(create)" |
| **Test File** | Path for test file (following project's test pattern), e.g., "tests/test_feature.js (create)" |

Include **Integration Contracts** when a task adds/changes function signatures, APIs, config keys, or has dependencies on other tasks.

Include **Test Design** from Phase 3 when available, attached to the relevant task(s).

**Task size:** ~10-30 minutes each, single coherent change, clear boundaries.

---

## Phase 6: Write Tests

For each task from Phase 5, dispatch `@test` with:
- The task spec (acceptance criteria, code context, files to modify)
- The Test Design section from the plan (if provided)
- The test file path to create (following project's test pattern)

`@test` writes failing tests and verifies RED with structured failure codes.

**Post-step file gate (MANDATORY):**
Before dispatching `@test`, snapshot the current changed files:
```bash
git diff --name-only > /tmp/pre_test_baseline.txt
```
After `@test` completes, validate only NEW changes:
```bash
git diff --name-only | comm -23 - /tmp/pre_test_baseline.txt > /tmp/test_new_files.txt
```
All new files must match test patterns: `**/test_*.js`, `**/*_test.js`, `**/test/**/*.js`, `**/tests/**/*.js`
If any non-matching file appears: discard `@test` output, report violation.

**Decision table — handling `@test` results:**

| Condition | Action |
|-----------|--------|
| `TESTS_READY` + `escalate_to_check: false` | Proceed to Phase 7 |
| `TESTS_READY` + `escalate_to_check: true` | Route tests to `@check` for light review. `@check` diagnoses, caller routes fixes to `@test`. Then proceed. |
| `NOT_TESTABLE` | Route to `@check` for sign-off on justification. If approved, task goes to `@make` without tests. |
| `BLOCKED` | Investigate. May need to revise task spec or plan. |
| Test passes immediately | Investigate — behavior may already exist. Task spec may be wrong. |

**Parallelism:** Independent tasks can have tests written in parallel.

---

## Phase 7: Implement

Execute each task by dispatching `@make` with:
- The task spec (from Phase 5)
- Relevant code context (actual snippets)
- **Pre-written failing tests and handoff from `@test` (if TESTS_READY)**

`@make` runs in TDD mode when tests are provided:
1. Entry validation: run tests, verify RED, check failure codes match handoff
2. Implement minimal code to make tests pass (GREEN)
3. Regression check on broader area
4. Refactor while keeping green
5. Report RED→GREEN evidence

**Escalation:** If `@make` flags test quality concerns during entry validation:
1. `@make` reports the issue to caller
2. Caller routes to `@check` for diagnosis
3. `@check` reports findings
4. Caller routes to `@test` for fixes
5. Fixed tests return to `@make`

For NOT_TESTABLE tasks, `@make` runs in standard mode.

After all tasks complete, verify overall integration:
- Run the project's test suite: `npm test`
- Run linting if configured: `npm run lint`
- Fix any integration issues between tasks

---

## Phase 8: Final Review

Dispatch `@check` and `@simplify` in parallel to review the full implementation (all changes across all files).

Provide reviewers with:
- The original plan
- The full diff (`git diff main...HEAD`)
- Any decisions or deviations from the plan

**Review loop (max 3 cycles):**
1. Send implementation to both reviewers
2. Merge findings (same precedence rules as Phase 4)
3. If ACCEPTABLE: proceed to Phase 9
4. If issues found: fix them directly (no need to re-dispatch `@make` for small fixes), then re-review
5. **Convergence detection:** same findings twice = stop loop early
6. If unresolved after 3 cycles: document blockers, proceed to PR anyway

---

## Phase 9: Commit, PR, and Wrap Up

### Commit
- Stage all changes: `git add .`
- Write a Gitmoji conventional commit message summarizing the implementation (follow `.agents/commit-conventions.md`)
- Example: `✨ Add dark mode toggle with state persistence`
- Commit: `git commit -m "<message>"`

### Push and Create Draft PR
- Push branch: `git push -u origin <branch-name>`
- Create draft PR: `gh pr create --draft --title "<title>" --body "<execution report>"`
- PR body should include:
  - Summary of what was implemented
  - Acceptance criteria checklist (from task context)
  - Files changed with brief descriptions
  - TDD summary: X tasks with tests (RED→GREEN), Y tasks NOT_TESTABLE with justifications
  - Any test quality escalations and their resolution
  - Unresolved blockers (if any from review loops)
  - Review cycle outcomes

### GitHub Issue Update (if applicable)
- If task came from a GitHub issue, comment on it: `gh issue comment <number> --body "Draft PR created: <pr-url>"`

### Local Summary
- Write `.opencode/workflow-summary.md` with:
  - Run timestamp
  - Task reference and title
  - Branch and PR link
  - Summary of implementation
  - TDD evidence (RED→GREEN per task, NOT_TESTABLE justifications)
  - Review outcomes (plan review + final review verdicts)
  - Unresolved items (if any)
  - Files changed

---

## Failure Handling

At any phase, if an unrecoverable error occurs:
1. Write `.opencode/workflow-summary.md` with what was completed and what failed
2. If any code was written, commit it with message `🚧 WIP: incomplete workflow run`
3. If a branch exists with commits, create the draft PR noting it is incomplete
4. Stop execution

**Never hang on interactive prompts.** If any command appears to require input, treat it as a failure and follow the above procedure.
