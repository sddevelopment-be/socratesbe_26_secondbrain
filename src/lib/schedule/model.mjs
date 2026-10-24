/**
 * The schedule model: the one and only validator of schedule data
 * (docs/_meta/schedule/*.yaml, FR-001, FR-019).
 *
 * Plain JavaScript that imports only node: built-ins, `yaml` and `gray-matter`,
 * so the same module runs inside Astro and in bare node (the check script).
 *
 * Findings follow FR-019: classes a-k are evaluated in order and a fault is
 * reported once, under the first class it matches. A finding reads
 * `<file>:<line> [<class>] <explanation>`.
 *
 * FR-019 names no class for value-shape faults, so they map as follows: text
 * that is too long, an enum value outside its list, a time/date/room-key that
 * does not match its pattern, a day whose `date` differs from its file name,
 * and a missing or empty `slots` list are reported as (d); duplicate room keys,
 * slot keys and equipment entries are reported as (e), like duplicate ids.
 *
 * One fault yields one finding: a reference to a collection or key that a
 * reported fault made unresolvable (an empty `rooms`, an empty room/slot key)
 * is not also reported as (g).
 *
 * No clock is read: the output depends on the files only (C-006).
 */
import fs from 'node:fs';
import path from 'node:path';
import { LineCounter, Parser, isMap, isScalar, isSeq, parseDocument } from 'yaml';
import matter from 'gray-matter';

/** FR-019 classes, in evaluation order. */
export const CLASSES = Object.freeze({
  a: 'unreadable',
  b: 'empty',
  c: 'writing rules',
  d: 'required field',
  e: 'duplicate',
  f: 'identity shape',
  g: 'unknown reference',
  h: 'location or timing',
  i: 'unknown field',
  j: 'draft note',
  k: 'placeholder description',
});
const CLASS_ORDER = Object.keys(CLASSES);

const DAY_FILE = /^(\d{4}-\d{2}-\d{2})\.yaml$/;
const KEY = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const SNAPSHOT = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):[0-5]\d$/;
const ID_SHAPE = /^(\d{4}-\d{2}-\d{2})-[a-z0-9]+(-[a-z0-9]+)*$/;
const ID_MAX = 60;
const TITLE_MAX = 100;
const DESCRIPTION_MAX = 140;
const PLACE_MAX = 40;
const SIZES = ['XL', 'L', 'S'];
const EQUIPMENT = ['projector', 'screen'];
const SLOT_TYPES = ['session', 'lunch', 'closing', 'dinner'];
const SECTIONS = ['lunch-tables', 'outside', 'evening', 'other'];
const SESSION_FIELDS = ['id', 'title', 'description', 'room', 'place', 'slot', 'section', 'start', 'uncertain'];

const codePoints = (s) => [...s].length;

function isRealDate(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

export function makeFinding(cls, file, line, message) {
  return { class: cls, file, line, message, text: `${file}:${line} [${cls}] ${message}` };
}

// ---------------------------------------------------------------- identity

/**
 * FR-001b: the identity of a session first added on `date`.
 * `taken` is the set of identities already in use (collisions get -2, -3, ...).
 */
export function formIdentity(date, title, taken = new Set()) {
  const slug =
    String(title)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'session';
  const cut = (text, max) => [...text].slice(0, max).join('').replace(/-+$/, '');
  const base = cut(`${date}-${slug}`, ID_MAX);
  if (!taken.has(base)) return base;
  for (let n = 2; ; n += 1) {
    const suffix = `-${n}`;
    const candidate = cut(base, ID_MAX - suffix.length) + suffix;
    if (!taken.has(candidate)) return candidate;
  }
}

// ----------------------------------------------------------------- reading

/**
 * Read a schedule directory: `rooms.yaml` plus one `YYYY-MM-DD.yaml` per day.
 * Anything else (bar a `sessions/` folder) and any unreadable file is listed in
 * `problems`, which validateSchedule reports as class (a).
 */
export function readScheduleDir(dir) {
  const out = { rooms: null, days: [], problems: [] };
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true }).sort((x, y) => (x.name < y.name ? -1 : 1));
  } catch (err) {
    out.problems.push({ file: dir, message: `cannot read the schedule directory (${err.code ?? err.message})` });
    return out;
  }
  const read = (name) => {
    const file = path.join(dir, name);
    try {
      return { file, src: fs.readFileSync(file, 'utf8') };
    } catch (err) {
      out.problems.push({ file, message: `cannot read the file (${err.code ?? err.message})` });
      return null;
    }
  };
  let roomsSeen = false;
  for (const entry of entries) {
    if (entry.isFile() && entry.name === 'rooms.yaml') {
      roomsSeen = true;
      out.rooms = read(entry.name);
    } else if (entry.isFile() && DAY_FILE.test(entry.name)) {
      const day = read(entry.name);
      if (day) out.days.push(day);
    } else if (!(entry.isDirectory() && entry.name === 'sessions')) {
      out.problems.push({ file: path.join(dir, entry.name), message: 'unexpected entry: only rooms.yaml, YYYY-MM-DD.yaml files and sessions/ belong here' });
    }
  }
  if (!roomsSeen) out.problems.push({ file: path.join(dir, 'rooms.yaml'), message: 'rooms.yaml is missing' });
  return out;
}

