---
affected_files: []
cycle_number: 1
mission_slug: living-schedule-01M5N5QA
reproduction_command:
reviewed_at: '2026-10-24T10:13:23Z'
reviewer_agent: claude
wp_id: WP06
---

# WP06 review: changes requested

The orchestrator recorded an implementation decision during WP06. It is at the end of
`kitty-specs/living-schedule-01M5N5QA/research.md` on `feat/living-schedule`, under
"Implementation decision (2026-10-24, during WP06)". It supersedes plan.md "Prefill
weight" and the T028 instruction to link table titles to `#session-<id>`. Implement it
as written. Items 1 and 2 below block approval.

## The decision

- **Sections sit outside the layout swap.** The board's sections (Lunch tables, Outside,
  Evening, Other / not yet scheduled) render in ONE shared block per day. The block comes
  after the phone list and the wide table, carries `data-layout="sections"`, and is
  visible at every width. The phone list (`data-layout="list"`) and the table
  (`data-layout="table"`) each contain every **timed** session exactly once. Each section
  session appears once, in the shared block only.
- **Table cells carry their own note action.** Each table cell shows the title and a
  compact "Read the notes" link (published note: the note page) or "Start the notes" link
  (prefill URL, with the same fallback rules as the card). Do not link titles to anchors
  in the hidden list.
- WP07's checks follow from this: list ∪ sections and table ∪ sections each equal the
  data set, and each layout holds each of its sessions once.

## Blocking findings

1. **Sections disappear on wide screens (FR-007 defect).** `ScheduleList.astro` renders
   `day.sections` inside `.sched-list`, and `schedule-table.css` sets that to
   `display: none` from 64rem. In Playwright at 1280px, all 4 `[data-section]` blocks
   had no client rects; at 375px they were visible. Fix: move the sections loop out of
   `ScheduleList` into its own block (for example a small `ScheduleSections.astro`, or
   directly in `ScheduleLayout.astro` after `<ScheduleTable>` and `<ScheduleList>`). Put
   `data-layout="sections"` on the block and keep it outside the swap rules. Keep the
   `section-<date>-<key>` heading ids.
2. **Table links go nowhere on wide screens.** Table titles link to `#session-<id>`. That
   target is inside the list, which is hidden whenever the table is visible. At 1280px,
   every sampled target had no client rects. Fix: render a compact note action in each
   table `<li>`: "Read the notes" linking to the note page, or "Start the notes" with the
   prefill URL, using the same link logic and fallback rules as `ScheduleCard`. Reuse
   `src/lib/schedule/links.mjs` and the view model; do not duplicate the rules. The title
   can be plain text. Drop the "(notes)" suffix, because the action replaces it.
   `data-session-id`, `data-note-state` and `data-note-id` stay on the `<li>`.
3. **`pnpm check` runs out of memory once `dist-fixture/` exists.** `tsconfig.json`
   excludes only `dist`, so `astro check` type-checks the bundled JS in `dist-fixture/`
   and aborts with "JavaScript heap out of memory" (exit 134). With `dist-fixture/`
   moved away: 0 errors, 0 warnings. Fix: add `"dist-fixture"` to `exclude` in
   `tsconfig.json`, and record it as an out-of-map edit with `add-history`.

## Also fix (same dead-click class)

4. **The jump bar's links do nothing on wide screens.** The links in `.sched-jump` point
   to `#slot-<date>-<key>`, and those headings are inside the hidden list. At 1280px, all
   sampled targets had no client rects. Choose one fix:
   - give the table's row `<th>` its own anchor and point the jump links at an id that
     exists in the visible layout (ids must stay unique), or
   - move the jump bar inside the list layout so it hides together with the list.

   Either is acceptable. State which one you chose in the history note.

## Minor

- Corner cell: an empty `<td>` or an empty `<th>` (no scope) is acceptable. The current
  `<td>` can stay.
- `DaySwitcher` depends on the view model's newest-first sort. That is acceptable because
  the model owns the order. Keep the comment that says so.

## Verified and correct (do not change)

- `pnpm build`: the real build has no switcher. The table has `caption id="cap-2026-10-23"`
  with `aria-labelledby` matching it, 8 `th scope="col"` in board order, 10
  `th scope="row"`, `colspan="8"` rows for Lunch, Closing and Dinner,
  `data-pagefind-ignore`, `role="region"` and `tabindex="0"`. The table holds 35 timed
  sessions, the same number as the list's timed slots.
- 375px: no page-level horizontal scroll (scrollWidth 375 = clientWidth 375).
- `node scripts/build-schedule-fixture.mjs`: the switcher shows 2 days, newest first,
  with `aria-current="page"` and "(shown first)" on 24 October. The published sentinel
  links `/socratesbe_26_secondbrain/sessions/2026-10-24-fixture-sentinel-published/`, and
  that page exists in `dist-fixture`. The draft and missing sentinels show "Start the
  notes". Afterwards `git status` is clean, `docs/sessions` is untouched, and `dist/`
  contains no FIXTURE-SENTINEL. Staging the data in an `os.tmpdir()` directory without
  `notes/` is fine.
- `.gitignore` has `dist-fixture/` and a slashless `node_modules`. The theme guard scans
  `schedule-table.css` and passes. The CSS uses tokens only. No names, no new
  dependencies.

After the fix, re-check at 1280px: sections, table note links and jump links all resolve
to visible elements. Also confirm that list ∪ sections = table ∪ sections = 49 sessions
for the real data.
