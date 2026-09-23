# Astro Static Migration Design

## Purpose

Migrate acommontrueness.com from duplicated hand-written HTML pages to an Astro-authored, statically generated site. The migration must preserve the current visual design and content while eliminating navigation flashes, preventing shared-page drift, and keeping the site fast and simple to deploy on Cloudflare.

## Success Criteria

- Astro builds the complete public site into `dist/` with no server-side runtime.
- Cloudflare Wrangler deploys only `dist/`.
- Navigating between Writing and Projects preserves the existing portrait and site-title DOM nodes, so neither disappears, resets, nor flashes.
- The chosen title text, `roman coussement` or `a common trueness`, is correct before first paint on a direct page load and persists across navigation.
- Shared header, biography, navigation, portrait, and footer markup comes from a single component hierarchy.
- Existing routes, article content, gallery behavior, and interactive model continue to work.
- The production build, automated test suite, and browser checks pass before deployment.

## Scope

### Included

- Astro project and build configuration.
- Shared site shell and reusable page/list components.
- Static routes for Writing, Projects, Library, Gallery, and the infectious-disease article.
- Static preservation of existing ancillary routes and assets that remain part of the site.
- Markdown or MDX-backed article content with frontmatter.
- Astro client-side navigation with persistent portrait and title elements.
- Migration of the current CSS, gallery JavaScript, library JavaScript, and outbreak simulation with only the changes needed for Astro lifecycle compatibility.
- Tests for generated routes, shared structure, navigation persistence, gallery constraints, article behavior, and Cloudflare configuration.
- Updated project documentation.

### Excluded

- A React, Vue, Svelte, or other UI-framework dependency.
- Server-side rendering, APIs, databases, authentication, or a CMS.
- A visual redesign or substantive copy edit.
- Reintroducing Bookmarks into public navigation.
- Replacing the current gallery or simulation with new implementations.

## Architecture

Astro is the authoring and build framework. It emits static HTML, CSS, JavaScript, and assets to `dist/`. Cloudflare serves those files as static Worker assets. No Astro server adapter or server-side runtime is used.

`BaseLayout.astro` owns document metadata, global styles, favicon, the early title-state script, and the Astro client router. `SiteShell.astro` owns the reusable site chrome. Pages supply only their route-specific main content and active navigation item.

The canonical Writing route is `/`. `/writing/` is retained as a generated redirect to `/`, removing the duplicate source page. Existing incoming URLs must continue to resolve with trailing-slash routing.

## Component Boundaries

- `BaseLayout.astro`: HTML document, per-page title and description, global assets, pre-paint state initialization, and client routing.
- `SiteShell.astro`: header, optional biography, navigation, portrait, footer, Past Present link, and friends-and-family link.
- `SiteTitle.astro`: interactive two-state title and its persistence contract.
- `SiteNav.astro`: one navigation definition rendered in the desktop and mobile placements with the correct active state.
- `Portrait.astro`: optimized portrait with fixed intrinsic dimensions and Astro persistence attributes.
- `SocialLinks.astro`: shared external profile links.
- `PostList.astro` and `ProjectList.astro`: route-specific lists using shared alignment conventions.
- Article layout: common article shell without the biography, including sidebar navigation and back link.
- Gallery and library page components: preserve their specialized layouts while using shared metadata and title behavior where appropriate.

Components must remain build-time Astro components unless browser behavior requires JavaScript. No component is hydrated merely to render static markup.

## Content Model

Published writing lives in Astro content source as Markdown or MDX with frontmatter for title, publication date, description, and slug. The infectious-disease article uses MDX only if embedding the interactive model requires a component; otherwise Markdown is preferred.

The Writing list is derived from published content rather than maintained separately. List items show titles only. The current article remains available at `/posts/understanding-transmission/`.

Project entries may remain a small typed data module because they have no standalone detail pages. Gallery metadata continues to come from the optimized artwork manifest. Library data continues to come from `library.csv`.

## Navigation and Persistent UI

Astro's client router handles same-origin internal navigation. The site title and portrait are marked with stable persistence identifiers so their live DOM nodes survive route changes whenever they appear in both the source and destination page.

Writing and Projects share the same `SiteShell` structure, including portrait placement. Only the active navigation state and page-specific list content change. The layout reserves stable geometry so neither scrollbars nor differing content widths shift the shared elements.