// ------------------------------------------------------------ file context

function openFile(file, src, findings) {
  const add = (cls, line, message) => findings.push(makeFinding(cls, file, line, message));
  if (!src.trim()) {
    add('b', 1, 'the file is empty');
    return null;
  }
  const lc = new LineCounter();
  const doc = parseDocument(src, { version: '1.2', lineCounter: lc });
  if (doc.errors.length) {
    const err = doc.errors[0];
    add('a', lc.linePos(err.pos[0]).line, `YAML cannot be read (${err.code}: ${err.message.split('\n')[0]})`);
    return null;
  }
  if (doc.contents === null) {
    add('b', 1, 'the file holds no data');
    return null;
  }
  if (!isMap(doc.contents)) {
    add('a', 1, 'the top level must be a mapping');
    return null;
  }
  const ctx = {
    file,
    src,
    doc,
    lc,
    tainted: new Set(),
    line: (node) => (node?.range ? lc.linePos(node.range[0]).line : 1),
    add,
  };
  return ctx;
}

// ------------------------------------------------- writing rules (class c)

function commentOffsets(src) {
  const found = [];
  const walk = (token) => {
    if (Array.isArray(token)) return token.forEach(walk);
    if (!token || typeof token !== 'object') return;
    if (token.type === 'comment') found.push(token.offset);
    for (const [key, value] of Object.entries(token)) if (key !== 'source') walk(value);
  };
  for (const token of new Parser().parse(src)) walk(token);
  return found;
}

const sameValue = (x, y) =>
  typeof x === typeof y && (x instanceof Date ? y instanceof Date && x.getTime() === y.getTime() : Object.is(x, y));

function checkWritingRules(ctx) {
  const lines = new Set();
  const flag = (line, message, node) => {
    if (node) ctx.tainted.add(node);
    if (lines.has(line)) return;
    lines.add(line);
    ctx.add('c', line, message);
  };

  for (const offset of commentOffsets(ctx.src)) {
    flag(ctx.lc.linePos(offset).line, 'comments are not allowed in schedule data');
  }

  const checkValue = (node, key) => {
    if (!isScalar(node)) {
      flag(ctx.line(node), 'anchors, aliases and tags are not allowed');
      return;
    }
    if (node.value === null && node.source === '' && node.type === 'PLAIN') return; // empty: a field fault, not a writing fault
    if (key === 'uncertain') {
      if (node.type !== 'PLAIN' || (node.source !== 'true' && node.source !== 'false')) {
        flag(ctx.line(node), '`uncertain` must be a bare true or false', node);
      }
    } else if (node.type !== 'QUOTE_DOUBLE' && node.type !== 'QUOTE_SINGLE') {
      flag(ctx.line(node), `text value is not quoted (write ${JSON.stringify(String(node.source))})`, node);
    }
  };
  const walk = (node, key) => {
    if (node && (node.anchor || node.tag)) flag(ctx.line(node), 'anchors, aliases and tags are not allowed', node);
    if (isMap(node)) {
      for (const pair of node.items) walk(pair.value, isScalar(pair.key) ? String(pair.key.value) : undefined);
    } else if (isSeq(node)) {
      for (const item of node.items) walk(item, key);
    } else if (node) {
      checkValue(node, key);
    }
  };
  walk(ctx.doc.contents);

  // YAML 1.1 and 1.2 readers must agree on every key and value.
  const old = parseDocument(ctx.src, { version: '1.1' });
  if (old.errors.length) {
    flag(ctx.lc.linePos(old.errors[0].pos[0]).line, 'a YAML 1.1 reader cannot read this file');
    return;
  }
  const compare = (a, b) => {
    if (isMap(a) && isMap(b) && a.items.length === b.items.length) {
      a.items.forEach((pair, i) => {
        compare(pair.key, b.items[i].key);
        compare(pair.value, b.items[i].value);
      });
    } else if (isSeq(a) && isSeq(b) && a.items.length === b.items.length) {
      a.items.forEach((item, i) => compare(item, b.items[i]));
    } else if (isScalar(a) && isScalar(b)) {
      if (!sameValue(a.value, b.value)) flag(ctx.line(a), 'YAML 1.1 and 1.2 read this value differently (quote it)', a);
    } else {
      flag(ctx.line(a), 'YAML 1.1 and 1.2 read this structure differently');
    }
  };
  compare(ctx.doc.contents, old.contents);
}

