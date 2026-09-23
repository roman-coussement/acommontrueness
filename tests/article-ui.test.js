"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("writing lists render title-only article items", () => {
    for (const file of ["index.html", "writing/index.html"]) {
        assert.doesNotMatch(read(file), /class="post-description"/);
    }
});

test("article pages omit the bio section by default", () => {
    for (const file of ["posts/template.html", "posts/understanding-transmission/index.html"]) {
        assert.doesNotMatch(read(file), /class="bio-section"/);
    }
});

test("every level-three article section is a closed disclosure by default", () => {
    const html = read("posts/understanding-transmission/index.html");
    const headings = html.match(/<h3>/g) || [];
    const disclosures = html.match(/<details class="article-disclosure">/g) || [];
    assert.equal(disclosures.length, headings.length);
    assert.equal(disclosures.length, 6);
    assert.doesNotMatch(html, /<details class="article-disclosure" open>/);
});

test("encounter-filter closing tools sit outside the Reception disclosure", () => {
    const html = read("posts/understanding-transmission/index.html");
    const receptionEnd = html.indexOf("</details>", html.indexOf("<strong>Reception</strong>"));
    const toolsParagraph = html.indexOf("Our main tools for closing the encounter filter");
    const compatibilityHeading = html.indexOf("<h2>Compatibility Filter</h2>");
    assert.ok(receptionEnd < toolsParagraph);
    assert.ok(toolsParagraph < compatibilityHeading);
});

test("simulator uses icon controls and the Interactive model title", () => {
    const html = read("posts/understanding-transmission/index.html");
    assert.match(html, /<h2 id="simulator-title">Interactive model<\/h2>/);
    assert.match(html, /id="simulation-toggle"[^>]+aria-label="Play outbreak"/);
    assert.match(html, /id="simulation-reset"[^>]+aria-label="Reset outbreak"/);
    assert.doesNotMatch(html, />Start<\/button>|>Reset<\/button>/);
});

test("transmission table wraps within the article column", () => {
    const css = read("style.css");
    assert.match(css, /\.transmission-table\s*\{[^}]*table-layout:\s*fixed/s);
    assert.doesNotMatch(css, /\.transmission-table\s*\{[^}]*min-width:\s*40rem/s);
});
