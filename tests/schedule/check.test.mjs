import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { selfTest } from '../../scripts/check-schedule.mjs';
import { patches } from '../../scripts/fixtures/schedule/patches.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCRIPT = path.join(ROOT, 'scripts/check-schedule.mjs');
const VALID = path.join(ROOT, 'scripts/fixtures/schedule/valid');

/** A temporary copy of the valid fixture, removed when the test ends. */
function copyFixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'schedule-check-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.cpSync(VALID, dir, { recursive: true });
  return dir;
}

/** Run the check on a data directory; notes live in its sessions/ folder. */
function check(dir, extraEnv = {}) {
  const result = spawnSync(process.execPath, [SCRIPT, '--data', dir, '--notes', path.join(dir, 'sessions'), '--template', path.join(dir, 'no-template.md')], {
    encoding: 'utf8',
    cwd: os.tmpdir(), // the script must not depend on the cwd
    env: { ...process.env, GITHUB_STEP_SUMMARY: '', ...extraEnv },
  });
  return result;
}

test('valid fixture: exit 0, summary line, and a note for the skipped template', (t) => {
  const result = check(copyFixture(t));
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /✓ schedule: 8 sessions across 2 day\(s\), 3 rooms \(self-test: \d+ patches\)/);
  assert.match(result.stdout, /skipping the placeholder-description check/);
});

test('every free-text value is in the proofreading list and the job summary (FR-020)', (t) => {
  const dir = copyFixture(t);
  const expected = [];
  for (const name of ['2026-10-22.yaml', '2026-10-23.yaml', 'rooms.yaml']) {
    const file = path.join(dir, name);
    const marked = fs.readFileSync(file, 'utf8').replace(/^(\s*(?:- )?)(id|title|description|place|name): "(.*)"$/gm, (_, lead, field, value) => {
      const next = field === 'id' ? `${value}-mk` : `${value} MK`;
      expected.push(`- ${field === 'name' ? 'room name' : field}: ${next}`);
      return `${lead}${field}: "${next}"`;
    });
    fs.writeFileSync(file, marked);
  }
  assert.ok(expected.some((l) => l.startsWith('- description:')) && expected.some((l) => l.startsWith('- place:')) && expected.some((l) => l.startsWith('- room name:')));
  const summary = path.join(dir, 'summary.md');
  const result = check(dir, { GITHUB_STEP_SUMMARY: summary });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /## Text to proofread for participant names/);
  const written = fs.readFileSync(summary, 'utf8');
  for (const line of expected) {
    assert.ok(result.stdout.includes(line), `stdout lacks: ${line}`);
    assert.ok(written.includes(line), `summary lacks: ${line}`);
  }
});

test('a broken data file exits 1 and names the class on stderr', (t) => {
  const dir = copyFixture(t);
  const patch = patches.find((p) => p.name === 'e: duplicate session id');
  const file = path.join(dir, patch.file);
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(patch.find, () => patch.replace));
  const result = check(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /✗ .*2026-10-23\.yaml:25 \[e duplicate\]/);
});

test('a draft note for a scheduled session exits 1 (class j)', (t) => {
  const dir = copyFixture(t);
  const patch = patches.find((p) => p.name === 'j: note is a draft');
  const file = path.join(dir, patch.file);
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(patch.find, () => patch.replace));
  const result = check(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /\[j draft note\] .*set `doc_status: active` or delete the note/);
});

test('a date-prefixed note without a session warns; an undated note does not', (t) => {
  const dir = copyFixture(t);
  const notes = path.join(dir, 'sessions');
  const note = fs.readFileSync(path.join(notes, '2026-10-22-moved-across-days.md'), 'utf8');
  fs.writeFileSync(path.join(notes, '2026-10-21-no-such-session.md'), note);
  fs.writeFileSync(path.join(notes, 'second-brain-for-humans-and-agents.md'), note);
  const result = check(dir);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /⚠ .*2026-10-21-no-such-session\.md: no session on the schedule has this identity/);
  assert.doesNotMatch(result.stdout, /⚠ .*second-brain-for-humans-and-agents/);
});

test('the self-test reports a patch whose expectation is wrong, so it cannot be disabled unnoticed', () => {
  assert.deepEqual(selfTest(), []);
  const wrong = patches.map((p, i) => (i === 0 ? { ...p, expect: { ...p.expect, line: p.expect.line + 1 } } : p));
  const problems = selfTest(wrong);
  assert.equal(problems.length, 1);
  assert.match(problems[0], new RegExp(`^${patches[0].name}: expected one`));
});

test('an unreadable template is a finding; only a missing one skips class k', (t) => {
  const dir = copyFixture(t);
  const run = (template) => spawnSync(process.execPath, [SCRIPT, '--data', dir, '--notes', path.join(dir, 'sessions'), '--template', template], { encoding: 'utf8', cwd: os.tmpdir(), env: { ...process.env, GITHUB_STEP_SUMMARY: '' } });
  const unreadable = run(dir); // a directory, not a file
  assert.equal(unreadable.status, 1);
  assert.match(unreadable.stderr, /the template cannot be read/);
  const broken = path.join(dir, 'broken.md');
  fs.writeFileSync(broken, '---\ndescription: [unclosed\n---\n');
  const unparsable = run(broken);
  assert.equal(unparsable.status, 1);
  assert.match(unparsable.stderr, /the template cannot be read/);
});