// -------------------------------------------------- shape helpers (b,d,e,i)

/** Fields of a closed mapping; unknown keys are class (i). */
function fields(ctx, node, allowed, label) {
  const found = new Map();
  for (const pair of node.items) {
    const name = isScalar(pair.key) ? String(pair.key.value) : '?';
    if (ctx.tainted.has(pair.key)) continue; // already reported under (c)
    if (!allowed.includes(name)) {
      ctx.add('i', ctx.line(pair.key), `unknown field '${name}' in ${label} (allowed: ${allowed.join(', ')})`);
    } else {
      found.set(name, { key: pair.key, node: pair.value });
    }
  }
  return found;
}

function required(ctx, found, name, owner, label) {
  const entry = found.get(name);
  if (!entry) ctx.add('d', ctx.line(owner), `${label} is missing the required field '${name}'`);
  return entry?.node;
}

/** A quoted text value; reports d for empty or too long. Returns undefined when faulty. */
function text(ctx, node, label, max) {
  if (node === undefined || ctx.tainted.has(node)) return undefined;
  if (!isScalar(node)) {
    ctx.add('d', ctx.line(node), `${label} must be a text value`);
    return undefined;
  }
  const value = node.value;
  if (typeof value !== 'string') {
    ctx.add(value === null ? 'd' : 'c', ctx.line(node), value === null ? `${label} is empty` : `${label} must be a quoted text value`);
    return undefined;
  }
  if (!value.trim()) {
    ctx.add('d', ctx.line(node), `${label} is empty`);
    return undefined;
  }
  if (max && codePoints(value) > max) {
    ctx.add('d', ctx.line(node), `${label} is too long (${codePoints(value)} > ${max} characters)`);
    return undefined;
  }
  return value;
}

function oneOf(ctx, node, label, allowed) {
  const value = text(ctx, node, label);
  if (value !== undefined && !allowed.includes(value)) {
    ctx.add('d', ctx.line(node), `${label} must be one of ${allowed.join(', ')}`);
    return undefined;
  }
  return value;
}

function pattern(ctx, node, label, regex, hint) {
  const value = text(ctx, node, label);
  if (value !== undefined && !regex.test(value)) {
    ctx.add('d', ctx.line(node), `${label} must look like ${hint}`);
    return undefined;
  }
  return value;
}

const isBlank = (node) => node === undefined || (isScalar(node) && node.value === null) || (isSeq(node) && node.items.length === 0);

/** A list that must not be empty; `cls` is the class reported when it is. */
function list(ctx, entry, owner, name, label, cls) {
  if (!entry || isBlank(entry.node)) {
    ctx.add(cls, ctx.line(entry?.key ?? owner), `${label} has no ${name}`);
    return null;
  }
  if (!isSeq(entry.node)) {
    ctx.add('d', ctx.line(entry.node), `'${name}' must be a list`);
    return null;
  }
  return entry.node.items;
}

// ------------------------------------------------------------------- rooms

