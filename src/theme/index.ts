/**
 * SoCraTes BE theme — the custom chrome for the 2026 second brain.
 *
 * Derived from the look of https://socratesbe.org (Inter type, the #007bff
 * primary, the dark #262627 header and footer bars, 8px cards and pill buttons)
 * and the blue/red ensō of the SoCraTes BE logo. Values are recreated here as
 * DocKitty `--dk-*` tokens; nothing is copied from the site's template CSS.
 *
 * Layered straight over the DocKitty default (no `extends`), so none of the
 * Spec Kitty brand's yellow leaks in.
 *   - mode-invariant tokens (type, radii) go in `tokens` below;
 *   - per-mode colour lives in socrates.css under `:root` and
 *     `:root[data-theme='dark']`;
 *   - chrome.css styles the header/footer bars and page furniture.
 */
import { fileURLToPath } from 'node:url';
import type { DocKittyOptions } from '@spec-kitty/doc-toolkit/config';

type DocKittyTheme = NonNullable<DocKittyOptions['theme']>;

const here = (file: string) => fileURLToPath(new URL(file, import.meta.url));

export const socratesTheme: DocKittyTheme = {
  name: 'socratesbe',
  tokens: {
    '--dk-font-sans':
      '"Inter", "Roboto", -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
    '--dk-font-display':
      '"Inter", "Roboto", -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
    '--dk-font-mono': '"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace',
    '--dk-weight-display': '700',
    '--dk-tracking-caps': '0.08em',
    '--dk-radius-sm': '0.375rem',
    '--dk-radius-md': '0.5rem',
    '--dk-radius-lg': '0.75rem',
    '--dk-radius-pill': '50px',
  },
  customCss: ['./src/theme/socrates.css', './src/theme/chrome.css'],
  assets: {
    // A served path, not a file path: the toolkit hands any value starting
    // with '/' straight to Starlight as a URL. The file lives in public/.
    favicon: '/favicon.svg',
    fonts: ['https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'],
  },
  slots: {
    'dk:head': here('./SiteHead.astro'),
    'dk:site-header': here('./SiteHeader.astro'),
    'dk:site-footer': here('./SiteFooter.astro'),
  },
};

export default socratesTheme;
