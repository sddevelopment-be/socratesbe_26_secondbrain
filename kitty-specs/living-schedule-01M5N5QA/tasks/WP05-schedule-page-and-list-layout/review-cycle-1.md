---
affected_files: []
cycle_number: 1
mission_slug: living-schedule-01M5N5QA
reproduction_command:
reviewed_at: '2026-10-24T09:57:00Z'
reviewer_agent: claude
wp_id: WP05
---

# WP05 review feedback (cycle 1): changes requested

Everything else checks out (see "Verified" below). There is one blocking defect, and it is small.

## Blocking

### B1. The fallback next to "Start the notes" does not point to the guide (FR-013a, contract guarantee 4)

FR-013a says: "a plain fallback next to every 'Start the notes' link that points to
the template **and the guide**". `contracts/start-notes-url.md`, Guarantees (tested)
item 4, says the same: "Next to the link, a plain fallback points to the template
on GitHub and to the 'Add a session note' guide."

`src/theme/ScheduleCard.astro` renders only `s.fallback.templateUrl`
("or copy the template"). The view model already computes `s.fallback.guideHref`
(`/socratesbe_26_secondbrain/guides/add-a-session-note/`), but nothing renders it.
The guide link appears nowhere on `dist/sessions/schedule/index.html`. The page
`docs/guides/add-a-session-note.md` already exists, so the link resolves today.

Fix: in the `none` branch of the card, render a second plain link to
`s.fallback.guideHref` next to the template link, for example
"or copy the template · read the guide". Give it a visually hidden "for {title}"
like the other links, and the same `min-height: 2.75rem` treatment as
`.sched-fallback` so it meets NFR-001a. Keep it as one fallback group per card.
Do not add JavaScript.

Verify: after `pnpm build`, every card with `sched-note--start` has both a link to
the template blob URL and a link to `/socratesbe_26_secondbrain/guides/add-a-session-note/`
(49 of each on the current data). `pnpm links` stays green, and a 375px screenshot
still shows no horizontal scroll (check that the actions row wraps cleanly).

## Non-blocking (take them or leave them)

- `ScheduleLayout.astro` filters slots by `jumpTypes`. That is a small piece of
  data logic in a `.astro` file. A `jump: boolean` per slot, or a `jumpSlots` list
  per day in `view.mjs`, would keep "no data logic in .astro" strict, and WP06/WP07
  could reuse it.
- `ScheduleList.astro` uses `any` for `slot`, `s` and `section`, although
  `view.mjs` exports JSDoc typedefs. Optional tidy-up.

## Verified (no action needed)

- `node --test "tests/schedule/*.test.mjs"`: 45/45 pass. `pnpm check`: theme guard
  scans chrome.css and schedule.css, self-test 27/9, astro check 0 errors.
  `pnpm validate`: green, with only the expected `kind: Schedule` warning.
  `pnpm build`, `pnpm links` and `pnpm lint:md`: green.
- dist: 49 `data-session-id` cards, all unique, each with `id="session-<id>"`.
  `data-note-state` on every card. No `<script>`, `on*=`, `<template>` or custom
  element inside `[data-schedule]`. All 10 jump links resolve. The snapshot
  statement reads "21:47 … authoritative". The section headings, including
  "Other / not yet scheduled", appear, and the outside session shows "from 17:30".
  Exactly the two uncertain sessions are flagged, and "Did I lock the door?" is not.
  The Slack line appears once in the schedule area. The intro comes before the
  schedule. Room facts are in words, with size only for rooms without equipment.
- With an empty `SCHEDULE_DATA_DIR`, the build fails with "[a] rooms.yaml is
  missing". With a temporary published note, the card shows "Read the notes",
  `data-note-state=published`, `data-note-id` and the correct href. A draft note
  is not linked, whether drafts are built or not.
- Contrast is AA in both schemes: "Read the notes" measures 4.53 (light) and
  8.47 (dark). There is no horizontal scroll at 375px.
