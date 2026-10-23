import { agentIndexRoute } from '@spec-kitty/doc-toolkit/routes';

// No Gherkin feature pages here, so there is no scenarios index to link to.
export const GET = agentIndexRoute({ title: 'SoCraTes BE 2026 — Second Brain', links: { scenarios: false } });
