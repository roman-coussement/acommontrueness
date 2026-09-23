"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const sourcePath = "src/content/posts/understanding-transmission.md";
const outputPath = "dist/posts/understanding-transmission/index.html";

test("writing list renders title-only article items", () => {
  const html = read("dist/index.html");
  assert.match(html, /Understanding Transmission of Infectious Diseases/);
  assert.doesNotMatch(html, /class="post-description"/);
});

test("article output omits the biography", () => {
  assert.doesNotMatch(read(outputPath), /class="bio-section"/);
});

test("every level-three article section is a closed disclosure by default", () => {
  const html = read(outputPath);
  const disclosures = html.match(/<details class="article-disclosure">/g) || [];
  assert.equal(disclosures.length, 6);
  assert.doesNotMatch(html, /<details class="article-disclosure" open>/);
});

test("encounter-filter closing tools sit outside the Reception disclosure", () => {
  const html = read(outputPath);
  const receptionEnd = html.indexOf("</details>", html.indexOf("<strong>Reception</strong>"));
  const toolsParagraph = html.indexOf("Our main tools for closing the encounter filter");
  const compatibilityHeading = html.indexOf("Compatibility Filter</h2>");
  assert.ok(receptionEnd < toolsParagraph);
  assert.ok(toolsParagraph < compatibilityHeading);
});

test("simulator uses icon controls and the Interactive model title", () => {
  const html = read(outputPath);
  assert.match(html, /<h2 id="simulator-title">Interactive model<\/h2>/);
  assert.match(html, /id="simulation-toggle"[^>]+aria-label="Play outbreak"/);
  assert.match(html, /id="simulation-reset"[^>]+aria-label="Reset outbreak"/);
  assert.doesNotMatch(html, />Start<\/button>|>Reset<\/button>/);
});

test("transmission table wraps within the article column", () => {
  const css = read("src/styles/global.css");
  assert.match(css, /\.transmission-table\s*\{[^}]*table-layout:\s*fixed/s);
  assert.doesNotMatch(css, /\.transmission-table\s*\{[^}]*min-width:\s*40rem/s);
});

test("article source retains the six disclosure sections", () => {
  const source = read(sourcePath);
  assert.equal((source.match(/<details class="article-disclosure">/g) || []).length, 6);
});

test("simulator tears down navigation-sensitive resources", () => {
  const script = read("src/scripts/simulator.js");
  assert.match(script, /astro:page-load/);
  assert.match(script, /astro:before-swap/);
  assert.match(script, /cancelAnimationFrame/);
  assert.match(script, /resizeObserver\.disconnect/);
  assert.match(script, /removeEventListener/);
});
