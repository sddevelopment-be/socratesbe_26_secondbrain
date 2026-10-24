---
work_package_id: WP05
title: Schedule page, view model and phone list layout
dependencies:
- WP01
- WP02
- WP04
requirement_refs:
- FR-004
- FR-006
- FR-007
- FR-008
- FR-009
- FR-011
- FR-012
- FR-022
- NFR-001
- NFR-001a
- NFR-002
- C-003
- C-003a
- C-006
- C-008
- SC-002
- SC-004
planning_base_branch: feat/living-schedule
merge_target_branch: feat/living-schedule
branch_strategy: Planning artifacts for this mission were generated on feat/living-schedule. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into feat/living-schedule unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-living-schedule-01M5N5QA
base_commit: 8fb755af66d788299caf584972076fded5af6be6
created_at: '2026-10-24T09:48:41.000963+00:00'
subtasks:
- T021
- T022
- T023
- T024
- T025
- T026
- T027
phase: Phase 3 - Page
history:
- at: '2026-10-23T22:30:00Z'
  actor: system
  action: Prompt generated via /spec-kitty.tasks
agent_profile: frontend-freddy
authoritative_surface: src/theme/
create_intent:
- src/lib/schedule/view.mjs
- src/lib/schedule/source.ts
- src/theme/ScheduleLayout.astro
- src/theme/ScheduleList.astro
- src/theme/schedule.css
- docs/sessions/schedule.md
- tests/schedule/view.test.mjs
execution_mode: code_change
model: ''
owned_files:
- src/lib/schedule/view.mjs
- src/lib/schedule/source.ts
- src/theme/ScheduleLayout.astro
- src/theme/ScheduleList.astro
- src/theme/schedule.css
- src/theme/index.ts
- docs/sessions/schedule.md
- scripts/check-theme-literals.mjs
- tests/schedule/view.test.mjs
role: implementer
tags: []
task_type: implement
tracker_refs: []
---
# Work Package Prompt: WP05 – Schedule page, view model and phone list layout

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

Render the schedule for humans from **one view model**, on a regular docs page,
mobile first, without JavaScript. Done when:

- `pnpm build` produces `/sessions/schedule/` with all 49 sessions in the list
  layout, slot jump links, sections, snapshot statement, room facts in words,
  uncertain flags, note links, fallback links and the Slack line;
- `node --test "tests/schedule/view.test.mjs"` passes;
- `pnpm check` (theme guard incl. the new CSS, astro check) and `pnpm validate`
  pass (a non-fatal `kind: Schedule` warning is expected);
- 375px screenshot shows no horizontal scroll.

Requirements: FR-004, FR-005 (page side), FR-006, FR-007, FR-008, FR-009, FR-011,
FR-012, FR-018 (schedule surface), FR-019a, FR-022, NFR-001, NFR-001a, NFR-002,
C-003, C-003a, C-006, C-008.

## Subtasks & Detailed Guidance

### Subtask T021 – `src/lib/schedule/view.mjs`: `buildScheduleView`

- `buildScheduleView({ schedule, publishedIds, site, template })` → a plain object
  every renderer uses (layout, API, text):
  `{ days: [ { date, weekday ('Friday'), snapshot: {date, time}, slots: [ {key, start, type, sessions: [...] } ], sections: [ {key, heading, sessions} ] } ], rooms }`.
  Each session view: `id, title, description?, location: {kind:'room', room} | {kind:'place', label}, slotKey?, sectionKey?, start?, uncertain, note: {state, href?}, start: {url, truncated}, fallback: {templateUrl, guideHref}`.
- Section headings: `lunch-tables` "Lunch tables", `outside` "Outside",
  `evening` "Evening", `other` "Other / not yet scheduled".
- Days newest first; weekday from the date via `Intl.DateTimeFormat('en-GB', {weekday:'long', timeZone:'UTC'})` on `new Date(date + 'T00:00:00Z')` (argument-full, time-independent).
- Uses `links.mjs` for note state and prefill. Pure.

### Subtask T022 – `src/lib/schedule/source.ts`

