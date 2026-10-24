// @ts-check
import { defineConfig } from 'astro/config';
import { defineDocKittyIntegrations } from '@spec-kitty/doc-toolkit/config';
import { socratesTheme } from './src/theme/index.ts';
import { OWNER, REPO, SITE, BASE } from './site.config.mjs';

export default defineConfig({
  site: SITE,
  base: BASE,
  // Pre-bundle Mermaid for the dev server: its CommonJS dependency (dayjs) is
  // otherwise served raw and the client-side diagram render fails in `astro dev`.
  vite: {
    optimizeDeps: { include: ['@spec-kitty/doc-toolkit > mermaid'] },
  },
  integrations: defineDocKittyIntegrations({
    title: 'SoCraTes BE 2026 — Second Brain',
    description:
      'The shared second brain of SoCraTes Belgium 2026: session notes, ideas and learnings from the unconference, for humans and agents alike.',
    // Must equal the Astro `base` above.
    base: BASE,
    social: [
      { icon: 'github', label: 'GitHub', href: `https://github.com/${OWNER}/${REPO}` },
      { icon: 'slack', label: 'SoCraTes BE Slack', href: 'https://socratesbe.org/slack/' },
    ],
    theme: socratesTheme,
    diagrams: true,
    markua: true,
    indexBasename: ['README'],
  }),
});
