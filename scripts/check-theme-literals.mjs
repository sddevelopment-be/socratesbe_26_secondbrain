#!/usr/bin/env node
/**
 * The chrome stylesheet takes every colour from a token: `--dk-*` where the
 * toolkit has one, otherwise a theme-private `--sb-*` token declared in
 * src/theme/socrates.css. A hex colour or an rgb()/rgba()/hsl()/hsla()
 * literal fails the check unless its line says why, with
 * `/* literal: <reason> *\/`. Comments are checked too, so a colour named in
 * prose needs rewording or the same marker.
 *
 * It reads the source, so it runs without a build.
 *
 *   node scripts/check-theme-literals.mjs [file ...]   (default: src/theme/chrome.css)
 */
import { readFileSync } from 'node:fs';

const files = process.argv.slice(2);
if (files.length === 0) files.push('src/theme/chrome.css');

const LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/;
const JUSTIFIED = /\/\*\s*literal:\s*\S[^*]*\*\//;

/** The 1-based numbers of lines with an unjustified colour literal. */
function offendingLines(text) {
  return text
    .split('\n')
    .flatMap((line, i) => (LITERAL.test(line) && !JUSTIFIED.test(line) ? [i + 1] : []));
}

// The check must catch a bare literal and let a justified one or a token through.
const fixtures = {
  fails: ['a { color: #ffffff; }', 'a { border-color: rgba(255, 255, 255, 0.25); }', 'a { color: #fff; } /* literal: */'],
  passes: [
    'a { color: var(--sb-bar-strong); }',
    'a { color: #000; } /* literal: printed page, no token applies */',
    '#main { color: var(--dk-color-text); }',
  ],
};
const selfTest = [
  ...fixtures.fails.filter((line) => offendingLines(line).length === 0).map((line) => `should fail: ${line}`),
  ...fixtures.passes.filter((line) => offendingLines(line).length > 0).map((line) => `should pass: ${line}`),
];
if (selfTest.length > 0) {
  console.error(`✗ check-theme-literals self-test failed:\n  ${selfTest.join('\n  ')}`);
  process.exit(1);
}

const found = [];
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  for (const n of offendingLines(lines.join('\n'))) found.push(`${file}:${n}: ${lines[n - 1].trim()}`);
}

if (found.length > 0) {
  console.error(
    `✗ ${found.length} colour literal(s) without a token; use a --dk-* or --sb-* token (src/theme/socrates.css) or add /* literal: <reason> */:\n  ${found.join('\n  ')}`,
  );
  process.exit(1);
}
console.log(`✓ no unjustified colour literals in ${files.join(', ')} (self-test passed)`);