function checkRooms(ctx) {
  const top = fields(ctx, ctx.doc.contents, ['rooms'], 'rooms.yaml');
  const items = list(ctx, top.get('rooms'), ctx.doc.contents, 'rooms', 'the file', 'b');
  const rooms = [];
  const keys = new Set();
  let resolvable = items !== null; // false once a fault hides which room keys exist
  for (const item of items ?? []) {
    if (!isMap(item)) {
      ctx.add('d', ctx.line(item), 'each room must be a mapping');
      resolvable = false;
      continue;
    }
    const f = fields(ctx, item, ['key', 'name', 'size', 'equipment'], 'a room');
    const keyNode = required(ctx, f, 'key', item, 'room');
    let key = text(ctx, keyNode, 'room key');
    if (key === undefined) resolvable = false;
    else {
      if (keys.has(key)) {
        ctx.add('e', ctx.line(keyNode), `duplicate room key '${key}'`);
      } else if (!KEY.test(key)) {
        ctx.add('d', ctx.line(keyNode), `room key '${key}' must be lowercase letters, digits and hyphens`);
      }
      keys.add(key);
    }
    const name = text(ctx, required(ctx, f, 'name', item, 'room'), 'room name');
    const size = oneOf(ctx, required(ctx, f, 'size', item, 'room'), 'room size', SIZES);
    const eqNode = required(ctx, f, 'equipment', item, 'room');
    let equipment;
    if (eqNode !== undefined) {
      if (!isSeq(eqNode)) {
        ctx.add('d', ctx.line(eqNode), "room 'equipment' must be a list");
      } else {
        equipment = [];
        for (const e of eqNode.items) {
          const value = oneOf(ctx, e, 'room equipment', EQUIPMENT);
          if (value === undefined) continue;
          if (equipment.includes(value)) ctx.add('e', ctx.line(e), `duplicate equipment '${value}'`);
          else equipment.push(value);
        }
      }
    }
    rooms.push({ key, name, size, equipment });
  }
  return { rooms, keys: resolvable ? keys : null };
}

// --------------------------------------------------------------------- day

