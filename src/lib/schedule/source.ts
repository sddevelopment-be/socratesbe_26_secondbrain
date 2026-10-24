/**
 * Build-time source of the schedule view: loads and validates the data (an
 * invalid schedule throws, so the build fails, FR-019a), finds which session
 * notes are published, and hands both to the view model. Memoised per build.
 */
import fs from 'node:fs';
import path from 'node:path';
import { getCollection } from 'astro:content';
import { isPublished } from '@spec-kitty/doc-toolkit';
import { BASE, BRANCH, OWNER, REPO } from '../../../site.config.mjs';
import { loadSchedule } from './model.mjs';
import { buildScheduleView } from './view.mjs';

const SESSIONS_PREFIX = 'sessions/';
let memo: ReturnType<typeof buildScheduleView> | undefined;

export async function getScheduleView() {
  if (memo) return memo;
  const root = process.cwd();
  const dir = path.resolve(root, process.env.SCHEDULE_DATA_DIR ?? 'docs/_meta/schedule');
  const schedule = loadSchedule(dir);
  const entries = await getCollection('docs');
  const publishedIds = new Set<string>(
    entries
      .filter((e) => e.id.startsWith(SESSIONS_PREFIX) && isPublished(e.data as never))
      .map((e) => e.id.slice(SESSIONS_PREFIX.length)),
  );
  const template = fs.readFileSync(path.join(root, 'docs/_meta/templates/session-note.md'), 'utf8');
  memo = buildScheduleView({
    schedule,
    publishedIds,
    site: { owner: OWNER, repo: REPO, branch: BRANCH, base: BASE },
    template,
  });
  return memo;
}
