# Astro Static Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild acommontrueness.com as an Astro-authored static site that preserves its design and interactive features while eliminating shared-shell drift and portrait/title flashes.

**Architecture:** Astro generates every public route into `dist/`; Cloudflare serves that directory without a server runtime. Shared Astro layouts own the repeated shell, while narrowly scoped browser modules own title, portrait, gallery, library, and simulator lifecycles. Content remains static and the existing vanilla SIR model remains framework-independent.

**Tech Stack:** Astro static output, TypeScript-enabled Astro components, vanilla JavaScript, Node's built-in test runner, Cloudflare Wrangler static assets.

**Spec:** `docs/superpowers/specs/2026-09-22-astro-static-migration-design.md`

## Global Constraints

- The build output is static HTML, CSS, JavaScript, and assets in `dist/`; there is no Astro server adapter or server-side runtime.
- Do not add React, Vue, Svelte, a CMS, an API, a database, or authentication.
- Preserve the current visual design and article wording; the migration is not a redesign or factual edit.
- Use the current Epoch AI subtitle and biography as canonical; remove the stale FAR.AI variant.
- Keep Bookmarks absent from public navigation.
- Keep root-relative public asset URLs and existing public route paths.
- Keep self-hosted fonts and make no Google Fonts requests.
- Write each behavior test first and observe the expected failure before changing production code.

## Review Focus

- A direct load with `localStorage.titleState === "title"` must never paint the default name first; Task 3 adds a source assertion and browser check for the pre-paint bootstrap.
- Repeated Astro navigation must not attach duplicate title, gallery, library, portrait, or simulator listeners; Tasks 3, 5, and 6 add idempotency/lifecycle assertions.
- A failed client-side transition must leave ordinary static links usable; Task 3 verifies real `href` values and avoids click interception outside Astro's router.
- Nested and trailing-slash URLs must resolve their root-relative assets and generated HTML; Tasks 1, 4, and 7 inspect the complete build output.
- Ancillary routes must not disappear merely because they are outside the shared shell; Task 7 inventories and asserts every retained route.

---

### Task 1: Establish the Astro static build contract

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `tests/astro-build.test.js`
- Modify: `tests/cloudflare-deploy.test.js`
- Modify: `wrangler.json`

**Interfaces:**
- Produces: `npm run build` writes static output to `dist/` with directory-style URLs.
- Produces: `npm test` runs all `tests/*.test.js` through Node's test runner.
- Produces: Wrangler reads static assets only from `./dist`.

- [ ] **Step 1: Write the failing project-contract tests**

Create `tests/astro-build.test.js` with assertions that `package.json` contains `dev`, `build`, `preview`, `test`, and `deploy` scripts; `astro.config.mjs` declares static output and trailing slashes; and `.gitignore` excludes `node_modules/`, `dist/`, and `.wrangler/`.

Update `tests/cloudflare-deploy.test.js` so its central assertion is:

```js
assert.equal(config.assets.directory, "./dist");
assert.deepEqual(config.routes, [
  { pattern: "acommontrueness.com/*", zone_name: "acommontrueness.com" },
  { pattern: "www.acommontrueness.com/*", zone_name: "acommontrueness.com" },
]);
```

Remove `.assetsignore` assertions because the repository root will no longer be deployed.

- [ ] **Step 2: Run the tests and verify the contract fails**

Run: `node --test tests/astro-build.test.js tests/cloudflare-deploy.test.js`

Expected: FAIL because `package.json` and `astro.config.mjs` do not exist and Wrangler still targets `.`.

- [ ] **Step 3: Add the minimum static Astro configuration**

Create `package.json` with private package metadata, `type: "module"`, Astro as the sole application dependency, Wrangler as a development dependency, and these scripts:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "node --test tests/*.test.js",
    "deploy": "npm run build && wrangler deploy"
  }
}
```

Install dependencies with `npm install astro@latest --save-exact` and `npm install wrangler@latest --save-dev --save-exact` so `package-lock.json` records the resolved versions. Configure Astro with `output: "static"`, `outDir: "./dist"`, and `trailingSlash: "always"`. Extend `astro/tsconfigs/strict` in `tsconfig.json`. Change Wrangler's asset directory to `./dist` without changing its custom-domain routes.

- [ ] **Step 4: Run the contract tests and build**

Run: `node --test tests/astro-build.test.js tests/cloudflare-deploy.test.js && npm run build`

Expected: PASS and an initially minimal `dist/` is generated.

- [ ] **Step 5: Commit the build foundation**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore wrangler.json tests/astro-build.test.js tests/cloudflare-deploy.test.js
git commit -m "build: establish Astro static site"
```

