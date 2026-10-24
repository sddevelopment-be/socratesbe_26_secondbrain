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

- The schedule is data, not prose. This is an exception to principle 1 (one
  source, two audiences): the page, the JSON and the text views are three
  renderings of the same data. Parity checks after the build fail when they
  disagree.
- The `kind` is custom, so the toolkit warns about it. We accept the warning.
- The splice into the text views is local to this site. It should give way to
  an upstream generic include if DocKitty offers one.
- A session `id` is a public address. It never changes, except to remove a
  participant name, and then its note file is renamed in the same pull request.
