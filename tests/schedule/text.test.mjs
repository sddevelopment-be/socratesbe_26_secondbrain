import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadSchedule } from '../../src/lib/schedule/model.mjs';
import { buildScheduleView } from '../../src/lib/schedule/view.mjs';
import { scheduleApi, scheduleMarkdown } from '../../src/lib/schedule/text.mjs';
import { OWNER, REPO, BRANCH, BASE, SITE } from '../../site.config.mjs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const ROOT = fileURLToPath(new URL('../../', import.meta.url));

const schedule = loadSchedule(join(ROOT, 'scripts/fixtures/schedule/valid'));
const template = readFileSync(join(ROOT, 'docs/_meta/templates/session-note.md'), 'utf8');
const published = '2026-10-23-event-storming';
const view = buildScheduleView({ schedule, publishedIds: new Set([published]), site: { owner: OWNER, repo: REPO, branch: BRANCH, base: BASE }, template });
const root = `${SITE}${BASE}`;
const ids = schedule.days.flatMap((d) => d.sessions.map((s) => s.id));
const text = scheduleMarkdown(view, root);

test('the text lists every session once, with its note state', () => {
  const tokens = [...text.matchAll(/\(id: ([^)]+)\)/g)].map((m) => m[1]);
  assert.deepEqual([...tokens].sort(), [...ids].sort());
  assert.match(text, new RegExp(`Notes: \\[published\\]\\(${root}/sessions/${published}\\.md\\) \\(id: ${published}\\)`));
  assert.match(text, /Notes: none \(id: 2026-10-23-is-tdd-dead\)/);
});

test('Markdown metacharacters in titles and descriptions are escaped; the id token stays parseable', () => {
  const tricky = structuredClone(schedule);
  const first = tricky.days[0].sessions[0];
  first.title = 'A *bold* [link](x) #1 <b> `c` a_b \\';
  first.description = 'See (id: fake) _now_';
  const out = scheduleMarkdown(buildScheduleView({ schedule: tricky, publishedIds: new Set(), site: { owner: OWNER, repo: REPO, branch: BRANCH, base: BASE }, template }), root);
  assert.ok(out.includes('**A \\*bold\\* \\[link\\]\\(x\\) \\#1 \\<b\\> \\`c\\` a\\_b \\\\**'), out);
  assert.ok(out.includes('See \\(id: fake\\) \\_now\\_.'), out);
  const tokens = [...out.matchAll(/\(id: ([^)\\\s]+)\)/g)].map((m) => m[1]);
  assert.deepEqual([...tokens].sort(), [...ids].sort());
});

test('every link is absolute under the site, the API is linked, no prefill URL appears', () => {
  const links = [...text.matchAll(/\]\(([^)]+)\)|<(https?:[^>]+)>/g)].map((m) => m[1] ?? m[2]);
  assert.ok(links.length >= 2);
  for (const link of links) assert.ok(link.startsWith(`${root}/`), link);
  assert.ok(text.includes(`Machine-readable: <${root}/api/schedule.json>`));
  assert.ok(!/github\.com\/[^ ]*\/new\//.test(text));
});

test('the API carries the same sessions, note states and no prefill URL', () => {
  const api = scheduleApi(view, root, `${root}/sessions/schedule/`);
  const sessions = api.days.flatMap((d) => d.sessions);
  assert.deepEqual(sessions.map((s) => s.id).sort(), [...ids].sort());
  assert.deepEqual(sessions.find((s) => s.id === published).note, { state: 'published', id: published, url: `${root}/sessions/${published}.md` });
  assert.deepEqual(sessions.find((s) => s.id === '2026-10-23-is-tdd-dead').note, { state: 'none', id: '2026-10-23-is-tdd-dead' });
  assert.ok(!JSON.stringify(api).includes('/new/'));
  assert.deepEqual(api.days.map((d) => d.date), ['2026-10-23', '2026-10-22']);
});
