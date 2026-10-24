#!/usr/bin/env node
/**
 * Checks the schedule data (docs/_meta/schedule) and the notes of scheduled
 * sessions (docs/sessions) against FR-019, using src/lib/schedule/model.mjs.
 *
 * Every run first proves the guard itself: each must-fail patch in
 * scripts/fixtures/schedule/patches.mjs is applied to a temporary copy of the
 * valid fixture and must produce exactly the expected finding. Then it checks
 * the real data, prints the text to proofread for participant names (FR-020)
 * and warns about notes that belong to no session (FR-024).
 *
 *   node scripts/check-schedule.mjs [--data <dir>] [--notes <dir>] [--template <file>]
 *
 * Defaults: docs/_meta/schedule, docs/sessions, docs/_meta/templates/session-note.md.
 * Paths resolve from the repository root, so the cwd does not matter.
 * When $GITHUB_STEP_SUMMARY is set the proofreading list is appended there too.
 * Exit code: 1 on any finding or a broken self-test; warnings do not change it.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import matter from 'gray-matter';
import { checkNotes, orphanNotes, validateSchedule } from '../src/lib/schedule/model.mjs';
import { TEMPLATE_DESCRIPTION, patches } from './fixtures/schedule/patches.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const VALID = path.join(root, 'scripts/fixtures/schedule/valid');

const sessionIds = (schedule) => schedule.days.flatMap((d) => d.sessions.map((s) => s.id));

/** Everything the check reports for a data directory and a notes directory. */
function allFindings(dir, notes, templateDescription) {
  const { findings, schedule } = validateSchedule(dir);
  if (!schedule) return { findings, schedule };
  return { findings: [...findings, ...checkNotes(sessionIds(schedule), notes, templateDescription)], schedule };
}

/**
 * Self-test: the valid fixture is clean and each patch yields exactly its finding.
 * Returns the problems found; exported so a test can prove it notices a wrong expectation.
 */
export function selfTest(patchList = patches) {
  const problems = [];
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'check-schedule-'));
  try {
    const run = (dir) => allFindings(dir, path.join(dir, 'sessions'), TEMPLATE_DESCRIPTION).findings;
    const clean = run(VALID);
    if (clean.length > 0) problems.push(`the valid fixture reports ${clean.length} finding(s): ${clean[0].text}`);
    for (const [i, patch] of patchList.entries()) {
      const dir = path.join(tmp, String(i));
      fs.cpSync(VALID, dir, { recursive: true });
      const file = path.join(dir, patch.file);
      const src = fs.readFileSync(file, 'utf8');
      if (src.split(patch.find).length - 1 !== 1) {
        problems.push(`${patch.name}: the text to change does not occur exactly once in ${patch.file}`);
        continue;
      }
      fs.writeFileSync(file, src.replace(patch.find, () => patch.replace));
      const found = run(dir);
      const [only] = found;
      const ok = found.length === 1 && only.class === patch.expect.class && only.line === patch.expect.line && path.basename(only.file) === path.basename(patch.file);
      if (!ok) problems.push(`${patch.name}: expected one [${patch.expect.class}] finding at ${patch.file}:${patch.expect.line}, got ${found.length ? found.map((f) => f.text).join(' | ') : 'none'}`);
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  return problems;
}

function option(name, fallback) {
  const at = process.argv.indexOf(`--${name}`);
  if (at < 0) return fallback;
  if (!process.argv[at + 1]) {
    console.error(`✗ --${name} needs a value`);
    process.exit(1);
  }
  return path.resolve(process.argv[at + 1]);
}
const dataDir = option('data', path.join(root, 'docs/_meta/schedule'));
const notesDir = option('notes', path.join(root, 'docs/sessions'));
const templateFile = option('template', path.join(root, 'docs/_meta/templates/session-note.md'));

function main() {
  const dataDir = option('data', path.join(root, 'docs/_meta/schedule'));
  const notesDir = option('notes', path.join(root, 'docs/sessions'));
  const templateFile = option('template', path.join(root, 'docs/_meta/templates/session-note.md'));
  const broken = selfTest();
  if (broken.length > 0) {
    console.error(`✗ check-schedule self-test failed (the guard itself is broken):\n  ${broken.join('\n  ')}`);
    process.exit(1);
  }

  // A missing template skips class (k) with a notice; an unreadable or unparsable one is a finding.
  let templateDescription = '';
  let templateProblem;
  try {
    templateDescription = String(matter(fs.readFileSync(templateFile, 'utf8')).data.description ?? '').trim();
    if (!templateDescription) templateProblem = 'the template has no description to compare notes against';
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`ℹ no session-note template at ${path.relative(root, templateFile)}; skipping the placeholder-description check (class k)`);
    } else {
      templateProblem = `the template cannot be read (${error.code ?? String(error.message).split('\n')[0]})`;
    }
  }
  if (templateProblem) {
    console.error(`✗ ${path.relative(root, templateFile)}: ${templateProblem}, so class (k) cannot be checked`);
    process.exit(1);
  }

  const { findings, schedule } = allFindings(dataDir, notesDir, templateDescription);
  if (findings.length > 0) {
    console.error(findings.map((f) => `✗ ${f.text}`).join('\n'));
    console.error(`✗ ${findings.length} schedule finding(s)`);
    process.exit(1);
  }

  // FR-024: date-prefixed notes with no session. A warning only.
  const ids = sessionIds(schedule);
  for (const name of orphanNotes(ids, notesDir)) {
    console.log(`⚠ ${path.relative(root, path.join(notesDir, name))}: no session on the schedule has this identity`);
  }

  // FR-020: every free-text value, so a reviewer can scan it for participant names.
  const lines = [];
  for (const room of schedule.rooms) lines.push(`room name: ${room.name}`);
  for (const day of schedule.days) {
    for (const s of day.sessions) {
      lines.push(`id: ${s.id}`, `title: ${s.title}`);
      if (s.description !== undefined) lines.push(`description: ${s.description}`);
      if (s.place !== undefined) lines.push(`place: ${s.place}`);
    }
  }
  const proofreading = ['## Text to proofread for participant names', '', ...lines.map((l) => `- ${l}`), ''].join('\n');
  console.log(`\n${proofreading}`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${proofreading}\n`);
    } catch (error) {
      console.log(`⚠ could not write the job summary: ${error.code ?? error.message}`);
    }
  }

  const sessions = ids.length;
  console.log(`✓ schedule: ${sessions} sessions across ${schedule.days.length} day(s), ${schedule.rooms.length} rooms (self-test: ${patches.length} patches)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
