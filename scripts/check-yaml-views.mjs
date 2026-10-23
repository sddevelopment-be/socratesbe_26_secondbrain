#!/usr/bin/env node
/**
 * Every per-page `.yaml` view, and the frontmatter of every `.md` view, must
 * read back as the same record as the page's `.json` view, also under a
 * YAML 1.1 parser (PyYAML, gray-matter and js-yaml read an unquoted
 * `2026-10-23T00:00:00Z` as a date and `yes` or `on` as a boolean).
 * Each view is read twice, by `yaml` in 1.1 mode and by gray-matter (js-yaml 3),
 * so a flaw in the library that writes the views cannot hide itself.
 * Only `_links.self` and `_links.alternate` differ by view, so they are left out.
 *
 *   node scripts/check-yaml-views.mjs <dist>
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { inspect, isDeepStrictEqual } from 'node:util';
import matter from 'gray-matter';
import { parse } from 'yaml';

const [dist = 'dist'] = process.argv.slice(2);

function* yamlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      // api/ and okf/ are the toolkit's own output, not per-page views.
      if (path !== join(dist, 'api') && path !== join(dist, 'okf')) yield* yamlFiles(path);
    } else if (name.endsWith('.yaml')) {
      yield path;
    }
  }
}

/** The record without the links that name the view itself. */
function comparable({ _links: { self, alternate, ...links } = {}, ...rest }) {
  return { ...rest, _links: links };
}

const READERS = {
  'yaml 1.1': (text) => parse(text, { version: '1.1' }),
  'gray-matter': (text) => matter(`---\n${text}---\n`).data,
};

const mismatched = [];
let checked = 0;
for (const yamlPath of yamlFiles(dist)) {
  const base = yamlPath.slice(0, -'.yaml'.length);
  const expected = comparable(JSON.parse(readFileSync(`${base}.json`, 'utf8')));
  const { markdown, ...meta } = expected;
  const views = { [yamlPath]: [expected, readFileSync(yamlPath, 'utf8')] };
  if (existsSync(`${base}.md`)) {
    const frontmatter = readFileSync(`${base}.md`, 'utf8').match(/^---\n([\s\S]*?\n)---\n/)?.[1] ?? '';
    views[`${base}.md`] = [meta, frontmatter];
  }
  for (const [file, [want, text]] of Object.entries(views)) {
    checked++;
    for (const [reader, read] of Object.entries(READERS)) {
      const actual = comparable(read(text) ?? {});
      if (isDeepStrictEqual(actual, want)) continue;
      const keys = [...new Set([...Object.keys(want), ...Object.keys(actual)])].filter(
        (key) => !isDeepStrictEqual(want[key], actual[key]),
      );
      const detail = keys.map((key) => `${key}: ${inspect(actual[key])} (JSON view: ${inspect(want[key])})`);
      mismatched.push(`${file} (${reader})\n      ${detail.join('\n      ')}`);
    }
  }
}

// A build with no views would otherwise pass without checking anything.
if (checked === 0) {
  console.error(`✗ no .yaml views found under ${dist}`);
  process.exit(1);
}

if (mismatched.length > 0) {
  console.error(`✗ ${mismatched.length} YAML read(s) differ from the .json record:\n  ${mismatched.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ ${checked} YAML view(s) read back as their .json record (${Object.keys(READERS).join(', ')})`);
