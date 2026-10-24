#!/usr/bin/env node
/**
 * Builds the two-day schedule fixture into dist-fixture/ (never dist/).
 *
 * It copies the fixture notes into docs/sessions/, builds with
 * SCHEDULE_DATA_DIR pointing at the fixture data and DK_PUBLISH_DRAFTS=on (so
 * the draft note exists in the collection but must still not be linked), and
 * always removes the copied notes afterwards, even when the build fails.
 * The schedule validator rejects any entry other than rooms.yaml and day files,
 * so the data files are staged in a temporary directory without notes/.
 *
 *   node scripts/build-schedule-fixture.mjs
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const fixtureDir = path.join(root, 'scripts/fixtures/schedule/two-day');
const notesFrom = path.join(fixtureDir, 'notes');
const sessionsDir = path.join(root, 'docs/sessions');
const outDir = 'dist-fixture';

const notes = readdirSync(notesFrom).filter((name) => name.endsWith('.md'));
const copied = [];
let status = 1;
let dataDir;

try {
  dataDir = mkdtempSync(path.join(os.tmpdir(), 'schedule-fixture-'));
  for (const name of readdirSync(fixtureDir).filter((n) => n.endsWith('.yaml'))) copyFileSync(path.join(fixtureDir, name), path.join(dataDir, name));
  mkdirSync(sessionsDir, { recursive: true });
  for (const name of notes) {
    const target = path.join(sessionsDir, name);
    if (existsSync(target)) throw new Error(`refusing to overwrite docs/sessions/${name}`);
    copyFileSync(path.join(notesFrom, name), target);
    copied.push(target);
  }
  const result = spawnSync('pnpm', ['exec', 'astro', 'build', '--outDir', outDir], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, SCHEDULE_DATA_DIR: dataDir, DK_PUBLISH_DRAFTS: 'on' },
  });
  status = result.status ?? 1;
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
} finally {
  for (const target of copied) rmSync(target, { force: true });
  if (dataDir) rmSync(dataDir, { recursive: true, force: true });
}
process.exit(status);
