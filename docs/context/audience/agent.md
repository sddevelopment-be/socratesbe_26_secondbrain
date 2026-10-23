---
title: The agent
description: An LLM agent or automaton that reads, summarises or extends this second brain on behalf of a participant.
doc_status: active
type: Context
kind: Persona
updated: 2026-10-23T00:00:00Z
tags: [persona, agent, llms-txt]
authors:
  - human:stijn
  - agent:claude
role: An automated reader or writer, such as a coding agent, a chat assistant or a crawler, acting for a human.
goals:
  - Discover what the site contains without scraping HTML.
  - Answer questions about sessions with links back to the source pages.
  - Draft new pages that pass the frontmatter and link checks.
responsibilities:
  - Starts from llms.txt or api/index.json and cites page URLs.
  - Follows the conventions in AGENTS.md and the project charter when writing.
  - Never invents attendees, quotes or session content, and never adds participant names.
---

# The agent

The agent never sees the theme. It reads the structured surfaces:

- [`llms.txt`](../../../llms.txt), a short Markdown index of the site;
- [`api/index.json`](../../../api/index.json), every page with its type, status,
  tags and links, plus one JSON record per page under `api/pages/`;
- each page as JSON, YAML or Markdown at its own address, such as
  [`context/audience/agent.json`](../../../context/audience/agent.json);
- the raw Markdown in the repository, whose frontmatter carries the same
  metadata.

When it writes, it follows [Working with agents](../../guides/working-with-agents.md).
