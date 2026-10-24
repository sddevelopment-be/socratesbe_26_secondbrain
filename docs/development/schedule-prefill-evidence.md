---
title: Schedule prefill evidence
description: Hand-recorded results of the "Start the notes" prefill link on desktop, without write access and on a phone browser.
doc_status: active
type: Operations
kind: Reference
updated: 2026-10-24T00:00:00Z
tags: [schedule, sessions, verification]
---

# Schedule prefill evidence

GitHub does not document the `value` parameter of its "new file" page, so the
"Start the notes" link is checked by hand. Each run opens a prefill link for a
real session and records whether the editor kept the filename and the body.

The link shape is fixed by the start-notes contract: the `new/main` editor with
`filename=docs/sessions/<id>.md` and `value=<encoded template>`. The automated
tests prove that the decoded body passes the frontmatter validator and that
links stay under 4,000 characters (about 800–1,500 characters for typical titles; the cap is 4,000, with a filename-only fallback beyond it). They cannot
prove that GitHub honours the link.

| Run | Date | Prefill survived | Notes |
| --- | --- | --- | --- |
| Desktop browser, account with write access | pending operator | pending operator | Open the link signed in; check filename, title, `updated` and headings. |
| Account without write access (fork flow) | pending operator | pending operator | Check that the fork-and-propose flow keeps the prefilled body. |
| Phone browser | pending operator | pending operator | Check that the long link is not truncated by the browser or messenger. |

The runs are tracked in
[issue #15](https://github.com/sddevelopment-be/socratesbe_26_secondbrain/issues/15).

If a run fails, the fallback beside the link still works: the template on
GitHub and the "Add a session note" guide.
