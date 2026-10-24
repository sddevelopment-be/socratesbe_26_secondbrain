/**
 * The schedule as text for agents: Markdown for the page's `.md`, `.json` and
 * `.yaml` views, and the plain object behind `api/schedule.json`. Pure: both
 * read the one view model (view.mjs). Every link is absolute under the site
 * prefix; neither carries a prefill URL, only the note's state, id and page.
 */

const noteUrl = (siteRoot, id) => `${siteRoot}/sessions/${id}.md`;

/** The absolute URL of the machine-readable schedule. */
export const apiUrl = (siteRoot) => `${siteRoot}/api/schedule.json`;

/** Backslash-escape Markdown metacharacters so titles and descriptions read as plain text. */
const esc = (text) => text.replace(/[\\*_[\]()`#<>]/g, '\\$&');

function where(s) {
  if (s.location.kind === 'place') return s.location.label;
  const { name, facts } = s.location.room;
  return `${name} (${facts.join(', ')})`;
}

function bullet(s, siteRoot) {
  const notes = s.note.state === 'published' ? `[published](${noteUrl(siteRoot, s.id)})` : 'none';
  const from = s.start ? `, from ${s.start}` : '';
  const doubt = s.uncertain ? ' Partly unreadable on the board.' : '';
  const about = s.description ? ` ${esc(/[.!?]$/.test(s.description) ? s.description : `${s.description}.`)}` : '';
  return `- **${esc(s.title)}** — ${where(s)}${from}.${about}${doubt} Notes: ${notes} (id: ${s.id})`;
}

/** @param {import('./view.mjs').ScheduleView} view @param {string} siteRoot absolute, no trailing slash */
export function scheduleMarkdown(view, siteRoot) {
  const out = [];
  for (const day of view.days) {
    out.push(`## ${day.weekday} ${day.dateLabel}`, '');
    out.push(`Transcribed from the board at ${day.snapshot.time} on ${day.snapshot.dateLabel}. The board in the venue is authoritative.`, '');
    for (const slot of day.slots) {
      out.push(`### ${slot.start}`, '');
      if (slot.type !== 'session') out.push(`${slot.type[0].toUpperCase()}${slot.type.slice(1)}`, '');
      else out.push(...slot.sessions.map((s) => bullet(s, siteRoot)), '');
    }
    for (const section of day.sections) {
      out.push(`### ${section.heading}`, '', ...section.sessions.map((s) => bullet(s, siteRoot)), '');
    }
  }
  out.push(`Machine-readable: <${apiUrl(siteRoot)}>`, '');
  return out.join('\n');
}

/** The body of api/schedule.json (contracts/api-schedule.schema.json, with `note` per session). */
export function scheduleApi(view, siteRoot, pageUrl) {
  const session = (s) => {
    const out = { id: s.id, title: s.title };
    if (s.description !== undefined) out.description = s.description;
    if (s.location.kind === 'room') out.room = s.location.room.key;
    else out.place = s.location.label;
    if (s.slotKey !== undefined) out.slot = s.slotKey;
    if (s.sectionKey !== undefined) out.section = s.sectionKey;
    if (s.start !== undefined) out.start = s.start;
    out.uncertain = s.uncertain;
    out.note = s.note.state === 'published'
      ? { state: 'published', id: s.id, url: noteUrl(siteRoot, s.id) }
      : { state: 'none', id: s.id };
    return out;
  };
  return {
    schema_version: 1,
    page: pageUrl,
    rooms: view.rooms.map((r) => ({ key: r.key, name: r.name, size: r.size, equipment: [...r.equipment] })),
    days: view.days.map((d) => ({
      date: d.date,
      snapshot: `${d.snapshot.date}T${d.snapshot.time}`,
      timezone: 'Europe/Brussels',
      slots: d.slots.map((slot) => ({ key: slot.key, start: slot.start, type: slot.type })),
      sessions: [...d.slots.flatMap((slot) => slot.sessions), ...d.sections.flatMap((section) => section.sessions)].map(session),
    })),
  };
}
