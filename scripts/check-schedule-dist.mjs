#!/usr/bin/env node
/**
 * Post-build checks of the schedule in a built site (FR-005, FR-012, FR-021,
 * FR-021a, FR-021b, FR-022, NFR-008).
 *
 *   node scripts/check-schedule-dist.mjs <distDir> [--fixture]
 *
 * The expected sessions come from the schedule data, read independently with
 * src/lib/schedule/model.mjs (the fixture data with --fixture, otherwise
 * $SCHEDULE_DATA_DIR or docs/_meta/schedule). The expected note state comes
 * from the note files and the built note pages, not from the page under test.
 *
 * Every run first proves the checks themselves: small HTML, JSON and Markdown
 * samples pass, and each injected violation is reported under its own code.
 * No dependency beyond what the repository already has; HTML is read with a
 * small tokenizer, enough for Astro's output.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import matter from 'gray-matter';
import { loadSchedule } from '../src/lib/schedule/model.mjs';
import { BASE, SITE } from '../site.config.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const FIXTURE_DIR = path.join(root, 'scripts/fixtures/schedule/two-day');
const MAX_URL = 4000;
const SENTINEL = 'FIXTURE-SENTINEL';
const PUBLISHED_SENTINEL = '2026-10-24-fixture-sentinel-published';
const DRAFT_SENTINEL = '2026-10-24-fixture-sentinel-draft';
const CONTROL_PAGE = 'guides/run-locally/index.html';
const VIEW_FILES = ['api/schedule.json', 'sessions/schedule.md', 'sessions/schedule.json', 'sessions/schedule.yaml', 'api/pages/sessions/schedule.json'];
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

// ---------------------------------------------------------------- HTML reading

/** Tokenise HTML into open/close tags with attributes, parent and matching close. */
export function parseHtml(html) {
  const tokens = [];
  const stack = [];
  const tagRe = /<(\/?)([a-zA-Z][^\s/>]*)((?:"[^"]*"|'[^']*'|[^'">])*?)(\/?)>/y;
  const attrRe = /([^\s=/"'>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let pos = 0;
  while (pos < html.length) {
    const lt = html.indexOf('<', pos);
    if (lt < 0) break;
    if (html.startsWith('<!--', lt)) {
      const end = html.indexOf('-->', lt + 4);
      pos = end < 0 ? html.length : end + 3;
      continue;
    }
    tagRe.lastIndex = lt;
    const m = tagRe.exec(html);
    if (!m) { pos = lt + 1; continue; }
    const [whole, slash, rawName, rawAttrs, selfClose] = m;
    const name = rawName.toLowerCase();
    const end = lt + whole.length;
    if (slash) {
      const token = { kind: 'close', name, start: lt, end };
      tokens.push(token);
      const at = stack.map((i) => tokens[i].name).lastIndexOf(name);
      if (at >= 0) {
        for (const open of stack.splice(at)) tokens[open].closeIdx = tokens.length - 1;
      }
      pos = end;
      continue;
    }
    const attrs = new Map();
    for (const a of rawAttrs.matchAll(attrRe)) attrs.set(a[1].toLowerCase(), a[2] ?? a[3] ?? a[4] ?? '');
    const token = { kind: 'open', name, attrs, start: lt, end, parent: stack.length ? stack[stack.length - 1] : -1 };
    tokens.push(token);
    if (name === 'script' || name === 'style') {
      const close = html.toLowerCase().indexOf(`</${name}`, end);
      const stop = close < 0 ? html.length : close;
      token.text = html.slice(end, stop);
      const closeEnd = close < 0 ? html.length : html.indexOf('>', close) + 1;
      tokens.push({ kind: 'close', name, start: stop, end: closeEnd });
      token.closeIdx = tokens.length - 1;
      pos = closeEnd;
      continue;
    }
    if (!VOID.has(name) && !selfClose) stack.push(tokens.length - 1);
    pos = end;
  }
  return tokens;
}

const opens = (tokens) => tokens.map((t, i) => ({ t, i })).filter(({ t }) => t.kind === 'open');
const within = (tokens, i) => {
  const close = tokens[i].closeIdx;
  return close === undefined ? [] : tokens.slice(i + 1, close);
};
const inner = (html, tokens, i) => (tokens[i].closeIdx === undefined ? '' : html.slice(tokens[i].end, tokens[tokens[i].closeIdx].start));
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');

/** Script identities of a page: `src:<url>` for external, `sha1:<hash>` for inline. */
export function scriptSet(html) {
  const out = new Set();
  for (const { t } of opens(parseHtml(html))) {
    if (t.name !== 'script') continue;
    out.add(t.attrs.has('src') ? `src:${t.attrs.get('src')}` : `sha1:${sha1(t.text ?? '')}`);
  }
  return out;
}

const scheduleRoot = (tokens) => opens(tokens).find(({ t }) => t.attrs.has('data-schedule'))?.i ?? -1;

// ---------------------------------------------------------------- page checks

/** FR-005: nothing in the schedule needs JavaScript. */
export function checkNoJs(html, controlHtml) {
  const problems = [];
  const tokens = parseHtml(html);
  const extra = [...scriptSet(html)].filter((s) => !scriptSet(controlHtml).has(s));
  if (extra.length) problems.push(`[script-subset] the schedule page has scripts the control page lacks: ${extra.join(', ')}`);
  const r = scheduleRoot(tokens);
  if (r < 0) return [...problems, '[no-root] no [data-schedule] element on the schedule page'];
  if (/<script/i.test(inner(html, tokens, r))) problems.push('[no-js-script] a <script> inside [data-schedule]');
  if (/<template/i.test(inner(html, tokens, r))) problems.push('[no-js-template] a <template> inside [data-schedule]');
  for (const t of [tokens[r], ...within(tokens, r)]) {
    if (t.kind !== 'open') continue;
    for (const name of t.attrs.keys()) if (/^on[a-z]+$/.test(name)) problems.push(`[no-js-handler] ${name}= on <${t.name}> inside [data-schedule]`);
    if (/^[a-z]+-[a-z-]+$/.test(t.name) && t.name !== 'data-schedule') problems.push(`[no-js-custom-element] <${t.name}> inside [data-schedule]`);
    if (t.attrs.has('hidden')) problems.push(`[no-js-hidden] hidden on <${t.name}> inside [data-schedule]`);
  }
  return problems;
}

/** The `data-session-id` values (and attributes) inside each `data-layout`. */
export function layoutSessions(html) {
  const tokens = parseHtml(html);
  const out = { list: [], table: [], sections: [] };
  for (const { t, i } of opens(tokens)) {
    const layout = t.attrs.get('data-layout');
    if (!layout || !(layout in out)) continue;
    for (const inside of within(tokens, i)) {
      if (inside.kind === 'open' && inside.attrs.has('data-session-id')) {
        out[layout].push({ id: inside.attrs.get('data-session-id'), state: inside.attrs.get('data-note-state') ?? '', noteId: inside.attrs.get('data-note-id') ?? '' });
      }
    }
  }
  return out;
}

const dupes = (ids) => ids.filter((id, n) => ids.indexOf(id) !== n);

/** FR-005: every timed session once in list and table, every section session once in sections. */
export function checkLayouts(html, { timed, sectioned }) {
  const problems = [];
  const found = layoutSessions(html);
  const ids = (layout) => found[layout].map((s) => s.id);
  const want = {
    list: [...timed],
    table: [...timed],
    sections: [...sectioned],
  };
  for (const layout of ['list', 'table', 'sections']) {
    const got = ids(layout);
    // Sections may be empty (the fixture has none); the timed layouts may not.
    if (got.length === 0 && (want[layout].length === 0 && layout !== 'sections')) problems.push(`[layout-empty] the ${layout} layout holds no sessions`);
    for (const id of dupes(got)) problems.push(`[layout-duplicate] ${id} appears more than once in the ${layout} layout`);
    for (const id of want[layout]) if (!got.includes(id)) problems.push(`[layout-missing] ${id} is missing from the ${layout} layout`);
    for (const id of new Set(got)) if (!want[layout].includes(id)) problems.push(`[layout-extra] ${id} should not be in the ${layout} layout`);
  }
  const union = (layout) => new Set([...ids(layout), ...ids('sections')]);
  const every = new Set([...timed, ...sectioned]);
  for (const layout of ['list', 'table']) {
    const u = union(layout);
    if (u.size !== every.size || [...every].some((id) => !u.has(id))) problems.push(`[layout-union] ${layout} + sections does not equal the schedule data`);
  }
  return problems;
}

/** Anchors resolve, Start URLs are short, every Start link (list, sections, table) carries both fallbacks. */
export function checkLinks(html, { base = BASE } = {}) {
  const problems = [];
  const tokens = parseHtml(html);
  const r = scheduleRoot(tokens);
  if (r < 0) return ['[no-root] no [data-schedule] element on the schedule page'];
  const idsOnPage = new Set(opens(tokens).map(({ t }) => t.attrs.get('id')).filter(Boolean));
  const rootEnd = tokens[r].closeIdx ?? tokens.length;
  for (let i = r; i < rootEnd; i += 1) {
    const t = tokens[i];
    if (t.kind !== 'open' || t.name !== 'a' || !t.attrs.has('href')) continue;
    const href = decode(t.attrs.get('href'));
    if (href.startsWith('#') && !idsOnPage.has(decodeURIComponent(href.slice(1)))) problems.push(`[anchor-dangling] ${href} resolves to no id`);
    if (!href.includes('/new/')) continue;
    if (href.length > MAX_URL) problems.push(`[url-long] a Start link is ${href.length} characters (limit ${MAX_URL})`);
    const parent = t.parent;
    const hrefs = within(tokens, parent).filter((x) => x.kind === 'open' && x.name === 'a').map((x) => decode(x.attrs.get('href') ?? ''));
    if (!hrefs.some((h) => h.endsWith('/docs/_meta/templates/session-note.md'))) problems.push('[fallback-missing] a Start link has no template link next to it');
    if (!hrefs.some((h) => h.startsWith(`${base}/guides/add-a-session-note/`))) problems.push('[fallback-missing] a Start link has no guide link next to it');
  }
  return problems;
}

// ---------------------------------------------------------------- parity

const triple = (id, state, noteId) => `${id}|${state}|${noteId}`;

export function htmlTriples(html) {
  const found = layoutSessions(html);
  return new Set(Object.values(found).flat().map((s) => triple(s.id, s.state, s.noteId)));
}

export function apiTriples(api) {
  return new Set((api.days ?? []).flatMap((d) => d.sessions ?? []).map((s) => triple(s.id, s.note?.state, s.note?.state === 'published' ? s.note.id : '')));
}

const MD_ROW = /Notes: (none|\[published\]\(([^)\s]+)\)) \(id: ([^)]+)\)/g;