function checkDay(ctx, fileDate, roomKeys, ids) {
  const root = ctx.doc.contents;
  const top = fields(ctx, root, ['date', 'snapshot', 'slots', 'sessions'], 'a day file');
  const day = { date: undefined, snapshot: undefined, slots: [], sessions: [] };

  const dateNode = required(ctx, top, 'date', root, 'day');
  const date = text(ctx, dateNode, 'date');
  if (date !== undefined) {
    if (!isRealDate(date)) ctx.add('d', ctx.line(dateNode), `date '${date}' must be a real YYYY-MM-DD date`);
    else if (date !== fileDate) ctx.add('d', ctx.line(dateNode), `date '${date}' must equal the file name (${fileDate})`);
    else day.date = date;
  }
  const snapNode = required(ctx, top, 'snapshot', root, 'day');
  const snapshot = text(ctx, snapNode, 'snapshot');
  if (snapshot !== undefined) {
    const m = SNAPSHOT.exec(snapshot);
    if (!m || !isRealDate(m[1])) ctx.add('d', ctx.line(snapNode), `snapshot '${snapshot}' must look like YYYY-MM-DDTHH:MM`);
    else day.snapshot = snapshot;
  }

  // slots
  const slotTypes = new Map();
  const slotItems = list(ctx, top.get('slots'), root, 'slots', 'the day', 'd');
  let slotsResolvable = slotItems !== null; // false once a fault hides which slot keys exist
  for (const item of slotItems ?? []) {
    if (!isMap(item)) {
      ctx.add('d', ctx.line(item), 'each slot must be a mapping');
      slotsResolvable = false;
      continue;
    }
    const f = fields(ctx, item, ['key', 'start', 'type'], 'a slot');
    const keyNode = required(ctx, f, 'key', item, 'slot');
    const key = text(ctx, keyNode, 'slot key');
    if (key === undefined) slotsResolvable = false;
    else {
      if (slotTypes.has(key)) ctx.add('e', ctx.line(keyNode), `duplicate slot key '${key}'`);
    }
    const start = pattern(ctx, required(ctx, f, 'start', item, 'slot'), 'slot start', TIME, 'HH:MM');
    const type = oneOf(ctx, required(ctx, f, 'type', item, 'slot'), 'slot type', SLOT_TYPES);
    if (key !== undefined && !slotTypes.has(key)) slotTypes.set(key, type);
    day.slots.push({ key, start, type });
  }

  // sessions
  for (const item of list(ctx, top.get('sessions'), root, 'sessions', 'the day', 'b') ?? []) {
    if (!isMap(item)) {
      ctx.add('d', ctx.line(item), 'each session must be a mapping');
      continue;
    }
    const f = fields(ctx, item, SESSION_FIELDS, 'a session');
    const s = {};

    const idNode = required(ctx, f, 'id', item, 'session');
    const id = text(ctx, idNode, 'session id');
    if (id !== undefined) {
      if (ids.has(id)) {
        const first = ids.get(id);
        ctx.add('e', ctx.line(idNode), `duplicate session id '${id}' (first used at ${first.file}:${first.line})`);
      } else {
        ids.set(id, { file: ctx.file, line: ctx.line(idNode) });
        const m = ID_SHAPE.exec(id);
        if (!m || !isRealDate(m[1]) || codePoints(id) > ID_MAX) {
          ctx.add('f', ctx.line(idNode), `session id '${id}' breaks the identity rule (valid date, lowercase letters, digits and single hyphens, at most ${ID_MAX} characters)`);
        }
      }
      s.id = id;
    }
    s.title = text(ctx, required(ctx, f, 'title', item, 'session'), 'title', TITLE_MAX);
    if (f.has('description')) s.description = text(ctx, f.get('description').node, 'description', DESCRIPTION_MAX);

    // location: exactly one of room | place
    const hasRoom = f.has('room');
    const hasPlace = f.has('place');
    if (hasRoom === hasPlace) {
      ctx.add('h', ctx.line(item), `session '${id ?? '?'}' needs exactly one of room and place`);
    } else if (hasRoom) {
      s.room = text(ctx, f.get('room').node, 'room');
      if (s.room !== undefined && roomKeys && !roomKeys.has(s.room)) {
        ctx.add('g', ctx.line(f.get('room').node), `unknown room '${s.room}'`);
      }
    } else {
      s.place = text(ctx, f.get('place').node, 'place', PLACE_MAX);
    }

    // timing: exactly one of slot | section
    const hasSlot = f.has('slot');
    const hasSection = f.has('section');
    if (hasSlot === hasSection) {
      ctx.add('h', ctx.line(item), `session '${id ?? '?'}' needs exactly one of slot and section`);
    } else if (hasSlot) {
      const node = f.get('slot').node;
      s.slot = text(ctx, node, 'slot');
      if (s.slot !== undefined) {
        if (!slotsResolvable) {
          // slots are faulty and already reported: the reference cannot be judged
        } else if (!slotTypes.has(s.slot)) ctx.add('g', ctx.line(node), `unknown slot '${s.slot}' in this day`);
        else if (slotTypes.get(s.slot) !== undefined && slotTypes.get(s.slot) !== 'session') {
          ctx.add('g', ctx.line(node), `slot '${s.slot}' is a ${slotTypes.get(s.slot)} slot; only session slots hold sessions`);
        }
      }
    } else {
      s.section = oneOf(ctx, f.get('section').node, 'section', SECTIONS);
    }
    if (f.has('start')) {
      const node = f.get('start').node;
      if (hasSlot && !hasSection) ctx.add('h', ctx.line(node), "'start' is only allowed together with 'section'");
      else s.start = pattern(ctx, node, 'start', TIME, 'HH:MM');
    }
    if (f.has('uncertain')) {
      const node = f.get('uncertain').node;
      if (!ctx.tainted.has(node)) {
        if (isScalar(node) && typeof node.value === 'boolean') s.uncertain = node.value;
        else ctx.add('c', ctx.line(node), '`uncertain` must be a bare true or false');
      }
    }
    day.sessions.push(s);
  }
  return day;
}

// ------------------------------------------------------------- public API

/**
 * Validate a schedule directory. Never throws.
 * Returns `{ findings, schedule }`; `schedule` is the normalised model
 * `{ rooms, days }` (days newest first, slots by start time, sessions in file
 * order) and is `null` whenever there is a finding.
 */
