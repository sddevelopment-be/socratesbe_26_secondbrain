// @ts-check
import { defineConfig } from 'astro/config';
import { defineDocKittyIntegrations } from '@spec-kitty/doc-toolkit/config';
import { socratesTheme } from './src/theme/index.ts';

// GitHub Pages project site. For a custom domain, set SITE to it and BASE to ''.
const OWNER = 'sddevelopment-be';
const REPO = 'socratesbe_26_secondbrain';
const SITE = `https://${OWNER}.github.io`;
const BASE = `/${REPO}`;

export default defineConfig({
  site: SITE,
  base: BASE,
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
