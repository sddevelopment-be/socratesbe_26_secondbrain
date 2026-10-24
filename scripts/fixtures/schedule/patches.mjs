/**
 * Must-fail patches for the schedule validator (NFR-007).
 *
 * Each patch is ONE text change to the valid fixture in ./valid (never an
 * object rebuilt from data, which would lose the quoting the rules are about).
 * `find` occurs exactly once in `file` (the test asserts it). `expect` is the
 * single finding the change must produce: its FR-019 class and the line in
 * `file`. Paths are relative to the fixture directory.
 */

/** Stand-in for the template's placeholder description (class k). */
export const TEMPLATE_DESCRIPTION = 'One-line summary of what this session covered';

const DAY = '2026-10-23.yaml';
const SMALL_DAY = '2026-10-22.yaml';
const ROOMS = 'rooms.yaml';
const NOTE = 'sessions/2026-10-22-moved-across-days.md';

export const patches = [
  // (a) cannot be read
  {
    name: 'a: file truncated mid-value',
    file: SMALL_DAY,
    find: '  - id: "2026-10-22-opening-circle"\n    title: "Opening Circle"\n    room: "ourthe"\n    slot: "1930"\n',
    replace: '  - id: "2026-10-22-opening-circle"\n    title: "Opening Ci',
    expect: { class: 'a', line: 9 },
  },
  // (b) empty
  {
    name: 'b: sessions emptied',
    file: SMALL_DAY,
    find: 'sessions:\n  - id: "2026-10-22-opening-circle"\n    title: "Opening Circle"\n    room: "ourthe"\n    slot: "1930"\n',
    replace: 'sessions: []\n',
    expect: { class: 'b', line: 7 },
  },
  {
    name: 'b: rooms emptied (no cascade of unknown rooms)',
    file: ROOMS,
    find: 'rooms:\n  - key: "sambre-meuse"\n    name: "Sambre / Meuse"\n    size: "XL"\n    equipment: ["projector", "screen"]\n  - key: "ourthe"\n    name: "Ourthe"\n    size: "L"\n    equipment: ["projector"]\n  - key: "lesse"\n    name: "Lesse"\n    size: "S"\n    equipment: []\n',
    replace: 'rooms: []\n',
    expect: { class: 'b', line: 1 },
  },
  // (c) writing rules
  {
    name: 'c: trailing comment after a quoted value',
    file: DAY,
    find: '    type: "lunch"',
    replace: '    type: "lunch"   # note',
    expect: { class: 'c', line: 9 },
  },
  {
    name: 'c: unquoted title',
    file: DAY,
    find: '    title: "Event Storming"',
    replace: '    title: Event Storming',
    expect: { class: 'c', line: 21 },
  },
  {
    name: 'c: unquoted title that hides a comment',
    file: DAY,
    find: '    title: "TDD #1: the team\'s Q&A … 🎉"',
    replace: '    title: TDD #1',
    expect: { class: 'c', line: 34 },
  },
  {
    name: 'c: uncertain is a quoted word',
    file: DAY,
    find: '    uncertain: true',
    replace: '    uncertain: "yes"',
    expect: { class: 'c', line: 52 },
  },
  {
    name: 'c: unquoted text value (a time)',
    file: DAY,
    find: '    start: "13:30"',
    replace: '    start: 13:30',
    expect: { class: 'c', line: 11 },
  },
  {
    name: 'c: key that YAML 1.1 reads as a boolean (1.1 versus 1.2 comparison only)',
    file: DAY,
    find: '    place: "Cafeteria"',
    replace: '    place: "Cafeteria"\n    no: "x"',
    expect: { class: 'c', line: 51 },
  },
  // (d) required field missing or empty
  {
    name: 'd: day without slots (no cascade of unknown slots)',
    file: SMALL_DAY,
    find: 'slots:\n  - key: "1930"\n    start: "19:30"\n    type: "session"\n',
    replace: 'slots: []\n',
    expect: { class: 'd', line: 3 },
  },
  {
    name: 'd: empty room key (no cascade of unknown rooms)',
    file: ROOMS,
    find: '  - key: "ourthe"',
    replace: '  - key: ""',
    expect: { class: 'd', line: 6 },
  },
  {
    name: 'd: empty slot key (no cascade of unknown slots)',
    file: SMALL_DAY,
    find: '  - key: "1930"',
    replace: '  - key: ""',
    expect: { class: 'd', line: 4 },
  },
  {
    name: 'd: title of 101 code points (multi-byte)',
    file: DAY,
    find: '    title: "Run Session"',
    replace: `    title: "${'🎉'.repeat(101)}"`,
    expect: { class: 'd', line: 44 },
  },
  {
    name: 'd: empty title',
    file: DAY,
    find: '    title: "Run Session"',
    replace: '    title: ""',
    expect: { class: 'd', line: 44 },
  },
  {
    name: 'd: empty snapshot',
    file: SMALL_DAY,
    find: 'snapshot: "2026-10-22T20:15"',
    replace: 'snapshot: ""',
    expect: { class: 'd', line: 2 },
  },
  {
    name: 'd: title missing',
    file: DAY,
    find: '    title: "Mob Programming"\n',
    replace: '',
    expect: { class: 'd', line: 29 },
  },
  // (e) duplicate identity
  {
    name: 'e: duplicate session id',
    file: DAY,
    find: '  - id: "2026-10-23-is-tdd-dead"',
    replace: '  - id: "2026-10-23-event-storming"',
    expect: { class: 'e', line: 25 },
  },
  // (f) identity shape
  {
    name: 'f: identity breaks the rule',
    file: DAY,
    find: '  - id: "2026-10-23-run-session"',
    replace: '  - id: "Bad Id"',
    expect: { class: 'f', line: 43 },
  },
  {
    name: 'f: identity with an impossible date',
    file: DAY,
    find: '  - id: "2026-10-23-run-session"',
    replace: '  - id: "2026-02-30-run-session"',
    expect: { class: 'f', line: 43 },
  },
  {
    name: 'f: identity of 61 characters',
    file: DAY,
    find: '  - id: "2026-10-23-run-session"',
    replace: `  - id: "2026-10-23-${'a'.repeat(50)}"`,
    expect: { class: 'f', line: 43 },
  },
  // (g) unknown reference
  {
    name: 'g: unknown room',
    file: DAY,
    find: '    room: "ourthe"',
    replace: '    room: "nile"',
    expect: { class: 'g', line: 23 },
  },
  {
    name: 'g: session in a lunch slot',
    file: DAY,
    find: '    room: "lesse"\n    slot: "1330"',
    replace: '    room: "lesse"\n    slot: "1230"',
    expect: { class: 'g', line: 42 },
  },
  // (h) location or timing
  {
    name: 'h: both room and place',
    file: DAY,
    find: '    place: "Outside"',
    replace: '    place: "Outside"\n    room: "lesse"',
    expect: { class: 'h', line: 43 },
  },
  {
    name: 'h: start without section',
    file: DAY,
    find: '    room: "lesse"\n    slot: "1050"',
    replace: '    room: "lesse"\n    slot: "1050"\n    start: "10:55"',
    expect: { class: 'h', line: 29 },
  },
  // (i) unknown field
  {
    name: 'i: extra field',
    file: DAY,
    find: '    place: "Cafeteria"',
    replace: '    place: "Cafeteria"\n    convener: "x"',
    expect: { class: 'i', line: 51 },
  },
  // (j) draft note for a scheduled session
  {
    name: 'j: note is a draft',
    file: NOTE,
    find: 'doc_status: active',
    replace: 'doc_status: draft',
    expect: { class: 'j', line: 4 },
  },
  {
    name: 'j: note without doc_status counts as a draft',
    file: NOTE,
    find: 'doc_status: active\n',
    replace: '',
    expect: { class: 'j', line: 1 },
  },
  // (k) placeholder description
  {
    name: 'k: note keeps the template description',
    file: NOTE,
    find: 'description: What we learnt from a session that changed day without losing its note.',
    replace: `description: ${TEMPLATE_DESCRIPTION}`,
    expect: { class: 'k', line: 3 },
  },
];
