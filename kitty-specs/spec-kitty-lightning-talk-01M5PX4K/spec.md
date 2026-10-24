# Mission Specification: Documentation Project - Spec Kitty lightning talk (mission run)

**Mission Branch**: `feat/demo-mission`
**Created**: 2026-10-24
**Status**: Draft
**Mission**: documentation
**Input**: User description: "Documentation mission (demo, comparison run). Goal: produce a new lightning-talk slide deck on the hub (docs/presentations/) and a new session page (docs/sessions/) explaining Spec Kitty and how to run a first mission in a new repository, briefly touching on creating a repo charter. Audience: developers, some using AI agents daily and some new to them; 15-minute lightning slot; takeaways: how to start tomorrow, and the full mission lifecycle. The session page needs an overview, a recap skeleton with 'What people wanted to learn' and 'What people learned' sections, and annotated references (why each matters) in frontmatter. Sources: local Spec Kitty clone, https://spec-kitty.ai/, https://github.com/spec-kitty/spec-kitty-charter. Constraint: the earlier ad-hoc version stays untouched as a reference for comparison; the mission's output must use new file paths."

## Purpose

A presenter explains Spec Kitty to developers at SoCraTes BE 2026 in a
15-minute lightning slot. The same deliverable was first produced ad hoc
(commit `26879d8`). This mission produces it again through the governed
documentation workflow, so the two outputs and the two processes can be
compared side by side.

## Documentation Scope

**Iteration Mode**: `mission_specific`: one talk and its session page, not a documentation suite.
**Target Audience**: Developers. Mixed audience, flagged: (a) daily users of AI coding agents; (b) experienced crafters who are new to, or sceptical of, agentic coding. Both are working developers; neither needs product or management framing.
**Selected Divio Types**: Deck: explanation (why specs before code) and how-to (start tomorrow). Session page: reference (overview, commands, annotated references) plus a recap skeleton.
**Languages Detected**: Markdown content in a JavaScript (Astro) docsite; no API reference generation.
**Generators to Use**: None. Content is hand-written Markdown rendered by the existing docsite.

### Domain Language

| Term | Meaning in this mission | Avoid |
|---|---|---|
| the hub | this second-brain docsite; Presentations and Sessions sections | "the wiki", "the portal" |
| deck | a full-screen slide page in the Presentations section, with speaker notes | "slides file", "PowerPoint" |
| session page | a Sessions page describing one unconference session | "minutes", "transcript" |
| mission | inside the talk: a Spec Kitty mission, the unit of tracked work | using it for this mission's own process |
| work package (WP) | one bounded slice of a mission | "ticket", "story" |
| consolidate | the step that lands a mission's work on the target branch | "merge" as the command name (renamed in 4.0) |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start tomorrow (Priority: P1)

A developer in the room wants to try Spec Kitty on their own repository the
next working day, without rewatching the talk.

**Why this priority**: The audience named "how to start tomorrow" as a primary
takeaway; it is the outcome that turns a talk into adoption.

**Independent Test**: A developer who did not attend follows only the session
page and the deck's "start" section on a fresh repository and reaches a
created mission specification without consulting other sources.

**Acceptance Scenarios**:

1. **Given** a developer with a supported coding agent and an empty repository, **When** they follow the start-tomorrow steps in order, **Then** they install the tool, initialise the repository, make the first commit, create a charter and start a first mission.
2. **Given** a developer who skips the first Git commit, **When** they read the steps, **Then** the material has already warned them that initialisation does not create a commit.

---

### User Story 2 - Understand the lifecycle (Priority: P1)

A developer wants to know what happens between "I have an idea" and "it is
merged", who acts at each step, and what file each step leaves behind.

**Why this priority**: "The full mission lifecycle" is the second primary takeaway.

**Independent Test**: After the talk, a listener can name the lifecycle steps
in order and the main artefact of the first three steps.

**Acceptance Scenarios**:

1. **Given** the deck, **When** a reader reaches the lifecycle section, **Then** they see every step from specify to consolidate in order, with the human decision points marked.
2. **Given** a reader new to agents, **When** they read about review, **Then** it is clear that the reviewer is not the author and that a human makes the final call.

---

### User Story 3 - Find out more and record the session (Priority: P2)

After the session, participants want the links, and want to add what they
learned, without inventing content.

**Why this priority**: The session page is the second brain's record; it
outlives the talk.

**Independent Test**: The session page lists every reference with a reason it
matters, and offers empty recap sections a participant can fill in.

**Acceptance Scenarios**:

1. **Given** the published session page, **When** a participant opens it, **Then** they find an overview, the commands in one place, a recap with "What people wanted to learn" and "What people learned", and annotated references.
2. **Given** an agent reading the agent API, **When** it fetches the session page, **Then** each reference carries its reason as structured metadata.

### Edge Cases

- The Spec Kitty docs and the installed CLI disagree (for example `merge` versus `consolidate`, or a documented `charter sync` that the CLI lacks): the installed CLI wins, and the discrepancy is recorded in the mission's research notes.
- The charter overhaul is proposed, not shipped: the material says so and does not present it as current behaviour.
- A presenter runs short of time: the deck can skip whole sections without losing the two primary takeaways.
- A listener knows none of the vocabulary: every Spec Kitty term on a slide is explained in plain words on that slide or its notes.

## Requirements *(mandatory)*

### Functional Requirements

