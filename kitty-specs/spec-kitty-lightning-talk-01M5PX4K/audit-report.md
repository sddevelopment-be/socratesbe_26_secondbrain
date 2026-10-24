# Validation report: Spec Kitty lightning talk (mission run)

**Date**: 2026-10-24 · **Pages**: `docs/presentations/spec-kitty-first-mission.md`,
`docs/sessions/spec-kitty-first-mission.md`, `docs/sessions/README.md`;
plus `docs/_meta/sections.yaml` (decision DM-01M5PYY8WFF9CDWW17MTX6VQWT).

**Verdict: `ready-to-publish`**

## How it was validated

1. The project gates, run by the author after every fix cycle.
2. An independent review by a reviewer profile that did not write the pages
   (two rounds: `needs-rework` → `ready-to-publish, with mitigations`).
3. Runnable-command checks in throwaway repositories on the local 4.0.0rc8
   and on the public 4.0.0rc7 and 3.2.7 (see `docs/generation-log.md`).

## Gates

| Gate | Command | Result (final run) |
|---|---|---|
| Frontmatter | `pnpm validate` | pass: 26 files valid |
| Markdown | `pnpm lint:md` | pass: 0 issues in 27 files |
| Links, source | `pnpm links` | pass: every internal reference resolves |
| Type check | `pnpm check` | pass: 0 errors, 0 warnings |
| Build | `pnpm build` | pass |
| Links, built | `pnpm check:dist` | pass |
| Spelling | `pnpm spell` | pass: 0 issues |
| Divio adherence | review | pass: deck §1 explanation, §2 how-to, §3 explanation + reference, §4 how-to; session page reference |
| Completeness vs plan | review | pass: every required cell filled; tutorials and A5 reference deferred as designed; no stub markers |
| Accessibility | review + build | pass: Mermaid diagram has title and description; headings `#`→`##`→`###` with no skips |
| Source alignment | command checks | pass: every command exists on 4.0.0rc7; both install paths run end to end |
| Cross-links | `pnpm links`, review | pass: deck ↔ session page, both active; no link to the ad-hoc drafts (C-004) |
| Timing | note timings | pass: 14 slides, 13:15 (NFR-001: ≤ 16 slides, ≤ 15:00) |
| Names, invented content | review | pass: only contributor handles in `authors`; recap subsections empty |
| Agent surfaces | built `llms.txt`, `api/index.json`, sitemap, RSS | pass after the feeds fix: both pages listed; ad-hoc drafts absent from all three |
| Generator reproducibility | n/a | no generator (plan DD-01) |

## Requirement status

| ID | Status | Evidence |
|---|---|---|
| FR-001 | pass | new deck path; a `Note:` on all 14 slides |
| FR-002 | pass | deck §1 |
| FR-003 | pass | deck 2.1 and 4.1: prerequisites (note), install, init, commit, verify, charter, specify |
| FR-004 | pass | deck 2.2: commands, purpose, charter principle with marked cut |
| FR-005 | pass | deck 3.1 to 3.4; decision points specify, plan, accept |
| FR-006 | pass | deck 3.3; terms defined in the 1.1 note |
| FR-007 | pass | session page "Session overview" and "Start tomorrow" |
| FR-008 | pass | session page "Recap", three empty subsections |
| FR-009 | pass | seven inline references, each with a note; notes reach agents through `api/content-graph.json` and the page HTML |
| FR-010 | pass | both pages' `audience` entries name the developers and the 15-minute format |
| FR-011 | pass | both `active`; Sessions hub lists the page; Presentations hub lists the deck automatically |
| FR-012 | pass | `research.md` R-01 to R-51, D-01 to D-08, P-01 to P-02 |
| NFR-001 | pass | 14 slides, 13:15 |
| NFR-002 | pass | all commands exist on 4.0.0rc7 (amended by DM-01M5PYY4HA569WK921Q6W6GFWR) |
| NFR-003 | pass | claim trace in `docs/generation-log.md`; review round 2 found no unsupported claim |
| NFR-004 | pass | see Accessibility |
| NFR-005 | pass | `pnpm spell` clean |
| C-001 | pass | the ad-hoc deck and session page are unchanged since `26879d8` |
| C-002 | pass | no participant names |
| C-003 | pass | recap empty |
| C-004 | pass | no links to drafts |
| C-005 | pass | the charter overhaul is labelled an early build |
| C-006 | pass so far | work on `feat/demo-mission`; pull request pending |
| C-007 | pass | all gates above |

## Findings and dispositions

| # | Finding | Severity | Disposition |
|---|---|---|---|
| V-01 | `pipx install spec-kitty-cli` installs 3.2.7, which lacks `consolidate`; 4.0.0rc8 is not on PyPI | block-publish | `accepted`: pinned `==4.0.0rc7` after operator decision DM-01M5PYY4HA569WK921Q6W6GFWR; both paths re-run on rc7 |
| V-02 | Charter quote cut without an ellipsis | mitigate | `accepted`: ellipsis added |
| V-03 | A note claimed an unrecorded "day before the talk" run | mitigate | `accepted`: replaced with the recorded date and version |
| V-04 | Human decision points inconsistent between diagram, slide and table | mitigate | `accepted`: specify, plan, accept everywhere |
| V-05 | Session audience lacked the 15-minute format | mitigate | `accepted` |
| V-06 | Seven claims without a research fact | mitigate | `accepted`: R-44 to R-51 added; two claims removed or softened |
| V-07 | Install block mixed new-project and existing-repository paths | mitigate | `accepted`: split; existing path commits only Spec Kitty files |
| V-08 | Work package, worktree and synthesize undefined for newcomers | mitigate | `accepted`: defined in notes |
| V-09 | Plan timing total wrong (14:15 vs 13:15) | accept | `accepted`: plan corrected |
| V-10 | Board lanes simplified | accept | `deferred_with_rationale`: a fair simplification for 15 minutes; the full list is in R-37 |
| V-11 | Title could read as a promise | accept | `accepted`: reworded |
| V-12 | Mission documents still named rc8 | mitigate | `accepted`: spec NFR-002, ASM-003, research and log updated |
| V-13 | rc7 runs not logged | mitigate | `accepted`: added to the generation log |
| V-14 | One fenced block held both install paths | accept | `accepted`: split into separate blocks |
| V-15 | `feeds: [rss]` kept Sessions and Ideas off `llms.txt`, the agent index and the sitemap, site-wide | mitigate (outside scope) | `accepted`: fixed in its own commit after operator decision DM-01M5PYY8WFF9CDWW17MTX6VQWT; drafts confirmed absent |
| V-16 | Page JSON has no `external_references` key | accept | `deferred_with_rationale`: toolkit behaviour; the notes reach agents through the content graph |

## Pre-mortem

| Risk after publish | Disposition |
|---|---|
| 4.0.0rc8 or 4.0 final ships and changes a command | accept: the page states the checked version and date |
| A reader already on 3.x gets the wrong commands | mitigated: the pin, the `--force` hint and the 3.2 `merge` note |
| A reader in a worktree hits the `synthesize` refusal (P-01) | accept: rare for a first-day user in a fresh repository; recorded in research |
| Upstream docs keep saying `merge` | mitigated: the deck and the tutorial reference both warn |