The title state is stored as `name` or `title` in `localStorage`. A small inline script in the document head reads and validates that state before rendering becomes visible, exposes the value as a document attribute, and allows CSS/server markup to display the correct text without a one-frame default. Storage failures fall back to `name` without breaking the page. Clicking the title retains the current baffle animation and commits the new state after the reveal.

If client-side navigation is unavailable or fails, all links remain ordinary static links and every destination remains independently loadable.

## Page Behavior

### Writing and Projects

Both pages use identical shell markup and geometry. The existing current Epoch AI subtitle and biography are canonical; stale FAR.AI text from the duplicate Writing page is removed. Bookmarks stay absent from both mobile and desktop navigation.

### Article

Article pages omit the biography. The infectious-disease article preserves its wording and factual content, closed-by-default H3 disclosures, note placement, wrapping transmission table, and interactive model. The paragraph beginning “Our main tools for closing...” remains outside the Reception disclosure and inside the Encounter Filter section.

### Interactive Model

The model keeps the title “Interactive model,” play/pause control, reset icon, standard site fonts, SIR state logic, and responsive canvases. Initialization must work after both a direct load and Astro client navigation. Cleanup must stop animation frames, observers, and event listeners before the page is replaced so repeat visits do not create duplicate simulations.

### Gallery

The gallery continues to use the optimized image manifest and bounded asset sizes. Wheel and drag updates stay coalesced through `requestAnimationFrame`. Initialization must work after direct loads and Astro navigation, and cleanup must prevent duplicate global listeners on repeat visits.

### Library

Search, filters, sorting, pagination, and CSV loading remain client-side. Initialization must be idempotent across Astro navigation. Direct access to `/library/` must continue to work.

### Ancillary Routes

Past Present, friends-and-family, and other currently reachable standalone pages are copied through `public/` or migrated when they need the shared shell. Their URLs must not be silently removed. Development-only files and repository metadata are not included in `dist/`.

## Styling and Assets

The existing visual appearance is the baseline. Global CSS is moved into Astro's source structure with targeted cleanup only where duplication or routing lifecycle requires it. Self-hosted fonts remain in use; there are no Google Fonts requests.

The optimized portrait retains explicit width and height. Gallery images continue to use the optimized asset set. Public static assets keep root-relative URLs so direct nested routes resolve correctly.

## Cloudflare Deployment

`wrangler.json` keeps the apex and `www` custom-domain routes and changes `assets.directory` from `.` to `./dist`. The repository gains explicit package scripts for development, build, preview, test, and deploy. Cloudflare's build command is `npm run build`; deployment remains `npx wrangler deploy` or the equivalent package script.

Only build output is deployed. Source files, tests, `.git`, local settings, and dependency metadata never enter the asset manifest.

## Error Handling and Progressive Enhancement

- Invalid or unavailable stored title state falls back to `roman coussement`.
- Client routing failures fall back to normal browser navigation.
- Missing gallery data produces an empty, stable gallery rather than an uncaught initialization loop.
- A missing canvas, model module, or page-specific control causes that enhancement to exit without affecting article readability.
- Library CSV failures retain a visible error state instead of leaving an indefinite loading message.
- Reduced-motion preferences disable or shorten nonessential title and page-transition animation.

## Testing Strategy

Tests are written before each production behavior is migrated.

- Build tests verify that all required public routes and assets exist in `dist/` and that source-only files do not.
- Structural tests parse source or built HTML to verify one shared navigation definition, Bookmarks absence, article shell rules, disclosures, model controls, and persistent-element attributes.
- Unit tests continue to exercise SIR population and transmission behavior.
- Lifecycle tests exercise idempotent setup/cleanup contracts for page-specific scripts where practical.
- Asset tests enforce the optimized gallery manifest and per-file size ceiling.
- Configuration tests require static Astro output and `wrangler.json` to deploy `./dist` with both custom-domain routes.
- Browser verification covers direct loads, Writing ↔ Projects transitions, back/forward navigation, title toggling, Gallery interaction, Library loading, article disclosures, and model play/pause/reset at desktop and narrow widths.

## Migration and Release

The migration occurs on the existing branch without deleting the working static site until equivalent Astro routes exist. Generated output is not treated as authored source. Once tests and the production build pass, a local preview is inspected before committing the implementation and pushing `main` for Cloudflare deployment.

The current public URL structure remains stable, so deployment does not require redirects beyond `/writing/` to `/`.
