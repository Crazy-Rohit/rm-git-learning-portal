#!/usr/bin/env node
/*
  Build script for the Git & GitHub Handbook. No dependencies, Node 18+.

    node build.js            build once  -> dist/index.html
    node build.js --watch    rebuild whenever anything in src/ changes

  How the output is assembled (see src/index.html for the placeholders):

    {{css}}      src/css/*.css           concatenated in filename order
    {{icons}}    src/partials/icons.html SVG sprite
    {{header}}   src/partials/header.html
    {{sidebar}}  src/partials/sidebar.html
    {{content}}  src/content/            see contentFiles() below
    {{js}}       src/js/*.js             concatenated in filename order,
                                         wrapped in one IIFE by the template

  Content order:
    src/content/*.html                    top-level files (cover, how to read), sorted
    src/content/part-N-<slug>/_part.html  part divider
    src/content/part-N-<slug>/chNN-*.html chapters, sorted

  The result is a single self-contained HTML file, exactly like the original
  handbook, so it can be opened directly from disk or printed to PDF.
*/
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const OUT_DIR = path.join(__dirname, 'dist');
const OUT_FILE = path.join(OUT_DIR, 'index.html');

const read = (p) => fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const sorted = (dir, re) => fs.readdirSync(dir).filter((f) => re.test(f)).sort();
const concat = (dir, re) => sorted(dir, re).map((f) => read(path.join(dir, f)).trim()).join('\n\n');

function contentFiles() {
  const dir = path.join(SRC, 'content');
  const files = [];
  for (const name of fs.readdirSync(dir).sort()) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) {
      const part = path.join(p, '_part.html');
      if (fs.existsSync(part)) files.push(part);
      for (const ch of sorted(p, /^ch\d+.*\.html$/)) files.push(path.join(p, ch));
    } else if (/\.html$/.test(name)) {
      files.push(p);
    }
  }
  return files;
}

function validate(content, page) {
  const problems = [];
  const dup = (re, label) => {
    const seen = new Set();
    for (const m of page.matchAll(re)) {
      if (seen.has(m[1])) problems.push('duplicate ' + label + ': ' + m[1]);
      seen.add(m[1]);
    }
  };
  dup(/<article class="chapter" id="([^"]+)"/g, 'chapter id');
  dup(/\bdata-k="([^"]+)"/g, 'exercise key (data-k)');
  dup(/\bid="([^"]+)"/g, 'element id');
  const ids = new Set([...page.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of page.matchAll(/href="#([^"]+)"/g)) {
    if (/['+]/.test(m[1])) continue; // template string inside the JS, not a real link
    // chN-sM anchors are generated at runtime by js/30-anchors.js
    if (!ids.has(m[1]) && !/^ch\d+-s\d+$/.test(m[1]) && m[1] !== 'top') problems.push('broken link: #' + m[1]);
  }
  const nos = [...content.matchAll(/<article class="chapter"[^>]*data-no="(\d+)"/g)].map((m) => +m[1]);
  nos.forEach((n, i) => { if (n !== i + 1) problems.push('chapter numbering: expected data-no="' + (i + 1) + '" but found ' + n); });
  return problems;
}

function build() {
  const t0 = Date.now();
  const files = contentFiles();
  const content = files.map((f) => read(f).trim()).join('\n\n');
  const page = read(path.join(SRC, 'index.html'))
    .replace('{{css}}', () => concat(path.join(SRC, 'css'), /\.css$/))
    .replace('{{icons}}', () => read(path.join(SRC, 'partials', 'icons.html')).trim())
    .replace('{{header}}', () => read(path.join(SRC, 'partials', 'header.html')).trim())
    .replace('{{sidebar}}', () => read(path.join(SRC, 'partials', 'sidebar.html')).trim())
    .replace('{{content}}', () => content)
    .replace('{{js}}', () => concat(path.join(SRC, 'js'), /\.js$/));

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, page, 'utf8');

  const chapters = (content.match(/<article class="chapter"/g) || []).length;
  const kb = (Buffer.byteLength(page) / 1024).toFixed(0);
  console.log(`[${new Date().toLocaleTimeString()}] built dist/index.html  ${chapters} chapters, ${kb} KB, ${Date.now() - t0} ms`);
  for (const p of validate(content, page)) console.warn('  warning: ' + p);
}

build();

if (process.argv.includes('--watch')) {
  let timer = null;
  console.log('watching src/ for changes...');
  fs.watch(SRC, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => { try { build(); } catch (e) { console.error(e.message); } }, 120);
  });
}