| ID | Requirement | Status | Delivery | No-op passable? |
|---|---|---|---|---|
| FR-001 | A new deck exists in the Presentations section at a path not used by the ad-hoc run, and opens as a full-screen slide deck with speaker notes on every slide. | Proposed | [build] | no |
| FR-002 | The deck explains, in its own section, why to write specs before letting agents code. | Proposed | [build] | no |
| FR-003 | The deck gives the start-tomorrow steps in order: prerequisites, install, initialise, first commit, verify, charter, first mission. | Proposed | [build] | no |
| FR-004 | The deck briefly explains what a repository charter is, how one is created, and gives one concrete principle from this project's charter. | Proposed | [build] | no |
| FR-005 | The deck presents the full mission lifecycle from specify to consolidate, with the artefact of each step and the points where a human decides. | Proposed | [build] | no |
| FR-006 | The deck explains work packages, parallel worktrees and the status board in plain words. | Proposed | [build] | no |
| FR-007 | A new session page exists in the Sessions section at a path not used by the ad-hoc run, with a session overview and the commands in one place. | Proposed | [build] | no |
| FR-008 | The session page has a recap section with empty "What people wanted to learn", "What people learned" and "Open questions" subsections. | Proposed | [build] | no |
| FR-009 | The session page's metadata lists every reference with a short note on why it matters to this audience. | Proposed | [build] | no |
| FR-010 | Both pages carry an audience entry describing the developer audience and the 15-minute format. | Proposed | [build] | no |
| FR-011 | Both pages are published and the session page is listed on the Sessions hub; the deck and session page link to each other. | Proposed | [build] | no |
| FR-012 | The mission keeps its own research notes, gathered fresh from the three named sources, with a source for each fact the deliverables rely on. | Proposed | [build] | no |

### Non-Functional Requirements

| ID | Requirement | Threshold | Status |
|---|---|---|---|
| NFR-001 | The talk fits the lightning slot. | Speaker-note timings total 15 minutes or less; at most 16 slides. | Proposed |
| NFR-002 | Command accuracy. | 100% of commands shown on slides or the session page exist in spec-kitty-cli 4.0.0rc8. | Proposed |
| NFR-003 | Source traceability. | Every factual claim about Spec Kitty in the deliverables maps to at least one entry in the mission's research notes. | Proposed |
| NFR-004 | Accessibility. | Every diagram has a title and a description; heading levels do not skip. | Proposed |
| NFR-005 | Writing standard. | UK English; zero spelling issues in the project spell check. | Proposed |

### Constraints

| ID | Constraint | Status |
|---|---|---|
| C-001 | The ad-hoc deck and session page from commit `26879d8` are not modified, moved or deleted. | Active |
| C-002 | No participant names appear anywhere: not as convener, speaker, attendee or quote source. Only contributors' own handles in `authors`. | Active |
| C-003 | No invented session content: the recap subsections stay empty until participants fill them. | Active |
| C-004 | Published pages do not link to draft pages, including the ad-hoc drafts. | Active |
| C-005 | Proposed or unshipped Spec Kitty features (such as the charter overhaul) are labelled as such. | Active |
| C-006 | Work lands on `feat/demo-mission`, through a pull request reviewed by a human. | Active |
| C-007 | The deliverables pass the project quality gates: frontmatter validation, Markdown lint, link checks before and after the build, type check and a clean build. | Active |

### Key Entities

- **Deck**: a slide page with sections, slides and speaker notes; its metadata is readable by agents.
- **Session page**: a record of one session: overview, recap skeleton, annotated references.
- **Annotated reference**: a link with a title and a note on why it matters to this audience.
- **Research note**: a sourced fact about Spec Kitty, with any doc/CLI discrepancy recorded.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer who did not attend can go from an empty repository to a created mission specification using only the session page and the deck, in under 30 minutes. — [build] · no-op passable: no
- **SC-002**: A listener can name the seven lifecycle steps in order after the talk. — [build] · no-op passable: no
- **SC-003**: Every reference on the session page has a reason it matters. — [build] · no-op passable: no
- **SC-004**: 100% of commands shown work on the installed tool version. — [build] · no-op passable: no
- **SC-005**: Zero participant names and zero invented recap content in the deliverables. — [ratchet] · no-op passable: yes (positive control: the reviewer reads both pages for names, and checks the recap subsections are empty)
- **SC-006**: The talk runs in 15 minutes or less at the noted timings. — [build] · no-op passable: no

### Quality Gates

- All diagrams have a title and description.
- Heading hierarchy is proper (no skipped levels).
- No broken internal links, before or after the build.
- Spelling is correct in UK English.
- A human reviewer proofreads for participant names.

## Assumptions

- **ASM-001**: The presenter runs the deck from the hub (live site or a local preview).
- **ASM-002**: The audience has a laptop and a supported coding agent; the talk does not cover choosing a model provider.
- **ASM-003**: spec-kitty-cli 4.0.0rc8 is the version to describe; the local clone and the public docs may lag it.
- **ASM-004**: The session has not happened yet; the recap is filled in afterwards by participants.

## Out of Scope

- Modifying, replacing or deleting the ad-hoc deck and session page.
- A hands-on workshop, exercises or a recorded demo.
- Spec Kitty's hosted products (team knowledge, early-access services) beyond a passing mention.
- Pricing, model choice, and agent comparisons.
- Translation into other languages.
- Writing the comparison between the two runs (a follow-up, after both outputs exist).
