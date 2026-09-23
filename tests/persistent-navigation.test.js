"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("title state is restored before paint and both shared nodes persist", () => {
  const layout = read("src/layouts/BaseLayout.astro");
  const title = read("src/components/SiteTitle.astro");
  const portrait = read("src/components/Portrait.astro");

  assert.match(layout, /ClientRouter/);
  assert.match(layout, /is:inline/);
  assert.match(layout, /localStorage\.getItem\(["']titleState["']\)/);
  assert.match(title, /transition:persist="site-title"/);
  assert.match(portrait, /transition:persist="site-portrait"/);
});

test("title and portrait scripts initialize and clean up on Astro navigation", () => {
  const title = read("src/scripts/site-title.js");
  const portrait = read("src/scripts/portrait.js");

  for (const script of [title, portrait]) {
    assert.match(script, /astro:page-load/);
    assert.match(script, /astro:before-swap/);
    assert.match(script, /removeEventListener/);
  }
  assert.match(portrait, /cancelAnimationFrame/);
});

test("navigation remains progressively enhanced and layout geometry is stable", () => {
  const nav = read("src/components/SiteNav.astro");
  const css = read("src/styles/global.css");

  for (const href of ['"/"', '"/projects/"', '"/library/"', '"/gallery/"']) {
    assert.match(nav, new RegExp(href.replaceAll("/", "\\/")));
  }
  assert.match(css, /scrollbar-gutter:\s*stable/);
  assert.match(css, /\.content-with-sidebar\s*\{[\s\S]*grid-template-columns:/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
