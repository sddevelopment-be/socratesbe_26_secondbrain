import type { APIRoute } from 'astro';
import { getScheduleView } from '../../lib/schedule/source';
import { scheduleApi } from '../../lib/schedule/text.mjs';

// /api/schedule.json: the schedule as data (contracts/api-schedule.schema.json).
export const GET: APIRoute = async ({ site }) => {
  const siteRoot = `${site?.origin ?? ''}${import.meta.env.BASE_URL.replace(/\/$/, '')}`;
  const body = scheduleApi(await getScheduleView(), siteRoot, `${siteRoot}/sessions/schedule/`);
  return new Response(JSON.stringify(body, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
