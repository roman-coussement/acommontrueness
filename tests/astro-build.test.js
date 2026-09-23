"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("project exposes the complete static-site workflow", () => {
  const pkg = JSON.parse(read("package.json"));

  assert.equal(pkg.private, true);
  assert.equal(pkg.scripts.dev, "astro dev");
  assert.equal(pkg.scripts.build, "astro build");
  assert.equal(pkg.scripts.preview, "astro preview");
  assert.equal(pkg.scripts.test, "node --test tests/*.test.js");
  assert.equal(pkg.scripts.deploy, "npm run build && wrangler deploy");
});

test("Astro is configured for static directory-style output", () => {
  const config = read("astro.config.mjs");

  assert.match(config, /output:\s*["']static["']/);
  assert.match(config, /outDir:\s*["']\.\/dist["']/);
  assert.match(config, /trailingSlash:\s*["']always["']/);
});

test("generated and local tool directories stay out of git", () => {
  const ignored = read(".gitignore");

  assert.match(ignored, /^node_modules\/$/m);
  assert.match(ignored, /^dist\/$/m);
  assert.match(ignored, /^\.wrangler\/$/m);
});
