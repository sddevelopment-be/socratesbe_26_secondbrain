#!/usr/bin/env node
/**
 * Every link in the per-page `.md` views must be absolute, and every same-site
 * one must resolve to a file in dist/. The toolkit's dockitty-assert-no-broken-links only reads HTML, and the
 * `.md` views rewrite their links (src/lib/page-views.ts), so this covers them.
 *
 *   node scripts/check-md-views.mjs <dist> <site-root-url>
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const [dist = 'dist', root = ''] = process.argv.slice(2);
if (!root) {
  console.error('usage: check-md-views.mjs <dist> <site-root-url>');
  process.exit(2);
}

const prefix = root.replace(/\/$/, '');

function* markdownFiles(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      // okf/ is the toolkit's own export, with its own links.
      if (path !== join(dist, 'okf')) yield* markdownFiles(path);
    } else if (name.endsWith('.md')) {
      yield path;
    }
  }
}

function resolves(href) {
  const path = decodeURIComponent(href.slice(prefix.length).split(/[#?]/)[0]).replace(/^\/+/, '');
  const target = join(dist, path);
  return existsSync(target) && (statSync(target).isFile() || existsSync(join(target, 'index.html')));
}

const broken = [];
let checked = 0;
for (const file of markdownFiles(dist)) {
  // Code fences and spans are examples, not links.
  const text = readFileSync(file, 'utf8').replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`/g, '');
  for (const [, href] of text.matchAll(/\]\(\s*([^)\s]+)/g)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith(`${prefix}/`)) continue;
    if (href.startsWith('#')) continue;
    checked++;
    // A relative or root-relative link cannot resolve from a .md view's address.
    if (!href.startsWith(`${prefix}/`) || !resolves(href)) broken.push(`${file}: ${href}`);
  }
}

if (broken.length > 0) {
  console.error(`✗ ${broken.length} broken link(s) in .md views:\n  ${broken.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ ${checked} same-site link(s) in .md views resolve`);
