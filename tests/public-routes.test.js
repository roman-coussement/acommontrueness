"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const retained = [
  "dist/pastpresent/index.html",
  "dist/bookmarks/index.html",
  "dist/ff-gate.html",
  "dist/friends-family.html",
  "dist/wardrobe.html",
  "dist/wardrobe (1).html",
  "dist/test-baffle.html",
];

test("production build retains every existing ancillary route", () => {
  retained.forEach((file) => assert.ok(fs.existsSync(path.join(root, file)), file));
});

test("retained documents have no missing root-relative static assets", () => {
  for (const file of retained) {
    if (!fs.existsSync(path.join(root, file))) continue;
    const html = fs.readFileSync(path.join(root, file), "utf8");
    const refs = [...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map((match) => match[1]);
    refs.filter((ref) => !ref.endsWith("/")).forEach((ref) => {
      assert.ok(fs.existsSync(path.join(root, "dist", ref.slice(1))), `${file}: ${ref}`);
    });
    assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/, file);
  }
});

test("build output excludes repository and source-only directories", () => {
  for (const name of [".git", ".claude", "tests", "docs", "src"]) {
    assert.ok(!fs.existsSync(path.join(root, "dist", name)), name);
  }
  const astroSources = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.name.endsWith(".astro")) astroSources.push(full);
    }
  };
  visit(path.join(root, "dist"));
  assert.deepEqual(astroSources, []);
});