- `getScheduleView()`: data dir = `process.env.SCHEDULE_DATA_DIR ?? 'docs/_meta/schedule'`
  (resolved from the project root); `loadSchedule(dir)` (throws → build fails,
  FR-019a); published ids from `getCollection('docs')` filtered with `isPublished`
  from `@spec-kitty/doc-toolkit`, ids where `entry.id` starts with `sessions/`
  (strip the prefix; match the toolkit's id form — inspect one entry); template
  text read from `docs/_meta/templates/session-note.md`; site constants from
  `site.config.mjs`. Memoise per build.

### Subtask T023 – Register the kind layout and create the page

- `src/theme/index.ts`: add `layouts: { Schedule: here('./ScheduleLayout.astro') }`
  with a local cast (the toolkit's `Kind` type is closed; runtime accepts it) and
  add `'./src/theme/schedule.css'` to `customCss`.
- `docs/sessions/schedule.md`: frontmatter `title: Schedule`, description (≤ 180
  chars, UK English), `doc_status: active`, `type: Context`, `kind: Schedule`,
  `tableOfContents: false`, `sidebar: { order: 1 }`, `updated`, `tags`, authors
  as on other pages. Body: one short intro paragraph saying the page transcribes
  the board, the board in the venue is authoritative, and agents can fetch
  `api/schedule.json` (link with the correct relative depth from
  `/sessions/schedule/`: `../../api/schedule.json`). No `related:`/`external_references`.
- Do **not** use `template: splash` (it removes the mobile menu).

### Subtask T024 – `ScheduleLayout.astro` and `ScheduleList.astro`

- Layout receives `{...route}` and a default slot (the toolkit's MarkdownContent
  passes Audience + body + related). Render the schedule **before** `<slot />`?
  No: render the intro (`<slot />`) first, then the schedule.
- Root `<div data-schedule>`; per day a section with `<h2>` weekday + date and the
  snapshot statement (FR-011: "Transcribed from the board at HH:MM on <date>. The
  board in the venue is authoritative.").
- Slot jump links: a plain list of links (not `<nav>`, Pagefind drops it) to
  `#slot-<date>-<key>` for session/lunch/closing/dinner slots.
- `ScheduleList.astro` (`data-layout="list"`): per slot an `<h3 id="slot-…">` with
  `<time datetime="2026-10-23T13:30">13:30</time>`; lunch/closing/dinner as a
  single line; sessions as cards in board order. Each card: title; description;
  location line "Ourthe · XL room · projector" (room facts in words; a room
  without equipment shows its size only, FR-006) or the place label; uncertain
  line "Partly unreadable on the board — correct it" linking to the data file on
  GitHub; note action: "Read the notes" (`href` = note page) or "Start the notes"
  (prefill URL) with visually hidden "for <title>" and "(on GitHub, sign-in
  needed)"; a small fallback link "or copy the template" next to Start (FR-013a).
- Then the sections (FR-007) with their headings and `start` times.
- Each card: `data-session-id`, `data-note-state`, `data-note-id` when published;
  `id="session-<id>"` (the table in WP06 links here).
- Slack line once per page (FR-018): "No GitHub account? Post your notes in the
  SoCraTes Slack and someone will open the pull request." linking
  `https://socratesbe.org/slack/`.
- Leave a single clearly named mount point in `ScheduleLayout.astro` where WP06
  will add `<ScheduleTable>` and `<DaySwitcher>` (render nothing extra now).

### Subtask T025 – `schedule.css`

- Mobile first; cards use `--dk-color-surface-1`, `--dk-color-border`,
  `--dk-radius-md`; text `--dk-color-text`, muted `--dk-color-text-muted`;
  published note action `--dk-color-success`/`--dk-color-success-bg`. Any new
  colour goes into `socrates.css` as an `--sb-*` token? Prefer existing `--dk-*`.
  **No colour literals.** Links/buttons ≥ 24×24 CSS px (NFR-001a); no fixed widths
  that cause horizontal scroll at 375px.
- `scripts/check-theme-literals.mjs`: extend the default targets to scan
  `src/theme/schedule*.css` too (keep its self-test green).

### Subtask T026 – Tests `tests/schedule/view.test.mjs`

- From the WP01 valid fixture: published note → state `published` with href; a
  session without a note → `none` with a prefill URL; days newest first; sections
  mapped to headings; the cross-day-moved session keeps its id.

### Subtask T027 – Verify

- `pnpm build`; inspect `dist/sessions/schedule/index.html`: count
  `data-layout="list"` session markers = 49; jump-link targets exist; no
  `<script>` inside `[data-schedule]`. Take a 375px screenshot (headless Chromium
  is at `/usr/bin/chromium`; playwright-core may be installed in a scratch dir —
  do not add it to the project) and check no horizontal scroll. Measure contrast
  of any new colour pair (NFR-002). Record numbers in history.

## Risks & Mitigations

- Starlight Markdown CSS on tables/lists → use `not-content` on the schedule root.
- Pagefind indexing twice → `data-pagefind-ignore` on the table (WP06) only.
- The `Kind` cast must not hide other type errors; run `pnpm check`.

## Review Guidance

- One view model, consumed by the layout; no data logic in `.astro` files.
- All markers present; no JS; tokens only; page validates.

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

- Record a note: `spec-kitty agent tasks add-history WP05 --note "<what you did>" --mission living-schedule-01M5N5QA`
- Mark subtasks: `spec-kitty agent tasks mark-status <Txxx…> --status done --mission living-schedule-01M5N5QA`
- Change status: `spec-kitty agent tasks move-task WP05 --to <status> --mission living-schedule-01M5N5QA`
