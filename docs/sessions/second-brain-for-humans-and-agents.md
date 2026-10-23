---
title: A second brain for humans and agents
description: The session that kicked off this site. Can one docs-as-code repository serve readers in a browser and LLM agents equally well?
doc_status: active
type: Context
kind: Reference
updated: 2026-10-23T00:00:00Z
tags: [docs-as-code, agents, llms-txt, dockitty, spec-kitty]
authors:
  - human:stijn
  - agent:claude
related:
  - context/audience/agent
  - guides/working-with-agents
  - adr/0001-dockitty-for-the-second-brain
external_references:
  - type: tool
    id: dockitty
  - type: tool
    id: spec-kitty
  - type: biblio
    id: llms-txt-2024
---

# A second brain for humans and agents

> **Notes wanted.** This page is waiting for notes from the session itself. The
> headings below are a suggested shape. Replace them with what actually
> happened.

## The question

Most documentation is written for one kind of reader. Can a single Markdown
tree, with metadata in its frontmatter, give humans a pleasant site *and* give
agents a reliable map, without writing everything twice?

## What we tried

This repository is the experiment:

- a `docs/` tree following the Common Docs convention, rendered by
  DocKitty (Astro + Starlight) in the SoCraTes look;
- generated agent surfaces: `llms.txt`, a JSON agent API and RSS;
- a Spec Kitty charter and `AGENTS.md` that tell agents how to contribute.

## Key points

<!-- What did the group discuss, agree or disagree on? -->

## Open questions

<!-- What is still unresolved? Move bigger ones to docs/ideas/. -->

## Links

- [Working with agents](../guides/working-with-agents.md)
