---
work_package_id: WP03
title: Schedule check script and CI wiring
dependencies:
- WP01
- WP02
requirement_refs:
- FR-020
- FR-024
- NFR-006
- NFR-006a
- C-004
- SC-005
planning_base_branch: feat/living-schedule
merge_target_branch: feat/living-schedule
branch_strategy: Planning artifacts for this mission were generated on feat/living-schedule. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into feat/living-schedule unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-living-schedule-01M5N5QA
base_commit: e0693c4570fdc1078c7039982bf3ad1e7252a19b
created_at: '2026-10-24T09:45:31.340915+00:00'
subtasks:
- T011
- T012
- T013
- T014
- T015
phase: Phase 2 - Gates
history:
- at: '2026-10-23T22:30:00Z'
  actor: system
  action: Prompt generated via /spec-kitty.tasks
agent_profile: node-norris
authoritative_surface: scripts/check-schedule.mjs
create_intent:
- scripts/check-schedule.mjs
- tests/schedule/check.test.mjs
- tests/schedule/board.test.mjs
execution_mode: code_change
model: ''
owned_files:
- scripts/check-schedule.mjs
- package.json
- .github/workflows/docsite.yml
- tests/schedule/check.test.mjs
- tests/schedule/board.test.mjs
role: implementer
tags: []
task_type: implement
tracker_refs: []
---
# Work Package Prompt: WP03 – Schedule check script and CI wiring

## ⚡ Do This First: Load Agent Profile

Use the `/spk-charter-profile-load` skill to load the agent profile specified in the frontmatter, and behave according to its guidance before parsing the rest of this prompt.

- **Profile**: `node-norris`
- **Role**: `implementer`
- **Agent/tool**: `claude`

If the skill is unavailable, run `spec-kitty agent profile show node-norris` and
`spec-kitty charter context --action implement --include agent-profile:node-norris`.

---

## ⚠️ IMPORTANT: Review Feedback

- **Has review feedback?**: Check the `review_ref` field in the event log (via `spec-kitty agent tasks status --mission living-schedule-01M5N5QA`).
- **You must address all feedback** before your work is complete.
- **Report progress** with `spec-kitty agent tasks add-history <WPID> --note "..." --mission living-schedule-01M5N5QA`.

---

## Markdown Formatting

Wrap HTML/XML tags in backticks: `` `<div>` ``, `` `<script>` ``. Use language identifiers in code blocks.

## Objectives & Success Criteria

A contributor-facing check that runs `model.mjs` on the real data and notes,
prints a proofreading list and orphan warnings, and is wired into `pnpm` and CI
as named steps. Done when:

- `pnpm check:schedule` exits 0 on the branch, prints the proofreading list, and
  exits 1 with a legible message on any must-fail patch;
- `pnpm test` runs all `tests/**/*.test.mjs`;
- CI has named steps **"Schedule data"** and **"Unit tests"** before **Build**;
- `pnpm check` still runs the theme guard and `astro check`, plus the schedule check.

Requirements: FR-019 (wiring), FR-020, FR-024, NFR-006, NFR-006a, NFR-008 (unit
step), C-004.

## Subtasks & Detailed Guidance

### Subtask T011 – `scripts/check-schedule.mjs`

- Default data dir `docs/_meta/schedule`, notes dir `docs/sessions`, template
  `docs/_meta/templates/session-note.md` (if the template does not exist yet,
  skip class k with a notice — WP04 creates it; do not fail). Resolve paths from
  the repo root via `import.meta.url` so it works from any cwd.
- Run `validateSchedule`, then `checkNotes`; print each finding as
  `✗ <file>:<line> [<class>] <message>`; exit 1 if any.
- Self-test on every run, before checking real data: apply each patch from
  `scripts/fixtures/schedule/patches.mjs` to a temp copy of the valid fixture and
  confirm exactly the expected finding; abort with a clear message if the guard
  itself is broken (same pattern as `scripts/check-theme-literals.mjs`).
- Print `✓ schedule: <n> sessions across <d> day(s), <r> rooms (self-test: <k> patches)`.

### Subtask T012 – Proofreading list (FR-020) and orphan warnings (FR-024)

- Collect every free-text value: titles, descriptions, room names, place labels,
  session ids. Print them under `## Text to proofread for participant names` as a
  flat list (one per line, prefixed with its field). When `$GITHUB_STEP_SUMMARY`
  is set, append the same Markdown there.
- Orphans: `orphanNotes()` → `⚠ docs/sessions/<file>: no session on the schedule
  has this identity` (warning, exit code unaffected). The existing undated note
  `second-brain-for-humans-and-agents.md` must **not** warn.

### Subtask T013 – package.json scripts

- `"check:schedule": "node scripts/check-schedule.mjs"`
- `"test": "node --test \"tests/**/*.test.mjs\""` (Node expands the quoted glob;
  `node --test tests/` fails on Node 24 — proved in research)