export function mdTriples(md) {
  const rows = [...md.matchAll(MD_ROW)].map(([, notes, url, id]) => ({ id, state: notes === 'none' ? 'none' : 'published', noteId: url ? (url.match(/\/sessions\/(.+)\.md$/)?.[1] ?? '?') : '' }));
  return { rows, set: new Set(rows.map((r) => triple(r.id, r.state, r.noteId))) };
}

export function checkParity({ html, api, md }, expected) {
  const problems = [];
  const want = new Set(expected.map((e) => triple(e.id, e.state, e.state === 'published' ? e.id : '')));
  if (want.size === 0) problems.push('[parity-empty] the schedule data holds no sessions');
  const rows = mdTriples(md);
  for (const id of dupes(rows.rows.map((r) => r.id))) problems.push(`[parity-md] ${id} appears more than once in the Markdown view`);
  for (const [name, got] of [['html', htmlTriples(html)], ['api', apiTriples(api)], ['md', rows.set]]) {
    const missing = [...want].filter((x) => !got.has(x));
    const extra = [...got].filter((x) => !want.has(x));
    if (missing.length || extra.length) problems.push(`[parity-${name}] (id, state, noteId) differs from the data: missing ${missing.slice(0, 3).join('; ') || 'none'}; unexpected ${extra.slice(0, 3).join('; ') || 'none'}`);
  }
  return problems;
}

