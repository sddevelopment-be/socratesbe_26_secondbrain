# Quickstart: Living schedule and session notes

## See it locally

```bash
pnpm install
pnpm check:schedule      # validate docs/_meta/schedule/*.yaml (prints the proofreading list)
pnpm dev                 # open /socratesbe_26_secondbrain/sessions/schedule/
```

## Add a day's board

1. Copy `docs/_meta/schedule/2026-10-23.yaml` to `docs/_meta/schedule/<YYYY-MM-DD>.yaml`.
2. Set `date` (equal to the file name) and `snapshot` (board photo time, local).
3. Replace `slots` and `sessions`. For each session:
   - `id`: the date, then the title in lowercase ASCII words joined by hyphens
     (accents removed, other characters dropped, at most 60 characters). If it
     is taken, add `-2`.
   - `title` and optional `description` exactly as on the sticky, **without any
     participant name**. Public figures, products and mascots may stay.
   - Either `room` (a key from `rooms.yaml`) or `place`; either `slot` (a slot
     key) or `section` (`lunch-tables`, `outside`, `evening`, `other`), with an
     optional `start` time for a section session.
   - `uncertain: true` only when the sticky was cut off or illegible.
4. Double-quote every text value (titles, ids, keys, times, dates); only `uncertain` is a bare `true` or `false`. No comments.
5. Run `pnpm check:schedule`; read the proofreading list for names.
6. Open a pull request with a generic title, for example "Add the Saturday board".

The day switcher appears by itself once two days exist; the newest day shows first.

## Move or rename a session

Change only its `room`, `slot`, `section`, `start` or `title`. Never change its
`id`, unless you are removing a participant name from it; then rename
`docs/sessions/<old-id>.md` to the new id in the same pull request.

## Start notes for a session

On the schedule, choose **Start the notes**. GitHub opens a new file
`docs/sessions/<id>.md` with the template. Fill in the TL;DR and the sections you
used, delete the rest, and propose the change. The note is published when the
pull request is merged. No GitHub account? Post your notes in the SoCraTes Slack.

## Checks that run on every pull request

| Check | Fails when |
|---|---|
| Schedule data (`pnpm check:schedule`) | any FR-019 class: unreadable, empty, missing or null field, duplicate or malformed id, unknown room/slot/day, both or neither of room/place or slot/section, unknown field, YAML 1.1/1.2 disagreement, draft note for a scheduled session |
| Build (`pnpm build`) | unreadable or empty schedule data |
| Built site (`pnpm check:dist`) | session count differs from the data, a jump or day link is broken, page/JSON/text views disagree, two outputs share a path, a prefill link exceeds 4,000 characters |
