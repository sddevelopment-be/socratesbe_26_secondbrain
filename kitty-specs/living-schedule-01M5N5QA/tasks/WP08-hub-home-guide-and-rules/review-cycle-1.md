---
affected_files: []
cycle_number: 1
mission_slug: living-schedule-01M5N5QA
reproduction_command:
reviewed_at: '2026-10-24T10:06:23Z'
reviewer_agent: claude
wp_id: WP08
---

# WP08 review feedback

All gates pass (validate, lint:md, links, check:schedule, test, build, spell).
`check:dist` fails only on `../../api/schedule.json`, which belongs to WP07. The hub, the
home hero, the ADR, AGENTS.md and the charter are fine. Two small fixes are needed, both in
`docs/guides/add-a-session-note.md`, section "Keep the schedule current".

## 1. The quoting rule is wrong and contradicts the validator (blocking)

The guide says: "quote every time, date and any value that could read as a boolean".
The validator (`src/lib/schedule/model.mjs`, `checkValue`) rejects **every** unquoted
value ("text value is not quoted"). The only exception is `uncertain`, which must be a
bare `true` or `false`. AGENTS.md already states the rule correctly ("quote every text
value"). A contributor who follows the guide and writes `room: ourthe` fails
`pnpm check:schedule`.

Fix: for example, "quote every value (`room: "ourthe"`, `start: "10:50"`); only
`uncertain` is a bare `true` or `false`". Keep it consistent with AGENTS.md.

## 2. Do not point a published page at mission artefacts (blocking)

"The full steps are in the mission quickstart in `kitty-specs/`." is an unlinked pointer to
an internal mission artefact. Missions can be archived or moved, so the pointer will go
stale. Readers of the published site also cannot find it. The quickstart repeats the wrong
quoting rule from item 1.

Fix: remove the sentence. The essential rules are already in the guide. If you want a
pointer, link a stable file instead, such as AGENTS.md on GitHub or the `pnpm check:schedule`
output. If you think steps for adding a session are needed, add a short one, for example
"add a session with a new `id`, a quoted `title`, a `room` or `place`, and a `slot` or
`section`".

## Non-blocking notes

- Home hero `./sessions/schedule/` (raw HTML, not rewritten): this is acceptable. It
  follows the existing `./sessions/` pattern and resolves under the base path in dist.
- The ADR README has no 0002 row: correct as it is. ADR-0002 is `doc_status: draft`, and
  a published page must not link a draft. Do not add the row.
