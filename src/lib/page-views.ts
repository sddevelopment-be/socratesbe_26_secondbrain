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
import { posix } from 'node:path';
import type { APIContext, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { pageSourceId, slugFromEntryId } from '@spec-kitty/doc-toolkit';
import { agentPageRoute } from '@spec-kitty/doc-toolkit/routes';
import { stringify } from 'yaml';
import { YAML_OPTIONS } from './yaml-view-options.mjs';
import { getScheduleView } from './schedule/source';
import { scheduleMarkdown } from './schedule/text.mjs';

const pageRoute = agentPageRoute();

/**
 * Top-level folders the toolkit writes into dist/: the agent API and the OKF
 * bundle. A page under one would put its views where the toolkit's own output
 * goes, and `okf/` is written last, so it would overwrite them silently.
 */
export const RESERVED_PREFIXES = ['api', 'okf'] as const;

/** The toolkit's page paths, refusing any page whose slug is under a reserved prefix. */
export const getStaticPaths = (async (options) => {
  const paths = await pageRoute.getStaticPaths(options);
  for (const { params, props } of paths) {
    const slug = String(params.slug);
    const prefix = RESERVED_PREFIXES.find((p) => slug === p || slug.startsWith(`${p}/`));
    if (!prefix) continue;
    const id = (props as { id?: string }).id;
    const file = (await getCollection('docs')).find((e) => e.id === id)?.filePath ?? slug;
    throw new Error(
      `[page-views] ${file}: the slug "${slug}" is under the reserved prefix "${prefix}/", ` +
        `which the toolkit writes to. Move or rename the page (see docs/adr/0002-per-page-machine-views.md).`,
    );
  }
  return paths;
}) satisfies GetStaticPaths;

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

/** The views' slug for a docs entry id, as the toolkit's routes name it ('home' for the root). */
export function viewSlug(entryId: string): string {
  return pageSourceId(slugFromEntryId(entryId));
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
  // The schedule page is drawn from data, so its text views carry the data too.
  if (slug === 'sessions/schedule') {
    record.markdown = `${record.markdown ?? ''}\n\n${scheduleMarkdown(await getScheduleView(), siteRoot(ctx))}`;
  }
  return record;
}

export function jsonResponse(record: PageRecord): Response {
  return new Response(JSON.stringify(record, null, 2), {
    headers: { 'Content-Type': `${TYPES.json}; charset=utf-8` },
  });
}

export function yamlResponse(record: PageRecord): Response {
  return new Response(stringify(record, YAML_OPTIONS), {
    headers: { 'Content-Type': `${TYPES.yaml}; charset=utf-8` },
  });
}

/**
 * Make the body's relative links absolute, since the `.md` view is served at
 * a different depth from both the source file and the HTML page. A link to
 * another docs file points at that page's `.md` view; any other relative link
 * (a generated file such as `./llms.txt`) is authored against the HTML route,
 * so it resolves against the page's `url`.
 */
async function absoluteLinks(ctx: APIContext, record: PageRecord, markdown: string): Promise<string> {
  const entries = await getCollection('docs');
  const id = (ctx.props as { id?: string }).id;
  const file = entries.find((e) => e.id === id)?.filePath;
  if (!file) return markdown;
  const slugByFile = new Map(entries.map((e) => [e.filePath, viewSlug(e.id)]));
  const root = siteRoot(ctx);
  const html = String(record.url);
  const rewrite = (text: string) =>
    text.replace(/(\]\(\s*)([^)\s]+)/g, (match, open: string, target: string) => {
      if (/^([a-z][a-z0-9+.-]*:|#|\/)/i.test(target)) return match;
      const [path, fragment] = target.split(/(?=#)/);
      if (path.endsWith('.md')) {
        const resolved = posix.join(posix.dirname(file), decodeURI(path));
        const slug = slugByFile.get(resolved);
        if (slug !== undefined) return `${open}${root}/${slug}.md${fragment ?? ''}`;
      }
      return `${open}${new URL(target, html).href}`;
    });
  // Code fences and spans are examples, not links: leave them as written.
  return markdown
    .split(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/)
    .map((part, i) => (i % 2 === 0 ? rewrite(part) : part))
    .join('');
}

/** The page's Markdown, its metadata and links restated as YAML frontmatter. */
export async function markdownResponse(ctx: APIContext, record: PageRecord): Promise<Response> {
  const { markdown: raw = '', ...meta } = record;
  const markdown = await absoluteLinks(ctx, record, raw);
  const body = `---\n${stringify(meta, YAML_OPTIONS)}---\n\n${markdown.trimStart()}`;
  return new Response(body, {
    headers: { 'Content-Type': `${TYPES.markdown}; charset=utf-8` },
  });
}
