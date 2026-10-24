# Gap analysis: Spec Kitty lightning talk (mission run)

**Mode**: `mission_specific` (from `spec.md`). **Audience**: developers, mixed
(daily agent users and newcomers). **Date**: 2026-10-24.

## Inventory

Every Markdown file under `docs/` on `feat/demo-mission` at `0647396`. Divio
classification rule: the frontmatter `kind` maps to a Divio type (How-To →
how-to; Reference → reference; Explanation → explanation; Hub, Persona,
Planning, ADR, Presentation → not a Divio content cell). Confidence is
`high` when `kind` and content agree.

| File | type / kind | Status | Divio | Confidence | Covers Spec Kitty? |
|---|---|---|---|---|---|
| docs/README.md | – / Hub | active | n/a | high | no |
| docs/adr/README.md | ADR / Hub | active | n/a | high | no |
| docs/adr/0001-dockitty-for-the-second-brain.md | ADR / ADR | active | n/a | high | one line: provides the charter |
| docs/adr/0002-per-page-machine-views.md | ADR / ADR | draft | n/a | high | no |
| docs/context/README.md | Context / Hub | active | n/a | high | no |
| docs/context/about.md | Context / Explanation | active | explanation | high | no |
| docs/context/practical.md | Context / Reference | active | reference | high | no |
| docs/context/audience/README.md | Context / Hub | active | n/a | high | no |
| docs/context/audience/participant.md | Context / Persona | active | n/a | high | no |
| docs/context/audience/agent.md | Context / Persona | active | n/a | high | no |
| docs/development/README.md | Operations / Hub | active | n/a | high | no |
| docs/development/branch-protection.md | Operations / Explanation | active | explanation | high | no |
| docs/guides/README.md | Guide / Hub | active | n/a | high | no |
| docs/guides/add-a-session-note.md | Guide / How-To | active | how-to | high | no |
| docs/guides/run-locally.md | Guide / How-To | active | how-to | high | no |
| docs/guides/working-with-agents.md | Guide / How-To | active | how-to | high | one paragraph: the charter in `.kittify/charter/` |
| docs/ideas/README.md | Plan / Hub | active | n/a | high | no |
| docs/ideas/session-wishlist.md | Plan / Planning | active | n/a | high | no |
| docs/presentations/README.md | Presentation / Hub | active | n/a | high | no |
| docs/presentations/doc-kitty.md | Presentation / Presentation | active | explanation (deck) | low-confidence | no; mentions DocKitty's own docs charter |
| docs/presentations/spec-kitty-in-15-minutes.md | Presentation / Presentation | draft | explanation + how-to (deck) | low-confidence | yes, **ad-hoc reference, out of bounds (C-001)** |
| docs/sessions/README.md | Context / Hub | active | n/a | high | no |
| docs/sessions/second-brain-for-humans-and-agents.md | Context / Reference | active | reference | high | one line: the charter and AGENTS.md |
| docs/sessions/getting-started-with-spec-kitty.md | Context / Reference | draft | reference | high | yes, **ad-hoc reference, out of bounds (C-001)** |

Ungoverned files: none. Every page has `type`, `kind` and `doc_status`.

## Coverage matrix

Areas come from `spec.md` (user stories and FR-002 to FR-009). The ad-hoc
drafts are excluded: they are a comparison baseline, not coverage, and
published pages may not link to them (C-004).

| Area | Tutorial | How-to | Reference | Explanation |
|---|---|---|---|---|
| A1 Why specs before code | n/a | n/a | n/a | **missing** |
| A2 Start tomorrow (install, init, commit, verify) | n/a (out of scope: no workshop) | **missing** | **missing** | n/a |
| A3 Creating a charter | n/a | **missing** | present-but-thin (working-with-agents.md, one paragraph) | **missing** |
| A4 Mission lifecycle and artefacts | n/a | n/a | **missing** | **missing** |
| A5 Work packages, worktrees, status board | n/a | n/a | **missing** | **missing** |
| A6 Session record (overview, recap, references) | n/a | n/a | **missing** | n/a |

## Drift findings

| ID | Location | Finding | Priority |
|---|---|---|---|
| G-D1 | docs/guides/working-with-agents.md:60-61 | "Agents with Spec Kitty installed load it automatically." The charter is injected during governed steps (R-23), not on every agent action. Imprecise, not wrong. | low; outside scope, noted only |
| G-D2 | Upstream docs (D-01 to D-08 in `research.md`) | The upstream docs contradict the CLI in eight places. A deck copying the docs would teach removed commands. | **high**: the deliverables must use the CLI form |

No published hub page states a removed command.

## Prioritised gaps

| Rank | Gap | Impact | Audience | Delivers |
|---|---|---|---|---|
| 1 | A2 how-to + reference: start tomorrow | blocks-onboarding | both halves; newcomers most | deck "start" section, session page commands (FR-003, FR-007) |
| 2 | G-D2 command drift | blocks-task (a wrong command fails) | both | every command checked against `research.md` (NFR-002) |
| 3 | A4 lifecycle explanation + reference | blocks-task | both | deck lifecycle section (FR-005) |
| 4 | A3 charter how-to + explanation | blocks-onboarding (P-01: a missing synthesis blocks the runtime) | both | deck charter slide (FR-004) |
| 5 | A1 why specs before code | blocks-discoverability (motivation) | newcomers and sceptics | deck opening section (FR-002) |
| 6 | A5 work packages and worktrees | nice-to-have for a 15-minute slot | daily agent users | deck slide (FR-006) |
| 7 | A6 session record | blocks-discoverability after the session | participants, agents | session page (FR-007 to FR-010) |

## Low-confidence items for validate

- The two decks are classified as explanation, but a deck mixes Divio types
  by design; validate checks that each section has one purpose.
