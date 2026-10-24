import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CLASSES,
  checkNotes,
  formIdentity,
  loadSchedule,
  orphanNotes,
  validateSchedule,
} from '../../src/lib/schedule/model.mjs';
import { TEMPLATE_DESCRIPTION, patches } from '../../scripts/fixtures/schedule/patches.mjs';

const VALID = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../scripts/fixtures/schedule/valid');
const MOVED_ID = '2026-10-22-moved-across-days';

function copyFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'schedule-model-'));
  fs.cpSync(VALID, dir, { recursive: true });
  return dir;
}

function applyPatch(dir, patch) {
  const file = path.join(dir, patch.file);
  const src = fs.readFileSync(file, 'utf8');
  assert.equal(src.split(patch.find).length - 1, 1, `${patch.name}: find must occur exactly once`);
  fs.writeFileSync(file, src.replace(patch.find, () => patch.replace));
}

/** Everything the PR check would report for a schedule directory. */
function allFindings(dir) {
  const { findings, schedule } = validateSchedule(dir);
  if (!schedule) return findings;
  const ids = schedule.days.flatMap((d) => d.sessions.map((s) => s.id));
  return [...findings, ...checkNotes(ids, path.join(dir, 'sessions'), TEMPLATE_DESCRIPTION)];
}

test('valid fixture: no findings, and a normalised model', () => {
  const dir = copyFixture();
  assert.deepEqual(allFindings(dir), []);
  const schedule = loadSchedule(dir);
  assert.equal(schedule.rooms.length, 3);
  assert.deepEqual(schedule.days.map((d) => d.date), ['2026-10-23', '2026-10-22']);
  assert.deepEqual(schedule.days[0].slots.map((s) => s.key), ['1050', '1230', '1330', '1700', '1900']);
  assert.equal(schedule.days[0].sessions.length, 7);
  assert.equal(schedule.days[1].sessions.length, 1);
  const byId = Object.fromEntries(schedule.days.flatMap((d) => d.sessions).map((s) => [s.id, s]));
  assert.equal(byId[MOVED_ID].slot, '1330'); // cross-day move keeps its id
  assert.equal(byId['2026-10-23-is-tdd-dead'].uncertain, false); // a question mark is not uncertainty
  assert.equal(byId['2026-10-23-is-ai-pro'].uncertain, true);
  assert.equal(byId['2026-10-23-run-session'].start, '17:30');
  assert.deepEqual(schedule.rooms.map((r) => r.equipment.length), [2, 1, 0]);
});

test('every FR-019 class has a must-fail patch', () => {
  assert.deepEqual([...new Set(patches.map((p) => p.expect.class))].sort(), Object.keys(CLASSES));
});

for (const patch of patches) {
  test(`must fail: ${patch.name}`, () => {
    const dir = copyFixture();
    applyPatch(dir, patch);
    const findings = allFindings(dir);
    assert.equal(findings.length, 1, findings.map((f) => f.text).join('\n'));
    const [finding] = findings;
    assert.equal(finding.class, patch.expect.class);
    assert.equal(finding.line, patch.expect.line);
    assert.equal(path.basename(finding.file), path.basename(patch.file));
    assert.match(finding.text, new RegExp(`^.+:${finding.line} \\[${finding.class}\\] .+`));
  });
}

test('loadSchedule throws listing the findings on unreadable and empty data', () => {
  for (const cls of ['a', 'b']) {
    const dir = copyFixture();
    applyPatch(dir, patches.find((p) => p.expect.class === cls));
    assert.throws(() => loadSchedule(dir), (err) => err.findings.length === 1 && err.findings[0].class === cls && err.message.includes(`[${cls}]`));
  }
});

test('a missing directory, a stray file and a missing rooms.yaml are unreadable (a)', () => {
  assert.deepEqual(validateSchedule(path.join(os.tmpdir(), 'schedule-model-does-not-exist')).findings.map((f) => f.class), ['a']);
  const dir = copyFixture();
  fs.writeFileSync(path.join(dir, 'notes.txt'), 'x');
  fs.rmSync(path.join(dir, 'rooms.yaml'));
  assert.deepEqual(validateSchedule(dir).findings.map((f) => f.class), ['a', 'a']);
});

test('orphanNotes lists date-prefixed notes that match no session', () => {
  const dir = copyFixture();
  const notes = path.join(dir, 'sessions');
  fs.writeFileSync(path.join(notes, '2026-10-24-ghost.md'), '---\ntitle: x\n---\n');
  fs.writeFileSync(path.join(notes, 'index.md'), '---\ntitle: x\n---\n');
  assert.deepEqual(orphanNotes([MOVED_ID], notes), ['2026-10-24-ghost.md']);
  assert.deepEqual(orphanNotes([MOVED_ID, '2026-10-24-ghost'], notes), []);
});

test('formIdentity: FR-001b rule', () => {
  assert.equal(formIdentity('2026-10-23', 'Event Storming'), '2026-10-23-event-storming');
  assert.equal(formIdentity('2026-10-23', 'Amblève'), '2026-10-23-ambleve');
  assert.equal(formIdentity('2026-10-23', '🎉🎉'), '2026-10-23-session');
  assert.equal(formIdentity('2026-10-23', "TDD #1: the team's Q&A"), '2026-10-23-tdd-1-the-team-s-q-a');
  const long = formIdentity('2026-10-23', 'word '.repeat(24));
  assert.ok(long.length <= 60 && !long.endsWith('-'), long);
  const taken = new Set(['2026-10-23-event-storming']);
  assert.equal(formIdentity('2026-10-23', 'Event Storming', taken), '2026-10-23-event-storming-2');
  taken.add('2026-10-23-event-storming-2');
  assert.equal(formIdentity('2026-10-23', 'Event Storming', taken), '2026-10-23-event-storming-3');
  const base = formIdentity('2026-10-23', 'x'.repeat(120));
  const suffixed = formIdentity('2026-10-23', 'x'.repeat(120), new Set([base]));
  assert.ok(suffixed.length <= 60 && suffixed.endsWith('-2'), suffixed);
});
