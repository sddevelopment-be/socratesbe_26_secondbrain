---
title: Add a session note
description: Create a page for a SoCraTes BE session in five minutes, from the GitHub web editor or your own machine.
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

## 1. Create the file

Add `docs/sessions/<short-slug>.md`. Use lowercase words joined by hyphens,
for example `docs/sessions/mob-programming-in-the-wild.md`.

## 2. Add the frontmatter

Copy this block to the top of the file and fill it in:

```yaml
---
title: Mob programming in the wild
description: One sentence that says what the session was about.
doc_status: draft        # change to `active` when the note is complete
type: Context
kind: Reference
updated: 2026-10-23T00:00:00Z
tags: [mob-programming, teams]
authors:
  - human:your-handle    # or leave yourself out
---
```

The fields matter beyond decoration. `title` and `description` appear in the
sidebar, the search results, `llms.txt` and the agent API. `tags` and
`related` connect your page to others.

## 3. Write the note

There is no required structure. These headings work well:

- **Convener and context:** who proposed it and why.
- **Key points:** what was said, shown or coded.
- **Open questions:** what is still unresolved.
- **Links:** slides, repositories, books, katas.

Write about ideas, not people. Only name participants who agreed to be named.

## 4. Link it

Add a line to the list on the [Sessions](../sessions/README.md) page. Use a
relative link to the Markdown file, such as `[My session](./my-session.md)`.
The build rewrites it to the right URL, and it also works on GitHub.

## 5. Open a pull request

Someone else reviews it, the checks run, and once it is merged the page is
live.
