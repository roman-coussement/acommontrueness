const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const shellPages = [
  "index.html",
  "writing/index.html",
  "projects/index.html",
  "bookmarks/index.html",
];

const navigationPages = [
  ...shellPages,
  "posts/template.html",
  "posts/understanding-transmission/index.html",
];

const primaryPages = [
  ...shellPages,
  "library/index.html",
  "gallery/index.html",
  "posts/template.html",
  "posts/understanding-transmission/index.html",
];

test("navigation omits bookmarks everywhere it is rendered", () => {
  navigationPages.forEach((file) => {
    const html = read(file);
    assert.doesNotMatch(html, /class="nav-item[^\"]*"[^>]*>bookmarks</i, file);
  });
});

test("shared shell pages declare the optimized portrait without JavaScript injection", () => {
  shellPages.forEach((file) => {
    const html = read(file);
    assert.match(
      html,
      /<img src="\/artwork\/optimized\/iceland_photo\.jpg" width="720" height="720" alt="roman coussement" class="art-image" id="artImage"/,
      file,
    );
  });

  assert.doesNotMatch(read("art-gallery.js"), /image\.src\s*=/);
});

test("shared layout reserves stable geometry and enables cross-page transitions", () => {
  const css = read("style.css");
  assert.match(css, /scrollbar-gutter:\s*stable/);
  assert.match(css, /@view-transition\s*\{[\s\S]*navigation:\s*auto/);
  assert.match(css, /\.content-with-sidebar\s*\{[\s\S]*grid-template-columns:/);
  assert.match(css, /view-transition-name:\s*profile-photo/);
});

test("primary pages use the self-hosted typeface without a duplicate Google Fonts request", () => {
  primaryPages.forEach((file) => {
    assert.doesNotMatch(read(file), /fonts\.(googleapis|gstatic)\.com/, file);
  });
});

test("gallery uses bounded optimized assets and frame-coalesced scrolling", () => {
  const manifest = JSON.parse(read("artwork/gallery-artwork.json"));
  assert.ok(manifest.length >= 20);

  manifest.forEach((file) => {
    const fullPath = path.join(root, "artwork", "optimized", file);
    assert.ok(fs.existsSync(fullPath), file);
    assert.ok(fs.statSync(fullPath).size < 1_500_000, `${file} is too large`);
  });

  const gallery = read("gallery.js");
  const css = read("style.css");
  assert.match(gallery, /requestAnimationFrame/);
  assert.match(gallery, /decoding\s*=\s*['"]async['"]/);
  assert.match(gallery, /loading\s*=\s*['"]eager['"]/);
  assert.match(gallery, /setAttribute\(['"]aria-hidden['"],\s*['"]true['"]\)/);
  assert.match(css, /contain:\s*layout paint/);
});
