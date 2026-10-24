---
work_package_id: WP08
title: Sessions hub, home page, guide, rules and ADR
dependencies:
- WP03
- WP05
requirement_refs:
- FR-016
- FR-017
- FR-018
- FR-023
- FR-025
- FR-014a
- C-007
planning_base_branch: feat/living-schedule
merge_target_branch: feat/living-schedule
branch_strategy: Planning artifacts for this mission were generated on feat/living-schedule. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into feat/living-schedule unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-living-schedule-01M5N5QA
base_commit: 46c3a5274e72ad6a4104e33613d4732d4914ee18
created_at: '2026-10-24T10:02:05.795235+00:00'
subtasks:
- T038
- T039
- T040
- T041
- T042
phase: Phase 5 - Entry points and docs
history:
- at: '2026-10-23T22:30:00Z'
  actor: system
  action: Prompt generated via /spec-kitty.tasks
agent_profile: curator-carla
authoritative_surface: docs/
create_intent:
- docs/adr/0003-schedule-as-structured-data.md
execution_mode: code_change
model: ''
owned_files:
- docs/sessions/README.md
- docs/README.md
- docs/guides/add-a-session-note.md
- AGENTS.md
- .kittify/charter/charter.md
- docs/adr/0003-schedule-as-structured-data.md
- docs/adr/README.md
role: implementer
tags: []
task_type: implement
tracker_refs: []
---
# Work Package Prompt: WP08 – Sessions hub, home page, guide, rules and ADR

## ⚡ Do This First: Load Agent Profile

Use the `/spk-charter-profile-load` skill to load the agent profile specified in the frontmatter, and behave according to its guidance before parsing the rest of this prompt.

- **Profile**: `curator-carla`
- **Role**: `implementer`
- **Agent/tool**: `claude`

If the skill is unavailable, run `spec-kitty agent profile show curator-carla` and
`spec-kitty charter context --action implement --include agent-profile:curator-carla`.

---

## ⚠️ IMPORTANT: Review Feedback

- **Has review feedback?**: Check the `review_ref` field in the event log (via `spec-kitty agent tasks status --mission living-schedule-01M5N5QA`).
- **You must address all feedback** before your work is complete.
- **Report progress** with `spec-kitty agent tasks add-history <WPID> --note "..." --mission living-schedule-01M5N5QA`.

---

## Markdown Formatting

Wrap HTML/XML tags in backticks: `` `<div>` ``, `` `<script>` ``. Use language identifiers in code blocks.

## Objectives & Success Criteria

Make the schedule reachable on phones, simplify contributing, and bring every
written instruction and governance surface in line. Done when `pnpm validate`,
`pnpm lint:md`, `pnpm links`, `pnpm build`, `pnpm check:dist` and `pnpm spell`
pass, and:

- the sessions hub has no hand-kept list, shows a schedule link before the
  automatic notes list (first screen at 375px), and the Slack fallback;
- the home hero links the schedule;
- the guide, AGENTS.md and the charter describe the new flow and gates;
- ADR 0003 records the decision.

Requirements: FR-016, FR-017, FR-018, FR-023, FR-025, FR-014a (procedure text),
C-007.

## Subtasks & Detailed Guidance

### Subtask T038 – Sessions hub `docs/sessions/README.md`

- Remove "Notes so far" and the "Publish what you have as a draft" advice. Keep
  `kind: Hub` (the toolkit lists published children automatically).
- Add, at the top of the body: a prominent link "See the schedule" to
  `./schedule.md`; one sentence on starting notes from a session on the schedule;
  the Slack fallback sentence (FR-018); a link to the guide.

### Subtask T039 – Home `docs/README.md`

- In the hero (next to "Browse sessions"), add a "Schedule" call to action
  linking `sessions/schedule.md` (relative). Keep the existing hero markup style.

### Subtask T040 – Guide `docs/guides/add-a-session-note.md`

- Rewrite around the new flow: 1) open the schedule, find the session, choose
  "Start the notes" (GitHub opens a prefilled file named after the session
  identity); fallback: copy the template (link to
  `docs/_meta/templates/session-note.md` on GitHub, not a copy of it);
  2) write the TL;DR and the sections you used; 3) propose the change — the note
  is published when merged (no draft step; drafts for scheduled sessions fail the
  check); 4) if the file already exists, add to the existing note instead;
  no GitHub account → Slack. Keep the no-names rule from PR #14 word for word.
  Drop the old step 4 "add a line to the list" and the `doc_status: draft` advice.
  Add a short "Keep the schedule current" section pointing to quickstart rules
  (quoted values, no comments, never change an id except to remove a name — then
  rename the note file in the same PR, FR-014a).

### Subtask T041 – AGENTS.md and charter

- AGENTS.md: session notes are published on merge (`doc_status: active`), an
  exception to "keep new pages draft"; schedule YAML rules (no comments, quote
  every text value, use `YAML_OPTIONS` when generating, never change an id); add
  `pnpm check:schedule` and `pnpm test` to the "before you finish" command list.
- `.kittify/charter/charter.md` Quality gates: add `pnpm check:schedule` (schedule
  data), `pnpm test` (unit tests) and the post-build schedule check in
  `check:dist`. Check `spec-kitty charter status` stays FRESH.

### Subtask T042 – ADR 0003

- `docs/adr/0003-schedule-as-structured-data.md` following ADR 0001/0002's
  frontmatter and structure (status Accepted, date 2026-10-23): context (living
  board, phones, agents), decision (per-day YAML in `docs/_meta/schedule`, one
  validator, kind layout on a docs page, `api/schedule.json` + text splice),
  consequences (exception to principle 1 with parity enforcement; custom kind
  warning; site-local splice until an upstream generic include exists).
  Description 50–180 characters. Update `docs/adr/README.md` if it lists ADRs.

## Risks & Mitigations

- A published page linking a draft → link only published pages and the schedule.
- Relative link depth from the hub and home → use `.md` relative links (the build
  rewrites them).

## Review Guidance

- No hand-kept lists remain; the guide does not duplicate the template; no names.

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

- Record a note: `spec-kitty agent tasks add-history WP08 --note "<what you did>" --mission living-schedule-01M5N5QA`
- Mark subtasks: `spec-kitty agent tasks mark-status <Txxx…> --status done --mission living-schedule-01M5N5QA`
- Change status: `spec-kitty agent tasks move-task WP08 --to <status> --mission living-schedule-01M5N5QA`
