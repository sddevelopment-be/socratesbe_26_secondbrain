# Research notes: Spec Kitty lightning talk (mission run)

Gathered fresh on 2026-10-24 for FR-012 by two read-only researchers, with no
reuse of the ad-hoc run's briefs (decision DM-01M5PX7Q9GVCPVXCNWYXGCGSFC).

**Source authority, highest first**: the installed CLI (spec-kitty-cli
4.0.0rc8, `--help` output, re-checked on the public 4.0.0rc7 after decision
DM-01M5PYY4HA569WK921Q6W6GFWR); the local clone's newest docs tag (`v4.0.0rc7`,
read with `git show`); the public site and docs; the charter repository.

**Confidence**: *CLI* = verified in `--help`; *docs* = documentation only;
*site* = marketing page; *proposed* = not shipped.

## Facts

### Positioning

| ID | Fact | Source | Confidence |
|---|---|---|---|
| R-01 | Headline: "Your AI agents write the code. Your people make the calls." | spec-kitty.ai/index.md | site (exact, checked with curl) |
| R-02 | Developers page: "Your agent asks first and writes a spec before it builds. Then a separate reviewer agent reviews the work against the spec and your rules." | spec-kitty.ai/developers.md | site (exact) |
| R-03 | The free CLI is MIT-licensed; hosted team products are contact-only or early access. | spec-kitty.ai/developers.md | site |
| R-04 | Spec Kitty keeps specs, plans, work packages, review state and merge decisions in Git, next to the code. | v4.0.0rc7:README.md | docs |

### Getting started

| ID | Fact | Source | Confidence |
|---|---|---|---|
| R-10 | Prerequisites: Python 3.11+, Git, pipx, and a supported AI coding agent signed in with your own model account. | v4.0.0rc7:docs/guides/tutorials/getting-started.md; spec-kitty.ai/getting-started.md | docs |
| R-11 | Install with `pipx install spec-kitty-cli`; a release candidate needs an exact pin such as `==4.0.0rc7`. | v4.0.0rc7:README.md | docs |
| R-12 | `spec-kitty init [name] --ai <keys>` initialises the current folder when no name is given; `--ai` takes comma-separated agent keys. | `init --help` | CLI |
| R-13 | `init` creates `.kittify/` and the agent's command and skill folders (for example `.claude/`), and is safe to re-run. | `init --help` | CLI |
| R-14 | `init` never touches Git: no repository, no commit. | `init --help` | CLI |
| R-15 | Specify needs a committed HEAD; without one it fails. Run `git init -b main`, commit, and branch first. | v4.0.0rc7:getting-started.md; docs.spec-kitty.ai tutorial | docs |
| R-16 | `spec-kitty verify-setup` checks the environment and project wiring. | `verify-setup --help` | CLI |
| R-17 | Claude Code, Codex, Cursor, Copilot, Gemini and over a dozen more agents are supported (16 or 17 depending on the page). | docs.spec-kitty.ai/api/supported-agents.html | docs |

### Charter

