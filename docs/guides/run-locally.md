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

You need Node 22.22 or later and pnpm (`corepack enable` installs it).

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
pnpm links        # every internal link resolves
pnpm build        # the full static site, plus llms.txt, RSS and the agent API
```

No registry token is needed: the DocKitty toolkit is installed straight from
its public GitHub repository.
