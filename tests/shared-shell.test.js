"use strict";

const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("shared navigation has the four current destinations and no bookmarks", () => {
  const nav = read("src/components/SiteNav.astro");

  assert.match(nav, /writing[\s\S]*projects[\s\S]*library[\s\S]*gallery/i);
  assert.doesNotMatch(nav, /bookmarks/i);
});

test("shared profile content uses canonical copy and stable portrait dimensions", () => {
  const bio = read("src/components/Bio.astro");
  const portrait = read("src/components/Portrait.astro");

  assert.match(bio, /special projects/i);
  assert.doesNotMatch(bio, /FAR\.AI/i);
  assert.match(portrait, /width="720"/);
  assert.match(portrait, /height="720"/);
});

test("base layout uses only the self-hosted typeface", () => {
  assert.doesNotMatch(
    read("src/layouts/BaseLayout.astro"),
    /fonts\.(googleapis|gstatic)\.com/,
  );
});

test("every shared public asset exists", () => {
  const expected = [
    "public/assets/baffle.min.js",
    "public/artwork/gallery-artwork.json",
    "public/artwork/optimized/iceland_photo.jpg",
    "public/fonts/averia-serif-libre/AveriaSerifLibre-Regular.ttf",
    "public/fonts/averia-serif-libre/AveriaSerifLibre-Bold.ttf",
    "public/fonts/averia-serif-libre/AveriaSerifLibre-Italic.ttf",
    "public/icons/jackdripper.svg",
    "public/icons/horseman.svg",
    "public/images/epoch-full-standard.svg",
    "public/library.csv",
  ];

  const gallery = JSON.parse(read("public/artwork/gallery-artwork.json"));
  gallery.forEach((file) => expected.push(`public/artwork/optimized/${file}`));

  expected.forEach((file) => assert.ok(fs.existsSync(path.join(root, file)), file));
});
