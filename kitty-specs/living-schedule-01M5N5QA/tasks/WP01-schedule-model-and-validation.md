---
work_package_id: WP01
title: Schedule model and validation core
dependencies: []
requirement_refs:
- FR-001
- FR-001a
- FR-001b
- FR-014
- FR-019
- FR-019a
- NFR-007
- C-001
- C-009
planning_base_branch: feat/living-schedule
merge_target_branch: feat/living-schedule
branch_strategy: Planning artifacts for this mission were generated on feat/living-schedule. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into feat/living-schedule unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-living-schedule-01M5N5QA
base_commit: 89a3c2ff355ce7acc860d735608d76cfbc8b2124
created_at: '2026-10-23T22:32:48.098029+00:00'
subtasks:
- T001
- T002
- T003
- T004
- T005
- T006
phase: Phase 1 - Foundation
history:
- at: '2026-10-23T22:30:00Z'
  actor: system
  action: Prompt generated via /spec-kitty.tasks
agent_profile: node-norris
authoritative_surface: src/lib/schedule/
create_intent:
- src/lib/schedule/model.mjs
- scripts/fixtures/schedule/patches.mjs
- tests/schedule/model.test.mjs
- scripts/fixtures/schedule/valid/rooms.yaml
- scripts/fixtures/schedule/valid/2026-10-22.yaml
- scripts/fixtures/schedule/valid/2026-10-23.yaml
- scripts/fixtures/schedule/valid/sessions/2026-10-22-moved-across-days.md
execution_mode: code_change
model: ''
owned_files:
- src/lib/schedule/model.mjs
- scripts/fixtures/schedule/valid/**
- scripts/fixtures/schedule/patches.mjs
- tests/schedule/model.test.mjs
role: implementer
tags: []
task_type: implement
tracker_refs: []
---
# Work Package Prompt: WP01 – Schedule model and validation core

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

Deliver `src/lib/schedule/model.mjs`: the **only** validator of schedule data. It
reads a schedule directory, enforces the writing rules, parses, validates every
FR-019 class (a)–(k) in order with exactly one finding per fault, and exposes the
identity rule. Done when:

- `node --test "tests/schedule/model.test.mjs"` passes;
- the valid fixture produces **zero** findings, and every must-fail patch in
  `patches.mjs` produces **exactly one** finding with the expected class and
  location (`file:line`);
- the module imports only `node:*`, `yaml`, `gray-matter`.

Requirements: FR-001, FR-001a, FR-001b, FR-014, FR-019 (a)–(k), FR-019a (the
throwing API the build uses), NFR-007 (check-script half), C-001, C-009.

## Subtasks & Detailed Guidance

### Subtask T001 – Read and lex the schedule directory; writing rules (class a, c)

- **Purpose**: Catch the faults that YAML parsing hides: comments (where names can
  hide in public source), unquoted text, non-boolean `uncertain`, values that
  YAML 1.1 and 1.2 read differently. Research R-10 and the post-plan review proved
  `title: Mob programming   # by …` and `title: TDD #1` pass every parse-based check.
- **Steps**:
  1. `export function readScheduleDir(dir)` → `{ rooms: {file, src}, days: [{file, src}] }`.
     `rooms.yaml` is required; day files match `^\d{4}-\d{2}-\d{2}\.yaml$`. Anything
     else in the directory (other than a `sessions/` folder used by fixtures) is a
     class (a) finding. A missing directory or unreadable file is class (a).
  2. Writing rules per file, using `yaml`'s CST/AST:
     - comments: `new Lexer().lex(src)` — any token starting with `#` (outside a
       quoted scalar) is a finding (class c) with its line;
     - parse with `parseDocument(src, { version: '1.2' })`; walk every `Scalar`
       node that is a **value** (not a key): text fields must have
       `node.type` `QUOTE_DOUBLE` or `QUOTE_SINGLE`; the `uncertain` value must be
       a `PLAIN` scalar `true` or `false`; arrays (`equipment`) hold quoted strings;
     - also parse with `{ version: '1.1' }` and compare the plain JS values; any
       difference is class (c). Report one finding per offending line.
     A file with a YAML syntax error is class (a) (cannot be read).
  3. Locations: compute `line` from node ranges (`LineCounter`). Message format:
     `<file>:<line> [<class>] <explanation>`.
- **Files**: `src/lib/schedule/model.mjs`.
- **Notes**: keep quoted values like `"No"`, `"2026-10-23-b"`, `"Chaos — what? 🎉 …"`
  free of false positives (proved in research). Do not use `stringify` to build
  anything that must keep quotes.

### Subtask T002 – Shape validation (classes b, d, f, g, h, i)

- **Purpose**: Closed, typed objects per `data-model.md` and `contracts/*.schema.json`.
- **Steps**:
  1. Rooms: `{ rooms: [ { key, name, size, equipment } ] }`; key pattern
     `^[a-z0-9]+(-[a-z0-9]+)*$`, unique; `size` ∈ XL|L|S; `equipment` ⊆
     {projector, screen}, unique.
  2. Day: `date` equals the file name; `snapshot` `YYYY-MM-DDTHH:MM`; `slots`
     non-empty with unique `key`, `start` HH:MM, `type` ∈ session|lunch|closing|dinner;
     `sessions` non-empty.
  3. Session fields exactly: `id`, `title`, `description?`, `room|place`,
     `slot|section`, `start?` (only with `section`), `uncertain?`. Unknown key →
     class (i) (this is the structural "no person field" guard). Title ≤ 100 and
     description ≤ 140 **Unicode code points** (`[...s].length`); place ≤ 40.
  4. Classes: (b) empty file/no sessions/no rooms; (d) required field missing or
     empty after trim (title, id, snapshot); (f) id shape (see T003); (g) unknown
     room key, unknown slot key in the same day, or a slot whose type is not
     `session`; (h) both/neither of room/place, both/neither of slot/section, or
     `start` without `section`; (i) unknown field.
  5. Order and uniqueness: evaluate per fault in the order a, b, c, d, e, f, g, h,
     i, j, k and report a fault only under the first class it matches (e.g. an
     unquoted `#x` title is (c), never also (d)).
- **Files**: `src/lib/schedule/model.mjs`.

### Subtask T003 – Identity rule and uniqueness (classes e, f)

- **Purpose**: FR-001b. Everyone forms ids the same way; ids never change on moves.
- **Steps**:
  1. `export function formIdentity(date, title, taken = new Set())`:
     NFKD-normalise, strip combining marks, lowercase, replace runs of anything
     outside `[a-z0-9]` with `-`, trim hyphens; empty → `session`; prefix
     `${date}-`; cut to 60 code points and trim a trailing hyphen; if taken,
     append `-2`, `-3`, … re-cutting the base so the result stays ≤ 60.
  2. Shape check (class f): `^\d{4}-\d{2}-\d{2}-[a-z0-9]+(-[a-z0-9]+)*$`, ≤ 60, the
     prefix a valid calendar date. **Do not** require the prefix to equal the
     containing day's date (cross-day moves keep their id, FR-014).
  3. Uniqueness (class e): across **all** schedule data (every day file). A file
     `docs/sessions/<id>.md` is the session's own note, never a collision.
- **Files**: `src/lib/schedule/model.mjs`.
- **Edge cases to test**: accents (`Amblève` → `ambleve`), emoji-only title →
  `…-session`, 120-character title truncation without trailing hyphen, collision
  suffix within 60.

### Subtask T004 – Note checks (classes j, k) and the public API

- **Purpose**: FR-019 (j) and (k), evaluated only where the docs tree is known.
- **Steps**:
  1. `export function checkNotes(sessionIds, notesDir, templateDescription)`:
     for each `notesDir/<id>.md` that exists, read frontmatter with `gray-matter`.
     (j) draft if `(doc_status ?? 'draft') === 'draft'` — copied from the toolkit's
     `isDraftStatus` (`node_modules/@spec-kitty/doc-toolkit/lib/vocabulary-core.mjs`,
     not exported); cite it in a comment. (k) `description` equals the template's
     placeholder description (passed in, read by the caller from
     `docs/_meta/templates/session-note.md`).
  2. Public API:
     - `export function validateSchedule(dir)` → `{ findings, schedule }` where
       `schedule` is the parsed, normalised model `{ rooms, days }` (days sorted
       newest first, slots by start, sessions in file order) — no throwing;
     - `export function loadSchedule(dir)` → `schedule`; **throws** an `Error`
       listing the findings when any finding exists (FR-019a; the build calls this);
     - `export const CLASSES` with the class letters and short names, for messages
       and tests.
  3. `orphanNotes(sessionIds, notesDir)` → date-prefixed `.md` files matching no
     session (FR-024 helper; the check script prints warnings).
- **Files**: `src/lib/schedule/model.mjs`.

### Subtask T005 – Valid fixture

- **Purpose**: One realistic, name-free fixture exercising every feature; the base
  for every must-fail patch.
- **Steps**: create `scripts/fixtures/schedule/valid/`:
  - `rooms.yaml`: 3 rooms (one with two equipment items, one with none);
  - `2026-10-22.yaml`: minimal valid day (1 session slot, 1 session);
  - `2026-10-23.yaml`: session, lunch, closing and dinner slots; a cell with two
    sessions; a section session with `start`; a session with `place`; one
    `uncertain: true`; a question-mark title that is **not** uncertain; a title
    with `:`, `&`, `'`, `…`, emoji; and the **moved session**: it lives in the
    `2026-10-23.yaml` file but keeps the id `2026-10-22-moved-across-days`
    (it was first added on the 22nd — a cross-day move, FR-014);
  - `sessions/2026-10-22-moved-across-days.md`: a **published** note
    (`doc_status: active`) for the moved session, valid DocKitty frontmatter.
  Every text value double-quoted; no comments.
- **Files**: `scripts/fixtures/schedule/valid/**`.

### Subtask T006 – Must-fail patches and tests

- **Purpose**: NFR-007: each class proven by a single text change.
- **Steps**:
  1. `scripts/fixtures/schedule/patches.mjs` exports an array of
     `{ name, file, find, replace, expect: { class, line } }`. `find` must occur
     exactly once in the target file. At least one patch per class a–k, e.g.:
     (a) truncate a file mid-mapping; (b) `sessions:` emptied; (c) a trailing
     `# note` comment, an unquoted title, `uncertain: "yes"`, unquoted `13:30`;
     (d) `title: ""`; (e) duplicate an id; (f) `id: "Bad Id"`; (g) unknown room
     key, slot pointing at the lunch slot; (h) both `room` and `place`; (i) an
     extra field `convener: "x"`; (j) set the fixture note's `doc_status: draft`;
     (k) set the note's description to the template placeholder (pass the
     placeholder string in the test).
  2. `tests/schedule/model.test.mjs` (node:test): copy the valid fixture to a temp
     dir (`fs.mkdtempSync` under `os.tmpdir()`), apply one patch, run
     `validateSchedule` (+ `checkNotes` for j/k), assert exactly one finding with
     the expected class and line. Assert the unpatched fixture yields zero
     findings (positive control). Assert `loadSchedule` throws on (a) and (b) and
     returns a model with the expected counts on valid data. Identity unit tests
     from T003. A test that `(doc_status absent)` counts as draft.
- **Files**: `scripts/fixtures/schedule/patches.mjs`, `tests/schedule/model.test.mjs`.

## Test Strategy

- `node --test "tests/schedule/model.test.mjs"`
- Mutation sanity (record in history, do not commit): temporarily disable the
  comment rule and confirm the (c) comment patch test fails.

## Risks & Mitigations

- Object-built fixtures lose quoting → patches are text replacements.
- Overlapping classes → strict evaluation order, one finding per fault.
- Location drift → compute lines from the YAML node ranges, not string search.

## Review Guidance

- Every class has a patch and a passing exact-one-finding test; the valid fixture
  yields zero findings; cross-day move and a published note are in the valid fixture.
- No toolkit imports; no `Date.now()`; no names in fixtures.

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

- Record a note: `spec-kitty agent tasks add-history WP01 --note "<what you did>" --mission living-schedule-01M5N5QA`
- Mark subtasks: `spec-kitty agent tasks mark-status <Txxx…> --status done --mission living-schedule-01M5N5QA`
- Change status: `spec-kitty agent tasks move-task WP01 --to <status> --mission living-schedule-01M5N5QA`
