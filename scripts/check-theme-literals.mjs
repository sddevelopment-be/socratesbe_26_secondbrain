#!/usr/bin/env node
/**
 * The chrome stylesheet takes every colour from a token: `--dk-*` where the
 * toolkit has one, otherwise a theme-private `--sb-*` token declared in
 * src/theme/socrates.css. This check fails on a colour literal in it:
 *
 * - a hex colour, in any case (`#fff`, `#FFFFFF`);
 * - a colour function: rgb(), rgba(), hsl(), hsla(), hwb(), lab(), lch(),
 *   oklab(), oklch(), color() or color-mix(), in any case;
 * - a URL-encoded hex colour (`%23ff0000`) or a hex colour inside a url(),
 *   as in an inline SVG data URI;
 * - a named colour (`white`, `Black`, `rebeccapurple`) in the value of a
 *   colour-bearing property. `transparent`, `currentColor`, `inherit`,
 *   `initial`, `unset` and `none` are not colours and pass.
 *
 * Selectors are not values, so a hex-looking ID selector (`#decade`) passes,
 * and so does a fragment reference such as `url(#gradient)`. Comments are
 * checked for hex colours and colour functions too, so a colour named by
 * value in prose needs rewording; a colour named by word in a comment passes.
 *
 * Escape hatch: a `/* literal: <reason> *\/` comment on a line excuses every
 * literal on that whole line, so keep such a line to the one declaration it
 * justifies. The reason must not be empty.
 *
 * It reads the source, so it runs without a build.
 *
 *   node scripts/check-theme-literals.mjs [file ...]   (default: src/theme/chrome.css)
 */
import { readFileSync } from 'node:fs';

const files = process.argv.slice(2);
if (files.length === 0) files.push('src/theme/chrome.css');

const HEX = /#[0-9a-f]{3,8}\b/gi;
const ENCODED_HEX = /%23[0-9a-f]{3,8}\b/gi;
const COLOUR_FUNCTION = /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\(/gi;
const JUSTIFIED = /\/\*\s*literal:\s*[^\s*][^*]*\*\//;

// The CSS Color 4 named colours.
const NAMED = new Set(
  `aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown
  burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan
  darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid
  darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet
  deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro
  ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki
  lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow
  lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray
  lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine
  mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise
  mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab
  orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru
  pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown
  seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan
  teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen`.split(/\s+/),
);

// Properties whose value can carry a colour keyword.
const COLOUR_PROPERTY =
  /^(?:color|background(?:-(?:color|image))?|border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-color)?|border-image(?:-source)?|mask(?:-image)?|filter|outline(?:-color)?|text-decoration(?:-color)?|text-emphasis(?:-color)?|column-rule(?:-color)?|box-shadow|text-shadow|caret-color|accent-color|fill|stroke|stop-color|flood-color|lighting-color|scrollbar-color|-webkit-text-fill-color|-webkit-text-stroke(?:-color)?|-webkit-tap-highlight-color|--[\w-]+)$/i;

/** Every match of a global regex in text, as offsets. */
const offsets = (regex, text) => [...text.matchAll(regex)].map((m) => m.index);