| ID | Fact | Source | Confidence |
|---|---|---|---|
| R-20 | The charter is the repository's governance: purpose, principles, quality gates, review policy. | docs.spec-kitty.ai/context/charter-overview.html | docs |
| R-21 | `spec-kitty charter interview --profile minimal` records answers in `.kittify/charter/interview/answers.yaml`; `/spec-kitty.charter` runs the interview inside the agent. | `charter interview --help`; setup-governance.md | CLI + docs |
| R-22 | `spec-kitty charter generate --from-interview` writes the charter; `charter synthesize` prepares it for the runtime; `charter status` reports drift. | `charter --help`; setup-governance.md | CLI |
| R-23 | When a governed step runs, the runtime injects the relevant charter rules into the agent's prompt. | charter-overview.html | docs |
| R-24 | `charter sync` no longer exists (removed upstream, #5828). | `charter --help`; setup-governance.html | CLI |
| R-25 | The charter overhaul (a separate service with charter packs) is "bootstrap, first code"; its contract is an unreleased snapshot. | github.com/spec-kitty/spec-kitty-charter README and roadmap | proposed |
| R-26 | Example principle from this repository's charter: "People first. … Participant names are not added to the site." | `.kittify/charter/charter.md` | repository |

### Lifecycle

| ID | Fact | Source | Confidence |
|---|---|---|---|
| R-30 | Four mission types: software-dev (default), research, documentation, plan. | `spec-kitty mission list`; v4.0.0rc7:docs/api/missions.md | CLI |
| R-31 | `/spec-kitty.specify` runs a discovery interview and writes `spec.md` and a requirements checklist under `kitty-specs/<mission>/`. Each run creates a new mission. | specify/spec-commit `--help`; slash-commands.md | CLI + docs |
| R-32 | `/spec-kitty.plan` writes `plan.md`, and where needed research, data model, contracts and a quickstart. | slash-commands.md; `plan --help` | docs |
| R-33 | `/spec-kitty.tasks` writes `tasks.md` and one prompt file per work package under `tasks/`, then computes dependencies and execution lanes. | slash-commands.md; `agent tasks finalize-tasks --help` | CLI + docs |
| R-34 | `/spec-kitty.analyze` cross-checks spec, plan and tasks and writes `analysis-report.md`. It is a slash command only. | `agent mission --help` | CLI |
| R-35 | `spec-kitty next --agent <a> --mission <m>` reports the one next action; with `--result success` it advances. | `next --help` | CLI |
| R-36 | Each work package is implemented in its own lane worktree; independent lanes run in parallel. | v4.0.0rc7:docs/architecture/execution-lanes.md | docs |
| R-37 | Status lanes: planned → claimed → in_progress → for_review → in_review → approved → done, plus blocked and canceled. | v4.0.0rc7:docs/architecture/kanban-workflow.md | docs |
| R-38 | `/spec-kitty.status` (or `spec-kitty agent tasks status`) shows the board. | `agent tasks status --help` | CLI |
| R-39 | A reviewer who is not the implementer approves a work package, or rejects it with feedback. | spec-kitty.ai/developers.md; reviewer-implementer separation tactic | docs |
| R-40 | `spec-kitty accept` validates readiness. | `accept --help` | CLI |
| R-41 | `spec-kitty consolidate` (or `/spec-kitty.consolidate`) lands the lanes on the target branch and cleans up worktrees; default strategy squash. | `consolidate --help` | CLI |
| R-42 | After landing: a mission review (spec against code) and a retrospective. | `review --help`; `retrospect --help` | CLI |
| R-43 | `spec-kitty dispatch "<request>"` opens a lightweight governed Op for ad-hoc work, with no mission. | `dispatch --help` | CLI |
| R-44 | `/spec-kitty.plan` asks planning questions and waits until the human confirms an "Engineering Alignment" summary. | `~/.claude/commands/spec-kitty.plan.md` (installed command) | CLI-installed command |
| R-45 | `/spec-kitty.review` reviews one work package implementation. | `~/.claude/commands/spec-kitty.review.md` | CLI-installed command |
| R-46 | Suggested first missions: a real backlog ticket, a small refactor you keep putting off, or docs for a module only one person understands. | spec-kitty.ai/getting-started.md (checked with curl) | site |
| R-47 | `consolidate` merges locally; publishing to origin is the separate `--push` step. | `consolidate --help` | CLI |
| R-48 | `charter generate` writes `charter.yaml` and auto-stages `.kittify/charter/charter.md`. | `charter generate --help`; scratch run in `docs/generation-log.md` | CLI |
| R-49 | PyPI publishes stable 3.2.7 and pre-release 4.0.0rc7; 4.0.0rc8 is not on PyPI. `pipx install spec-kitty-cli` installs 3.2.7. | `pip index versions [--pre] spec-kitty-cli` | CLI |
| R-50 | 3.2.7 has `merge` and `charter sync` but no `consolidate`; 4.0.0rc7 has `consolidate`, the charter interview/generate/synthesize/status commands, and no `charter sync`. | `--help` in throwaway virtualenvs | CLI |
| R-51 | On 4.0.0rc7, `init` adds `.claude/` to `.gitignore`, so in an existing repository only `.kittify`, `.gitignore` and `.gitattributes` are committed. | scratch run, `docs/generation-log.md` | CLI (run) |

## Discrepancies (the CLI wins)

| ID | Docs say | Installed CLI says | Used in deliverables |
|---|---|---|---|
| D-01 | `/spec-kitty.merge`, `spec-kitty merge` (README, first-mission tutorial) | `merge` is removed: "Renamed to spec-kitty consolidate" | consolidate |
| D-02 | `charter sync` (some docs, ADRs, a skill description) | no such command | interview / generate / synthesize / status |
| D-03 | `spec-kitty implement WP##` moves to `doing` | `implement` is internal; `agent action implement` moves to in_progress | omit the internal command |
| D-04 | "review" means per-WP review | `spec-kitty review` is the post-merge mission review | say "review a work package" vs "mission review" |
| D-05 | Agent count "20+" (site), 16 or 17 (docs) | n/a | "over a dozen" |
| D-06 | Docs show versions 3.1.5, 3.2, 4.0.0rc2 | 4.0.0rc8 locally; 4.0.0rc7 on PyPI | name 4.0.0rc7 (R-49) |
| D-07 | Retrospective written "during merge" vs "at runtime terminus" | `mission close` saves it | "after landing" |
| D-08 | `spec-kitty ops` sounds like Ops | it is Git reflog history | do not mention |

## Process finding (for the comparison)

| ID | Finding |
|---|---|
| P-01 | A documentation mission blocked at its first step with `CHARTER_PREFLIGHT_FAILED: synthesized_drg missing`. `charter synthesize` refuses to write from a linked worktree. The seed artefacts were cherry-picked from another branch (`c5186ee`). Starting a first mission therefore needs `charter synthesize` in the root checkout (R-22). |
| P-02 | The documentation runtime's generate guard looks for Markdown under `kitty-specs/<mission>/docs/`, not the repository's `docs/`. A project that publishes into its own site tree is blocked even when the pages exist. Recorded in `docs/generation-log.md`. |
| P-03 | `spec-kitty upgrade` run inside a linked worktree wrote the worktree folder name (`demo-mission`) as the project name in the `AGENTS.md` orientation block; corrected by hand to `socratesbe-26-secondbrain`. |
