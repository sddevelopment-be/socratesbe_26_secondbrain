import type { APIRoute } from 'astro';
import { pageRecord, pageRoute, markdownResponse } from '../lib/page-views';

// /<slug>.md: see src/lib/page-views.ts.
export const getStaticPaths = pageRoute.getStaticPaths;
export const GET: APIRoute = async (ctx) => markdownResponse(await pageRecord(ctx, 'markdown'));
