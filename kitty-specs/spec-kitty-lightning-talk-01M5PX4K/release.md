# Release handoff: Spec Kitty lightning talk (mission run)

**Validate verdict**: `ready-to-publish` ([audit-report.md](./audit-report.md), 2026-10-24).
**Source revision**: branch `feat/demo-mission`, validated at `4996b96`. The
history is cleaned and rebased before the pull request; the published
revision is the pull request's merge commit on `main`.
**Publication target**: GitHub Pages, deployed from `main` by
`.github/workflows/docsite.yml`. **Owner**: the repository maintainer, who
reviews and merges the pull request. Agents never merge.

## What ships

| Page | Area | URL after deploy |
|---|---|---|
| `docs/presentations/spec-kitty-first-mission.md` | deck: A1 to A5 | https://sddevelopment-be.github.io/socratesbe_26_secondbrain/presentations/spec-kitty-first-mission/ (PDF: add `?print-pdf`) |
| `docs/sessions/spec-kitty-first-mission.md` | session page: A2 to A4, A6 | https://sddevelopment-be.github.io/socratesbe_26_secondbrain/sessions/spec-kitty-first-mission/ |
| `docs/sessions/README.md` | Sessions hub listing | https://sddevelopment-be.github.io/socratesbe_26_secondbrain/sessions/ |
| `docs/_meta/sections.yaml` | Sessions and Ideas now feed `llms.txt`, the agent API index and the sitemap | https://sddevelopment-be.github.io/socratesbe_26_secondbrain/llms.txt |

Not shipped, by design: the ad-hoc baseline (`docs/presentations/spec-kitty-in-15-minutes.md`,
`docs/sessions/getting-started-with-spec-kitty.md`) stays a draft and is
excluded from every generated surface.

## Release readiness

| Check | Result |
|---|---|
| Build | `pnpm build` clean locally; CI runs the same gates on the pull request |
| Internal links at the deployed base | `pnpm check:dist` passes with base `/socratesbe_26_secondbrain` and the production site URL |
| External links | all 9 return HTTP 200 on 2026-10-24 (the seven references, plus spec-kitty.ai and docs.spec-kitty.ai) |
| Search and navigation | deck listed on the Presentations hub (automatic) and in `llms.txt`; session page on the Sessions hub, in `llms.txt`, `api/index.json`, the sitemap and RSS |
| Assets | no images; one Mermaid diagram, rendered at build time |
| Versioning | the site is unversioned; both pages state the Spec Kitty version (4.0.0rc7) and the check date |
| Toolchain | `@spec-kitty/doc-toolkit` pinned at `4c0d6be` in `package.json`; Astro 7, Starlight 0.42 |

## Accepted caveats

- V-10: the deck shows five board lanes; the full nine are in research R-37.
- V-16: the page JSON omits `external_references`; agents get the notes
  through `api/content-graph.json`.
- P-01: `charter synthesize` refuses to write from a linked worktree; not
  mentioned on the pages.

## Living documentation

| Content | Cadence | Trigger |
|---|---|---|
| "Start tomorrow" how-to (deck 2.1, 2.2; session page) | re-run both install paths at each Spec Kitty release candidate or final 4.0 release | a new `spec-kitty-cli` release on PyPI |
| Lifecycle reference (deck 3.2, session page table) | check against `--help` at the same time | a renamed or removed command |
| Explanation (deck §1, §3) | revisit if the review or consolidate model changes | upstream ADRs |
| Recap | filled in by participants after the session | the session itself |
| References | link check before each conference reuse | — |

## For the next iteration

- Compare this mission's output with the ad-hoc baseline (commit `26879d8`):
  a follow-up, out of this mission's scope.
- Raise upstream: P-02 (the documentation generate guard looks only under the
  mission folder) and the doc/CLI drift D-01 to D-08.
- When 4.0 final ships, drop the release-candidate pin and the 3.2 `merge` note.

## Post-mission revisions

After acceptance, the maintainer asked for a narrative extension of the deck, run as governed ops rather than a new mission:

| Op | Profile | Change |
|---|---|---|
| `01M5Q3REWFHA9ZXAY1998WYP0R` | researcher-robbie | facts R-60 to R-81 in `research.md` |
| `01M5Q42RH8S1AMSXQXWCMS6ETK` | comms-cleo | deck restructured from high level to detail: two questions; what makes a good prompt; how Spec Kitty helps (software-dev mission diagram); the charter system (layers, packs, mission types, roles, harnesses); three ways to work; how to start. Session page agenda updated. |

Effect on the accepted spec: the deck now has 23 slides (NFR-001 allowed 16) with 14:55 of timed notes; the 15-minute limit still holds, and skipping the optional work-package slide gives 14:10. The slide-count deviation was accepted by the maintainer's request for the extra sections.
