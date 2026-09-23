"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("build contains canonical writing, redirect, projects, and article routes", () => {
  for (const file of [
    "dist/index.html",
    "dist/writing/index.html",
    "dist/projects/index.html",
    "dist/posts/understanding-transmission/index.html",
  ]) {
    assert.ok(fs.existsSync(path.join(root, file)), file);
  }
});

test("writing and projects output preserve the intended list content", () => {
  const writing = read("dist/index.html");
  const projects = read("dist/projects/index.html").replaceAll("&#39;", "'");

  assert.match(writing, /Understanding Transmission of Infectious Diseases/);
  assert.doesNotMatch(writing, /post-description/);
  for (const title of ["22c", "Age of Research", "twentyfivebooks_", "endless eggs", "Conway's Game of Life Synthesizer"]) {
    assert.match(projects, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("writing alias points home and articles omit the biography", () => {
  assert.match(read("dist/writing/index.html"), /url=\/?["']/i);
  const article = read("dist/posts/understanding-transmission/index.html");
  assert.doesNotMatch(article, /class="bio-section"/);
  assert.match(article, /Combes' Two Filters/);
});

test("post source declares complete metadata", () => {
  const post = read("src/content/posts/understanding-transmission.md");

  assert.match(post, /^title:\s*["']Understanding Transmission of Infectious Diseases["']/m);
  assert.match(post, /^date:\s*2026-09-22$/m);
  assert.match(post, /^description:\s*.+$/m);
  assert.match(post, /^slug:\s*understanding-transmission$/m);
});