// ---------------------------------------------------------------- API shape

const isStr = (v) => typeof v === 'string';
const only = (obj, keys, where, problems) => {
  for (const k of Object.keys(obj)) if (!keys.includes(k)) problems.push(`[api-shape] ${where} has unexpected key ${k}`);
};
const need = (obj, keys, where, problems) => {
  for (const k of keys) if (!(k in obj)) problems.push(`[api-shape] ${where} lacks ${k}`);
};

/** Hand-written assertion of contracts/api-schedule.schema.json (with `note` in place of `notes`). */
export function checkApiShape(api, siteRoot = `${SITE}${BASE}`) {
  const problems = [];
  if (api === null || typeof api !== 'object') return ['[api-shape] the API body is not an object'];
  only(api, ['schema_version', 'page', 'rooms', 'days'], 'the body', problems);
  need(api, ['schema_version', 'page', 'rooms', 'days'], 'the body', problems);
  if (api.schema_version !== 1) problems.push('[api-shape] schema_version is not 1');
  if (!isStr(api.page) || !api.page.startsWith(`${siteRoot}/`)) problems.push('[api-shape] page is not an absolute URL under the site');
  if (!Array.isArray(api.rooms) || api.rooms.length === 0) problems.push('[api-shape] rooms is empty');
  for (const r of api.rooms ?? []) {
    only(r, ['key', 'name', 'size', 'equipment'], 'a room', problems);
    need(r, ['key', 'name', 'size', 'equipment'], 'a room', problems);
    if (!['XL', 'L', 'S'].includes(r.size)) problems.push(`[api-shape] room size ${r.size}`);
    if (!Array.isArray(r.equipment) || r.equipment.some((e) => !['projector', 'screen'].includes(e))) problems.push('[api-shape] room equipment');
  }
  if (!Array.isArray(api.days) || api.days.length === 0) problems.push('[api-shape] days is empty');
  const dates = (api.days ?? []).map((d) => d.date);
  if (dates.some((d, n) => n > 0 && d > dates[n - 1])) problems.push('[api-shape] days are not newest first');
  for (const d of api.days ?? []) {
    only(d, ['date', 'snapshot', 'timezone', 'slots', 'sessions'], 'a day', problems);
    need(d, ['date', 'snapshot', 'timezone', 'slots', 'sessions'], 'a day', problems);
    if (d.timezone !== 'Europe/Brussels') problems.push('[api-shape] timezone is not Europe/Brussels');
    for (const s of d.slots ?? []) {
      only(s, ['key', 'start', 'type'], 'a slot', problems);
      need(s, ['key', 'start', 'type'], 'a slot', problems);
      if (!['session', 'lunch', 'closing', 'dinner'].includes(s.type)) problems.push(`[api-shape] slot type ${s.type}`);
    }
    for (const s of d.sessions ?? []) {
      only(s, ['id', 'title', 'description', 'room', 'place', 'slot', 'section', 'start', 'uncertain', 'note'], 'a session', problems);
      need(s, ['id', 'title', 'uncertain', 'note'], 'a session', problems);
      if (typeof s.uncertain !== 'boolean') problems.push('[api-shape] uncertain is not a boolean');
      if (s.section !== undefined && !['lunch-tables', 'outside', 'evening', 'other'].includes(s.section)) problems.push(`[api-shape] section ${s.section}`);
      const n = s.note ?? {};
      only(n, ['state', 'id', 'url'], 'a note', problems);
      if (!['published', 'none'].includes(n.state) || !isStr(n.id)) problems.push(`[api-shape] note of ${s.id}`);
      if ((n.state === 'published') !== (n.url !== undefined)) problems.push(`[api-shape] note url of ${s.id} must be present exactly when published`);
      if (n.url !== undefined && !String(n.url).startsWith(`${siteRoot}/`)) problems.push(`[api-shape] note url of ${s.id} is not absolute under the site`);
      if (JSON.stringify(s).includes('/new/')) problems.push(`[api-shape] ${s.id} carries a prefill URL`);
    }
  }
  return problems;
}

