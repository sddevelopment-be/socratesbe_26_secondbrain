import type { APIRoute } from 'astro';
import { getStaticPaths, jsonResponse, pageRecord } from '../../../lib/page-views';

// The canonical agent record, with links to the page's other views.
export { getStaticPaths };
export const GET: APIRoute = async (ctx) => jsonResponse(await pageRecord(ctx, 'api'));
