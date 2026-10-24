# Implementation Plan: Spec Kitty lightning talk (mission run)

**Branch**: `feat/demo-mission` | **Date**: 2026-10-24 | **Spec**: [spec.md](./spec.md)
**Input**: Mission specification from `kitty-specs/spec-kitty-lightning-talk-01M5PX4K/spec.md`, gap analysis from [gap-analysis.md](./gap-analysis.md), facts from [research.md](./research.md)

## Summary

Two new published pages in the existing second-brain docsite: a sectioned,
skippable 15-minute deck (explanation + how-to) and a session page
(reference + recap skeleton). They close gaps A1 to A6 of the gap analysis
for a mixed developer audience. No generator is involved; every Spec Kitty
statement traces to a `research.md` fact ID, and the CLI form wins every
doc/CLI discrepancy (D-01 to D-08).

## Technical Context

**Documentation Framework**: the existing DocKitty site (Astro + Starlight); decks render with reveal.js from Markdown.
**Languages Detected**: Markdown content. The `plan` scaffold's JSDoc and Sphinx detections are false positives: there is no API surface to document (see DD-01).
**Generator Tools**: none.
**Output Format**: HTML site pages, plus the generated agent surfaces (`llms.txt`, page JSON, RSS) from the same frontmatter.
**Hosting Platform**: GitHub Pages, deployed from `main` by the existing workflow.
**Build Commands**: `pnpm validate && pnpm lint:md && pnpm links && pnpm check && pnpm build && pnpm check:dist`, then `pnpm spell`.
**Theme**: existing SoCraTes theme; section slides reuse the existing `sb-section` class and gradient from `docs/presentations/doc-kitty.md`.
**Accessibility Requirements**: every Mermaid diagram carries `%% title:` and `%% description:`; no skipped heading levels (NFR-004).

## Project Structure

### Documentation (this mission)

```text
kitty-specs/spec-kitty-lightning-talk-01M5PX4K/
├── spec.md            # discover
├── research.md        # audit: sourced facts R-xx, discrepancies D-xx, process P-xx
├── gap-analysis.md    # audit: inventory, coverage matrix, prioritised gaps
├── plan.md            # design (this file)
├── checklists/        # spec quality checklist
└── decisions/         # discovery Decision Moments
```

### Documentation files (repository)

```text
docs/
├── presentations/
│   ├── spec-kitty-first-mission.md   # NEW deck (Presentation / Presentation, active)
│   └── spec-kitty-in-15-minutes.md   # ad-hoc baseline, untouched (C-001)
├── sessions/
│   ├── README.md                      # EDIT: list the new session page
│   ├── spec-kitty-first-mission.md    # NEW session page (Context / Reference, active)
│   └── getting-started-with-spec-kitty.md   # ad-hoc baseline, untouched (C-001)
.cspell/project-words.txt               # EDIT only if new terms appear
```

## Divio allocation

| Area (gap) | Tutorial | How-to | Reference | Explanation | Where |
|---|---|---|---|---|---|
| A1 Why specs before code | deferred: no workshop (spec Out of Scope) | n/a | n/a | **required** | deck §1 |
| A2 Start tomorrow | deferred: no workshop | **required** | **required** | n/a | deck §2; session page "Start tomorrow" |
| A3 Charter | deferred | **required** (brief) | **required** (commands) | **required** (one line: why) | deck §2 slide 2.2; session page |
| A4 Lifecycle and artefacts | n/a | n/a | **required** | **required** | deck §3; session page table |
| A5 Work packages, worktrees, board | n/a | n/a | deferred to links (time budget) | **required** | deck §3 slide 3.3 |
| A6 Session record | n/a | n/a | **required** | n/a | session page |

The tutorial cells are deferred because the spec excludes a hands-on
workshop; the session page links to the official tutorials instead.

## Navigation and cross-links

- The deck lives in the Presentations section, hidden from the sidebar like the
  existing deck (`sidebar.hidden: true`); it is reached from the Presentations
  hub listing and from the session page.
- The session page is listed under "Notes so far" on `docs/sessions/README.md`.
- Deck `related:` → the session page and `guides/working-with-agents`.
  Session page `related:` → the deck, `guides/working-with-agents` and
  `sessions/second-brain-for-humans-and-agents` (the session that started the
  site and mentions the charter).
- The session page body links to the deck with a relative `.md` link.
- Neither new page links to the ad-hoc drafts (C-004).
- A reader reaches the deck in two clicks from the home page (Sessions →
  session page → deck) or one from the Presentations hub.

## Deck design

Sectioned with `##` (→ skips a section) and `###` slides (↓). Every slide has
a `Note:` with a timing. Budget: 14 slides, 13 min 15 s (NFR-001).

