# acommontrueness.com

Roman Coussement's personal website. Astro generates a static site that Cloudflare serves from `dist/`.

## Local development

```bash
npm install
npm run dev
```

Astro prints the local URL when the development server starts.

## Verification

```bash
npm test
npm run build
npm run preview
```

`npm test` runs the Node test suite. `npm run build` regenerates the production site in `dist/`. `npm run preview` serves that production build locally.

## Publishing a post

1. Add a Markdown file to `src/content/posts/`.
2. Include `title`, `description`, `date`, and `slug` in its frontmatter.
3. Run `npm run build && npm test`.

The Writing list and `/posts/{slug}/` route are generated from the content collection.

## Updating projects

Edit `src/data/projects.ts`, then run the build and tests. Project entries may include an external `href`; entries without one render as plain text.

## Deployment

Cloudflare's connected build uses:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Static asset directory: `./dist`

To build and deploy from an authenticated local environment:

```bash
npm run deploy
```

The Wrangler configuration routes both `acommontrueness.com` and `www.acommontrueness.com` through the static Worker deployment.

## Structure

```text
src/components/        Shared site components
src/content/posts/     Published Markdown posts
src/data/              Small structured content collections
src/layouts/           Document and article layouts
src/pages/             Public Astro routes
src/scripts/           Page-specific browser behavior
src/styles/            Global design system
public/                Static assets and retained standalone pages
tests/                 Build, content, interaction, and deployment checks
```
