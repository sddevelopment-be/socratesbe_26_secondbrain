<!-- spec-kitty:orientation -->
**Spec Kitty v4.0.0rc7** — project: socratesbe-26-secondbrain (healthy)

Two usage patterns:
- **Full mission** (spec → plan → tasks → implement → review → merge):
  trigger: "spec out", "create a mission", "write a spec", "plan this"
  → run `/spec-kitty.specify`
- **Lightweight dispatch** (ad-hoc fix, question, or advice — no mission created):
  trigger: "hey spec kitty", "use spec kitty to", "spec kitty <anything>"
  → **ALWAYS run `spec-kitty dispatch "<request verbatim>"` — do NOT answer directly.**
  If you know the right profile, pass it to skip routing:
  `spec-kitty dispatch "<request verbatim>" --profile <profile-id>`
  Reason: `spec-kitty dispatch` loads governance context, routes the request,
  and opens the Op. Skipping it produces ungoverned, untracked responses.
  After finishing the work, close the Op with the command printed in the capsule
  (`spec-kitty profile-invocation complete --invocation-id <id> --outcome <done|failed|abandoned>`).
<!-- /spec-kitty:orientation -->

## Project: SoCraTes BE 2026 Second Brain

A DocKitty docsite (Astro + Starlight) that collects notes from the SoCraTes
Belgium 2026 unconference for humans and agents. Read
`.kittify/charter/charter.md` for intent and principles.

### Where things go

- Content lives in `docs/`, following the DocKitty / Common Docs convention.
  Each folder's `README.md` is its section index and carries frontmatter
  (including `okf_version: "0.2"`).
- Sections (registered in `docs/_meta/sections.yaml`): `context/` (the
  unconference), `sessions/` (one page per session), `ideas/`, `guides/`
  (contributing), `adr/` (decisions).
- The theme is in `src/theme/`. Refine `--dk-*` tokens, never `--sl-*`.
- Chrome the toolkit has no token for (bars, hero, call-to-action buttons)
  uses theme-private `--sb-*` tokens declared in `src/theme/socrates.css`.
  Declare a token once in `:root` when it is the same in both schemes,
  otherwise in both blocks; never alias `--dk-color-accent*`. `chrome.css`
  holds no colour literals unless the line carries a
  `/* literal: <reason> */` comment; `pnpm check` enforces this.

### Every page needs frontmatter

```yaml
---
title: Short title
description: One sentence. It appears in search, llms.txt and the agent API.
doc_status: draft        # draft | active | deprecated | superseded | durable
type: Context            # must match the section's type in sections.yaml
kind: Reference          # Reference | How-To | Explanation | Hub | Persona | Planning | ADR ...
updated: 2026-10-23T00:00:00Z
tags: [lowercase, hyphenated]
authors:
  - human:<handle>       # add agent:<name> when an agent co-wrote the page
---
```

### Rules

- Never push to `main`. Work on a topic branch and open a pull request; `main`
  is protected (see `docs/development/branch-protection.md`).
- Link to other pages with relative `.md` links (`../sessions/foo.md`). The
  build rewrites them, and they still work on GitHub.
- A published page must not link to a draft. Publish the target or keep both
  as drafts.
- Never invent attendees, quotes or session content. Only name people who
  appear by name in the notes you were given.
- Keep new pages `doc_status: draft` unless the human asks otherwise.
- Write in UK English (colour, behaviour, organise).
- Before you finish, run `pnpm validate && pnpm lint:md && pnpm links && pnpm build`,
  then `pnpm spell` and fix real typos (add project terms to
  `.cspell/project-words.txt`).
