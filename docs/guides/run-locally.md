---
title: Run the site locally
description: Install the toolchain, start the dev server and run the checks that a pull request must pass.
doc_status: active
type: Guide
kind: How-To
updated: 2026-10-23T00:00:00Z
tags: [setup, pnpm, astro]
authors:
  - human:stijn
  - agent:claude
---

# Run the site locally

You need Node 22.23.4 or later (Node 24 recommended) and pnpm (`corepack enable` installs it).

```sh
pnpm install
pnpm dev          # http://localhost:4321/socratesbe_26_secondbrain/
```

The dev server shows draft pages, marked as drafts. The production build
leaves them out (`.env.production` sets `DK_PUBLISH_DRAFTS=off`).

## Checks

Run these before you open a pull request:

```sh
pnpm validate     # frontmatter against the convention
pnpm lint:md      # Markdown syntax
pnpm links        # every internal link resolves
pnpm check        # type check
pnpm build        # the full static site, plus llms.txt, RSS and the agent API
pnpm check:dist   # every link in the built site resolves
pnpm spell        # UK English spelling (advisory)
```

The same checks run in CI on every pull request. Spelling is advisory: CI
shows unknown words as warnings but never blocks a merge. Add names and
project terms to `.cspell/project-words.txt`.

## Deployment

Every push to `main` builds the site and publishes it to GitHub Pages,
without draft pages.

No registry token is needed: the DocKitty toolkit is installed straight from
its public GitHub repository.
