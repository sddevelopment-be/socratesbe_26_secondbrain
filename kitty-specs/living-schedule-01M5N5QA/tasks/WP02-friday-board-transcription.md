---
work_package_id: WP02
title: Friday 23 October board transcription
dependencies:
- WP01
requirement_refs:
- FR-002
- FR-002a
- SC-001
- C-002
planning_base_branch: feat/living-schedule
merge_target_branch: feat/living-schedule
branch_strategy: Planning artifacts for this mission were generated on feat/living-schedule. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into feat/living-schedule unless the human explicitly redirects the landing branch.
subtasks:
- T007
- T008
- T009
- T010
phase: Phase 2 - Data
history:
- at: '2026-10-23T22:30:00Z'
  actor: system
  action: Prompt generated via /spec-kitty.tasks
agent_profile: implementer-ivan
authoritative_surface: docs/_meta/schedule/
create_intent:
- docs/_meta/schedule/rooms.yaml
- docs/_meta/schedule/2026-10-23.yaml
- kitty-specs/living-schedule-01M5N5QA/identity-checklist.md
execution_mode: planning_artifact
model: ''
owned_files:
- docs/_meta/schedule/rooms.yaml
- docs/_meta/schedule/2026-10-23.yaml
- kitty-specs/living-schedule-01M5N5QA/identity-checklist.md
role: implementer
tags: []
task_type: implement
tracker_refs: []
---
# Work Package Prompt: WP02 – Friday 23 October board transcription

## ⚡ Do This First: Load Agent Profile

Use the `/spk-charter-profile-load` skill to load the agent profile specified in the frontmatter, and behave according to its guidance before parsing the rest of this prompt.

- **Profile**: `implementer-ivan`
- **Role**: `implementer`
- **Agent/tool**: `claude`

If the skill is unavailable, run `spec-kitty agent profile show implementer-ivan` and
`spec-kitty charter context --action implement --include agent-profile:implementer-ivan`.

---

## ⚠️ IMPORTANT: Review Feedback

- **Has review feedback?**: Check the `review_ref` field in the event log (via `spec-kitty agent tasks status --mission living-schedule-01M5N5QA`).
- **You must address all feedback** before your work is complete.
- **Report progress** with `spec-kitty agent tasks add-history <WPID> --note "..." --mission living-schedule-01M5N5QA`.

---

## Markdown Formatting

Wrap HTML/XML tags in backticks: `` `<div>` ``, `` `<script>` ``. Use language identifiers in code blocks.

## Objectives & Success Criteria

Transcribe the board of Friday 23 October 2026 into schedule data that passes
`validateSchedule` with zero findings and contains **no participant names**.
Done when:

- `node -e "import('./src/lib/schedule/model.mjs').then(m=>{const r=m.validateSchedule('docs/_meta/schedule');console.log(r.findings);process.exit(r.findings.length)})"` prints `[]`;
- the inventory matches research R-12 exactly: 8 rooms; 10 slots (session slots
  10:50, 11:40, 13:30, 14:30, 15:30, 16:30, 17:30; lunch 12:30; closing 18:30;
  dinner 19:30); **49 sessions** = 35 in the grid + 2 lunch tables + 1 outside
  (17:30) + 4 evening + 7 other/not yet scheduled; exactly 2 `uncertain`;
- `identity-checklist.md` lists all 49 ids and titles (no names).

Requirements: FR-002, FR-002a, FR-007 (data), FR-008 (data), SC-001, C-001, C-002.

## Source

The operator's transcription (NOT to be committed, C-002):
`/tmp/claude-1000/-home-stijnd-Documents-code-projects-UNCONFERENCE-socratesbe-26-secondbrain/d9730253-4682-490f-bc3d-6e5bcaaed9ee/scratchpad/schedule-research/board-2026-10-23.html`.
Every sticky's convener is in a `<span class="who">`: **ignore those spans
entirely**. Never copy a `.who` value, and never put a name into a title,
description or id.