export function validateSchedule(dir) {
  const findings = [];
  const raw = readScheduleDir(dir);
  for (const p of raw.problems) findings.push(makeFinding('a', p.file, 1, p.message));

  let roomResult = null;
  if (raw.rooms) {
    const ctx = openFile(raw.rooms.file, raw.rooms.src, findings);
    if (ctx) {
      checkWritingRules(ctx);
      roomResult = checkRooms(ctx);
    }
  }
  if (raw.days.length === 0 && raw.rooms) {
    findings.push(makeFinding('b', dir, 1, 'the schedule has no day files'));
  }

  const ids = new Map();
  const days = [];
  for (const { file, src } of raw.days) {
    const ctx = openFile(file, src, findings);
    if (!ctx) continue;
    checkWritingRules(ctx);
    const fileDate = DAY_FILE.exec(path.basename(file))[1];
    days.push(checkDay(ctx, fileDate, roomResult?.keys ?? null, ids));
  }

  findings.sort(
    (x, y) =>
      CLASS_ORDER.indexOf(x.class) - CLASS_ORDER.indexOf(y.class) ||
      (x.file < y.file ? -1 : x.file > y.file ? 1 : 0) ||
      x.line - y.line,
  );
  if (findings.length) return { findings, schedule: null };

  const schedule = {
    rooms: roomResult.rooms.map((r) => ({ key: r.key, name: r.name, size: r.size, equipment: r.equipment ?? [] })),
    days: days
      .map((d) => ({
        date: d.date,
        snapshot: d.snapshot,
        slots: d.slots.map((s, i) => [s, i]).sort((x, y) => (x[0].start < y[0].start ? -1 : x[0].start > y[0].start ? 1 : x[1] - y[1])).map(([s]) => s),
        sessions: d.sessions.map((s) => {
          const out = { id: s.id, title: s.title };
          for (const name of ['description', 'room', 'place', 'slot', 'section', 'start']) if (s[name] !== undefined) out[name] = s[name];
          out.uncertain = s.uncertain === true;
          return out;
        }),
      }))
      .sort((x, y) => (x.date < y.date ? 1 : x.date > y.date ? -1 : 0)),
  };
  return { findings, schedule };
}

/** FR-019a: the model, or an Error listing every finding. The build calls this. */
export function loadSchedule(dir) {
  const { findings, schedule } = validateSchedule(dir);
  if (findings.length) {
    const error = new Error(`Schedule data is invalid (${findings.length} finding${findings.length === 1 ? '' : 's'}):\n${findings.map((f) => `  ${f.text}`).join('\n')}`);
    error.findings = findings;
    throw error;
  }
  return schedule;
}

/**
 * FR-019 (j) and (k) for the notes of scheduled sessions.
 * `templateDescription` is the placeholder description of
 * docs/_meta/templates/session-note.md, read by the caller.
 */
export function checkNotes(sessionIds, notesDir, templateDescription) {
  const findings = [];
  for (const id of sessionIds) {
    const file = path.join(notesDir, `${id}.md`);
    let src;
    try {
      src = fs.readFileSync(file, 'utf8');
    } catch {
      continue; // no note yet: nothing to check
    }
    let data;
    try {
      data = matter(src).data;
    } catch (err) {
      findings.push(makeFinding('a', file, 1, `the note's frontmatter cannot be read (${err.message.split('\n')[0]})`));
      continue;
    }
    const lineOf = (name) => {
      const lines = src.split(/\r?\n/);
      if (lines[0]?.trim() !== '---') return 1;
      for (let i = 1; i < lines.length && lines[i].trim() !== '---'; i += 1) {
        if (lines[i].startsWith(`${name}:`)) return i + 1;
      }
      return 1;
    };
    // Same rule as isDraftStatus in @spec-kitty/doc-toolkit lib/vocabulary-core.mjs
    // (not exported): a note without doc_status counts as a draft, as on the site.
    if ((data.doc_status ?? 'draft') === 'draft') {
      findings.push(makeFinding('j', file, lineOf('doc_status'), `the note for scheduled session '${id}' is a draft (doc_status ${data.doc_status === undefined ? 'is missing' : `is '${data.doc_status}'`}); publish it or remove it`));
    }
    if (templateDescription && String(data.description ?? '').trim() === templateDescription.trim()) {
      findings.push(makeFinding('k', file, lineOf('description'), `the note for scheduled session '${id}' still has the template description`));
    }
  }
  return findings;
}

/** FR-024 helper: date-prefixed notes that belong to no session, sorted. */
export function orphanNotes(sessionIds, notesDir) {
  const known = new Set(sessionIds);
  let names;
  try {
    names = fs.readdirSync(notesDir);
  } catch {
    return []; // no notes folder means no notes, hence no orphans
  }
  return names
    .filter((n) => /^\d{4}-\d{2}-\d{2}.*\.md$/.test(n) && !known.has(n.slice(0, -3)))
    .sort();
}
