---
title: Working with agents
description: How LLM agents can read this second brain through llms.txt and the JSON agent API, and how to let an agent draft a page that passes the checks.
doc_status: active
type: Guide
kind: How-To
updated: 2026-10-23T00:00:00Z
tags: [agents, llms-txt, agent-api, spec-kitty]
authors:
  - human:stijn
  - agent:claude
related:
  - context/audience/agent
  - adr/0001-dockitty-for-the-second-brain
external_references:
  - type: biblio
    id: llms-txt-2024
  - type: tool
    id: spec-kitty
---

# Working with agents

## Reading the site

Point your agent at one of these instead of the HTML pages:

| Surface | What it is | Good for |
|---|---|---|
| `llms.txt` | A Markdown index of every published page with its description | Giving a chat assistant context in one fetch |
| `api/index.json` | Every page with type, kind, status, tags, dates and `_links` | Programmatic discovery and filtering |
| `<slug>.json` | One page's metadata, raw Markdown and `_links`, at the page's own address (`context/about/` → `context/about.json`; the home page is `home.json`) | Following `related` and `alternate` links |
| `<slug>.yaml` | The same record as YAML | Tools and people who prefer YAML |
| `<slug>.md` | The page's Markdown, its metadata as frontmatter | Pasting one page into a chat |
| `api/pages/<slug>.json` | The canonical record behind the views above | Programmatic use alongside `api/index.json` |
| `rss.xml` | New and updated pages | Watching for changes |

A prompt that works well:

> Read `https://sddevelopment-be.github.io/socratesbe_26_secondbrain/llms.txt`
> and summarise the sessions about testing. Link every claim to its page.

Draft pages are left out of all of these on the live site, so an agent only sees notes
their authors marked as ready.

## Writing with an agent

The repository tells coding agents how to behave:

- **`AGENTS.md`** at the root holds the conventions: where pages go, the
  frontmatter, and the checks to run.
- **The Spec Kitty charter** (`.kittify/charter/`) states the project's
  intent and quality gates. Agents with Spec Kitty installed load it
  automatically.

A typical flow is to paste your raw session notes and ask:

> Turn these notes into a session page following AGENTS.md. Keep it a draft,
> do not add names that are not in my notes, and run `pnpm validate`.

Then review the result like any other pull request. The agent drafts, and a
human decides what is true.
