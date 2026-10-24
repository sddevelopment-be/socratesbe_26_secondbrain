# Contract: the "Start the notes" link

Shown for a session whose note file `docs/sessions/<id>.md` does not exist.

## Shape

```
https://github.com/sddevelopment-be/socratesbe_26_secondbrain/new/main
  ?filename=docs/sessions/<id>.md
  &value=<encodeURIComponent(body)>
```

- `<id>` is the session identity (FR-001b).
- `body` is `docs/_meta/templates/session-note.md` with exactly two substitutions
  (FR-013): the title placeholder replaced by the session title, quoted as a YAML
  double-quoted string (escape `\` and `"`), and `updated:` set to the session's
  day (`<YYYY-MM-DD>T00:00:00Z`) so the link is deterministic and independent of
  the build time (C-006). Room and slot are not copied.
- The description placeholder stays; FR-019 (k) fails a merged note that still
  carries it.
- The site's `OWNER` and `REPO` come from `site.config.mjs`, shared with
  `astro.config.mjs`.
- The prefill link appears only in the phone list layout; table cells link to
  the session's list entry. The agent text views carry the note state, not the
  prefill link.

## Guarantees (tested)

1. Decoding `filename` yields `docs/sessions/<id>.md`.
2. Decoding `value` yields a document that passes `pnpm validate` unchanged,
   including for titles with `:`, `?`, `&`, `"`, emoji and a leading `#`.
3. The full link is at most 4,000 characters (titles are capped at 100 code
   points; measured links are 812–1,232 characters). If it would be longer, the link is
   emitted without `value` (file name only) and the check reports the session.
4. Next to the link, a plain fallback points to the template on GitHub and to the
   "Add a session note" guide (FR-013a).
5. For contributors without write access, GitHub's fork-and-propose flow applies;
   behaviour on desktop with write access, without write access and on a phone
   browser is recorded by hand (FR-013b).

## "Read the notes"

Shown when the docs collection contains entry `sessions/<id>` and
`isPublished(entry.data)` is true. The href is the site-relative page URL
(`<base>/sessions/<id>/`), so the build's link checks see it.
