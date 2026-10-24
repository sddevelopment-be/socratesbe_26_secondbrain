---
work_package_id: WP04
title: Session note template, note links and prefill
dependencies:
- WP01
requirement_refs:
- FR-013
- FR-013a
- FR-013b
- FR-015
- NFR-004
- C-005
- SC-003
planning_base_branch: feat/living-schedule
merge_target_branch: feat/living-schedule
branch_strategy: Planning artifacts for this mission were generated on feat/living-schedule. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into feat/living-schedule unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-living-schedule-01M5N5QA
base_commit: b73ca70ac6e67ae3a96b57fd3f377f62d1230466
created_at: '2026-10-23T22:47:54.963522+00:00'
subtasks:
- T016
- T017
- T018
- T019
- T020
phase: Phase 2 - Notes
history:
- at: '2026-10-23T22:30:00Z'
  actor: system
  action: Prompt generated via /spec-kitty.tasks
agent_profile: node-norris
authoritative_surface: src/lib/schedule/links.mjs
create_intent:
- docs/_meta/templates/session-note.md
- src/lib/schedule/links.mjs
- site.config.mjs
- tests/schedule/links.test.mjs
- docs/development/schedule-prefill-evidence.md
execution_mode: code_change
model: ''
owned_files:
- docs/_meta/templates/session-note.md
- src/lib/schedule/links.mjs
- site.config.mjs
- astro.config.mjs
- tests/schedule/links.test.mjs
- docs/development/schedule-prefill-evidence.md
role: implementer
tags: []
task_type: implement
tracker_refs: []
---
# Work Package Prompt: WP04 – Session note template, note links and prefill

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

One template file; a pure `links.mjs` that decides note state from a set of
published ids and builds the "Start the notes" URL per
`contracts/start-notes-url.md`; shared site constants. Done when:

- `node --test "tests/schedule/links.test.mjs"` passes, including a test that
  writes the decoded prefill body into a temp DocKitty tree and runs
  `dockitty-validate-frontmatter` on it successfully;
- `pnpm validate` passes with the template present;
- `pnpm build` still works after `astro.config.mjs` imports `site.config.mjs`.

Requirements: FR-013, FR-013a, FR-013b, FR-015, NFR-004, C-005.

## Subtasks & Detailed Guidance

### Subtask T016 – `site.config.mjs`

- Export `OWNER = 'sddevelopment-be'`, `REPO = 'socratesbe_26_secondbrain'`,
  `SITE = \`https://${OWNER}.github.io\``, `BASE = \`/${REPO}\``, `BRANCH = 'main'`.
- Change `astro.config.mjs` to import these instead of declaring them (keep
  behaviour identical; `pnpm build` output paths unchanged).

### Subtask T017 – Template `docs/_meta/templates/session-note.md`

- Frontmatter (valid DocKitty; `_meta` is validated but not published):
  `title: "SESSION TITLE"`, `description: "One sentence: what the session was about and what the room took away."`,
  `doc_status: active`, `type: Context`, `kind: Reference`,
  `updated: 2026-10-23T00:00:00Z`, `tags: []`, and a commented-out optional
  `# authors:` / `#   - human:your-github-handle` block with a comment that only
  your own handle may go there.
- Body: first an HTML comment: "No names. Write 'the convener' or 'a participant'.
  Your own handle in authors is the only exception." Then headings, each with a
  one-line HTML-comment hint: `## TL;DR` (at most three bullets), `## What we discussed`,
  `## Learnings`, `## Open questions and follow-ups` (bigger ones go to
  `docs/ideas/`), `## References` (slides, repositories, books, katas),
  `## Write-ups` (posts written later; append here). Close with a comment
  "Delete headings you did not use." No convener heading.
- Keep it short (prefill URL size). Run `pnpm validate` and `pnpm lint:md`.

### Subtask T018 – `src/lib/schedule/links.mjs`

- `noteState(id, publishedIds)` → `'published' | 'none'`.
- `notePath(base, id)` → `${base}/sessions/${id}/`.
- `startNotesUrl({ owner, repo, branch, id, title, day, template })`:
  exactly two substitutions in the template: the `title:` line becomes
  `title: "<escaped title>"` (escape `\` and `"`), and the `updated:` line becomes
  `updated: <day>T00:00:00Z`. URL:
  `https://github.com/${owner}/${repo}/new/${branch}?filename=docs/sessions/${id}.md&value=${encodeURIComponent(body)}`.
  If the result exceeds 4,000 characters, return the URL without `value` and
  `{ truncated: true }` so the check can report it (NFR-004).
- `templateUrl(owner, repo, branch)` → blob URL of the template; `guideHref(base)`
  → `${base}/guides/add-a-session-note/` (FR-013a fallback).
- Pure: no file reads; the caller passes the template text.

### Subtask T019 – Tests `tests/schedule/links.test.mjs`

- Decoded `filename` equals `docs/sessions/<id>.md`.
- Decoded body passes the real validator: write it to
  `<tmp>/docs/sessions/<id>.md`, copy `docs/_meta/sections.yaml` to
  `<tmp>/docs/_meta/sections.yaml`, run
  `node_modules/.bin/dockitty-validate-frontmatter <tmp>/docs` and assert exit 0 —
  for titles `"#legacy: TDD & why? \"quoted\" 🎉"`, a plain title and an
  accented title. Positive control: an unescaped body with `title: #legacy` must
  fail the validator.
- A synthetic 3,000-character title produces the filename-only fallback.
- Note state: published, missing.

### Subtask T020 – Prefill evidence page (FR-013b)

- Create `docs/development/schedule-prefill-evidence.md` (valid frontmatter,
  `type: Operations`, `kind: Reference`, `doc_status: active`) with a table of
  the three runs (desktop with write access; account without write access via the
  fork flow; phone browser): columns run, date, prefill survived (yes/no),
  notes. Fill in what can be checked by an agent (e.g. the URL shape opens the
  GitHub editor when signed in — mark "pending operator" for anything you
  cannot observe). Link it from nowhere else yet. No names.

## Risks & Mitigations

- GitHub prefill is undocumented → fallback link, evidence page.
- Template drift from the guide → the guide (WP07) links the template instead of
  copying it.

## Review Guidance

- Two substitutions only; body validated by the real CLI; fallback tested.

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

- Record a note: `spec-kitty agent tasks add-history WP04 --note "<what you did>" --mission living-schedule-01M5N5QA`
- Mark subtasks: `spec-kitty agent tasks mark-status <Txxx…> --status done --mission living-schedule-01M5N5QA`
- Change status: `spec-kitty agent tasks move-task WP04 --to <status> --mission living-schedule-01M5N5QA`
