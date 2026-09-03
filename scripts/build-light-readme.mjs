#!/usr/bin/env node
// Generates README-light.md from README.md.
//
//   npm run docs:readme-light
//
// GitHub has no theme toggle, so the toggle is a pair of pages that link to each
// other. They must stay identical apart from the screenshot paths and that one
// link, which is why the light page is generated rather than maintained: edit
// README.md, run this, commit both.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'README.md');
const OUT = path.join(ROOT, 'README-light.md');

const REPLACEMENTS = [
  [/docs\/screenshots\/dark\//g, 'docs/screenshots/light/'],
  [/docs\/screenshots\/responsive\/dark\//g, 'docs/screenshots/responsive/light/'],
  [
    '<p><b>Dark mode</b> · <a href="./README-light.md">View this page in light mode</a></p>',
    '<p><b>Light mode</b> · <a href="./README.md">View this page in dark mode</a></p>',
  ],
  [
    'This page shows **dark mode**; the same gallery in light mode is at **[README-light.md](./README-light.md)**.',
    'This page shows **light mode**; the same gallery in dark mode is at **[README.md](./README.md)**.',
  ],
];

const HEADER = '<!-- Generated from README.md by scripts/build-light-readme.mjs. Do not edit by hand. -->\n\n';

let out = fs.readFileSync(SRC, 'utf8');
for (const [from, to] of REPLACEMENTS) {
  const before = out;
  out = out.replaceAll(from, to);
  if (before === out) {
    console.error(`README.md is missing the expected marker: ${from}`);
    process.exit(1);
  }
}

fs.writeFileSync(OUT, HEADER + out);
console.log(`Wrote ${path.relative(ROOT, OUT)} from ${path.relative(ROOT, SRC)}`);