// ---------------------------------------------------------------- files

export function checkPaths(dist) {
  const problems = [];
  const real = new Map();
  for (const rel of VIEW_FILES) {
    const file = path.join(dist, rel);
    if (!fs.existsSync(file)) { problems.push(`[paths] ${rel} does not exist`); continue; }
    const key = fs.realpathSync(file);
    if (real.has(key)) problems.push(`[paths] ${rel} and ${real.get(key)} are the same file`);
    real.set(key, rel);
  }
  return problems;
}

function* filesUnder(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* filesUnder(file);
    else yield file;
  }
}

export function checkSentinelAbsent(dist) {
  const needle = Buffer.from(SENTINEL);
  const hits = [...filesUnder(dist)].filter((f) => fs.readFileSync(f).includes(needle));
  return hits.map((f) => `[sentinel] ${SENTINEL} found in ${path.relative(dist, f)}`);
}

/** The text views must carry every id token; the other views are checked for the same set. */
export function checkViewTokens(texts, ids) {
  const problems = [];
  for (const [name, text] of Object.entries(texts)) {
    const got = new Set([...text.matchAll(/\(id: ([^)\\\s]+)\)/g)].map((m) => m[1]));
    const missing = ids.filter((id) => !got.has(id));
    if (missing.length || got.size !== ids.length) problems.push(`[parity-views] ${name} lists ${got.size} of ${ids.length} sessions (missing ${missing.slice(0, 3).join(', ') || 'none'})`);
  }
  return problems;
}

