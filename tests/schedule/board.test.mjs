import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSchedule } from '../../src/lib/schedule/model.mjs';

const DATA = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../docs/_meta/schedule');

test('the real Friday board has the counts the photograph gave (SC-001)', () => {
  const schedule = loadSchedule(DATA);
  const days = schedule.days.filter((d) => d.date === '2026-10-23');
  assert.equal(days.length, 1);
  const [friday] = days;
  const sessions = friday.sessions;
  assert.equal(sessions.length, 49);
  assert.equal(sessions.filter((s) => s.slot).length, 35);
  const sectioned = sessions.filter((s) => s.section);
  assert.equal(sectioned.length, 14);
  const bySection = (name) => sectioned.filter((s) => s.section === name);
  assert.equal(bySection('lunch-tables').length, 2);
  assert.equal(bySection('outside').length, 1);
  assert.equal(bySection('outside')[0].start, '17:30');
  assert.equal(bySection('evening').length, 4);
  assert.equal(bySection('other').length, 7);
  assert.deepEqual(schedule.rooms.map((r) => r.key), ['sambre-meuse', 'ourthe', 'ambleve', 'wamme', 'vesdre', 'lesse', 'semois', 'lhomme']);
  assert.equal(friday.slots.length, 10);
  const uncertain = sessions.filter((s) => s.uncertain);
  assert.equal(uncertain.length, 2);
  const questions = sessions.filter((s) => s.title.includes('?'));
  assert.ok(questions.length > 0 && questions.some((s) => !s.uncertain), 'a question-mark title is not uncertain');
});
