---
title: Add a session note
description: Start the notes for a SoCraTes BE session from the schedule in five minutes, from the GitHub web editor.
doc_status: active
type: Guide
kind: How-To
updated: 2026-10-23T00:00:00Z
tags: [contributing, sessions, frontmatter]
authors:
  - human:stijn
  - agent:claude
related:
  - sessions
---

# Add a session note

## 1. Start the notes

Open the [schedule](../sessions/schedule.md), find the session and choose
**Start the notes**. GitHub opens a new file, named after the session and
filled in from the template.

If that link does not work for you, copy the
[session note template](https://github.com/sddevelopment-be/socratesbe_26_secondbrain/blob/main/docs/_meta/templates/session-note.md)
into `docs/sessions/<session-id>.md`. The file name to use is shown next to
"copy the template" on the schedule.

If the file already exists, someone has started the notes. Add to that note
instead of creating another.

## 2. Write the note

First replace the one-sentence description at the top: the check fails if you
leave the example text. To credit yourself, remove the `#` in front of the two
`authors` lines and add your GitHub handle.

Then write the TL;DR and the sections you used, and delete the rest. A short
note is fine.

Write about ideas, not people. Do not add participant names, including the
convener's: write "the convener" or "a participant" instead. Your own handle
in `authors` is the only exception. Reviewers check for names before merging.

## 3. Propose the change

You need a GitHub sign-in for this step. Choose **Commit changes…**, then
choose a new branch and start a pull request (GitHub may call the button
**Propose changes**), then **Create pull request**. These button labels are to
be confirmed against GitHub ([issue #15](https://github.com/sddevelopment-be/socratesbe_26_secondbrain/issues/15)).
Someone else reviews the pull request and the checks run. A session note
is published when the pull request is merged: there is no draft step, and the
check fails for a draft note on a scheduled session.

No GitHub account? Post your notes in the
[SoCraTes Slack](https://socratesbe.org/slack/) and an organiser will add them.

## Keep the schedule current

The schedule is data in `docs/_meta/schedule/`, one file per day. When you edit
it:

- put double quotes around every text value: titles, ids, room keys, times and
  dates. Only `uncertain` is a bare `true` or `false`;
- do not use YAML comments or anchors;
- never change a session's `id`, unless you are removing a participant name
  from it. Then rename `docs/sessions/<old-id>.md` to the new id in the same
  pull request;
- run `pnpm check:schedule` and read the proofreading list for names.

A correct session looks like this:

```yaml
  - id: "2026-10-23-example-session"
    title: "Example Session"
    room: "sambre-meuse"
    slot: "1050"
```