/** FR-010, FR-012, FR-022 on the two-day fixture build. */
export function checkFixturePage(html, dist = null, base = BASE) {
  const problems = [];
  const tokens = parseHtml(html);
  const switchers = opens(tokens).filter(({ t }) => t.attrs.get('class') === 'sched-days');
  const days = switchers.length === 1 ? within(tokens, switchers[0].i).filter((x) => x.kind === 'open' && x.name === 'a' && (x.attrs.get('href') ?? '').startsWith('#day-')) : [];
  if (days.length !== 2) problems.push(`[fixture-switcher] expected a day switcher with 2 days, found ${days.length}`);
  const states = layoutSessions(html).list.map((s) => s.state);
  if (!states.includes('published')) problems.push('[fixture-states] no published session in the fixture build');
  if (!states.includes('none')) problems.push('[fixture-states] no session without a note in the fixture build');
  // Only the schedule itself: the sidebar lists every built page, drafts included.
  const r = scheduleRoot(tokens);
  const hrefs = (r < 0 ? [] : within(tokens, r)).filter((x) => x.kind === 'open' && x.name === 'a').map((x) => decode(x.attrs.get('href') ?? ''));
  const link = (id) => `${base}/sessions/${id}/`;
  if (!hrefs.includes(link(PUBLISHED_SENTINEL))) problems.push('[fixture-published] the published sentinel is not linked to its note page');
  else if (dist && !fs.existsSync(path.join(dist, 'sessions', PUBLISHED_SENTINEL, 'index.html'))) problems.push('[fixture-published] the published sentinel note page was not built');
  if (hrefs.some((h) => h.startsWith(link(DRAFT_SENTINEL).slice(0, -1)))) problems.push('[fixture-draft-linked] the draft sentinel is linked to its note page');
  if (!layoutSessions(html).list.some((s) => s.id === DRAFT_SENTINEL && s.state === 'none')) problems.push('[fixture-draft-linked] the draft sentinel is not shown as "none"');
  return problems;
}

// ---------------------------------------------------------------- data