### Task 2: Move public assets and create the shared static shell

**Files:**
- Create: `public/assets/baffle.min.js`
- Create: `public/artwork/optimized/*`
- Create: `public/artwork/gallery-artwork.json`
- Create: `public/fonts/averia-serif-libre/*`
- Create: `public/icons/jackdripper.svg`
- Create: `public/icons/horseman.svg`
- Create: `public/images/epoch-full-standard.svg`
- Create: `public/library.csv`
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/SocialLinks.astro`
- Create: `src/components/SiteNav.astro`
- Create: `src/components/Bio.astro`
- Create: `src/components/Portrait.astro`
- Create: `src/components/SiteShell.astro`
- Create: `tests/shared-shell.test.js`

**Interfaces:**
- Produces: `BaseLayout({ title, description, bodyClass })` wraps every Astro page.
- Produces: `SiteShell({ active, showBio, showPortrait })` owns all common chrome.
- Produces: `SiteNav({ active })` renders the same four-item navigation in desktop and mobile placements.
- Consumes: public assets at stable root-relative URLs.

- [ ] **Step 1: Write failing shared-shell and asset tests**

Create `tests/shared-shell.test.js` to read the Astro sources and assert:

```js
assert.match(read("src/components/SiteNav.astro"), /writing[\s\S]*projects[\s\S]*library[\s\S]*gallery/i);
assert.doesNotMatch(read("src/components/SiteNav.astro"), /bookmarks/i);
assert.match(read("src/components/Portrait.astro"), /width="720"/);
assert.match(read("src/components/Portrait.astro"), /height="720"/);
assert.match(read("src/components/Bio.astro"), /special projects/i);
assert.doesNotMatch(read("src/components/Bio.astro"), /FAR\.AI/i);
assert.doesNotMatch(read("src/layouts/BaseLayout.astro"), /fonts\.(googleapis|gstatic)\.com/);
```

Also assert that every expected public font, icon, portrait, artwork manifest, optimized gallery image, and CSV file exists.

- [ ] **Step 2: Run the shell test and verify it fails**

Run: `node --test tests/shared-shell.test.js`

Expected: FAIL because the Astro shell and public asset tree do not exist.

- [ ] **Step 3: Copy assets and implement focused shell components**

Move deployable assets into `public/`, renaming only where the plan specifies a stable normalized path. Port `style.css` to `src/styles/global.css` without visual redesign. Import it from `BaseLayout.astro`.

Define the navigation once:

```astro
---
const { active } = Astro.props;
const items = [
  ["writing", "/"],
  ["projects", "/projects/"],
  ["library", "/library/"],
  ["gallery", "/gallery/"],
];
---
```

Render that data in both mobile and desktop navigation placements. Implement the current Epoch AI subtitle, canonical biography, social links, portrait, Past Present link, and friends-and-family link once inside `SiteShell.astro`. Keep the article-compatible `showBio` and `showPortrait` flags explicit.

- [ ] **Step 4: Run the shell test and build**

Run: `node --test tests/shared-shell.test.js && npm run build`

Expected: PASS with public assets copied into `dist/`.

- [ ] **Step 5: Commit the shared shell**

```bash
git add public src/styles src/layouts src/components tests/shared-shell.test.js
git commit -m "feat: add shared Astro site shell"
```

### Task 3: Implement persistent title and portrait navigation

**Files:**
- Create: `src/components/SiteTitle.astro`
- Create: `src/scripts/site-title.js`
- Create: `src/scripts/portrait.js`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/Portrait.astro`
- Modify: `src/components/SiteShell.astro`
- Modify: `src/styles/global.css`
- Create: `tests/persistent-navigation.test.js`

**Interfaces:**
- Produces: `data-title-state="name|title"` on `<html>` before first paint.
- Produces: persistent nodes keyed `site-title` and `site-portrait` across Astro navigation.
- Produces: `initSiteTitle()` and `initPortrait()` functions that return cleanup functions and replace any prior initialization.

- [ ] **Step 1: Write failing persistence and lifecycle tests**

