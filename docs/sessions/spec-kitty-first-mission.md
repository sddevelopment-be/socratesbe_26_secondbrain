---
title: Your first Spec Kitty mission
description: A 15-minute lightning session on spec-driven development with AI agents, from an empty repository to a first consolidated Spec Kitty mission.
doc_status: active
type: Context
kind: Reference
updated: 2026-10-24T00:00:00Z
tags: [spec-kitty, spec-driven-development, agents, charter, lightning-talk]
authors:
  - human:stijn
  - agent:claude
related:
  - presentations/spec-kitty-first-mission
  - guides/working-with-agents
  - sessions/second-brain-for-humans-and-agents
audience:
  - profile: participant
    guidance_text: >-
      A 15-minute lightning talk for developers: some use AI coding agents
      every day, others are new to them or sceptical. Start with "Start
      tomorrow" for the commands, or "The lifecycle at a glance" for the
      steps.
  - profile: agent
    guidance_text: >-
      The commands were checked against spec-kitty-cli 4.0.0rc7, the public
      release candidate, on 2026-10-24. Each reference carries a note on why
      it matters; cite the reference URL, not this page, for Spec Kitty
      behaviour.
external_references:
  - type: tool
    id: spec-kitty
  - url: https://spec-kitty.ai/getting-started.md
    title: Spec Kitty, Getting started
    note: start here tomorrow; prerequisites, install, init and what to pick as a first mission, on one page
  - url: https://docs.spec-kitty.ai/guides/tutorials/your-first-mission.html
    title: Spec Kitty tutorial, Your first mission
    note: the full lifecycle with exact commands, for when the talk's summary is not enough; where it says merge, the 4.0 command is consolidate
  - url: https://docs.spec-kitty.ai/guides/how-to/governance/setup-governance.html
    title: Spec Kitty how-to, Set up governance
    note: how to write a minimal charter, including the synthesize step the runtime needs before a first mission
  - url: https://docs.spec-kitty.ai/context/charter-overview.html
    title: Spec Kitty, Charter overview
    note: explains how charter rules reach the agent's prompt, which is why a charter changes what the agent does
  - url: https://docs.spec-kitty.ai/api/supported-agents.html
    title: Spec Kitty, Supported agents
    note: check that your coding agent is supported and find the key to pass to init --ai
  - url: https://github.com/spec-kitty/spec-kitty
    title: spec-kitty on GitHub
    note: the MIT-licensed source and issue tracker; the place to report a command that does not match the docs
  - url: https://github.com/spec-kitty/spec-kitty-charter
    title: spec-kitty-charter
    note: where charter governance is heading (a separate service with charter packs); an early build, not what you install today
---

# Your first Spec Kitty mission

> **Recap wanted.** The overview was written before the session. The recap
> sections are empty on purpose: fill them in with what happened in the room.

## Session overview

A 15-minute lightning talk with slides:
[Your first Spec Kitty mission](../presentations/spec-kitty-first-mission.md).

Spec Kitty is an open-source command-line tool for spec-driven development
with AI coding agents. The spec, the plan, the work packages and the review
state are files in your repository, next to the code. Agents do the
implementation; people decide what to build and make the final call.

| Section | Time | Question it answers |
|---|---|---|
| Two questions before any code | 1.5 min | What do we build, and how? |
| What makes a good prompt | 2 min | What does an agent need from me? |
| How Spec Kitty helps | 3.5 min | What happens between idea and landed change? |
| The charter system | 3.5 min | How do the rules reach every agent, role and tool? |
| Three ways to work | 1 min | Mission, governed op, or ad hoc? |
| How to start | 3 min | What do I type tomorrow morning? |

## Start tomorrow

Prerequisites: Python 3.11 or newer, pipx, Git, and a supported coding agent.

```sh
pipx install "spec-kitty-cli==4.0.0rc7"   # add --force if you already have 3.x
```

For a new project:

```sh
spec-kitty init my-project --ai claude && cd my-project
git init -b main && git add -A && git commit -m "init"
```

Or, in an existing repository, commit only the Spec Kitty files:

```sh
spec-kitty init --ai claude
git add .kittify .gitignore .gitattributes && git commit -m "Add Spec Kitty"
```

Then, in either case:

```sh
git checkout -b first-mission
spec-kitty verify-setup

spec-kitty charter interview --profile minimal
spec-kitty charter generate --from-interview
spec-kitty charter synthesize             # then commit the files it lists
spec-kitty charter status
```

The exact pin matters: a plain `pipx install spec-kitty-cli` gives the stable
3.2 line, where `consolidate` is still called `merge`. `init` never creates a
Git repository or a commit; specify needs both. Then, in your agent, run
`/spec-kitty.specify` with one real backlog item. These steps were checked on
4.0.0rc7 on 24 October 2026.

## The lifecycle at a glance

| Step | Command | Who decides | You get |
|---|---|---|---|
| specify | `/spec-kitty.specify` | you answer the interview | `spec.md`, requirements checklist |
| plan | `/spec-kitty.plan` | you confirm the plan | `plan.md`, plus research, data model, contracts where needed |
| tasks | `/spec-kitty.tasks` | agent | `tasks.md`, one `tasks/WP…` file per work package |
| implement | `spec-kitty next --agent <agent> --mission <mission>` | agent | changes in a worktree per lane |
| review | `/spec-kitty.review` | a reviewer who is not the author | approved, or sent back with feedback |
| accept | `spec-kitty accept` | you | a readiness check |
| consolidate | `spec-kitty consolidate` | you run it, after accepting | the work on your local branch, worktrees cleaned up; the pull request is still yours to open |

Three ways to work, lightest first: ad hoc with your agent, where the
charter guidance is already in its instructions and `spec-kitty charter
context --action <step>` shows the rules for a step; a governed op with
`spec-kitty dispatch "<request>"` for a one-sitting task, run under the
right profile with a record; or a full mission when the work needs a spec.

## Recap

### What people wanted to learn

<!-- The questions and expectations the room brought. One bullet each. -->

### What people learned

<!-- The takeaways, in the room's own words. No names. -->

### Open questions

<!-- What is still unresolved? Move bigger ones to docs/ideas/. -->

## References

Each link in this page's references comes with a note on why it matters.
