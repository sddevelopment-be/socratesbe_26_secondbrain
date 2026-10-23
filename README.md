# SoCraTes BE 2026 — Second Brain

The shared second brain of [SoCraTes Belgium 2026](https://socratesbe.org/)
(22–25 October 2026, La Roche-en-Ardenne): session notes, ideas and learnings
from the unconference, collected in the open.

It is also a demonstration of a docsite that works for **humans and agents**.
The same Markdown tree renders as a SoCraTes-styled website for people and as
machine-readable surfaces for LLM agents:

| For humans | For agents |
|---|---|
| A searchable docsite with light and dark themes | `llms.txt`, an index written for language models |
| Sidebar navigation built from the sections | `api/index.json` plus one JSON record per page |
| Readable Markdown on GitHub | `rss.xml` and `sitemap-index.xml` |

Built with [DocKitty](https://github.com/spec-kitty/doc-kitty) (Astro +
Starlight, the Common Docs convention) and governed with
[Spec Kitty](https://github.com/spec-kitty/spec-kitty).

## Contribute

Were you there? Add your notes.

1. Create `docs/sessions/<short-slug>.md` (the GitHub web editor is fine).
2. Copy the frontmatter from
   [Add a session note](docs/guides/add-a-session-note.md).
3. Open a pull request.

Using an agent? Point it at [`AGENTS.md`](AGENTS.md) and see
[Working with agents](docs/guides/working-with-agents.md).

Write about ideas, not people: only name participants who agreed to be named.
The [code of conduct](https://confcodeofconduct.com/) applies here too.

## Run it locally

Requires Node ≥ 22.22 and pnpm (`corepack enable`). No registry token is
needed: the toolkit installs from its public GitHub repository.

```sh
pnpm install
pnpm dev        # http://localhost:4321/socratesbe_26_secondbrain/
pnpm validate   # frontmatter against the convention
pnpm lint:md    # Markdown syntax
pnpm links      # strict internal link check
pnpm build      # static site + llms.txt + RSS + agent API in dist/
pnpm spell      # UK English spelling (advisory)
```

CI (`.github/workflows/docsite.yml`) runs the same checks on every pull
request and deploys `main` to GitHub Pages.

## Layout

| Path | What it is |
|---|---|
| [`docs/`](docs) | The content: one folder per section, `README.md` as each section's index. |
| [`docs/_meta/`](docs/_meta) | Section registry, bibliography and tools catalogs. |
| [`src/theme/`](src/theme) | The SoCraTes BE chrome: tokens, header, footer. |
| [`src/pages/`](src/pages) | Route endpoints for RSS, `llms.txt` and the agent API. |
| [`.kittify/charter/`](.kittify/charter) | The Spec Kitty project charter. |
| [`AGENTS.md`](AGENTS.md) | Instructions for coding agents. |

## Licence

Code and content are MIT licensed (see [LICENSE](LICENSE)). The theme
recreates the look of socratesbe.org with its own tokens and a hand-drawn
ensō mark. No assets are copied from the SoCraTes BE site.
