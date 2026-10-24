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

## Deck extension (governed Op 01M5Q3REWFHA9ZXAY1998WYP0R)

Gathered 2026-10-24 for the narrative extension of the deck. `rc7:` = `git show v4.0.0rc7:<path>` in the local clone; CLI facts were checked on the public 4.0.0rc7.

| ID | Fact | Source | Confidence |
|---|---|---|---|
| R-60 | "The specification answers: What are we building and why?" / "The plan answers: How will we build it?" | rc7:docs/architecture/spec-driven-development.md | docs (exact) |
| R-61 | Specify focuses on WHAT users need and WHY, and avoids HOW (no tech stack, APIs, code structure). | `spec-kitty.specify` command template | CLI template |
| R-62 | "It gives your agent a clear spec, a plan, and a checklist to work from — instead of a loose prompt and a hope." | https://docs.spec-kitty.ai/ | site (exact) |
| R-63 | Good context engineering means "finding the smallest possible set of high-signal tokens"; prompts sit at the right altitude, between brittle hardcoded logic and vague guidance that falsely assumes shared context. | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | site (exact) |
| R-64 | Context degrades as it grows ("context rot"); specialised sub-agents handle focused tasks with clean context windows. | same | site |
| R-65 | The charter turns one machine-readable policy file into action-scoped context; "The agent does not invent governance; it reads and complies with what the charter says." | rc7:docs/context/charter-overview.md | docs (exact) |
| R-66 | Doctrine is the layered, governed content that shapes how missions and agents behave (directives, tactics, styleguides, toolguides, paradigms, procedures, agent profiles). | rc7:docs/architecture/doctrine-kinds.md | docs |
| R-67 | The charter offering has three layers: built-in (ships with the CLI), org (versioned remote packs, opt-in, fetched with `charter fetch`) and project (`.kittify/charter-packs/`, highest precedence). | rc7:docs/architecture/org-doctrine-layer.md; `charter fetch --help` | docs + CLI |
| R-68 | Org packs let a company ship shared rules (e.g. a versioned security pack) without forking the CLI; `charter pack assemble` combines packs into one distributable. | org-doctrine-layer.md; `charter pack --help` | docs + CLI |
| R-69 | A pack skill is one reviewed `<id>.skill.yaml`, so every configured agent tool gets the same skill; org packs can distribute skills. | rc7:docs/development/how-to/create-a-pack-skill.md | docs |
| R-70 | `spec-kitty plugin build --target claude-code|codex` builds a plugin bundle with rendered command skills and agent profiles. | `plugin build --help` (rc7) | CLI |
| R-71 | Mission types are configurable: four built-in (software-dev, research, documentation, plan, each with its own step sequence), plus custom types from project, org or user (`~/.kittify/missions/`) locations. | `mission list`; rc7:docs/api/missions.md | CLI + docs |
| R-72 | software-dev steps: specify → plan → tasks → implement → review; analyse, accept and consolidate wrap around them. | `mission list --json`; R-31 to R-41 | CLI |
| R-73 | Agent profiles give each role its own identity, routing and boundaries; 4.0.0rc7 lists 26 built-in profiles (e.g. researcher, architect, planner, implementer, reviewer). The docs say 18 (stale). | `profiles list` (rc7); rc7:docs/api/agent_profiles/index.md | CLI |
| R-74 | A reviewer must differ from the latest implementer; a generic identity never counts as a reviewer. | rc7:docs/architecture/kanban-workflow.md | docs |
| R-75 | "The agent that wrote the change is the one that says it's fine. Review becomes a rubber stamp at machine speed." | https://spec-kitty.ai/index.md | site (exact) |
| R-76 | Commands are rendered from one shared template source and adapted per agent (Markdown, TOML or SKILL.md); "Spec Kitty maintains a single source of truth". | rc7:docs/architecture/ai-agent-architecture.md | docs (exact) |
| R-77 | Agents can be added later with `spec-kitty agent config add`. | `agent config --help` (rc7) | CLI |
| R-78 | Paths, lightest first: no Spec Kitty, an ad-hoc specialist session (`dispatch`), an adversarial squad, a full mission. "Choose the lightest path that still fits the work." | rc7:docs/guides/when-to-use-modes.md | docs (exact) |
| R-79 | An Op creates no spec, branch or worktree; it routes to a profile, loads charter context, writes `kitty-ops/<id>.jsonl` and stays open until `profile-invocation complete`. | rc7:docs/context/ops-vs-missions.md | docs |
| R-80 | "if you can describe the entire task in one sentence and expect it done in one sitting, it's an Op. If you'd naturally want to write a spec for it, or if \"let's continue this tomorrow\" makes sense, it's a Mission." | same | docs (exact) |
| R-81 | Ad-hoc, interactive work can still use the charter: `spec-kitty charter context --action <action>` renders the governance for a step, and `init` writes an orientation block into the agent's instructions (e.g. `CLAUDE.md`) plus session-start and session-stop hooks. | `charter context --help`; this repo's `.claude/` | CLI + observed |