| # | Slide | Purpose / Divio | Facts | Time |
|---|---|---|---|---|
| 0 | Title: "Your first Spec Kitty mission" | framing | R-01 | 0:30 |
| §1 | Why specs before code (section) | explanation; skippable | | 0:15 |
| 1.1 | Prompt-and-hope vs spec-first: three failure modes, and what Spec Kitty keeps in Git | explanation | R-02, R-04 | 1:30 |
| §2 | Start tomorrow (section) | how-to; core | | 0:15 |
| 2.1 | Install, init, first commit, verify, with the "init never touches Git" warning | how-to + reference | R-10 to R-17 | 1:30 |
| 2.2 | Give the repo a charter: interview → generate → synthesize → status; one principle from this repo | how-to + explanation | R-20 to R-26, P-01 | 1:30 |
| §3 | The mission lifecycle (section) | core | | 0:15 |
| 3.1 | The lifecycle flowchart with human decision points | explanation | R-31 to R-42 | 1:30 |
| 3.2 | What each step leaves behind (table) | reference | R-31 to R-34 | 1:30 |
| 3.3 | Work packages, worktrees, the board, `spec-kitty next` | explanation | R-35 to R-38 | 1:30 |
| 3.4 | Review, accept, consolidate; a human makes the final call | explanation | R-39 to R-42, D-01 | 1:15 |
| §4 | Your turn (section) | | | 0:15 |
| 4.1 | Tomorrow morning: three steps, and when a mission is overkill (dispatch) | how-to | R-43 | 1:00 |
| 4.2 | Learn more: four links | reference | research LEARN MORE | 0:30 |

## Session page design

Frontmatter: `title`, `description` (50 to 180 characters), `doc_status:
active`, `type: Context`, `kind: Reference`, `updated`, `tags`, `authors`,
`related`, `audience` (FR-010), and `external_references` as inline
`{url, title, note}` entries (FR-009).

Body headings, in order:

1. `# <title>`, then a short "recap wanted" callout.
2. `## Session overview`: format, one-paragraph summary, link to the deck, the agenda (four sections with timings).
3. `## Start tomorrow`: the commands in one code block, then the in-agent steps (FR-007).
4. `## The lifecycle at a glance`: step, command, what you get (reference).
5. `## Recap`: `### What people wanted to learn`, `### What people learned`, `### Open questions`, each an HTML comment prompt only (FR-008, C-003).
6. `## References`: one sentence pointing at the page's references block.

## Design decisions

### DD-01: No generator

- **Choice**: hand-written Markdown only.
- **Alternatives**: JSDoc or Sphinx, as the `plan` scaffold detected.
- **Rationale**: the deliverables document a third-party CLI, not this repository's code; the detections are false positives from the docsite's own toolchain.
- **Trade-off**: command accuracy depends on the research notes, not on generated output (mitigated by NFR-002 and the validate step).

### DD-02: A sectioned, skippable deck

- **Choice**: four `##` sections of one to four slides; §1 is skippable.
- **Alternatives**: a flat run of slides; a two-section deck.
- **Rationale**: it follows the existing deck's convention (`doc-kitty.md`) and the spec edge case "a presenter runs short of time".
- **Trade-off**: section title slides cost four of the 14 slides.

### DD-03: References inline in frontmatter, not in the bibliography catalog

- **Choice**: inline `external_references` entries with a page-specific `note`, plus the existing `tool: spec-kitty` catalog entry.
- **Alternatives**: new entries in `docs/_meta/bibliography.yaml`.
- **Rationale**: the "why it matters" is specific to this audience (FR-009); catalog notes are global. Inline entries render the note and are exposed to agents.
- **Trade-off**: the links are not reusable by other pages without copying.

### DD-04: Published and listed

- **Choice**: `doc_status: active` on both pages; the session page is listed on the Sessions hub.
- **Rationale**: Decision Moment DM-01M5PX7S1HR16PJ58JV6CMQHNY (publish both).
- **Consequence**: C-004 forbids links from these pages to the ad-hoc drafts; the deck-to-session cross-links are both active, so they are allowed.

### DD-05: The CLI's vocabulary wins

- **Choice**: use `consolidate`, `charter synthesize`, "review a work package" vs "mission review"; never `merge` (as a command), `charter sync` or `spec-kitty ops`.
- **Rationale**: research D-01 to D-08; NFR-002.

### DD-06: The charter slide names `synthesize`

- **Choice**: the charter recipe on slide 2.2 includes `charter synthesize`.
- **Alternatives**: interview and generate only, as in the ad-hoc deck.
- **Rationale**: process finding P-01: without synthesis this mission's runtime blocked at its first step. This is the most likely first-day failure for the audience.
- **Trade-off**: one more command on a dense slide.

## Risks

| Risk | Mitigation |
|---|---|
| A slide copies a removed command from upstream docs | validate cross-checks every command against research.md and `--help` |
| The deck overruns 15 minutes | timings in every note; total checked in validate |
| A published page links to a draft | `pnpm links` in production mode, plus a manual check of `related:` |
| A participant name slips in | reviewer proofread (charter); the recap stays empty |