Create `tests/persistent-navigation.test.js` that asserts:

```js
assert.match(baseLayout, /ClientRouter/);
assert.match(baseLayout, /is:inline/);
assert.match(baseLayout, /localStorage\.getItem\(["']titleState["']\)/);
assert.match(siteTitle, /transition:persist="site-title"/);
assert.match(portrait, /transition:persist="site-portrait"/);
assert.match(siteTitleScript, /astro:page-load/);
assert.match(siteTitleScript, /astro:before-swap/);
assert.match(portraitScript, /astro:page-load/);
assert.match(portraitScript, /astro:before-swap/);
```

Assert every internal navigation item retains a normal absolute-path `href`. Assert CSS has a reduced-motion rule and stable `scrollbar-gutter`/grid geometry.

- [ ] **Step 2: Run the persistence test and verify it fails**

Run: `node --test tests/persistent-navigation.test.js`

Expected: FAIL because client routing, persistence keys, and lifecycle modules are absent.

- [ ] **Step 3: Implement pre-paint state and persistent nodes**

Add Astro's `ClientRouter` to `BaseLayout.astro`. Before stylesheet-dependent content can paint, run an inline defensive bootstrap:

```html
<script is:inline>
  try {
    const value = localStorage.getItem("titleState");
    document.documentElement.dataset.titleState = value === "title" ? "title" : "name";
  } catch {
    document.documentElement.dataset.titleState = "name";
  }
</script>
```

Render both title strings in `SiteTitle.astro`, use the document state to expose only the selected one, and mark the title root with `transition:persist="site-title"`. Mark the portrait root with `transition:persist="site-portrait"`.

Port the baffle interaction into `src/scripts/site-title.js`. It must guard against double initialization, handle storage exceptions, update the document attribute, and unregister its click handler on `astro:before-swap`. Port portrait positioning into `src/scripts/portrait.js` with one resize listener and cleanup of any pending animation frame.

- [ ] **Step 4: Run persistence and shell tests**

Run: `node --test tests/persistent-navigation.test.js tests/shared-shell.test.js && npm run build`

Expected: PASS; built pages contain Astro router support and persistent node markers.

- [ ] **Step 5: Commit persistent navigation**

```bash
git add src/components/SiteTitle.astro src/components/Portrait.astro src/components/SiteShell.astro src/layouts/BaseLayout.astro src/scripts/site-title.js src/scripts/portrait.js src/styles/global.css tests/persistent-navigation.test.js
git commit -m "feat: persist title and portrait across navigation"
```

