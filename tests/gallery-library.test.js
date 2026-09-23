"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("gallery route and script support smooth repeat navigation", () => {
  const page = read("src/pages/gallery/index.astro");
  const script = read("src/scripts/gallery.js");

  assert.match(page, /id="galleryCarousel"/);
  assert.match(script, /requestAnimationFrame/);
  assert.match(script, /astro:page-load/);
  assert.match(script, /astro:before-swap/);
  assert.match(script, /removeEventListener/);
  assert.match(script, /aria-hidden/);
  assert.match(script, /decoding\s*=\s*["']async["']/);
  assert.match(script, /loading\s*=\s*["']eager["']/);
});

test("library route and script cleanly reload abortable data", () => {
  const page = read("src/pages/library/index.astro");
  const script = read("src/scripts/library.js");

  assert.match(page, /id="libraryTable"/);
  assert.match(page, /id="searchInput"/);
  assert.match(script, /astro:page-load/);
  assert.match(script, /astro:before-swap/);
  assert.match(script, /AbortController/);
  assert.match(script, /Unable to load library/);
  assert.match(script, /removeEventListener/);
});

test("gallery manifest contains only bounded optimized images", () => {
  const files = JSON.parse(read("public/artwork/gallery-artwork.json"));
  assert.ok(files.length >= 20);

  files.forEach((file) => {
    const asset = path.join(root, "public/artwork/optimized", file);
    assert.ok(fs.existsSync(asset), file);
    assert.ok(fs.statSync(asset).size < 1_500_000, `${file} exceeds the size ceiling`);
  });
});
