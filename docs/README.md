---
okf_version: "0.2"
title: SoCraTes BE 2026 — Second Brain
description: The shared second brain of SoCraTes Belgium 2026. Session notes, ideas and learnings from the unconference, written for humans and readable by agents.
doc_status: active
kind: Hub
updated: 2026-10-23T00:00:00Z
authors:
  - human:stijn
  - agent:claude
---

**[See today's schedule](./sessions/schedule.md)**

<div class="sb-hero">
  <h2>Learn, share, practice.<br />And write it down.</h2>
  <p>The shared memory of <strong>SoCraTes BE 2026</strong>: for software crafters, by software crafters, and readable by their agents too.</p>
  <a class="sb-cta" href="./sessions/">Browse sessions</a>
  <a class="sb-cta" href="./sessions/schedule/">Schedule</a>
  <a class="sb-cta sb-cta--ghost" href="./guides/">Add your notes</a>
</div>

An unconference has no fixed agenda and no recordings. What you learn lives
in your head, in a few photos of a whiteboard, and in a Slack thread that
scrolls away. This site keeps it. Anyone who was there can add session notes,
ideas and links, and every page is plain Markdown in a
[public repository](https://github.com/sddevelopment-be/socratesbe_26_secondbrain).

## Two audiences, one source

The same `docs/` tree feeds two kinds of reader:

- **Humans** get this site: navigation, search, light and dark themes, and the
  SoCraTes look.
- **Agents** get machine-readable surfaces built from the same pages:
  - [`/llms.txt`](./llms.txt), the entry point for language models;
  - [`/api/index.json`](./api/index.json), a JSON map of every page and its metadata;
  - every page in three more formats at its own address: add `.json`, `.yaml`
    or `.md` to it, for example [`/context.json`](./context.json). The footer
    of each page links to them;
  - [`/rss.xml`](./rss.xml), a feed of new and updated pages;
  - [`/sitemap-index.xml`](./sitemap-index.xml), for search engines.

Each page's frontmatter (type, status, tags, related pages) drives both the
site navigation and the agent API, so one write serves both audiences.

## Sections

- [The Unconference](./context/README.md): what SoCraTes BE is and how the
  2026 edition works.
- [Sessions](./sessions/README.md): notes from the marketplace sessions.
- [Ideas](./ideas/README.md): proposals and open questions that are not
  sessions yet.
- [Contribute](./guides/README.md): how to add a page, by hand or with an agent.
- [Decisions](./adr/README.md): why this site is built the way it is.