- `"check"`: prepend `node scripts/check-schedule.mjs &&` to the existing chain.
- Do **not** add or change dependencies (C-004); diff `dependencies` and
  `devDependencies` against `main` before committing.

### Subtask T014 – CI workflow

- In `.github/workflows/docsite.yml` `build` job, before "Build": add
  `- name: Schedule data` → `run: pnpm check:schedule` and
  `- name: Unit tests` → `run: pnpm test`.
- Leave a clearly commented placeholder-free workflow: WP06 will add the fixture
  build job and the dist check (it records that out-of-map edit). Do not add
  steps that reference scripts that do not exist yet.

### Subtask T015 – Tests

- `tests/schedule/check.test.mjs`: spawn `node scripts/check-schedule.mjs` with an
  env/arg pointing at a temp copy of the valid fixture (add `--data <dir>
  --notes <dir>` arguments to the script); assert exit 0 and that a distinct
  marker string placed in every free-text field of a fixture copy appears in the
  proofreading output (FR-020); apply one patch and assert exit 1 with the class
  in stderr; assert a date-prefixed orphan warns and an undated note does not.
- `tests/schedule/board.test.mjs` (real data, SC-001): parse
  `docs/_meta/schedule` and assert 49 sessions, 35 with a slot, 14 with a section
  (2 lunch-tables, 1 outside with start 17:30, 4 evening, 7 other), 8 rooms in
  board order, 10 slots, exactly 2 uncertain, and that a question-mark title is
  not uncertain.

## Test Strategy

`pnpm check:schedule`, `pnpm test`, `pnpm check` (theme guard + astro check).

## Risks & Mitigations

- Summary only in logs → write to `$GITHUB_STEP_SUMMARY` when set.
- The self-test must not depend on cwd.

## Review Guidance

- Named CI steps exist before Build; dependency sets unchanged; proofreading list
  covers every free-text field (marker test).

## Context & Constraints (all work packages)

- Read first: `kitty-specs/living-schedule-01M5N5QA/spec.md` (requirements, Delivery Slices), `plan.md`
  (structure, rendering and validation decisions, Verification Strategy),
  `data-model.md`, `contracts/`, `research.md` (R-01…R-12 and both review tables),
  `quickstart.md`, `.kittify/charter/charter.md`, `AGENTS.md`.
- **No participant names** anywhere: data, identities, fixtures, tests, comments,
  commit messages, branch names (C-001). Public figures, products, tools and
  mascots in titles are fine. Never commit the board HTML or photos (C-002).
- **No new dependencies** (C-004). `yaml` and `gray-matter` are already in
  `package.json`; tests use `node:test` (`node --test "tests/**/*.test.mjs"`).
- **Static and time-independent** (C-006): no `Date.now()` or argument-less
  `new Date()` in schedule code.
- **UK English** in all user-facing text (C-007).
- **Test economy** (DIRECTIVE_041): add a test only when it guards real behaviour
  through the production entry point with realistic data and would fail on a real
  regression; prefer strengthening an existing test; pair every refusal/absence
  assertion with a same-fixture positive control (tactic
  acceptance-criteria-non-vacuity).
- **Never run a full heavy suite** (NO_FULL_HEAVY_SUITES_IN_MISSION). Run the
  targeted checks named in this prompt. `pnpm build` takes about 3 s and is fine.
- Shared pure logic lives in `src/lib/schedule/*.mjs` and must import only
  `node:` built-ins, `yaml` and `gray-matter` (no toolkit TypeScript), so the same
  module runs in Astro and in bare node (precedent: `src/lib/yaml-view-options.mjs`).
- Commit messages: Conventional Commits, generic for schedule data
  (e.g. `feat(schedule): add Friday board data`), ending with:
  `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>` and
  `Claude-Session: https://claude.ai/code/session_01K9BDgLL1DfcxZeqw3pSXjm`.

## Branch Strategy

- **Planning base branch**: `feat/living-schedule`
- **Merge target branch**: `feat/living-schedule` (the mission branch is later
  opened as one pull request against `main`)
- Execution worktrees are allocated per computed lane from `lanes.json`; do not
  pick a base branch by hand. Implement with:
  `spec-kitty agent action implement <WP-id> --agent claude --mission living-schedule-01M5N5QA`

## Progress & Status

Progress, history and status live in the status event log, never in this file.

- Record a note: `spec-kitty agent tasks add-history WP03 --note "<what you did>" --mission living-schedule-01M5N5QA`
- Mark subtasks: `spec-kitty agent tasks mark-status <Txxx…> --status done --mission living-schedule-01M5N5QA`
- Change status: `spec-kitty agent tasks move-task WP03 --to <status> --mission living-schedule-01M5N5QA`
