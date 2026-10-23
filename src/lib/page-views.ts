/**
 * Machine views of a docs page, served next to the page itself:
 *
 *   /<slug>/        HTML (Starlight)
 *   /<slug>.json    the agent record, with HATEOAS `_links`
 *   /<slug>.yaml    the same record as YAML
 *   /<slug>.md      the page's Markdown, with its metadata as frontmatter
 *
 * The record comes from the toolkit's agent-page route (the one behind
 * /api/pages/<slug>.json), so every view says the same thing. These helpers
 * only re-point `self` and add `alternate` links between the views.
 */
import type { APIContext } from 'astro';
import { agentPageRoute } from '@spec-kitty/doc-toolkit/routes';
import { stringify } from 'yaml';

export const pageRoute = agentPageRoute();

export type View = 'json' | 'yaml' | 'markdown' | 'api';

type Link = { href: string; type?: string };
type PageRecord = Record<string, unknown> & {
  slug: string;
  markdown?: string;
  _links: Record<string, unknown>;
};

const TYPES = {
  json: 'application/json',
  yaml: 'application/yaml',
  markdown: 'text/markdown',
} as const;

/** The site root as an absolute URL without a trailing slash, base included. */
function siteRoot(ctx: APIContext): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${ctx.site?.origin ?? ''}${base}`;
}

/** URLs of every view of the page with route parameter `slug`. */
export function viewLinks(root: string, slug: string): Record<View, Link> {
  return {
    json: { href: `${root}/${slug}.json`, type: TYPES.json },
    yaml: { href: `${root}/${slug}.yaml`, type: TYPES.yaml },
    markdown: { href: `${root}/${slug}.md`, type: TYPES.markdown },
    api: { href: `${root}/api/pages/${slug}.json`, type: TYPES.json },
  };
}

/** The toolkit's record for this page, with `self` and `alternate` links for `view`. */
export async function pageRecord(ctx: APIContext, view: View): Promise<PageRecord> {
  const response = await pageRoute.GET(ctx);
  const record = (await response.json()) as PageRecord;
  const slug = String(ctx.params.slug);
  const links = viewLinks(siteRoot(ctx), slug);
  const { [view]: self, ...others } = links;
  record._links = {
    ...record._links,
    self,
    alternate: Object.values(others),
  };
  return record;
}

export function jsonResponse(record: PageRecord): Response {
  return new Response(JSON.stringify(record, null, 2), {
    headers: { 'Content-Type': `${TYPES.json}; charset=utf-8` },
  });
}

export function yamlResponse(record: PageRecord): Response {
  return new Response(stringify(record, { lineWidth: 0 }), {
    headers: { 'Content-Type': `${TYPES.yaml}; charset=utf-8` },
  });
}

/** The page's Markdown, its metadata and links restated as YAML frontmatter. */
export function markdownResponse(record: PageRecord): Response {
  const { markdown = '', ...meta } = record;
  const body = `---\n${stringify(meta, { lineWidth: 0 })}---\n\n${markdown.trimStart()}`;
  return new Response(body, {
    headers: { 'Content-Type': `${TYPES.markdown}; charset=utf-8` },
  });
}