/** The offsets of every colour literal in a stylesheet. */
function literalOffsets(css) {
  const found = [];
  // Comments: hex colours and colour functions only. Blank them out of the
  // code (keeping offsets) so the parse below never sees them.
  let code = css.replace(/\/\*[\s\S]*?\*\//g, (comment, at) => {
    for (const regex of [HEX, COLOUR_FUNCTION]) for (const i of offsets(regex, comment)) found.push(at + i);
    return comment.replace(/[^\n]/g, ' ');
  });
  // Chunks end at `{` (a selector or at-rule prelude), `;` or `}` (a declaration).
  for (const chunk of code.matchAll(/[^{};]+(?=[{};]|$)/g)) {
    const end = chunk.index + chunk[0].length;
    if (code[end] === '{') continue; // selectors carry no colours: `#decade` is an ID
    const colon = chunk[0].indexOf(':');
    if (colon < 0) continue;
    const property = chunk[0].slice(0, colon).trim();
    const valueAt = chunk.index + colon + 1;
    let value = chunk[0].slice(colon + 1);
    // Inside url(): a data URI can carry hex, encoded or not; any other URL's
    // `#` starts a fragment (`url(#gradient)`, `url(icons.svg#face)`).
    value = value.replace(/url\(\s*(['"]?)([\s\S]*?)\1\s*\)/gi, (whole, _quote, target, at) => {
      if (/^data:/i.test(target)) {
        for (const regex of [HEX, ENCODED_HEX]) for (const i of offsets(regex, whole)) found.push(valueAt + at + i);
      }
      return whole.replace(/[^\n]/g, ' ');
    });
    for (const regex of [HEX, ENCODED_HEX, COLOUR_FUNCTION]) for (const i of offsets(regex, value)) found.push(valueAt + i);
    if (COLOUR_PROPERTY.test(property)) {
      // var(--sb-white) names a token, not a colour; blank only the name, so a
      // fallback (`var(--sb-bar, white)`) is still scanned.
      const bare = value.replace(/var\(\s*--[\w-]+/gi, (v) => v.replace(/[^\n]/g, ' '));
      for (const word of bare.matchAll(/(?<![\w-])[a-z]+(?![\w-])/gi))
        if (NAMED.has(word[0].toLowerCase())) found.push(valueAt + word.index);
    }
  }
  return found;
}

/** The 1-based numbers of lines with an unjustified colour literal. */
function offendingLines(css) {
  const lines = css.split('\n');
  const lineOf = (offset) => css.slice(0, offset).split('\n').length;
  return [...new Set(literalOffsets(css).map(lineOf))]
    .filter((n) => !JUSTIFIED.test(lines[n - 1]))
    .sort((a, b) => a - b);
}

// Every rule above, checked against stylesheets that must fail and must pass.
const fixtures = {
  fails: [
    'a { color: #ffffff; }',
    'a { color: #FFF; }',
    'a { border-color: rgba(255, 255, 255, 0.25); }',
    'a { color: RGB(0 0 0); }',
    'a { color: hsl(0 0% 100%); }',
    'a { color: HSLA(0, 0%, 100%, 0.5); }',
    'a { color: hwb(0 100% 0%); }',
    'a { color: lab(100% 0 0); }',
    'a { color: lch(100% 0 0); }',
    'a { color: oklab(1 0 0); }',
    'a { color: oklch(1 0 0); }',
    'a { color: color(display-p3 1 1 1); }',
    'a { color: color-mix(in srgb, var(--sb-bar) 50%, var(--sb-bar-text)); }',
    'a { color: var(--sb-bar, white); }',
    'a { border: 1px solid Black; }',
    'a { outline-color: rebeccapurple; }',
    'a { box-shadow: 0 0 0 2px navy; }',
    'a {\n  background-image:\n    linear-gradient(red, blue);\n}',
    `a { background: url("data:image/svg+xml,%3Csvg fill='%23ff0000'/%3E"); }`,
    `a { background: url("data:image/svg+xml,<svg fill='#f00'/>"); }`,
    '/* white on #007bff */',
    'a { color: #fff; } /* literal: */',
  ],
  passes: [
    'a { color: var(--sb-bar-strong); }',
    'a { color: var(--sb-white); }',
    'a { color: #000; } /* literal: printed page, no token applies */',
    '#main { color: var(--dk-color-text); }',
    '#decade,\n#face { color: var(--dk-color-text); }',
    '.white .red { color: var(--dk-color-text); }',
    'a { fill: url(#gradient); }',
    "a { mask: url('icons.svg#face'); }",
    'a { color: transparent; border-color: currentColor; background: none; }',
    'a { color: inherit; outline-color: initial; fill: unset; }',
    'a { font-family: var(--dk-font-mono); content: "red"; transition: color 0.3s ease; }',
    '/* white text on the dark bar */',
  ],
};
const selfTest = [
  ...fixtures.fails.filter((css) => offendingLines(css).length === 0).map((css) => `should fail: ${css}`),
  ...fixtures.passes.filter((css) => offendingLines(css).length > 0).map((css) => `should pass: ${css}`),
];
if (selfTest.length > 0) {
  console.error(`✗ check-theme-literals self-test failed:\n  ${selfTest.join('\n  ')}`);
  process.exit(1);
}

const found = [];
for (const file of files) {
  const css = readFileSync(file, 'utf8');
  const lines = css.split('\n');
  for (const n of offendingLines(css)) found.push(`${file}:${n}: ${lines[n - 1].trim()}`);
}

if (found.length > 0) {
  console.error(
    `✗ ${found.length} line(s) with a colour literal; use a --dk-* or --sb-* token (src/theme/socrates.css) or add /* literal: <reason> */:\n  ${found.join('\n  ')}`,
  );
  process.exit(1);
}
console.log(
  `✓ no unjustified colour literals in ${files.join(', ')} (self-test: ${fixtures.fails.length} must-fail, ${fixtures.passes.length} must-pass)`,
);
