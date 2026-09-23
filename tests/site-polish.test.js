const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("navigation omits bookmarks everywhere it is rendered", () => {
  assert.doesNotMatch(read("src/components/SiteNav.astro"), /bookmarks/i);
});

test("shared shell declares one optimized portrait with stable dimensions", () => {
  const portrait = read("src/components/Portrait.astro");
  assert.match(portrait, /src="\/artwork\/optimized\/iceland_photo\.jpg"/);
  assert.match(portrait, /width="720"/);
  assert.match(portrait, /height="720"/);
  assert.match(portrait, /transition:persist="site-portrait"/);
});

test("shared layout reserves stable geometry and enables persistent navigation", () => {
  const css = read("src/styles/global.css");
  assert.match(css, /scrollbar-gutter:\s*stable/);
  assert.match(css, /\.content-with-sidebar\s*\{[\s\S]*grid-template-columns:/);
  assert.match(read("src/layouts/BaseLayout.astro"), /ClientRouter/);
  assert.match(read("src/components/SiteTitle.astro"), /transition:persist="site-title"/);
});

test("site sources and retained pages use self-hosted fonts", () => {
  const files = [
    "src/layouts/BaseLayout.astro",
    "src/styles/global.css",
    "public/pastpresent/index.html",
    "public/ff-gate.html",
    "public/friends-family.html",
  ];
  files.forEach((file) => {
    assert.doesNotMatch(read(file), /fonts\.(googleapis|gstatic)\.com/, file);
  });
});

test("gallery uses bounded optimized assets and frame-coalesced scrolling", () => {
  const manifest = JSON.parse(read("public/artwork/gallery-artwork.json"));
  assert.ok(manifest.length >= 20);

  manifest.forEach((file) => {
    const fullPath = path.join(root, "public", "artwork", "optimized", file);
    assert.ok(fs.existsSync(fullPath), file);
    assert.ok(fs.statSync(fullPath).size < 1_500_000, `${file} is too large`);
  });

  const gallery = read("src/scripts/gallery.js");
  const css = read("src/styles/global.css");
  assert.match(gallery, /requestAnimationFrame/);
  assert.match(gallery, /decoding\s*=\s*['"]async['"]/);
  assert.match(gallery, /loading\s*=\s*['"]eager['"]/);
  assert.match(gallery, /setAttribute\(['"]aria-hidden['"],\s*['"]true['"]\)/);
  assert.match(css, /contain:\s*layout paint/);
});
