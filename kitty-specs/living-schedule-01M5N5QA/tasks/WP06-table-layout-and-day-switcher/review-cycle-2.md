---
affected_files: []
cycle_number: 2
mission_slug: living-schedule-01M5N5QA
reproduction_command:
reviewed_at: '2026-10-24T10:20:17Z'
reviewer_agent: claude
wp_id: WP06
---

# WP06 review, cycle 2: changes requested (one item, one-line CSS fix)

All four cycle-1 items are fixed (evidence below). One new blocking item: the cycle-2 table
note actions cause a page-level horizontal scrollbar on wide screens. Fix only this item.
Do not change anything else.

## Blocking

1. **The page scrolls sideways at 64rem and wider. The cause is the new table note actions.**
   - Measured with Playwright on `pnpm build` + `astro preview`:
     - 1280px: `document.documentElement.scrollWidth` 1391, `clientWidth` 1280.
     - 1024px: scrollWidth 1383, clientWidth 1024.
     - 375px: 375 = 375 (fine).
   - Control page `/guides/run-locally/` in the same build: 1280 = 1280 and 1024 = 1024.
     The site chrome does not cause it.
   - The overflowing elements are the `<span class="sr-only">` inside the table's
     `a.sched-table-action` links. `.sr-only` is `position: absolute`. No ancestor inside
     the table is positioned, so `offsetParent` is `BODY`. An absolutely positioned
     element whose containing block is outside a scroll container is not clipped by that
     container. So these spans escape `.sched-table-wrap { overflow-x: auto }` and widen
     the document. In the real data, the cells in the right-hand columns put
     `right` = 1391.
   - **Fix:** in `src/theme/schedule-table.css`, add `position: relative;` to the
     `[data-schedule] .sched-table-wrap` rule. The wrapper then becomes the containing
     block, and its own overflow clips the spans.
   - I injected exactly that rule at 1280px and checked: scrollWidth fell to 1280, and
     the spans' offsetParent became `DIV.sched-table-wrap`. The sticky row headers are
     not affected.
   - Do not remove the sr-only text. It gives the repeated "Start the notes" links
     their accessible names.
   - Verify: at 1024px and 1280px, `scrollWidth === clientWidth` on
     `/sessions/schedule/`. The table wrapper itself must still scroll horizontally.

## Verified fixed (do not change)

- **Sections:** `ScheduleSections.astro` renders one `data-layout="sections"` block per
  day, after the table and the list. 0 `[data-section]` inside the list. All 4 sections
  are visible at 375, 1024 and 1280px. The `section-<date>-<key>` ids are kept.
- **Counts (real data):** list 35, table 35, sections 14. list ∪ sections = 49 and
  table ∪ sections = 49. No duplicates within a layout. No section session appears in
  the list or the table.
- **Table note actions:** every table `<li>` has exactly one link and 0 `#` anchors.
  Real data: all "Start the notes" links, pointing to the repository's GitHub new-file
  URL. In the fixture, the published sentinel shows "Read the notes", which links to
  `/socratesbe_26_secondbrain/sessions/2026-10-24-fixture-sentinel-published/`. The
  draft and missing sentinels show "Start the notes". `data-session-id`,
  `data-note-state` and `data-note-id` are kept.
- **Jump bar:** it now sits inside the list layout. At 1024 and 1280px it is hidden
  together with the list. At 375px it is visible and all 10 targets resolve to visible
  headings. The history note records the choice.
- **tsconfig:** `exclude` has `dist-fixture`. `pnpm check` exits 0 with `dist-fixture/`
  present: 0 errors, 0 warnings, and the theme guard passes. The out-of-map edit is
  recorded in history.
- **Fixture build:** `node scripts/build-schedule-fixture.mjs` exits 0. Afterwards
  `git status` is clean and `dist/` has no FIXTURE-SENTINEL.
- No new dependencies. No names. The CSS uses tokens only.