### Task 4: Generate Writing, Projects, and content-backed article routes

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/posts/understanding-transmission.md`
- Create: `src/data/projects.ts`
- Create: `src/components/PostList.astro`
- Create: `src/components/ProjectList.astro`
- Create: `src/layouts/ArticleLayout.astro`
- Create: `src/pages/index.astro`
- Create: `src/pages/writing/index.astro`
- Create: `src/pages/projects/index.astro`
- Create: `src/pages/posts/[...slug].astro`
- Create: `tests/routes-and-content.test.js`
- Remove after parity is demonstrated: `index.html`
- Remove after parity is demonstrated: `writing/index.html`
- Remove after parity is demonstrated: `projects/index.html`
- Remove after parity is demonstrated: `posts/template.html`

**Interfaces:**
- Produces: the canonical Writing page at `/` from the posts collection.
- Produces: a static redirect page at `/writing/` targeting `/`.
- Produces: Projects at `/projects/` from `src/data/projects.ts`.
- Produces: article pages at `/posts/{slug}/` from the posts collection.
- Consumes: `SiteShell`, `PostList`, and `ProjectList`.

- [ ] **Step 1: Write failing route/content tests**

Create `tests/routes-and-content.test.js`. Build once in the test setup when `dist/` is absent, then assert:

```js
for (const file of [
  "dist/index.html",
  "dist/writing/index.html",
  "dist/projects/index.html",
  "dist/posts/understanding-transmission/index.html",
]) assert.ok(fs.existsSync(path.join(root, file)), file);
```

Assert the Writing list contains the article title but no post description, Projects contains all five current entries, `/writing/` points to `/`, the built article has no `.bio-section`, and the content frontmatter contains the title, date `2026-09-22`, description, and slug.

- [ ] **Step 2: Run the route/content test and verify it fails**

Run: `rm -rf dist && node --test tests/routes-and-content.test.js`

Expected: FAIL because there are no Astro page routes or content collection.

- [ ] **Step 3: Implement routes and migrate content without copy edits**

Define a posts collection schema requiring `title`, `description`, and a date. Move the current article body verbatim into `src/content/posts/understanding-transmission.md`, retaining its raw HTML disclosures, table, notes, and simulator markup. Implement `getStaticPaths()` in `[...slug].astro` to render each post through `ArticleLayout.astro`.

Build Writing from the collection sorted by date descending. Implement `/writing/` using Astro's static redirect support to `/`. Move the five project entries and links into a typed array and render them with `ProjectList.astro`.

- [ ] **Step 4: Run route/content tests and build**

Run: `rm -rf dist && npm run build && node --test tests/routes-and-content.test.js tests/shared-shell.test.js tests/persistent-navigation.test.js`

Expected: PASS; all four routes exist and source content drives the Writing list and article.

- [ ] **Step 5: Remove replaced authored HTML and commit**

Remove only the four replaced HTML sources listed for this task after the passing build proves route parity.

```bash
git add src/content.config.ts src/content src/data src/components/PostList.astro src/components/ProjectList.astro src/layouts/ArticleLayout.astro src/pages tests/routes-and-content.test.js index.html writing/index.html projects/index.html posts/template.html
git commit -m "feat: generate writing and projects with Astro"
```

### Task 5: Migrate Gallery and Library with navigation-safe lifecycles

**Files:**
- Create: `src/pages/gallery/index.astro`
- Create: `src/pages/library/index.astro`
- Create: `src/scripts/gallery.js`
- Create: `src/scripts/library.js`
- Modify: `src/styles/global.css`
- Create: `tests/gallery-library.test.js`
- Remove after parity is demonstrated: `gallery/index.html`
- Remove after parity is demonstrated: `library/index.html`
- Remove after parity is demonstrated: `gallery.js`
- Remove after parity is demonstrated: `library.js`

**Interfaces:**
- Produces: Gallery at `/gallery/` using `/artwork/gallery-artwork.json` and optimized images.
- Produces: Library at `/library/` using `/library.csv`.
- Produces: `initGallery()` and `initLibrary()` setup functions that are safe on direct load, repeat navigation, and teardown.

- [ ] **Step 1: Write failing gallery/library tests**

Create `tests/gallery-library.test.js` to assert the Astro pages contain the expected mounting elements and the scripts contain:

```js
assert.match(galleryScript, /requestAnimationFrame/);
assert.match(galleryScript, /astro:page-load/);
assert.match(galleryScript, /astro:before-swap/);
assert.match(galleryScript, /removeEventListener/);
assert.match(libraryScript, /astro:page-load/);
assert.match(libraryScript, /astro:before-swap/);
assert.match(libraryScript, /AbortController/);
```

Validate every file in the artwork manifest exists below `public/artwork/optimized/` and is smaller than 1,500,000 bytes. Assert the Library script displays a readable error string in its rejected fetch path.

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/gallery-library.test.js`

Expected: FAIL because the Astro routes and lifecycle-aware scripts do not exist.

- [ ] **Step 3: Port Gallery with explicit cleanup**

Retain the existing three-copy endless strip, eager asynchronous image decoding, wheel/drag/touch behavior, boundary normalization, and animation-frame coalescing. Collect every global listener cleanup in one returned function. On `astro:before-swap`, cancel pending frames and remove window listeners. On `astro:page-load`, initialize only when `#galleryCarousel` exists and replace any prior cleanup.

- [ ] **Step 4: Port Library with abortable data loading**

Retain search, category/tag/subtag filters, sorting, pagination, and placeholder styling. Use one `AbortController` per initialization, abort it during teardown, remove listeners, and replace the loading row with a readable failure state when CSV loading rejects.

- [ ] **Step 5: Run focused tests and build**

Run: `rm -rf dist && npm run build && node --test tests/gallery-library.test.js tests/persistent-navigation.test.js`

Expected: PASS and both generated route files exist.

- [ ] **Step 6: Remove replaced sources and commit**

```bash
git add src/pages/gallery src/pages/library src/scripts/gallery.js src/scripts/library.js src/styles/global.css tests/gallery-library.test.js gallery/index.html library/index.html gallery.js library.js
git commit -m "feat: migrate gallery and library routes"
```

