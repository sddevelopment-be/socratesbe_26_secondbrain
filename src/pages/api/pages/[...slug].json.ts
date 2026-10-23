import type { APIRoute } from 'astro';
import { jsonResponse, pageRecord, pageRoute } from '../../../lib/page-views';

// The canonical agent record, with links to the page's other views.
export const getStaticPaths = pageRoute.getStaticPaths;
export const GET: APIRoute = async (ctx) => jsonResponse(await pageRecord(ctx, 'api'));
