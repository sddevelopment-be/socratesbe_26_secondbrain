---
affected_files: []
cycle_number: 1
mission_slug: living-schedule-01M5N5QA
reproduction_command:
reviewed_at: '2026-10-23T22:41:54Z'
reviewer_agent: claude
wp_id: WP01
---

# WP01 review feedback (cycle 1) - changes requested

Overall the module is solid: 26/26 tests pass, imports are only `node:*`, `yaml`
and `gray-matter`, there is no `Date.now()` and no argument-less `new Date()`. The
valid fixture includes the cross-day move and a published note. Quoted `"No"`,
`"yes"`, emoji, `…` and `#` inside quotes give no false positives. A session whose id
prefix differs from its day passes. Mutation checks show these rules are guarded:
the comment rule, the unknown-field rule (i) and the draft rule (j), including the
"missing doc_status means draft" fallback. The issues below must be fixed before
approval.

## Issue 1 (blocking): one fault produces several findings (FR-019 "exactly one finding per fault")

When a referenced collection is faulty, every reference to it is also reported as
class (g):

- `rooms.yaml` with `rooms: []` gives 7 findings: `[b] the file has no rooms` plus
  6 `[g] unknown room ...`. `rooms.yaml` without a `rooms` key gives 8.
- A day with no `slots` gives `[d] the day has no slots` plus `[g] unknown slot '1930'`.
- A room with `key: ""` gives `[d] room key is empty` plus one `[g]` per session in
  that room. A slot with `key: ""` gives `[d]` plus `[g]`.

Cause: `checkRooms` returns `keys` as an empty or partial `Set`, and `checkDay`'s
`slotTypes` has the same problem. `validateSchedule` only skips the (g) room check
when `roomResult` is `null`.

Fix: suppress (g) for references that a reported fault has made unresolvable. For
example, pass `null` room keys when the rooms list is missing or empty. Register a
key whose value is faulty as "known but invalid", the way you already handle a slot
with an invalid `type` (`slotTypes.set(key, undefined)`). Add a must-fail patch
`b: rooms emptied` (`rooms.yaml`, expect exactly one `[b]`). The WP lists "no rooms"
as a class (b) fault, and this patch would have caught the cascade.

## Issue 2 (blocking): the YAML 1.1 versus 1.2 rule is untested and its only reachable path double-reports

- Mutation: replacing `if (!sameValue(a.value, b.value)) flag(...)` with
  `if (false) ...` leaves all 26 tests green. The patch
  `c: unquoted time (YAML 1.1 reads it as a number)` is caught by the quoting rule,
  not by the 1.1/1.2 comparison, so its name is misleading.
- Every plain value except `uncertain` is already flagged by the quoting rule. So the
  comparison only adds anything for keys, which are not quote-checked. There it
  double-reports. For example, adding `off: "x"` to a day file gives
  `[c] YAML 1.1 and 1.2 read this value differently` and `[i] unknown field 'off'`
  for the same fault.

Fix: when a key is flagged under (c), do not also report it under (i). One way is to
taint the key node and skip tainted keys in `fields()`. Then add a patch that reaches
this rule and only this rule, for example a session line `    no: "x"` (expect a
single `[c]` on that line). Rename the "unquoted time" patch to say what it proves:
an unquoted text value.

## Issue 3 (blocking): FR-001a and FR-001b validator limits have no guarding test

All 26 tests still pass under each of these mutations:

- `TITLE_MAX` and `DESCRIPTION_MAX` set to effectively unlimited. Only `ID_MAX` is
  caught, and only through `formIdentity`.
- The id-shape check reduced to `if (!m)`. That drops the calendar-date check
  (`2026-02-30-...`) and the 60-character limit in the validator.

These are behaviours of FR-001a and FR-001b, which are in this WP's
`requirement_refs`. Add must-fail patches that each produce exactly one finding:

- a title of 101 code points written with multi-byte characters, for example 101
  `🎉` (this also proves code points are counted, not UTF-16 units). Expect `[d]`;
- an id with an impossible date, for example `"2026-02-30-opening-circle"`. Expect `[f]`;
- an id of 61 characters. Expect `[f]`.

A description patch is optional if the title patch shares the same `text(..., max)`
path. Prefer extending `patches.mjs` over adding new test functions.

## Issue 4 (required, cheap): personal first name in fixture and test data (C-001)

The fixture title `"TDD #1: Bob's Q&A … 🎉"` (`2026-10-23.yaml` line 34, also used in
`patches.mjs`) and the `formIdentity` test `"TDD #1: Bob's Q&A"` contain a first
name. The review guidance says "no names in fixtures". Replace it with a non-name
that keeps the same punctuation coverage, for example `"TDD #1: the team's Q&A … 🎉"`.

## Non-blocking notes

- `formIdentity` strips combining marks with literal U+0300 and U+036F characters
  inside the regex (`/[̀-ͯ]/g`), which look blank in most editors. Write it as
  `/[̀-ͯ]/g`.
- An anchor on a scalar (`room: &r "ourthe"`) is accepted, although the message
  for non-scalars says anchors are not allowed. This is harmless, since an alias is
  caught. Either reject anchors (`node.anchor`) or reword the message.
- `orphanNotes` returns `[]` silently when `notesDir` is unreadable. Add a
  one-line comment explaining why (no notes directory means no orphans).

## Implementer deviations (judged)

1. Extra faults (lengths, enums, time/date patterns, room-key pattern, date not
   equal to the file name) reported as (d), and duplicate room/slot keys and
   equipment as (e): **acceptable**. FR-019 has no closer class. Please mention it
   in the module header so WP03's check output is explainable.
2. Missing or empty `slots` is (d), while empty sessions or rooms is (b):
   **acceptable**.
3. Finding shape `{class,file,line,message,text}`: **acceptable**.
4. `schedule: null` whenever any finding exists: **acceptable**. It is documented
   in the JSDoc.
5. `uncertain` is always present on normalised sessions (default false):
   **acceptable**.
6. (h) is reported at the session's first line, and (j) for a missing `doc_status`
   at line 1: **acceptable**.
7. Comments are found with the CST `Parser` instead of the `Lexer`:
   **acceptable**. The mutation proves the rule is guarded.
8. The template placeholder is passed into `checkNotes` by the caller:
   **acceptable**. This is what the WP specifies.
9. In the data-model.md example, the section session has no place:
   **acceptable for WP01**. The fixture adds a place. The data-model.md example
   `2026-10-23-is-ai-pro` (no `room`/`place`) needs fixing by the planner or the WP
   that owns that file. It is not in WP01's owned files.

## Anti-pattern checklist

1. Dead code: PASS. There are no production callers yet; WP03 and WP05 consume the
   module by design (foundation WP).
2. Synthetic fixture: PASS. All tests go through `validateSchedule`, `checkNotes`
   and `loadSchedule` on text-patched copies.
3. Silent empty return: PASS, with the `orphanNotes` note above.
4. FR coverage: FAIL. See Issue 3 (FR-001a length limits, FR-001b date and length
   in the validator).
5. Frozen surface: N/A.
6. Locked decision: PASS. There is no clock and there are no toolkit imports.
7. Shared-file ownership: N/A. Only WP01-owned files were changed.
8. Production fragility: PASS. `loadSchedule` throws by design (FR-019a).
