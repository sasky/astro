# sasky.nz

Cameron Grant's personal site, built with [Astro](https://astro.build) 7 and deployed on Netlify.

Posts live in three sections, each with its own look:

| Section | URL | Theme | Feel |
|---|---|---|---|
| Code | `/code` | `code` | A terminal: JetBrains Mono, green on near-black |
| Life | `/life` | `hp` | Graph paper, Dymo labels and Fraunces (Home, tag pages and the 404 use it too) |
| On | `/meditations` | `on` | A Victorian handbill: kraft paper, Holtwood, Oswald, Roman numerals |

Home (`/`) has the hero, the about section, a door into each section and a tag browser. Tags have pages at `/tags/{tag}`, and there's one RSS feed at `/rss.xml`.

## Getting started

Node 24.21 or later (see `.nvmrc`).

```sh
npm install
npm run dev        # http://localhost:4321
```

## Adding a post

Add `src/content/posts/<slug>.mdx`. The file name is the URL slug, so use lowercase kebab-case (`a-z`, `0-9`, single `-`); a test rejects anything else.

```mdx
---
title: "Cheap and easy Silverstripe hosting"
description: "Shown under the title and in listings"
metaDescription: "Optional; the meta description, defaults to description"
pubDate: 2024-04-01
section: code          # code | life | on
tags: ["silverstripe", "learning"]   # optional; lowercase kebab-case
draft: false           # optional; drafts are left out of production builds
---
```

Other optional fields (`src/content.config.ts` has the full schema):

| Field | Purpose |
|---|---|
| `updatedDate`, `image` | Accepted by the schema (`image` is `{ src, alt }`) but not shown anywhere yet. |
| `excerpt` | Overrides the computed excerpt that the On listing shows for its headliner. |
| `pico8` | A cart name in `public/pico8/`; Code posts with it get the game panel. |

Notes by section:

- **Dates** are date-only and always shown in UTC, so the day never shifts.
- **On posts:** headings written as `## 1. Tip` become Roman-numbered tips (`src/markdown/on-tips.ts`). Plain `##` headings get the essay style.
- **Code posts:** fences take a caption with a `title`: ` ```bash title="composer.json" `.
- **MDX components** in `src/components/mdx/` work in any section and follow its theme. Import them in the post, for example `import YouTube from "@components/mdx/YouTube.astro";`:
  - `<YouTube id title caption? />` shows a video card. Nothing loads from YouTube until it's clicked.
  - `<ImageCollection>` lays out a grid of images.
  - `<Ornament />` draws the On divider.

Images go in `src/images/`. Import them with `@images/…` and render them with `<Picture>` from `astro:assets`; `<ImageCollection>` frames `<Picture>` children only.

Section names, blurbs and intros are in `src/data/sections.ts`, and Home's copy is in `src/data/home.ts`.

## How it's built

- **Content:** one `posts` collection. Pages read it only through `getPosts()` (`src/lib/get-posts.ts`). The pure helpers in `src/lib/` (dates, excerpts, numbering, tags, the feed) are unit tested.
- **Themes:**
  - `src/styles/base.css` is shared.
  - Each theme's tokens live in `src/styles/themes/{hp,code,on}.css`, under `:root[data-theme="…"]`. Only that theme's layout (`HpLayout`, `CodeLayout`, `OnLayout`) imports the file.
  - A page loads only its own theme's CSS and fonts (Home also loads the On faces for its section doors).
  - The MDX components in `src/components/mdx/` use theme tokens only, so they suit any section (a unit test enforces it). The shared chrome in `src/components/site/` mostly does, but the footers, Dymo labels and section chips have their own colours.
- **Fonts:** the Astro Fonts API downloads and self-hosts them at build time (`fonts` in `astro.config.mjs`).
- **Markdown:** Sätteri, Astro 7's pipeline, with the `onTips` plugin and a custom Shiki theme (`src/shiki/sasky-terminal.json`).
- **URLs:** no trailing slash, and pages build as `code.html` and so on (`build.format: "file"`). Old URLs are 301'd in `public/_redirects`.
- **Client JS:** three small scripts in `src/scripts/`: the tag browser, video cards and copy buttons. Everything works without them.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Build to `dist/` |
| `npm run preview` | Serve `dist/` |
| `npm run check` | `astro check` (types and templates) |
| `npm test` | Unit and component tests (Vitest, run in `America/Los_Angeles` to catch time-zone slips) |
| `npm run test:e2e` | Browser tests (Playwright) against the built site, including accessibility (axe) and network budgets |
| `npm run check:links` | Every link in `dist/` resolves and follows the URL rules |
| `npm run check:redirects -- --dist` | Every redirect in `public/_redirects` points at a built page |
| `npm run check:redirects -- --url <base>` | A running server answers each redirect correctly |
| `npm run qa:lighthouse [base]` | Lighthouse (mobile) on Home and a post per theme; reports in `qa/lighthouse/`. Needs `npm run preview -- --port 4322 --ignore-lock` running in another shell, or a base URL |
| `npm run qa:compare` | Each design board beside the built page, in `qa/compare/index.html` |
| `npm run baseline` | Full-page screenshots of every page at 1280 and 390, in `qa/baseline/` |

Before a PR: `npm run build`, `npm run check`, `npm test`, `npm run check:links`, `npm run check:redirects -- --dist` and `npm run test:e2e`.

To check the redirects the way Netlify serves them:

```sh
npm run build
npx netlify-cli dev --offline --dir dist --port 8888   # keeps running; use another shell for the next line
npm run check:redirects -- --url http://localhost:8888
```

## Deploying

Netlify deploys `main` and builds a deploy preview for every PR into `main` (its build settings live in the Netlify UI; there is no `netlify.toml`).

## Design

The designs are in `design-handoff/`: the `.dc.html` boards, plus a README and DECISIONS file. The redesign's spec, roadmap and per-phase plans are in `docs/`.
