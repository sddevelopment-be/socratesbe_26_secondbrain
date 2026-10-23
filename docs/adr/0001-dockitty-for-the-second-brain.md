---
title: "ADR-0001: Build the second brain with DocKitty"
description: Why the SoCraTes BE 2026 second brain is a DocKitty docsite in a public repository rather than a wiki, a shared drive or a Miro board.
doc_status: active
type: ADR
kind: ADR
updated: 2026-10-23T00:00:00Z
authors:
  - human:stijn
  - agent:claude
external_references:
  - type: tool
    id: dockitty
  - type: biblio
    id: common-docs
---

# ADR-0001: Build the second brain with DocKitty

## Status

Accepted

## Context

Knowledge from an unconference is scattered across whiteboard photos, Slack
threads and the Miro board. We want one place to collect it that:

- anyone who attended can contribute to, without an account on yet another
  tool;
- outlives the event and the free tier of any SaaS product;
- works for people reading in a browser **and** for agents reading on their
  behalf;
- shows the community's own look, not a generic theme.

## Decision

Keep the content as Markdown in a public Git repository, following the
Common Docs convention (`docs/`, README as the section index, frontmatter on
every page). Render it with **DocKitty** (`@spec-kitty/doc-toolkit`, Astro +
Starlight), with a custom SoCraTes BE theme in `src/theme/`.

DocKitty generates `llms.txt`, a JSON agent API, RSS and a sitemap from the
same frontmatter that drives the navigation. Spec Kitty provides the project
charter and agent instructions.

The toolkit is installed from its public GitHub repository at a pinned
commit, so contributors need no GitHub Packages token.

## Consequences

- Contributing means a pull request. This is low ceremony for this audience
  but excludes people without a GitHub account. Organisers can relay notes
  for them.
- Frontmatter is required and validated. This adds a little friction but is
  what makes the agent surfaces trustworthy.
- The theme refines DocKitty's `--dk-*` tokens only, so toolkit upgrades
  stay cheap.
