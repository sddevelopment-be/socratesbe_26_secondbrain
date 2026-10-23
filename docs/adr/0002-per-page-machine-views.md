---
title: "ADR-0002: Serve every page as JSON, YAML and Markdown at its own address"
description: Why each page has machine views at /<slug>.json, .yaml and .md, derived from the toolkit's agent record, and what that commits the site to.
doc_status: draft
type: ADR
kind: ADR
updated: 2026-10-23T00:00:00Z
authors:
  - human:stijn
  - agent:claude
related:
  - adr/0001-dockitty-for-the-second-brain
  - guides/working-with-agents
---

# ADR-0002: Serve every page as JSON, YAML and Markdown at its own address

## Status

Proposed

## Context

DocKitty already gives agents `llms.txt`, an index at `api/index.json` and
one record per page at `api/pages/<slug>.json`. An agent that is reading a
page has to know that layout to find the page's record, because the page
itself does not link to it.

The charter asks for one source and two audiences, with no agent-only copies
of the content.

## Decision

Serve three machine views of every docs page next to its HTML:

- `/<slug>.json`: the toolkit's agent record, with `_links` (`self`, `up`,
  `html`, `related` and `alternate`);
- `/<slug>.yaml`: the same record as YAML;
- `/<slug>.md`: the page's Markdown, with its metadata as frontmatter and its
  links made absolute.

The slug is the toolkit's (`pageSourceId`): the page's route without slashes,
and `home` for the root. `api/pages/<slug>.json` stays the canonical record.
The views are built from it through the toolkit's public `agentPageRoute`
(`src/lib/page-views.ts`), and only re-point `self` and add `alternate`
links. They are generated, never written by hand.

Every page advertises its views with `<link rel="alternate">` in its head
and in a "This page as" row in the footer.

## Consequences

- The three address patterns are a public contract. Renaming a page moves
  its views, as it moves its HTML.
- The views share the site root's namespace with the toolkit's own output
  (`api/`, `okf/`). A docs page whose slug starts with either would collide
  with a generated file, and the `okf/` export would overwrite it without a
  warning. These prefixes are therefore reserved: the build stops with an
  error naming the page (`RESERVED_PREFIXES` in `src/lib/page-views.ts`).
  Do not add a docs folder called `api` or `okf`.
- The `.md` view and the `okf/` bundle both give a page as Markdown, with
  different frontmatter. The agents guide says which to use for what.
- Per-page views are a convention feature rather than something specific to
  this site. If DocKitty offers them, these routes should give way to the
  toolkit's.
