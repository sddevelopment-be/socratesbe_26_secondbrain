---
title: Getting started with Spec Kitty
description: A 15-minute lightning session on spec-driven development with AI agents, from installing Spec Kitty in a new repository to merging a first mission.
doc_status: draft
type: Context
kind: Reference
updated: 2026-10-24T00:00:00Z
tags: [spec-kitty, spec-driven-development, agents, charter, lightning-talk]
authors:
  - human:stijn
  - agent:claude
related:
  - presentations/spec-kitty-in-15-minutes
  - sessions/second-brain-for-humans-and-agents
  - guides/working-with-agents
audience:
  - profile: participant
    guidance_text: >-
      Developers who use AI coding agents, and experienced crafters who are
      new to them. They came for the steps to start tomorrow and for the full
      mission lifecycle.
external_references:
  - type: tool
    id: spec-kitty
  - url: https://spec-kitty.ai/getting-started.md
    title: Spec Kitty, Getting started
    note: the shortest route from nothing to a first mission; prerequisites, install, init and what to pick first
  - url: https://docs.spec-kitty.ai/
    title: Spec Kitty documentation
    note: the tutorials (getting started, your first mission) and the slash-command reference, for when the talk's summary is not enough
  - url: https://docs.spec-kitty.ai/context/charter-overview.html
    title: Spec Kitty, Charter overview
    note: explains where the charter lives and how its rules reach the agent's prompt at each step
  - url: https://docs.spec-kitty.ai/api/supported-agents.html
    title: Spec Kitty, Supported agents
    note: check that your coding agent is supported, and find its --ai key for init
  - url: https://github.com/spec-kitty/spec-kitty
    title: spec-kitty on GitHub
    note: the MIT-licensed source, README quickstart and issue tracker
  - url: https://github.com/spec-kitty/spec-kitty-charter
    title: spec-kitty-charter
    note: the charter overhaul design; read it to see where governance is heading, but it is an early build, not shipped
---

# Getting started with Spec Kitty

> **Recap wanted.** The overview below was written before the session. The
> recap headings are empty on purpose. Fill them in with what actually
> happened.

## Session overview

A 15-minute lightning talk with slides:
[Spec Kitty in 15 minutes](../presentations/spec-kitty-in-15-minutes.md).

Spec Kitty is an open-source command-line tool for spec-driven development
with AI coding agents. It keeps the spec, the plan, the work packages and the
review state as files in the repository, next to the code. Agents implement;
people decide what to build and make the final call.

The talk covers:

1. **Why specs before code.** Lost intent, no boundaries between agents, and
   agents grading their own work.
2. **Start tomorrow.** Install, `spec-kitty init`, the first Git commit, and a
   short charter interview that gives the repository its rules.
3. **The mission lifecycle.** specify → plan → tasks → implement → review →
   accept → consolidate, and the file each step leaves behind.
4. **Your turn.** Pick one real backlog item and specify it.

### The commands, in one place

```sh
pipx install spec-kitty-cli
spec-kitty init . --ai claude
git add -A && git commit -m "init" && git checkout -b first-mission
spec-kitty verify-setup
```

Then, in the agent: `/spec-kitty.charter`, `/spec-kitty.specify`,
`/spec-kitty.plan`, `/spec-kitty.tasks`, implement and review each work
package, `/spec-kitty.accept`, `/spec-kitty.consolidate`.

## Recap

### What people wanted to learn

<!-- The questions and expectations the room brought. One bullet each. -->

### What people learned

<!-- The takeaways, in the room's own words. No names. -->

### Open questions

<!-- What is still unresolved? Move bigger ones to docs/ideas/. -->

## References

The links, and why each one matters, are listed under this page's references.
