# Project Charter — SoCraTes BE 2026 Second Brain

<!--
Hand-authored, display-only companion to the authoritative
`.kittify/charter/charter.yaml` (generated from
`.kittify/charter/interview/answers.yaml`). This file holds the human
rationale. `charter generate` never overwrites it.
-->

## Purpose

An open, community-owned second brain for the SoCraTes Belgium 2026
unconference. It collects what participants want to keep from the sessions
and publishes it as one docsite that serves two audiences equally:

- **Humans** read a navigable, searchable site in the SoCraTes look.
- **Agents** read `llms.txt`, the JSON agent API and RSS, all generated from
  the same frontmatter.

The repository is also a live demonstration of docs-as-code for both
audiences, so how it is built matters as much as what it holds.

## Principles

1. **One source, two audiences.** Content is written once, in Markdown with
   validated frontmatter. Do not add parallel "agent-only" or "human-only"
   copies.
2. **Unconference spirit.** Low ceremony, anyone may contribute, and
   whatever happens is what gets written down. A draft is better than nothing.
3. **People first.** Write about ideas, not people. Participant names are
   not added to the site: not as conveners, speakers, attendees or the
   source of a quote. The one exception is a contributor's own handle in a
   page's `authors` list, which they add themselves. The SoCraTes code of
   conduct applies.
4. **Agents draft, humans decide.** Agent-written content is welcome but is
   reviewed by a human before it is merged. Agents never invent attendees,
   quotes or session content.
5. **Stay on the convention.** The tree follows DocKitty / Common Docs. The
   theme refines `--dk-*` tokens only, so toolkit upgrades stay cheap.

## Quality gates

Before merge, a change passes:

- `pnpm validate`: frontmatter against the convention;
- `pnpm lint:md`: Markdown syntax;
- `pnpm links` and `pnpm check:dist`: internal links, before and after the
  build. `check:dist` also runs the post-build schedule check
  (`scripts/check-schedule-dist.mjs`);
- `pnpm check:schedule`: schedule data in `docs/_meta/schedule/`;
- `pnpm test`: unit tests for the schedule logic;
- `pnpm check`: type check;
- `pnpm build`: a clean static build.

Spelling (UK English, `pnpm spell`) is checked too but is advisory: it warns
and never blocks a merge. CI runs all of this on every pull request and
deploys `main` to GitHub Pages.

One other participant reviews each pull request. The reviewer also reads for
participant names. There is no automated name detection: the project relies
on the good will of contributors and reviewers to proofread, catch common
names and remove them.

## Out of scope

- Personal data about attendees beyond what they chose to share.
- Recordings or transcripts of sessions.
- Anything that needs private registry credentials to build.
