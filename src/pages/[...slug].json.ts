import type { APIRoute } from 'astro';
import { pageRecord, pageRoute, jsonResponse } from '../lib/page-views';

// /<slug>.json: see src/lib/page-views.ts.
export const getStaticPaths = pageRoute.getStaticPaths;
export const GET: APIRoute = async (ctx) => jsonResponse(await pageRecord(ctx, 'json'));
