import type { APIRoute } from 'astro';
import { getStaticPaths, pageRecord, jsonResponse } from '../lib/page-views';

// /<slug>.json: see src/lib/page-views.ts.
export { getStaticPaths };
export const GET: APIRoute = async (ctx) => jsonResponse(await pageRecord(ctx, 'json'));
