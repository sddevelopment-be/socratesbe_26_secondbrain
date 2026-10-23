import type { APIRoute } from 'astro';
import { getStaticPaths, pageRecord, markdownResponse } from '../lib/page-views';

// /<slug>.md: see src/lib/page-views.ts.
export { getStaticPaths };
export const GET: APIRoute = async (ctx) => markdownResponse(ctx, await pageRecord(ctx, 'markdown'));
