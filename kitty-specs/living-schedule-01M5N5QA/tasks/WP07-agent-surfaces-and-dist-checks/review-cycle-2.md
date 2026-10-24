---
affected_files: []
cycle_number: 2
mission_slug: living-schedule-01M5N5QA
reproduction_command:
reviewed_at: '2026-10-24T12:12:04Z'
reviewer_agent: claude
wp_id: WP07
---

# WP07 re-review (post-approval fixes 964c6d4, ca56143): changes requested

## Blocking: FR-008 table marker has no invitation to correct

FR-008 says an uncertain session is "shown with an invitation to correct it". ca56143 adds
`<span class="sched-table-uncertain">partly unreadable</span>` to table cells
(`src/theme/ScheduleTable.astro:44`), but the cell has no correction link. At widths of 64rem and up
`.sched-list` is `display: none` (`src/theme/schedule-table.css`, the `@media (min-width: 64rem)` block), so a
timed uncertain session on desktop shows the marker and no way to correct it. The card version
(`ScheduleCard.astro:24-28`) does it correctly: "Partly unreadable on the board — correct it" linking `day.dataFileUrl`.

How I checked: a scratch copy of the data with `uncertain: true` on
`2026-10-23-the-psychology-of-software-teams` (slot 1050), built to a temp outDir, at 1280x900. The marker
renders, but `li` contains no `a[href$=".yaml"]`. Today's real data does not hit this case, because both
uncertain sessions are sectioned. Any later board with a timed uncertain sticky will hit it.

Fix (small): pass `day.dataFileUrl` into `ScheduleTable` (or put it on the slot or day view) and render the
marker as `partly unreadable — <a href={dataFileUrl}>correct it</a>`, keeping the `.sched-table-uncertain`
styling. The link is inline in a sentence, so the WCAG 2.5.8 inline exception applies, as it does for the card's
"correct it". Optional: have `check-schedule-dist` assert that every `[data-note-state]` item with an uncertain
marker also has a correction link, and add a self-test case for it.

## Verified OK (no action)
- `pnpm check` (0 errors), `pnpm test` (57/57), `pnpm build`, `pnpm check:dist`, and the fixture build plus
  `check-schedule-dist dist-fixture --fixture` all pass.
- FR-013a: all 70 table Start links have template and guide fallbacks. Removing one table template link in a
  scratch copy of dist makes the checker fail with `[fallback-missing]` (exit 1), so the check is not vacuous.
  The new self-test case is present.
- SC-002: the first jump row bottom is 594px at 375x667 (with and without JS). Jump links are 36px tall.
- scrollWidth == clientWidth at 375, 1024 and 1280. Table fallback links are at least 34x31px.
- The new CSS uses tokens only. Warning marker contrast on the table cell surface: 6.36:1 light, 6.82:1 dark.
