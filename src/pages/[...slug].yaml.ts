import type { APIRoute } from 'astro';
import { getStaticPaths, pageRecord, yamlResponse } from '../lib/page-views';

// /<slug>.yaml: see src/lib/page-views.ts.
export { getStaticPaths };
export const GET: APIRoute = async (ctx) => yamlResponse(await pageRecord(ctx, 'yaml'));