## Subtasks & Detailed Guidance

### Subtask T007 – Rooms

- Columns in board order (left to right): Sambre / Meuse (XL, projector),
  Ourthe (XL, projector), Amblève (L, screen), Wamme (S), Vesdre (S),
  Lesse (L, projector), Semois (L, projector), Lhomme (S). 📽 = projector,
  🖥 = screen (assumption recorded in the spec). Keys: lowercase ASCII
  (`sambre-meuse`, `ourthe`, `ambleve`, `wamme`, `vesdre`, `lesse`, `semois`,
  `lhomme`). File: `docs/_meta/schedule/rooms.yaml`.

### Subtask T008 – Day file: slots and grid sessions

- `date: "2026-10-23"`; `snapshot`: ask nothing — use `"2026-10-23T21:47"` (the
  transcription file's time) and note in history that the operator may correct it.
- Slots with keys like `"1050"`; lunch `"1230"` type lunch; closing `"1830"`;
  dinner `"1930"`.
- For each grid cell, one session per sticky **in board order**; `room` = column
  key; `slot` = row key. Titles exactly as on the sticky (keep emoji, `?`, `&`,
  `…`). Description: the sticky's `.desc` text **except** transcription notes:
  "(cut off in photo)" becomes `uncertain: true` and is not copied. Keep other
  descriptions as written (e.g. "(no-AI)", "(Pope on AI)" — a public figure, allowed;
  "w/ Mr Kitty (bring laptop)" — a mascot, allowed).
- The 8 decorative lunch stickies (food icons and the "ELLE YOU…" sticky) are not
  sessions.
- ids via `formIdentity('2026-10-23', title, taken)` from `model.mjs`, generated
  once and written literally into the file.

### Subtask T009 – Sections

- Lunch tables (2): `section: "lunch-tables"`, `place: "Lunch table"`.
- Outside (1): `section: "outside"`, `place: "Outside"`, `start: "17:30"`.
- Evening (4): `section: "evening"`; place where stated (e.g. "Cafeteria" for the
  board-games sticky), otherwise `place: "To be announced"`.
- Other / not yet scheduled (7): `section: "other"`, `place: "To be announced"`.
  The "(Thursday)" sticky stays here with "(Thursday)" kept in its description
  (FR-002a). The two "(cut off in photo)" stickies get `uncertain: true` and
  their visible title text as written (including "…").
- A question title (e.g. "Did I lock the door?") is **not** uncertain (FR-008).

### Subtask T010 – Validate, count and checklist

- Run the validator (command above) until zero findings.
- Count programmatically from the parsed model and confirm 49 / 35 / 14 / 8 rooms
  / 10 slots / 2 uncertain; record the command output in history.
- Write `kitty-specs/living-schedule-01M5N5QA/identity-checklist.md`: a table of `id | title |
  room-or-place | slot-or-section`, 49 rows, no names. Proofread the whole data
  file and the checklist for any participant name before committing.
- Commit with a generic message, e.g. `feat(schedule): add the Friday 23 October board`.

## Risks & Mitigations

- Name leakage via descriptions such as "w/ <name>" → only mascots/public figures
  may stay; when in doubt, drop the phrase.
- A title starting with `#` or containing `:` → always double-quote (writing rules).

## Review Guidance

- Recount from the data; compare with R-12. Grep the YAML and checklist for every
  `.who` value in the source (reviewer runs this locally from the scratch file) —
  zero hits.

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

- Record a note: `spec-kitty agent tasks add-history WP02 --note "<what you did>" --mission living-schedule-01M5N5QA`
- Mark subtasks: `spec-kitty agent tasks mark-status <Txxx…> --status done --mission living-schedule-01M5N5QA`
- Change status: `spec-kitty agent tasks move-task WP02 --to <status> --mission living-schedule-01M5N5QA`
