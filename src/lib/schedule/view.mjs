/**
 * The schedule view model: one plain object that every renderer reads (the
 * page layouts, and later the API and text views). Pure: no file reads, no
 * clock. Callers pass the validated schedule, the set of published note ids,
 * the site constants and the note template text.
 */
import { noteState, notePath, startNotesUrl, templateUrl, guideHref } from './links.mjs';

export const SECTION_HEADINGS = Object.freeze({
  'lunch-tables': 'Lunch tables',
  outside: 'Outside',
  evening: 'Evening',
  other: 'Other / not yet scheduled',
});

const SECTION_ORDER = ['lunch-tables', 'outside', 'evening', 'other'];

const weekdayName = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'UTC' });

const ukDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** UK display date, e.g. "23 October 2026", from an ISO date (no clock). */
export function ukDateOf(date) {
  return ukDate.format(new Date(`${date.slice(0, 10)}T00:00:00Z`));
}

const JUMP_TYPES = ['session', 'lunch', 'closing', 'dinner'];

export function weekdayOf(date) {
  return weekdayName.format(new Date(`${date}T00:00:00Z`));
}

const SIZE_WORDS = { XL: 'XL room', L: 'L room', S: 'S room' };

/** Room facts in words: "XL room · projector"; a room without equipment shows its size only. */
export function roomFacts(room) {
  return [SIZE_WORDS[room.size] ?? `${room.size} room`, ...room.equipment];
}

/**
 * @typedef {{ id: string, title: string, description?: string, slotKey?: string, sectionKey?: string,
 *   start?: string, uncertain: boolean,
 *   location: { kind: 'room', room: { key: string, name: string, facts: string[] } } | { kind: 'place', label: string },
 *   note: { state: 'published' | 'none', href?: string },
 *   startNotes: { url: string, truncated: boolean },
 *   fallback: { templateUrl: string, guideHref: string } }} SessionView
 * @typedef {{ key: string, start: string, type: string, sessions: SessionView[] }} SlotView
 * @typedef {{ key: string, heading: string, sessions: SessionView[] }} SectionView
 * @typedef {{ date: string, weekday: string, dataFileUrl: string, snapshot: { date: string, dateLabel: string, time: string },
 *   dateLabel: string, jumpSlots: SlotView[], slots: SlotView[], sections: SectionView[] }} DayView
 * @typedef {{ days: DayView[], rooms: object[] }} ScheduleView
 */

/**
 * @param {{schedule: any, publishedIds: Set<string>,
 *   site: {owner: string, repo: string, branch: string, base: string}, template: string}} input
 * @returns {ScheduleView}
 */
export function buildScheduleView({ schedule, publishedIds, site, template }) {
  const rooms = new Map(schedule.rooms.map((r) => [r.key, r]));

  const sessionView = (s, day) => {
    const published = noteState(s.id, publishedIds) === 'published';
    const location = s.room !== undefined
      ? { kind: 'room', room: { key: s.room, name: rooms.get(s.room).name, facts: roomFacts(rooms.get(s.room)) } }
      : { kind: 'place', label: s.place };
    const view = {
      id: s.id,
      title: s.title,
      location,
      uncertain: s.uncertain === true,
      note: published ? { state: 'published', href: notePath(site.base, s.id) } : { state: 'none' },
      startNotes: startNotesUrl({ owner: site.owner, repo: site.repo, branch: site.branch, id: s.id, title: s.title, day: day.date, template }),
      fallback: {
        templateUrl: templateUrl(site.owner, site.repo, site.branch),
        guideHref: guideHref(site.base),
      },
    };
    if (s.description !== undefined) view.description = s.description;
    if (s.slot !== undefined) view.slotKey = s.slot;
    if (s.section !== undefined) view.sectionKey = s.section;
    if (s.start !== undefined) view.start = s.start;
    return view;
  };

  const days = schedule.days.map((day) => {
    const sessions = day.sessions.map((s) => sessionView(s, day));
    const slots = day.slots.map((slot) => ({
      key: slot.key,
      start: slot.start,
      type: slot.type,
      sessions: sessions.filter((s) => s.slotKey === slot.key),
    }));
    return {
      date: day.date,
      weekday: weekdayOf(day.date),
      dateLabel: ukDateOf(day.date),
      dataFileUrl: `https://github.com/${site.owner}/${site.repo}/blob/${site.branch}/docs/_meta/schedule/${day.date}.yaml`,
      snapshot: { date: day.snapshot.slice(0, 10), dateLabel: ukDateOf(day.snapshot), time: day.snapshot.slice(11, 16) },
      slots,
      jumpSlots: slots.filter((slot) => JUMP_TYPES.includes(slot.type)),
      sections: SECTION_ORDER.map((key) => ({
        key,
        heading: SECTION_HEADINGS[key],
        sessions: sessions.filter((s) => s.sectionKey === key),
      })).filter((section) => section.sessions.length > 0),
    };
  });

  return { days, rooms: schedule.rooms.map((r) => ({ ...r, facts: roomFacts(r) })) };
}