### Task 6: Migrate and harden the interactive outbreak model

**Files:**
- Create: `public/scripts/sir-model.js`
- Create: `src/scripts/simulator.js`
- Modify: `src/content/posts/understanding-transmission.md`
- Modify: `src/pages/posts/[...slug].astro`
- Modify: `src/styles/global.css`
- Modify: `tests/sir-model.test.js`
- Modify: `tests/article-ui.test.js`
- Remove after parity is demonstrated: `posts/understanding-transmission/index.html`
- Remove after parity is demonstrated: `posts/understanding-transmission/simulator.js`
- Remove after parity is demonstrated: `posts/understanding-transmission/sir-model.js`

**Interfaces:**
- Produces: unchanged `SIRModel.createPopulation`, `SIRModel.stepSimulation`, and `SIRModel.countStates` browser API plus CommonJS-compatible exports for Node tests.
- Produces: `initSimulator()` that returns cleanup for its resize observer, controls, and animation frame.
- Consumes: simulator markup embedded in the article content.

- [ ] **Step 1: Update article/model tests before moving production code**

Point `tests/sir-model.test.js` at `public/scripts/sir-model.js`. Update `tests/article-ui.test.js` to inspect the Markdown source and built article. Preserve assertions for six closed disclosures, paragraph placement, title “Interactive model,” icon-only play/pause and reset buttons, article biography absence, and fixed-layout wrapping table.

Add lifecycle assertions:

```js
assert.match(simulatorScript, /astro:page-load/);
assert.match(simulatorScript, /astro:before-swap/);
assert.match(simulatorScript, /cancelAnimationFrame/);
assert.match(simulatorScript, /resizeObserver\.disconnect/);
```

- [ ] **Step 2: Run model/article tests and verify the migration assertions fail**

Run: `node --test tests/sir-model.test.js tests/article-ui.test.js`

Expected: FAIL because the planned public model and lifecycle-aware simulator do not exist.

- [ ] **Step 3: Move the pure model and implement simulator lifecycle cleanup**

Move the SIR model without changing its calculations. Port the renderer and controls into `src/scripts/simulator.js`. Store the animation-frame identifier, stop scheduling after teardown, disconnect `ResizeObserver`, and unregister every control listener. Initialize on `astro:page-load` only when both canvases and `window.SIRModel` exist; cleanup on `astro:before-swap`.

Ensure canvas text uses the same Averia Serif Libre stack as the page. Preserve play, pause, restart, and reset aria labels.

- [ ] **Step 4: Run model/article tests, build, and rerun them against output**

Run: `rm -rf dist && npm run build && node --test tests/sir-model.test.js tests/article-ui.test.js tests/routes-and-content.test.js`

Expected: PASS with the article and model available at the existing URL.

- [ ] **Step 5: Remove replaced article files and commit**

```bash
git add public/scripts/sir-model.js src/scripts/simulator.js src/content/posts/understanding-transmission.md src/pages/posts src/styles/global.css tests/sir-model.test.js tests/article-ui.test.js posts/understanding-transmission
git commit -m "feat: migrate interactive transmission article"
```

### Task 7: Preserve ancillary routes and finalize deployment documentation

**Files:**
- Create: `public/pastpresent/index.html`
- Create: `public/ff-gate.html`
- Create: `public/friends-family.html`
- Create: `public/wardrobe.html`
- Create: `public/wardrobe (1).html`
- Create: `public/test-baffle.html`
- Create: `public/EndlessUCarousel/*`
- Create: `tests/public-routes.test.js`
- Modify: `README.md`
- Modify: `tests/site-polish.test.js`
- Remove after parity is demonstrated: root copies of the ancillary files and their copied asset directories
- Remove: `.assetsignore`
- Remove: `.nojekyll`

**Interfaces:**
- Produces: unchanged public URLs for every retained ancillary page.
- Produces: contributor instructions for Astro development, content authoring, testing, preview, and Cloudflare deployment.

- [ ] **Step 1: Write the failing retained-route test**

Create `tests/public-routes.test.js` with an explicit route inventory:

```js
const retained = [
  "dist/pastpresent/index.html",
  "dist/ff-gate.html",
  "dist/friends-family.html",
  "dist/wardrobe.html",
  "dist/wardrobe (1).html",
  "dist/test-baffle.html",
];
```

