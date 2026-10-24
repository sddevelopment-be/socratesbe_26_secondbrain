---
work_package_id: WP06
title: Wide-screen table, day switcher and two-day fixture build
dependencies:
- WP05
requirement_refs:
- FR-003
- NFR-003
- FR-010
- FR-010a
planning_base_branch: feat/living-schedule
merge_target_branch: feat/living-schedule
branch_strategy: Planning artifacts for this mission were generated on feat/living-schedule. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into feat/living-schedule unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-living-schedule-01M5N5QA
base_commit: 6869e49b4fac0d1758a721bc0c4bb48c5f61956a
created_at: '2026-10-24T10:01:33.536257+00:00'
subtasks:
- T028
- T029
- T030
- T031
phase: Phase 4 - Wide screens
history:
- at: '2026-10-23T22:30:00Z'
  actor: system
  action: Prompt generated via /spec-kitty.tasks
agent_profile: frontend-freddy
authoritative_surface: src/theme/ScheduleTable.astro
create_intent:
- src/theme/ScheduleTable.astro
- src/theme/DaySwitcher.astro
- src/theme/schedule-table.css
- scripts/build-schedule-fixture.mjs
- scripts/fixtures/schedule/two-day/rooms.yaml
- scripts/fixtures/schedule/two-day/2026-10-23.yaml
- scripts/fixtures/schedule/two-day/2026-10-24.yaml
- scripts/fixtures/schedule/two-day/notes/2026-10-24-fixture-sentinel-published.md
- scripts/fixtures/schedule/two-day/notes/2026-10-24-fixture-sentinel-draft.md
execution_mode: code_change
model: ''
owned_files:
- src/theme/ScheduleTable.astro
- src/theme/DaySwitcher.astro
- src/theme/schedule-table.css
- scripts/fixtures/schedule/two-day/**
- scripts/build-schedule-fixture.mjs
role: implementer
tags: []
task_type: implement
tracker_refs: []
---
# Work Package Prompt: WP06 – Wide-screen table, day switcher and two-day fixture build

## ⚡ Do This First: Load Agent Profile

Use the `/spk-charter-profile-load` skill to load the agent profile specified in the frontmatter, and behave according to its guidance before parsing the rest of this prompt.

- **Profile**: `frontend-freddy`
- **Role**: `implementer`
- **Agent/tool**: `claude`

If the skill is unavailable, run `spec-kitty agent profile show frontend-freddy` and
`spec-kitty charter context --action implement --include agent-profile:frontend-freddy`.

---

## ⚠️ IMPORTANT: Review Feedback

- **Has review feedback?**: Check the `review_ref` field in the event log (via `spec-kitty agent tasks status --mission living-schedule-01M5N5QA`).
- **You must address all feedback** before your work is complete.
- **Report progress** with `spec-kitty agent tasks add-history <WPID> --note "..." --mission living-schedule-01M5N5QA`.

---

## Markdown Formatting

Wrap HTML/XML tags in backticks: `` `<div>` ``, `` `<script>` ``. Use language identifiers in code blocks.

## Objectives & Success Criteria

Add the wide-screen room × slot table, the day switcher, and a reproducible
two-day fixture build that also exercises published, draft and missing notes.
Done when:

- from about 64rem the table shows (caption, `th scope="col"` rooms in board
  order, `th scope="row"` slots, several sessions per cell, lunch/closing/dinner
  as full-width rows) and the list hides; below, the reverse;
- the day switcher appears only with ≥ 2 days, newest first, current day marked
  in words and `aria-current="page"`;
- `node scripts/build-schedule-fixture.mjs` builds `dist-fixture/` from the
  two-day data with fixture notes, leaving the working tree clean afterwards.

Requirements: FR-003, NFR-003, FR-010, FR-010a; supports FR-012/FR-022 fixture
verification (WP07 asserts).

## Out-of-map edits (recorded)

- `src/theme/ScheduleLayout.astro`: mount `<ScheduleTable>` and `<DaySwitcher>` at
  WP05's mount point (one import block, one render block).
- `src/theme/index.ts`: add `'./src/theme/schedule-table.css'` to `customCss`.
- `.gitignore`: add `dist-fixture/`.
Record each with `add-history` and a one-line rationale.

## Subtasks & Detailed Guidance

### Subtask T028 – `ScheduleTable.astro` + `schedule-table.css`

- Wrapper `<div class="not-content" role="region" aria-labelledby="cap-<date>" tabindex="0" data-layout="table" data-pagefind-ignore>`.
- `<table>` with `<caption id="cap-<date>">Schedule for Friday 23 October 2026</caption>`;
  `<thead>` with an empty corner cell then one `<th scope="col">` per room
  ("Ourthe" + `<span>` "XL · projector"); rows per slot: `<th scope="row"><time>`;
  session slots: one `<td>` per room holding a `<ul>` of sessions (title linking to
  `#session-<id>` in the list layout — no prefill URLs here) each with
  `data-session-id`, `data-note-state`, `data-note-id?`; lunch/closing/dinner:
  one `<td colspan>` with the label.
- Sticky slot column (`position: sticky; inset-inline-start: 0` with the surface
  background); focus outline visible on the region (3:1). Tokens only; the guard
  scans `schedule*.css`.
- CSS swap: list visible by default; at `min-width: 64rem` show the table and hide
  the list with `display: none` (both stay in the HTML).

### Subtask T029 – `DaySwitcher.astro`

- Renders nothing for one day. For ≥ 2: a list of links (plain `<a>`, not
  `<nav>`) to `#day-<date>` anchors, newest first; current (first) day carries
  `aria-current="page"` plus visible "(shown first)" text, styled with
  `--sb-chip-bg`/`--sb-chip-text`.

### Subtask T030 – Two-day fixture data and notes

- `scripts/fixtures/schedule/two-day/`: `rooms.yaml`, `2026-10-23.yaml` (2–3
  sessions), `2026-10-24.yaml` with a session titled
  `"FIXTURE-SENTINEL published"`, one `"FIXTURE-SENTINEL draft"`, one
  `"FIXTURE-SENTINEL missing"`; ids via `formIdentity`.
- `notes/`: a **published** note for the first id and a **draft** note for the
  second (valid DocKitty frontmatter); none for the third.

### Subtask T031 – `scripts/build-schedule-fixture.mjs`

- Copies `notes/*.md` into `docs/sessions/`, runs
  `astro build --outDir dist-fixture` with `SCHEDULE_DATA_DIR` set to the
  fixture dir and `DK_PUBLISH_DRAFTS=on` (so the draft exists in the collection
  but must still not be linked), then **always** removes the copied notes
  (`try/finally`), even on failure. Never touches `dist/`.
- Note: the draft fixture would fail `check:schedule` class (j) if the copied
  notes were checked — the script does not run that check; it only builds.
- Verify manually: `dist-fixture/sessions/schedule/index.html` contains a day
  switcher, the published sentinel links its note, the draft and missing ones
  show "Start the notes". `git status` clean afterwards.

## Risks & Mitigations

- `--outDir` on another filesystem fails with EXDEV → keep it inside the repo.
- Leaving fixture notes in `docs/` would publish them → `finally` cleanup, and
  WP07's dist check asserts the sentinel is absent from `dist/`.

## Review Guidance

- Table semantics present; switcher hidden for one day; fixture script leaves no
  trace; out-of-map edits recorded.

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

- Record a note: `spec-kitty agent tasks add-history WP06 --note "<what you did>" --mission living-schedule-01M5N5QA`
- Mark subtasks: `spec-kitty agent tasks mark-status <Txxx…> --status done --mission living-schedule-01M5N5QA`
- Change status: `spec-kitty agent tasks move-task WP06 --to <status> --mission living-schedule-01M5N5QA`
