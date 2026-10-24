import { test } from 'node:test';
import matter from 'gray-matter';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { noteState, notePath, guideHref, templateUrl, startNotesUrl } from '../../src/lib/schedule/links.mjs';
import { OWNER, REPO, BRANCH } from '../../site.config.mjs';

const template = readFileSync('docs/_meta/templates/session-note.md', 'utf8');
const validator = join(process.cwd(), 'node_modules/.bin/dockitty-validate-frontmatter');
const base = { owner: OWNER, repo: REPO, branch: BRANCH, day: '2026-10-24', template };

function decode(url) {
  const q = new URL(url).searchParams;
  return { filename: q.get('filename'), value: q.get('value') };
}

function validate(id, body) {
  const root = mkdtempSync(join(tmpdir(), 'prefill-'));
  mkdirSync(join(root, 'docs/sessions'), { recursive: true });
  mkdirSync(join(root, 'docs/_meta'), { recursive: true });
  copyFileSync('docs/_meta/sections.yaml', join(root, 'docs/_meta/sections.yaml'));
  writeFileSync(join(root, 'docs/sessions', `${id}.md`), body);
  return spawnSync(validator, [join(root, 'docs')], { encoding: 'utf8' });
}

const titles = [
  '#legacy: TDD & why? "quoted" 🎉',
  'Mob programming in the wild',
  'Café crème: naïve résumé à la carte',
  'Back\\slash and $& dollar',
];

for (const title of titles) {
  test(`prefill for ${JSON.stringify(title)} passes the real validator`, () => {
    const { url, truncated } = startNotesUrl({ ...base, id: 'sample-id', title });
    assert.equal(truncated, false);
    assert.ok(url.length <= 4000);
    const { filename, value } = decode(url);
    assert.equal(filename, 'docs/sessions/sample-id.md');
    assert.match(value, /^updated: 2026-10-24T00:00:00Z$/m);
    assert.equal(matter(value).data.title, title);
    const r = validate('sample-id', value);
    assert.equal(r.status, 0, r.stdout + r.stderr);
  });
}

test('positive control: an unescaped #legacy title fails the validator', () => {
  const body = template.replace(/^title:.*$/m, 'title: #legacy');
  assert.notEqual(validate('sample-id', body).status, 0);
});

test('a 3,000-character title falls back to the file name only', () => {
  const r = startNotesUrl({ ...base, id: 'long', title: 'x'.repeat(3000) });
  assert.equal(r.truncated, true);
  assert.equal(r.url, `https://github.com/${OWNER}/${REPO}/new/${BRANCH}?filename=docs/sessions/long.md`);
});

test('note state and paths', () => {
  const published = new Set(['a']);
  assert.equal(noteState('a', published), 'published');
  assert.equal(noteState('b', published), 'none');
  assert.equal(notePath('/b', 'a'), '/b/sessions/a/');
  assert.equal(guideHref('/b'), '/b/guides/add-a-session-note/');
  assert.equal(templateUrl('o', 'r', 'main'), 'https://github.com/o/r/blob/main/docs/_meta/templates/session-note.md');
});
