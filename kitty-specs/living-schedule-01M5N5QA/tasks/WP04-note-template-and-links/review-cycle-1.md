---
affected_files: []
cycle_number: 1
mission_slug: living-schedule-01M5N5QA
reproduction_command:
reviewed_at: '2026-10-24T09:45:17Z'
reviewer_agent: claude
wp_id: WP04
---

# WP04 review feedback (cycle 1)

Everything else passes. Tests 7/7. `pnpm validate`, `pnpm lint:md` and `pnpm build` are green, and the built base and site are unchanged. Mutation checks were run on the title escaping, the backslash escaping, the quoting, the `updated` substitution, the `$` replacer and the 4,000 fallback, and each one turns the suite red. One blocking issue remains.

## Issue 1 (blocking, C-001): a first name in a test fixture

`tests/schedule/links.test.mjs` uses the accented title `'Café résumé: naïve Zoë'`. "Zoë" is a person's first name. C-001 and the WP prompt say "No participant names anywhere: data, identities, fixtures, tests". Reviewers cannot tell an invented name from a participant's name, so the project applies the rule to every name. WP01 set the precedent: its fixtures had to drop "Bob's Q&A" (commit 920212d).

Fix: replace the title with one that has accents and no person's name, for example `'Café crème: naïve résumé à la carte'`. The test still covers accented characters.

## Non-blocking notes (optional)

- The prefill tests check that the validator passes, but they never check that the parsed `title` equals the input. A bug that drops or mangles the title while keeping valid YAML would not be caught. If you want to strengthen this, parse `value` with `gray-matter` and assert `data.title === title` inside the existing loop, without adding a new test. I checked by hand that the round-trip is correct today.
- The evidence page says a typical link is "about 1,400" characters, while the contract says "812–1,232". With this template a 100-character ASCII title gives 1,427. Make the two numbers agree, or leave both alone.
- Implementer deviations, all accepted: `startNotesUrl` always returns `{url, truncated}` (one consistent shape); `fillTemplate` is exported and uses replacer functions (correct, because `$&` stays literal); `yamlQuote` folds CR/LF into a space (sensible); every row on the evidence page says "pending operator" (allowed, because FR-013b is in Slice 3).
