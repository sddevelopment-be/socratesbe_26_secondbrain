---
title: "ADR-0003: Keep the schedule as structured data"
description: Why the unconference schedule is per-day YAML rendered on a docs page and mirrored in a JSON file, not a hand-kept Markdown list.
doc_status: active
type: ADR
kind: ADR
updated: 2026-10-23T00:00:00Z
authors:
  - human:stijn
  - agent:claude
related:
  - adr/0001-dockitty-for-the-second-brain
---

# ADR-0003: Keep the schedule as structured data

## Status

Accepted

## Context

The marketplace schedule changes during the event: sessions move, are renamed
and gain notes. Participants read it on their phones between sessions, and
agents read it to find which notes exist. A hand-kept Markdown list drifts
from the board and cannot be checked.

The charter asks for one source and two audiences.

## Decision

Keep each day's board as YAML in `docs/_meta/schedule/`, one file per day.
One shared validator (`src/lib/schedule/`) checks it in `pnpm check:schedule`,
in the build and in the post-build check.

A docs page of its own `kind` (`docs/sessions/schedule.md`) renders the board
as a layout built for phones. The build also writes `api/schedule.json` for
agents, and splices the schedule into the page's text views.

Each session links to its note by a stable `id`, and the schedule offers a
prefilled "Start the notes" link.

## Consequences

- The schedule is data, not prose. The departure from principle 1 (one source,
  two audiences) is only that the source is YAML data rather than Markdown: one
  source still feeds both audiences, as the page, the JSON and the text views
  render the same data. Parity checks after the build fail when they disagree.
- The `kind` is custom, so the toolkit warns about it. We accept the warning.
- The splice into the text views is local to this site. It should give way to
  an upstream generic include if DocKitty offers one.
- A session `id` is a public address. It never changes, except to remove a
  participant name, and then its note file is renamed in the same pull request.
- The board sections (lunch tables, outside, evening, other) render as one
  block per day below the table or list, at every width, because they do not
  fit the rooms-by-slots grid. Each session in them has the same actions as a
  timed one. The wide-screen table carries the Start the notes and fallback
  links in each cell, so no reader needs the phone layout to act.
- The sessions and ideas sections no longer declare `feeds: [rss]`. An absent
  `feeds` means every surface, so the schedule page and the hubs now reach
  `llms.txt`, `api/index.json` and the sitemap. The feed still carries the
  session notes.

## Seams to remove later

- The theme layout cast in `src/theme/index.ts`.
- `isPublished` in `src/lib/schedule/source.ts`.
- The copied draft predicate (a local copy of the toolkit's `isDraftStatus`).
- The slug-matched text-view splice in `page-views.ts`. The operator reports
  that the toolkit's OKF and agent export gap is fixed on doc-kitty mainline
  and is not yet released. Once that release is pinned, the splice can go.
