import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadSchedule } from '../../src/lib/schedule/model.mjs';
import { buildScheduleView } from '../../src/lib/schedule/view.mjs';
import { OWNER, REPO, BRANCH, BASE } from '../../site.config.mjs';

const schedule = loadSchedule('scripts/fixtures/schedule/valid');
const template = readFileSync('docs/_meta/templates/session-note.md', 'utf8');
const site = { owner: OWNER, repo: REPO, branch: BRANCH, base: BASE };
const view = buildScheduleView({ schedule, publishedIds: new Set(['2026-10-23-event-storming']), site, template });
const day = (date) => view.days.find((d) => d.date === date);
const all = (d) => [...d.slots.flatMap((s) => s.sessions), ...d.sections.flatMap((s) => s.sessions)];
const find = (id) => view.days.flatMap(all).find((s) => s.id === id);

test('days run newest first, with weekday and snapshot', () => {
  assert.deepEqual(view.days.map((d) => d.date), ['2026-10-23', '2026-10-22']);
  assert.equal(day('2026-10-23').weekday, 'Friday');
  assert.deepEqual(day('2026-10-23').snapshot, { date: '2026-10-23', dateLabel: '23 October 2026', time: '21:47' });
});

test('a published note links to its page; a session without one gets a prefill URL', () => {
  const published = find('2026-10-23-event-storming');
  assert.equal(published.note.state, 'published');
  assert.equal(published.note.href, `${BASE}/sessions/2026-10-23-event-storming/`);

  const none = find('2026-10-23-is-tdd-dead');
  assert.equal(none.note.state, 'none');
  assert.equal(none.note.href, undefined);
  assert.match(none.startNotes.url, /\/new\/main\?filename=docs\/sessions\/2026-10-23-is-tdd-dead\.md&value=/);
  assert.equal(none.fallback.guideHref, `${BASE}/guides/add-a-session-note/`);
});

test('sessions sit in their slot or section, with headings and room facts in words', () => {
  const d = day('2026-10-23');
  assert.deepEqual(d.slots.find((s) => s.key === '1330').sessions.map((s) => s.id), [
    '2026-10-23-mob-programming',
    '2026-10-23-tdd-1',
    '2026-10-22-moved-across-days',
  ]);
  assert.deepEqual(d.sections.map((s) => [s.key, s.heading]), [
    ['outside', 'Outside'],
    ['other', 'Other / not yet scheduled'],
  ]);
  assert.equal(find('2026-10-23-run-session').start, '17:30');
  assert.deepEqual(find('2026-10-23-event-storming').location.room.facts, ['L room', 'projector']);
  assert.deepEqual(find('2026-10-23-is-tdd-dead').location.room.facts, ['S room']);
  assert.deepEqual(find('2026-10-23-run-session').location, { kind: 'place', label: 'Outside' });
  assert.equal(find('2026-10-23-is-ai-pro').uncertain, true);
  assert.equal(find('2026-10-23-event-storming').uncertain, false);
});

test('a session moved across days keeps the id it was first given', () => {
  assert.equal(find('2026-10-22-moved-across-days').slotKey, '1330');
  assert.ok(day('2026-10-23').slots.some((s) => s.sessions.some((x) => x.id === '2026-10-22-moved-across-days')));
  assert.equal(day('2026-10-22').slots[0].sessions.length, 1);
});

test('UK display dates, jump slots and the guide link', () => {
  const d = day('2026-10-23');
  assert.equal(d.dateLabel, '23 October 2026');
  assert.equal(d.snapshot.dateLabel, '23 October 2026');
  assert.ok(d.jumpSlots.every((s) => ['session', 'lunch', 'closing', 'dinner'].includes(s.type)));
});