function withStagedData(fixture, run) {
  if (!fixture) return run(path.resolve(root, process.env.SCHEDULE_DATA_DIR ?? 'docs/_meta/schedule'));
  // The validator accepts only rooms.yaml and day files, so stage them without notes/.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'schedule-dist-'));
  try {
    for (const name of fs.readdirSync(FIXTURE_DIR).filter((n) => n.endsWith('.yaml'))) fs.copyFileSync(path.join(FIXTURE_DIR, name), path.join(dir, name));
    return run(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** Sessions with the note state the notes folder and built pages imply. */
export function expectedSessions(schedule, notesDir, dist) {
  return schedule.days.flatMap((d) => d.sessions).map((s) => {
    let published = false;
    try {
      const status = matter(fs.readFileSync(path.join(notesDir, `${s.id}.md`), 'utf8')).data.doc_status ?? 'draft';
      published = status !== 'draft' && fs.existsSync(path.join(dist, 'sessions', s.id, 'index.html'));
    } catch { /* no note */ }
    return { id: s.id, state: published ? 'published' : 'none', timed: s.slot !== undefined, sectioned: s.section !== undefined };
  });
}

export function checkDist(dist, { fixture = false } = {}) {
  const problems = [];
  const read = (rel) => fs.readFileSync(path.join(dist, rel), 'utf8');
  const exists = (rel) => fs.existsSync(path.join(dist, rel));
  if (!exists('sessions/schedule/index.html')) return ['[page] sessions/schedule/index.html does not exist'];
  if (!exists(CONTROL_PAGE)) return [`[page] control page ${CONTROL_PAGE} does not exist`];
  const html = read('sessions/schedule/index.html');
  const siteRoot = `${SITE}${BASE}`;
  const notesDir = fixture ? path.join(FIXTURE_DIR, 'notes') : path.join(root, 'docs/sessions');
  const expected = withStagedData(fixture, (dir) => expectedSessions(loadSchedule(dir), notesDir, dist));
  const sets = { timed: expected.filter((e) => e.timed).map((e) => e.id), sectioned: expected.filter((e) => e.sectioned).map((e) => e.id) };

  problems.push(...checkNoJs(html, read(CONTROL_PAGE)), ...checkLayouts(html, sets), ...checkLinks(html));
  problems.push(...checkPaths(dist));
  if (!exists('api/schedule.json') || !exists('sessions/schedule.md')) return problems;
  const api = JSON.parse(read('api/schedule.json'));
  problems.push(...checkApiShape(api, siteRoot), ...checkParity({ html, api, md: read('sessions/schedule.md') }, expected));
  const texts = Object.fromEntries(VIEW_FILES.slice(1).filter(exists).map((rel) => [rel, read(rel)]));
  problems.push(...checkViewTokens(texts, expected.map((e) => e.id)));
  const intro = html.match(/href="([^"]*api\/schedule\.json)"/);
  if (!intro) problems.push('[api-link] the schedule page does not link api/schedule.json');
  if (!read('sessions/schedule.md').includes(`<${siteRoot}/api/schedule.json>`)) problems.push('[api-link] the Markdown view lacks the absolute API link');
  if (fixture) problems.push(...checkFixturePage(html, dist));
  else problems.push(...checkSentinelAbsent(dist));
  if (!fixture && new Set(api.days.map((d) => d.date)).size > 1 && !html.includes('sched-days')) problems.push('[switcher] several days but no day switcher');
  return problems;
}

// ---------------------------------------------------------------- self-test

const SAMPLE_BASE = BASE;
const startUrl = (id) => `https://github.com/o/r/new/main?filename=docs/sessions/${id}.md&amp;value=x`;
const fallbacks = '<a href="https://github.com/o/r/blob/main/docs/_meta/templates/session-note.md">t</a> <a href="' + SAMPLE_BASE + '/guides/add-a-session-note/">g</a>';
const card = (id, state) => `<li class="sched-card" id="session-${id}" data-session-id="${id}" data-note-state="${state}"${state === 'published' ? ` data-note-id="${id}"` : ''}><p class="sched-actions">${state === 'published' ? `<a href="${SAMPLE_BASE}/sessions/${id}/">Read</a>` : `<a href="${startUrl(id)}">Start</a> ${fallbacks}`}</p></li>`;
const cell = (id, state, bare = false) => `<li data-session-id="${id}" data-note-state="${state}"${state === 'published' ? ` data-note-id="${id}"` : ''}>${state === 'published' ? `<a href="${SAMPLE_BASE}/sessions/${id}/">x</a>` : `<span><a href="${startUrl(id)}">x</a>${bare ? '' : ` ${fallbacks}`}</span>`}</li>`;

const SAMPLE = {
  expected: [
    { id: '2026-10-23-a', state: 'published', timed: true, sectioned: false },
    { id: '2026-10-23-b', state: 'none', timed: true, sectioned: false },
    { id: '2026-10-23-c', state: 'none', timed: false, sectioned: true },
  ],
};

function samplePage(o = {}) {
  const list = o.dropFromList ? '' : card('2026-10-23-a', 'published');
  const table = o.dropFromTable ? '' : cell('2026-10-23-a', 'published');
  return `<!doctype html><html><head><script src="/x.js"></script><script>var a=1</script></head><body>
<div data-schedule class="not-content">
<ul class="sched-days"><li><a href="#day-2026-10-23">d</a></li></ul>
<section id="day-2026-10-23">
<div data-layout="table"><table><tr><td><ul>${table}${o.sectionInTable ? cell('2026-10-23-c', 'none') : ''}${cell('2026-10-23-b', 'none', o.noTableFallback)}</ul></td></tr></table></div>
<div data-layout="list"><ul class="sched-jump"><li><a href="${o.danglingAnchor ? '#slot-nowhere' : '#slot-1'}">1</a></li></ul><h3 id="slot-1">1</h3><ul>${list}${o.dupInList ? list : ''}${card('2026-10-23-b', o.parityState ?? 'none').replace(o.longUrl ? 'value=x' : '\u0000', o.longUrl ? `value=${'x'.repeat(4100)}` : '').replace(o.noFallback ? fallbacks : '\u0000', '')}</ul></div>
<div data-layout="sections"><ul>${card('2026-10-23-c', 'none')}</ul></div>
${o.script ? '<script>1</script>' : ''}${o.handler ? '<a href="#slot-1" onclick="x()">h</a>' : ''}${o.template ? '<template><p>x</p></template>' : ''}${o.custom ? '<my-widget></my-widget>' : ''}${o.hidden ? '<p hidden>x</p>' : ''}
</section></div>${o.extraScript ? '<script>alert(2)</script>' : ''}</body></html>`;
}

const sampleApi = (o = {}) => ({
  schema_version: 1,
  page: `${SITE}${BASE}/sessions/schedule/`,
  rooms: [{ key: 'r', name: 'R', size: 'XL', equipment: ['projector'] }],
  days: [{
    date: '2026-10-23', snapshot: '2026-10-23T09:00', timezone: o.timezone ?? 'Europe/Brussels',
    slots: [{ key: '1', start: '10:00', type: 'session' }],
    sessions: [
      { id: '2026-10-23-a', title: 'A', uncertain: false, note: { state: 'published', id: '2026-10-23-a', url: `${SITE}${BASE}/sessions/2026-10-23-a.md` } },
      { id: '2026-10-23-b', title: 'B', uncertain: false, note: { state: o.apiState ?? 'none', id: '2026-10-23-b' } },
      { id: '2026-10-23-c', title: 'C', uncertain: false, section: o.badSection ?? 'other', note: { state: 'none', id: '2026-10-23-c' } },
    ],
  }],
});

const sampleMd = (o = {}) => `## Friday\n\n- **A** — R. Notes: [published](${SITE}${BASE}/sessions/${o.mdId ?? '2026-10-23-a'}.md) (id: 2026-10-23-a)\n- **B** — R. Notes: none (id: 2026-10-23-b)\n- **C** — P. Notes: none (id: 2026-10-23-c)\n\nMachine-readable: <${SITE}${BASE}/api/schedule.json>\n`;

const fixturePage = (o = {}) => samplePage().replace('<ul class="sched-days"><li><a href="#day-2026-10-23">d</a></li></ul>', `<ul class="sched-days"><li><a href="#day-2026-10-23">d</a></li>${o.oneDay ? '' : '<li><a href="#day-2026-10-24">e</a></li>'}</ul>`)
  .replace('</section></div>', `</section><section id="day-2026-10-24"></section>${o.draftLinked ? `<a href="${SAMPLE_BASE}/sessions/${DRAFT_SENTINEL}/">d</a>` : ''}</div>`)
  .replaceAll('2026-10-23-a', PUBLISHED_SENTINEL).replaceAll('2026-10-23-b', DRAFT_SENTINEL)
  .replace(o.noPublished ? new RegExp(`data-note-state="published"`, 'g') : /\u0000/g, 'data-note-state="none"');

const all = (o = {}) => {
  const html = o.fixture ? fixturePage(o) : samplePage(o);
  return [
    ...checkNoJs(html, samplePage({})),
    ...checkLayouts(html, { timed: ['2026-10-23-a', '2026-10-23-b'], sectioned: ['2026-10-23-c'] }),
    ...checkLinks(html),
    ...checkParity({ html, api: sampleApi(o), md: sampleMd(o) }, SAMPLE.expected),
    ...checkApiShape(sampleApi(o)),
  ];
};

/** Each injected violation must be reported under its code; the clean sample must pass. */
export function selfTest() {
  const failures = [];
  const clean = all();
  if (clean.length) failures.push(`the clean sample reports: ${clean.join(' | ')}`);
  const cases = [
    ['a <script> in the root', 'no-js-script', { script: true }],
    ['an inline handler', 'no-js-handler', { handler: true }],
    ['a <template>', 'no-js-template', { template: true }],
    ['a custom element', 'no-js-custom-element', { custom: true }],
    ['a hidden session', 'no-js-hidden', { hidden: true }],
    ['a script the control page lacks', 'script-subset', { extraScript: true }],
    ['a session missing from the table', 'layout-missing', { dropFromTable: true }],
    ['a session missing from the list', 'layout-missing', { dropFromList: true }],
    ['a duplicate in the list', 'layout-duplicate', { dupInList: true }],
    ['a section session in the table', 'layout-extra', { sectionInTable: true }],
    ['a dangling anchor', 'anchor-dangling', { danglingAnchor: true }],
    ['an over-long Start URL', 'url-long', { longUrl: true }],
    ['a Start link without fallbacks', 'fallback-missing', { noFallback: true }],
    ['a table cell Start link without fallbacks', 'fallback-missing', { noTableFallback: true }],
    ['a state mismatch between HTML and data', 'parity-html', { parityState: 'published' }],
    ['a state mismatch in the API', 'parity-api', { apiState: 'published' }],
    ['a note mismatch in the Markdown', 'parity-md', { mdId: '2026-10-23-zzz' }],
    ['a wrong timezone in the API', 'api-shape', { timezone: 'UTC' }],
    ['an unknown section in the API', 'api-shape', { badSection: 'attic' }],
  ];
  for (const [name, code, o] of cases) {
    if (!all(o).some((p) => p.startsWith(`[${code}]`))) failures.push(`${name} was not reported as [${code}]`);
  }
  if (!checkParity({ html: '', api: {}, md: '' }, []).some((p) => p.startsWith('[parity-empty]'))) failures.push('an empty schedule was not reported as [parity-empty]');
  const fx = [...checkFixturePage(fixturePage())];
  if (fx.length) failures.push(`the clean fixture sample reports: ${fx.join(' | ')}`);
  for (const [name, code, o] of [
    ['a fixture with one day', 'fixture-switcher', { oneDay: true }],
    ['a draft sentinel linked to its page', 'fixture-draft-linked', { draftLinked: true }],
    ['a fixture without a published session', 'fixture-states', { noPublished: true }],
  ]) {
    if (!checkFixturePage(fixturePage(o)).some((p) => p.startsWith(`[${code}]`))) failures.push(`${name} was not reported as [${code}]`);
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'schedule-dist-self-'));
  try {
    fs.writeFileSync(path.join(tmp, 'a.txt'), `x ${SENTINEL} y`);
    if (!checkSentinelAbsent(tmp).length) failures.push('a planted sentinel was not reported as [sentinel]');
    fs.writeFileSync(path.join(tmp, 'a.txt'), 'clean');
    if (checkSentinelAbsent(tmp).length) failures.push('a clean directory was reported as [sentinel]');
    if (!checkPaths(tmp).some((p) => p.startsWith('[paths]'))) failures.push('missing view files were not reported as [paths]');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  return failures;
}

// ---------------------------------------------------------------- main

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const fixture = args.includes('--fixture');
  const dist = args.find((a) => !a.startsWith('--'));
  if (!dist) {
    console.error('usage: check-schedule-dist.mjs <distDir> [--fixture]');
    process.exit(2);
  }
  const broken = selfTest();
  if (broken.length) {
    console.error(`✗ the checks themselves are broken:\n  ${broken.join('\n  ')}`);
    process.exit(1);
  }
  console.log('✓ self-test: every injected violation is detected');
  const problems = checkDist(path.resolve(dist), { fixture });
  if (problems.length) {
    console.error(`✗ ${problems.length} problem(s) in ${dist}:\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`✓ the schedule in ${dist} passes (${fixture ? 'fixture' : 'real'} build)`);
}
