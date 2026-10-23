import type { APIRoute } from 'astro';
import { pageRecord, pageRoute, yamlResponse } from '../lib/page-views';

// /<slug>.yaml: see src/lib/page-views.ts.
export const getStaticPaths = pageRoute.getStaticPaths;
export const GET: APIRoute = async (ctx) => yamlResponse(await pageRecord(ctx, 'yaml'));
