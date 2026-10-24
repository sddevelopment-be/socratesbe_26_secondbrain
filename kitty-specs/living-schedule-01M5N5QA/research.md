# Research: Living schedule and session notes

Inputs: a pre-spec research squad (architect, toolkit researcher, designer,
adversarial reviewer), a post-spec review squad (anti-laziness reviewer,
requirements analyst, planner), and direct reads of the installed toolkit
(`@spec-kitty/doc-toolkit` 0.4.0), Starlight 0.42.6 and Astro 7.4. No dependency
is added, so no supply-chain review applies (DIRECTIVE_051).

## Decisions

### R-01 Where the schedule data lives

- **Decision**: `docs/_meta/schedule/rooms.yaml` (event-wide) and one file per day, `docs/_meta/schedule/<YYYY-MM-DD>.yaml`.
- **Rationale**: `docs/_meta/` is the convention's registry home (bibliography, tools, sections) and the docs loader excludes it, so the data never becomes a page. One file per day keeps pull requests small and localises merge conflicts during the event; identities are still checked for uniqueness across all files.
- **Alternatives**: one file for all days (simpler uniqueness, more conflicts); one file per session (no conflicts, more friction); a Markdown page (rejected by the operator).

### R-02 How the data is loaded

- **Decision**: a site-owned Astro loader backed by a pure `model.mjs` that parses with `yaml` and throws on unreadable, empty or invalid data.
- **Rationale**: Astro's `file()` loader logs a YAML parse error and returns an empty collection (the build stays green), skips items without an id, and only warns on duplicate ids (`astro/dist/content/loaders/file.js`). A malformed schedule would deploy as an empty grid.
- **Alternatives**: copying the toolkit's bibliography pattern (`file()`), rejected for the reason above.

### R-03 How the page renders

- **Decision**: a regular docs page `docs/sessions/schedule.md` with `kind: Schedule`, rendered by a theme kind layout registered in `src/theme/index.ts` (`layouts: { Schedule: … }`), with `template: splash` and `tableOfContents: false` for full width.
- **Rationale**: Theme layouts merge over the toolkit's base kind registrations (`lib/manifest.ts`); `Hub` uses the same seam. A docs page keeps search, sidebar, `llms.txt`, frontmatter validation and the draft policy. The docs schema extends Starlight's, so `template` and `tableOfContents` are valid frontmatter. `kind` is an open vocabulary: an unknown kind is a non-fatal `pnpm validate` warning by toolkit design (ADR-0009); the TypeScript `Kind` type needs a local cast.
- **Alternatives**: a custom `StarlightPage` route (outside the collection: no `llms.txt`, views, draft policy or link gates); MDX (adds `@astrojs/mdx`, and agent views would show the component tag); a remark directive (no dependency tracking, so stale in dev, and cannot use `getCollection`).
- **Divergence resolved**: two squad members favoured a custom route for full width; `template: splash` gives full width without leaving the collection.

### R-04 Phone and wide layouts

- **Decision**: a per-slot card list by default and a real table from about 64rem, swapped with CSS (`display: none` removes the hidden one from the accessibility tree); the table has `class="not-content"`, a `<caption>`, `<th scope="col">` rooms and `<th scope="row">` slots, sits in a `role="region"` scroll wrapper with `tabindex="0"`, and has a sticky slot column. The hidden layout carries `data-pagefind-ignore`.
- **Rationale**: Starlight's Markdown table rule (`display: block; overflow: auto`) can strip table semantics; an 8-room table needs about 1250px, so phones need the list.
- **Alternatives**: a horizontally scrolling table on phones (five screens of scrolling); ARIA `grid` (wrong for static data).

### R-05 Session identity

