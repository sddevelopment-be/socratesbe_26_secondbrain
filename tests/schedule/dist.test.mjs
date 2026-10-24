import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checkApiShape, expectedSessions, selfTest, parseHtml, scriptSet } from '../../scripts/check-schedule-dist.mjs';

test('the post-build checker detects every injected violation and passes the clean sample', () => {
  assert.deepEqual(selfTest(), []);
});

test('the reader handles quoted, unquoted and inline-script markup', () => {
  const html = '<div data-layout=list class="a b"><script>if (a<b) {}</script><li data-session-id=x></li></div>';
  const open = parseHtml(html).filter((t) => t.kind === 'open');
  assert.equal(open[0].attrs.get('data-layout'), 'list');
  assert.equal(open[0].closeIdx, parseHtml(html).length - 1);
  assert.equal(open.find((t) => t.name === 'li').attrs.get('data-session-id'), 'x');
  assert.equal(scriptSet(html).size, 1);
});

test('a note that cannot be parsed is reported, not read as "no note"; an absent note is not', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'schedule-dist-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, 'a.md'), '---\ndescription: [unclosed\n---\n');
  const schedule = { days: [{ sessions: [{ id: 'a', slot: '1' }, { id: 'b', slot: '1' }] }] };
  const problems = [];
  const found = expectedSessions(schedule, dir, dir, problems);
  assert.equal(found.length, 2);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /^\[note-unreadable\] the note for a /);
});

test('api-shape messages say what was expected', () => {
  const [problem] = checkApiShape({ schema_version: 2, page: 'x', rooms: [{}], days: [{}] }).filter((p) => p.includes('schema_version'));
  assert.match(problem, /expected 1/);
});
