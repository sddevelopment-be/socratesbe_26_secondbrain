---
work_package_id: WP07
title: Agent surfaces, parity and post-build checks
dependencies:
- WP03
- WP05
- WP06
requirement_refs:
- FR-005
- FR-021
- FR-021a
- FR-021b
- NFR-005
- NFR-008
- SC-006
planning_base_branch: feat/living-schedule
merge_target_branch: feat/living-schedule
branch_strategy: Planning artifacts for this mission were generated on feat/living-schedule. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into feat/living-schedule unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-living-schedule-01M5N5QA
base_commit: 5b120d1af3349d2782d360ce8a81a09aea9371de
created_at: '2026-10-24T10:24:07.761740+00:00'
subtasks:
- T032
- T033
- T034
- T035
- T036
- T037
phase: Phase 4 - Agents and checks
history:
- at: '2026-10-23T22:30:00Z'
  actor: system
  action: Prompt generated via /spec-kitty.tasks
agent_profile: node-norris
authoritative_surface: scripts/check-schedule-dist.mjs
create_intent:
- src/pages/api/schedule.json.ts
- src/lib/schedule/text.mjs
- scripts/check-schedule-dist.mjs
- tests/schedule/text.test.mjs
- tests/schedule/dist.test.mjs
execution_mode: code_change
model: ''
owned_files:
- src/pages/api/schedule.json.ts
- src/lib/schedule/text.mjs
- src/lib/page-views.ts
- scripts/check-schedule-dist.mjs
- tests/schedule/text.test.mjs
- tests/schedule/dist.test.mjs
role: implementer
tags: []
task_type: implement
tracker_refs: []
---
# Work Package Prompt: WP07 – Agent surfaces, parity and post-build checks

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

Agents read the same schedule as humans, and a post-build checker with its own
self-test proves no-JS, counts, parity, note links and path uniqueness. Done when:

- `dist/api/schedule.json` matches `contracts/api-schedule.schema.json` (hand-
  written shape assertion) with 49 sessions;
- `dist/sessions/schedule.md` (and `.json`, `.yaml`, `api/pages/sessions/schedule.json`)
  contain the schedule as text and link `api/schedule.json`;
- `node scripts/check-schedule-dist.mjs dist` passes on the real build and on
  `dist-fixture` (`--fixture`), and its self-test passes;
- CI runs it after the build and in a separate fixture job; nothing from the
  fixture is uploaded.

Requirements: FR-005 (dist), FR-012/FR-022 (fixture verification), FR-021,
FR-021a, FR-021b, NFR-005, NFR-007 (dist half), NFR-008 (fixture step, sentinel).

## Out-of-map edits (recorded)

- `package.json`: `check:dist` chains `node scripts/check-schedule-dist.mjs dist`.
- `.github/workflows/docsite.yml`: a separate job `schedule-fixture`
  (checkout, pnpm, node 24, install, `node scripts/build-schedule-fixture.mjs`,
  `node scripts/check-schedule-dist.mjs dist-fixture --fixture`) with no upload.

## Subtasks & Detailed Guidance

### Subtask T032 – `src/pages/api/schedule.json.ts`

- `GET` static route using `getScheduleView()` (WP05 `source.ts`); output per
  the contract: `schema_version: 1`, `page` (absolute URL), `rooms`, `days`
  (newest first, `timezone: "Europe/Brussels"`), sessions with
  `note: { state, id, url? }` (absolute `url` only when published). No prefill URLs.

### Subtask T033 – `src/lib/schedule/text.mjs` + splice

- `scheduleMarkdown(view, siteRoot)` → Markdown: per day `## Friday 23 October 2026`
  + snapshot line; per slot `### 13:30`, one bullet per session:
  `- **Event Storming** — Ourthe (XL room, projector). Notes: none (id: 2026-10-23-event-storming)`
  or `Notes: [published](<absolute .md URL>) (id: …)`; then sections; finally
  `Machine-readable: <absolute URL of api/schedule.json>`. All links absolute
  under the site prefix (`check-md-views.mjs` requires it). No prefill URLs.
- `src/lib/page-views.ts` `pageRecord()`: when the record is the schedule page
  (slug `sessions/schedule`), append the text to `record.markdown`. Nothing else
  changes; existing views and `check-md-views.mjs`/`check-yaml-views.mjs` stay green.

### Subtask T034 – `scripts/check-schedule-dist.mjs`

Arguments: `<distDir> [--fixture]`. Data read **independently** via
`model.mjs` (`SCHEDULE_DATA_DIR` or the fixture dir with `--fixture`).

- **No-JS (FR-005)**: the set of `<script src>` and inline-script SHA-1 hashes on
  the schedule page ⊆ that of a control docs page (`guides/run-locally/index.html`);
  inside `[data-schedule]`: no `<script`, no `on[a-z]+=` attribute, no `<template`,
  no custom element tag (`<[a-z]+-[a-z-]+`), no `hidden` on a session or ancestor.
- **Counts**: `[data-layout="list"]` and `[data-layout="table"]` each contain
  every `data-session-id` exactly once; the set equals the data ids and is non-empty.
- **Links**: every `href="#…"` in `[data-schedule]` resolves to an `id`; every
  "Start the notes" URL ≤ 4,000 characters; each Start link has a fallback link.
- **Parity (FR-021b)**: normalised `(id, state, noteId)` sets equal across the
  HTML markers, `api/schedule.json` and the `.md` view tokens `(id: …)`, and equal
  the data; never empty.
- **Paths**: no two of `dist/api/schedule.json`, `dist/sessions/schedule.{md,json,yaml}`,
  `dist/api/pages/sessions/schedule.json` are the same file; the API file exists.
- **Real build**: assert the string `FIXTURE-SENTINEL` appears nowhere in `dist/`.
- **Fixture build (`--fixture`)**: day switcher present with 2 days; ≥ 1
  `data-note-state="published"` (the published sentinel) and ≥ 1 `none`; the draft
  sentinel is **not** linked to its note page (FR-022).
- **Self-test** on every run: small HTML/JSON/MD snippets, one injected violation
  per assertion (a `<script>` in the root, a missing session in one layout, a
  parity mismatch, a dangling anchor, an over-long URL), each must be detected.

### Subtask T035 – Tests

- `tests/schedule/text.test.mjs`: from the WP01 valid fixture view, the text
  lists every id once, uses absolute links, includes the API link, has no
  `github.com/…/new/` URLs.
- `tests/schedule/dist.test.mjs`: runs the checker's self-test function directly
  (exported) and asserts every injected violation is reported.

### Subtask T036 – Wiring (out-of-map edits above)

- `check:dist` chain; CI `schedule-fixture` job; keep the Pages upload `path: dist`.

### Subtask T037 – Timings (NFR-005, NFR-006)

- Record before/after `pnpm build` wall time on the same machine (baseline 3.2 s)
  and `pnpm check:schedule` time in history; both must meet the budgets.

## Risks & Mitigations

- Vacuous parity → non-empty sets equal to the data; fixture build covers the
  published/draft states.
- Starlight scripts on every page → subset comparison against a control page.

## Review Guidance

- Self-test detects every injected violation; real and fixture runs pass; sentinel
  absent from `dist/`; text view links absolute.

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

- Record a note: `spec-kitty agent tasks add-history WP07 --note "<what you did>" --mission living-schedule-01M5N5QA`
- Mark subtasks: `spec-kitty agent tasks mark-status <Txxx…> --status done --mission living-schedule-01M5N5QA`
- Change status: `spec-kitty agent tasks move-task WP07 --to <status> --mission living-schedule-01M5N5QA`