Assert every file exists after build and that any assets referenced by those documents are present in `dist/`. Assert `dist/` does not contain `.git`, `.claude`, `tests`, `docs`, or source `.astro` files.

- [ ] **Step 2: Run the test and verify it fails**

Run: `rm -rf dist && npm run build && node --test tests/public-routes.test.js`

Expected: FAIL because ancillary routes have not yet been copied into `public/`.

- [ ] **Step 3: Preserve ancillary pages and their dependencies**

Copy the listed pages and `EndlessUCarousel` assets into `public/`. Resolve their relative asset references against the new public tree and copy only referenced local dependencies. Do not place repository configuration, tests, source content, or unused original gallery images in `public/`.

- [ ] **Step 4: Update regression tests and README**

Rewrite `tests/site-polish.test.js` to inspect Astro source and `public/` rather than removed root HTML. Keep its assertions for hidden Bookmarks, optimized portrait dimensions, stable layout geometry, self-hosted fonts, optimized gallery sizes, and frame-coalesced gallery scrolling.

Replace the GitHub Pages/manual HTML README with exact commands:

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
npm run deploy
```

Document adding a Markdown post to `src/content/posts/`, updating project data, and Cloudflare's `npm run build` plus `npx wrangler deploy` settings.

- [ ] **Step 5: Run the full automated suite and production build**

Run: `rm -rf dist && npm run build && npm test`

Expected: PASS with zero failing tests and no build warnings that indicate broken routes or missing assets.

- [ ] **Step 6: Remove obsolete root sources and commit**

Delete only files now represented in `src/` or `public/`, including `.assetsignore`, `.nojekyll`, old root scripts/styles, copied font folders, deployable artwork copies, and ancillary page originals. Keep design/plan docs, tests, license, package metadata, and other source files required by the build.

Run `npm run build && npm test` again after deletion.

```bash
git add -A
git commit -m "chore: finalize Astro migration and documentation"
```

### Task 8: Browser verification and release

**Files:**
- Modify only if verification exposes a failing behavior: the owning source and test file from Tasks 2–7

**Interfaces:**
- Consumes: production `dist/` served by `npm run preview`.
- Produces: verified release commit on `main`, ready for Cloudflare's connected deployment.

- [ ] **Step 1: Start the production preview**

Run: `npm run build && npm run preview -- --host 127.0.0.1 --port 8765`

Expected: preview reports `http://127.0.0.1:8765/` and remains running for browser checks.

- [ ] **Step 2: Verify direct routes and responsive layout in the browser**

Open `/`, `/projects/`, `/library/`, `/gallery/`, and `/posts/understanding-transmission/` directly. At desktop and narrow mobile widths, verify no missing assets, horizontal overflow, shifted shared columns, console errors, or unexpected Bookmarks entry.

- [ ] **Step 3: Verify the original flash regression**

On Writing, click the title until it displays “a common trueness.” Navigate Writing → Projects → Writing, then use browser Back and Forward. Verify the title never renders “roman coussement,” the portrait never disappears or changes position, and the same persistent nodes survive the transitions. Reload Projects directly and verify the stored title is correct on the first visible frame.

- [ ] **Step 4: Verify page-specific interactions**

Scroll and rapidly wheel/drag the Gallery; verify smooth continuous movement and correct wrapping. Use Library search, each filter, sorting, and pagination. On the article, expand/collapse every H3 disclosure, resize the window, and exercise model play, pause, reset, parameter changes, and navigation away/back. Verify repeat visits do not accelerate animation or duplicate handlers.

- [ ] **Step 5: Fix any observed regression test-first**

For each failure, add the smallest automated regression test to the owning test file, observe it fail, patch the owning source, and rerun the focused test. Repeat browser verification for the failed behavior.

- [ ] **Step 6: Run final clean verification**

Run: `rm -rf dist && npm run build && npm test && git diff --check && git status --short`

Expected: build succeeds, all tests pass, `git diff --check` is silent, and status contains only deliberate verification fixes if any.

- [ ] **Step 7: Commit verification fixes if present**

```bash
git add src public tests
git commit -m "fix: resolve Astro migration verification issues"
```

Skip this commit when verification required no changes.

- [ ] **Step 8: Push the verified main branch**

Push `main` using the repository's authenticated GitHub client. Confirm the remote branch includes all migration commits, then allow Cloudflare's connected build to run with `npm run build` and deploy `dist/`.