- **Decision**: `<YYYY-MM-DD>-<title-slug>`, lowercase ASCII letters, digits and single hyphens, accents removed, other characters dropped, at most 60 characters, unique across days and existing files in `docs/sessions/`, `-2`/`-3` on collision, reserved names rejected; formed once and stored explicitly in the data, never recomputed.
- **Rationale**: Notes are joined by file name; identities derived at build time would orphan notes on a title fix. Storing the identity makes moves and renames safe (FR-014). The only allowed change is removing a participant name (FR-014a).
- **Alternatives**: room/slot-based ids (break on moves); a frontmatter back-reference in notes (the toolkit's docs schema strips unknown keys).

### R-06 Note state and drafts

- **Decision**: two states. "Read the notes" when the docs collection contains `sessions/<identity>` and `isPublished(entry.data)` is true; otherwise "Start the notes". A draft note for a scheduled session fails the PR check (FR-019 j).
- **Rationale**: Production builds drop drafts (`DK_PUBLISH_DRAFTS=off` in `.env.production`), dev keeps them; deciding with `isPublished` keeps both consistent. Failing on drafts keeps the operator's "publish on merge, no in-progress state" decision and avoids "Start the notes" pointing at an existing file.
- **Alternatives**: a third "Continue the notes" state (contradicts the decision); ignoring drafts (duplicate-file trap).

### R-07 Prefilled note link

- **Decision**: `https://github.com/<owner>/<repo>/new/main?filename=docs/sessions/<identity>.md&value=<urlencoded template>`, with the title only; capped at 4,000 characters (fallback: filename only, reported by the check); a plain fallback link to the template and guide next to it; three manual runs recorded as evidence (FR-013b).
- **Rationale**: The prefill is undocumented but long-standing; for non-collaborators GitHub forks and proposes a PR, which must be verified by hand. Practical URL limits are around 8 KB server-side.
- **Alternatives**: no prefill (more friction); a GitHub issue form (adds a maintainer step).

### R-08 Agent parity

- **Decision**: `src/pages/api/schedule.json.ts` (next to `api/bibliography.json`); the schedule as Markdown text spliced into the schedule page's record in `src/lib/page-views.ts` `pageRecord()` (the one seam feeding `.md`, `.json`, `.yaml` and `api/pages`); a post-build parity and collision check. File an upstream doc-kitty issue for a generic data-backed agent include, after which the splice can go.
- **Rationale**: The page views serve the raw Markdown body; a layout-rendered grid would be invisible to agents. `llms.txt` and `api/index.json` have no hook for extra resources, so the page's text links the JSON.
- **Spec correction**: FR-021 originally said "outside the reserved `api/` prefix". The reservation applies to *pages*, whose views would collide with toolkit output; a site route under `api/` (as `bibliography.json` already is) cannot collide with any page. FR-021 is amended to place the schedule at `api/schedule.json`.

### R-09 Validation placement

- **Decision**: `scripts/check-schedule.mjs` as its own named CI step before the build (and in `pnpm check`), plus the loader failing the build, plus `scripts/check-schedule-dist.mjs` after the build in `check:dist`.
- **Rationale**: Contributors get a legible failure before a long build; the build cannot deploy bad data even if the step is skipped; output-level properties (no-JS, parity) can only be checked on `dist/`.

### R-10 YAML 1.1 versus 1.2

- **Decision**: the check reads each file under both the YAML 1.2 core schema and YAML 1.1 rules and fails where they differ or read as null (FR-019 i), which in practice forces quoted times, dates and booleans-looking words.
- **Rationale**: `yaml@2` reads `13:30` as a string, while YAML 1.1 readers (gray-matter, PyYAML) read it as 810; both read `title: #x` as null. Agents fetching raw data would get wrong values. PR #10 hit the same class of bug; `scripts/check-yaml-views.mjs` is the precedent.

### R-11 Testing without new dependencies

- **Decision**: `node:test` for pure modules; fixture self-tests in the check script; post-build checks over `dist/`. No browser automation in CI.
- **Rationale**: C-004 forbids new dependencies; built-output checks give a positive control (session count) for the no-JS claim.

### R-12 Board inventory (Friday 23 October 2026)

Counted from the operator's transcription (not committed, C-002):

| Item | Count |
|---|---|
| Rooms | 8: 4 with a projector (2 XL, 2 L), 1 L with a screen, 3 S with no equipment |
| Slots | 10: 7 session slots (10:50, 11:40, 13:30, 14:30, 15:30, 16:30, 17:30), lunch 12:30, closing 18:30, dinner 19:30 |
| Sessions in the grid | 35 (up to 3 per cell) |
| Sessions in sections | 14: Lunch tables 2, Outside 1 (17:30), Evening 4, Other / not yet scheduled 7 |
| **Sessions total** | **49** |
| Decorative lunch stickies | 8 (not transcribed) |
| Uncertain sessions | 2 (cut off) |

The identity checklist of the 49 sessions is produced with the transcription work
and kept in the mission folder (titles and identities only; no names).

## Squad findings and dispositions

| Finding | Source | Disposition |
|---|---|---|
| `file()` swallows parse errors; duplicate ids only warn | adversary, architect | Adopted (R-02, FR-019a) |
| Custom route vs docs page | designer, adversary vs architect, researcher | Resolved for docs page + kind layout (R-03) |
| YAML 1.1/1.2 drift, `#` titles read as null | adversary, anti-laziness | Adopted (R-10, FR-019 c, i) |
| Draft note causes duplicate "Start the notes" | analyst, anti-laziness, architect | Adopted as a failing check (R-06, FR-019 j) |
| Machine view path collisions | anti-laziness, adversary | Adopted (R-08, FR-021b); `api/` placement corrected |
| Text view is a placeholder unless spliced | researcher, architect, planner | Adopted in-repo (R-08); planner's deferral rejected because the site seam exists |
| Hub already lists children; manual list is a third index | all | Adopted (FR-016) |
| Identity rule, uncertain definition, Dinner, Outside time, weekday hint | analyst | Adopted in spec (FR-001a/b, FR-002a, FR-008) |
| Colours and "framed" | designer, adversary | Dropped by operator decision |
| "Now / next" highlight | designer | Out of scope by operator decision |
| One-PR scope and cut order | planner | Adopted (spec Delivery Slices) |
| PR #14 conflicts with the guide | planner, analyst | Guide and AGENTS.md last, after rebase (IC-08) |
| Proofreading list in checks summary, every free-text field | adversary, anti-laziness | Adopted (FR-020) |
| Orphan warning firing forever on the old note | anti-laziness | Adopted: only date-prefixed files warn (FR-024) |
| Upstream generic agent include | architect, researcher | Follow-up issue on spec-kitty/doc-kitty |
| `editLink` for every page ("Edit this page") | designer | Not adopted in this mission (out of the confirmed scope); candidate follow-up |

## Post-plan review (2026-10-23) and dispositions

Three lenses (brownfield seams, verification realism with experiments,
contract-vs-spec traceability), all READY_WITH_FIXES.

| Finding | Disposition |
|---|---|
| Identity uniqueness against note files makes every session fail once its note merges; date-prefix-equals-day contradicts cross-day moves | Fixed: uniqueness across schedule data only; prefix is the day first added (FR-001b, FR-014, data model) |
| A name in a YAML comment, or `#1` in an unquoted title, passes every planned check (proved by experiment) | Fixed: writing rules in FR-019 (c): no comments, quoted strings, bare booleans, 1.1/1.2 agreement |
| Wrong types read identically by both YAML versions (`slot: 1050`, a title `42`) and overlapping classes | Fixed: quote-everything rule; class order and exactly-one-finding per fault |
| Parity and note-link checks compare empty sets on real data | Fixed: fixture build with published, draft and missing notes; non-empty sets equal to the data |
| No-JS check meaningless because every page carries Starlight scripts | Fixed: script set ⊆ control page; nothing script-like inside `[data-schedule]`; per-layout counts |
| Post-build checker has no self-test | Fixed: NFR-007 extended |
| Unit tests never run in CI; `node --test tests/` fails on Node 24 | Fixed: `node --test "tests/**/*.test.mjs"` as a named CI step (NFR-008) |
| `isPublished` not importable outside Astro | Fixed: published ids passed in by `source.ts`; the check copies the toolkit rule with a test |
| Must-fail fixtures built from objects lose quoting | Fixed: fixtures as text patches on the valid fixture |
| Two-day build: temporary fixture leaves FR-010 unguarded | Fixed: permanent fixture build step via `SCHEDULE_DATA_DIR`, sentinel absent from `dist/` |
| `template: splash` does not give full width and removes the phone menu | Fixed: normal frame, scrolling table region |
| Custom loader needs a dev watcher; validation could exist four times | Fixed: no collection loader; `model.mjs` is the only validator, called while rendering |
| Three renderers join the data separately | Fixed: one `buildScheduleView` in `view.mjs` |
| Prefill links duplicated across layouts and views | Fixed: list layout only; not in text views |
| Owner/repo hard-coded twice | Fixed: `site.config.mjs` |
| Slice 1 contradicts the unchanged guide and AGENTS.md | Resolved by operator: PR #14 merged, branch rebased, FR-023 moved to slice 1 |
| Template description placeholder could ship as a stub | Fixed: FR-019 (k) |
| `place` undefined | Fixed: free-text display label, proofread |
| Upstream: export `isDraftStatus` as `.mjs`; open the `Kind` type; generic data include | Follow-up issues on spec-kitty/doc-kitty |

## Implementation decision (2026-10-24, during WP06)

- **Sections outside the layout swap.** The board's sections (Lunch tables, Outside,
  Evening, Other / not yet scheduled) render in one shared block after the
  phone list and the wide table, visible at every width, so FR-007 holds on
  desktop. The phone list (`data-layout="list"`) and the table
  (`data-layout="table"`) each contain every **timed** session exactly once;
  section sessions appear once, in the shared block (`data-layout="sections"`).
- **Table cells carry their own note action.** Linking table titles to anchors in
  the hidden list does nothing on wide screens. Each table cell shows the title
  and a compact "Read the notes" or "Start the notes" link (with the same
  fallback rules); the extra prefill weight is about 1 KB gzipped per day,
  measured in the post-plan review. Supersedes plan.md "Prefill weight".
- WP07's count and no-JS checks follow this: list ∪ sections and table ∪ sections
  each equal the data set; each layout holds each of its sessions once.
