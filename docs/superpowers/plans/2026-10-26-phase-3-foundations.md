# Phase 3: Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the fonts, tokens, layout chain, shared chrome, small shared components and the HP 404 page that Phases 4–6 build on. The live pages keep their old look.

**Architecture:**
- **Layout chain:** the new `BaseLayout` owns `<html data-theme>`, the meta tags and the `head` slot. `HpLayout`, `CodeLayout` and `OnLayout` each import their own theme CSS, render their own `<Font>`s, and compose `Texture`, `TopBar`, `<main id="main">` and their footer.
- **Theme-neutral shared components:** they style themselves only through custom properties set in `:root[data-theme="…"]` in the theme files, so no theme's rules reach another theme's pages.
- **Path helpers:** `pagePath()` and `sectionForPath()` normalise the `.html` URLs that `format: 'file'` produces.

**Tech Stack:** Astro 7.3.4 (Fonts API, `<Font>` from `astro:assets`, `experimental_AstroContainer` from `astro/container` for component tests), Vitest 5, Playwright 1.64.

**Spec:**
- [`docs/superpowers/specs/2026-10-26-phase-3-foundations-design.md`](../specs/2026-10-26-phase-3-foundations-design.md), the approved Phase 3 design. It wins on conflicts.
- Its parent, [`docs/redesign-plan.md`](../../redesign-plan.md) sections 5.5, 5.6, 5.7, 5.16, 6.1, 6.5 and tasks 3.1–3.4.
- Design values come from `design-handoff/design/*.dc.html` (top bar and footer blocks, `<helmet>` texture CSS) and `design-handoff/README.md` "Themes at a glance".

## Global Constraints

- Astro 7 APIs only, with no UI framework. Client JS is small vanilla `<script>` modules.
- **Design values:** take exact values from the `.dc.html` files and convert them into scoped CSS plus custom properties. Never paste inline styles. Design-time `{{tweaks}}` become fixed tokens:
  - `{{blue}}` `#2452ff`
  - `{{orange}}` `#ff6a1f`
  - `{{accent}}` `#6ee7a0`
  - `{{texture}}` defaults per spec 5.5
- **Theme isolation:**
  - Each theme's tokens live under `:root[data-theme="hp|code|on"]` in `src/styles/themes/<theme>.css`, imported only by that theme's layout.
  - Shared components (`TopBar`, `SkipLink`, `Texture`, `Dymo`, `SectionChip`, `TagLinks`, `Manicule`, `Fleuron`) contain no theme-specific values or selectors.
  - Theme-only effects (the Code cursor blink, On's uppercase nav) live in the theme file. They target the stable class names `site-mark`, `site-nav` and `site-wordmark`, which `TopBar` puts on its elements.
- **Breakpoints:** 480, 760 and 900 only.
- **Accessibility:** `prefers-reduced-motion: reduce` turns off blinking, hover lifts and transitions. Plus 44px targets, a visible `:focus-visible`, and the `aria-current` rules from the design spec.
- **Branch:** `redesign/phase-3-foundations` (already created; the design is committed). Commit as `sasky` / `cam@sasky.nz` and end each message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **The legacy pages must not change visually.** The Phase 2 e2e tests and the baseline-style checks stay green.

## Review Focus

1. **The path a page renders under:**
   - `/index.html`, `/code.html` and `/meditations/on-happiness.html` (build), plus `/code` and `/code/` (dev) must give the same current section.
   - `/codex` and `/tags/music` must give none.
   - Pinned in Task 1.
2. **CSS leaking through shared component imports.** A shared component's scoped CSS ships on every page that imports it. The 404 page's stylesheets must contain no `data-theme="code"` or `data-theme="on"` selectors, and no `@font-face` for Holtwood, Alfa Slab, Rye or Oswald. Pinned in Task 8.
3. **The Fraunces `opsz` axis being silently dropped by the provider,** which makes the headlines look wrong. Checked by name in Task 2, Step 3.
4. **Reduced motion:** with `prefers-reduced-motion: reduce`, the Code cursor's computed `animation-name` is `none`. Pinned in Task 7 on the Code demo page.
5. **An unknown URL** returns the 404 page with HTTP status 404 under both `astro preview` and the Netlify emulator, not a 200 or the default page. Pinned in Task 8 (preview) and Task 9 (emulator).

---

### Task 1: Path helpers

**Files:**
- Create: `src/lib/paths.ts`, `tests/unit/paths.test.ts`

**Interfaces:**
- Produces:
  - `pagePath(url: URL): string`: strips a trailing `.html`, then `/index`, then any trailing `/`; returns `/` for Home.
  - `sectionForPath(path: string): { section: Section; isListing: boolean } | undefined`: matches `/${SECTIONS[s].path}` exactly (a listing) or as a prefix followed by `/` (a post).

- [ ] **Step 1: Write the failing tests**

| Input | Expected |
|---|---|
| `pagePath(new URL('https://sasky.nz/index.html'))` | `'/'` |
| `pagePath(…'/')` | `'/'` |
| `pagePath(…'/code.html')` | `'/code'` |
| `pagePath(…'/code/hide-n-seek-game.html')` | `'/code/hide-n-seek-game'` |
| `pagePath(…'/code')` and `pagePath(…'/code/')` | `'/code'` |
| `pagePath(…'/404.html')` | `'/404'` |
| `sectionForPath('/meditations')` | `{ section: 'on', isListing: true }` |
| `sectionForPath('/meditations/on-happiness')` | `{ section: 'on', isListing: false }` |
| `sectionForPath('/life')` | `{ section: 'life', isListing: true }` |
| `sectionForPath('/')`, `('/codex')`, `('/tags/music')`, `('/404')` | `undefined` |

- [ ] **Step 2: Run the tests** — `npm test`. Expected: FAIL, because the module is missing.
- [ ] **Step 3: Implement `src/lib/paths.ts`** (it imports `SECTIONS` and `Section` from `src/data/sections.ts`).
- [ ] **Step 4: Run the tests** — `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** — `git commit -m "Add page path and section helpers"`.

---

### Task 2: Fonts

**Files:**
- Modify: `astro.config.mjs`
- Possibly modify: `package.json` (only if Step 3 triggers the fallback)

**Interfaces:**
- Produces these CSS variables, registered for `<Font cssVariable=…>`:
  - `--font-fraunces`
  - `--font-source-sans`
  - `--font-jetbrains`
  - `--font-holtwood`
  - `--font-alfa`
  - `--font-rye`
  - `--font-oswald`

- [ ] **Step 1: Add the `fonts` array**

Add a top-level `fonts` array, imported from `astro/config`, using `fontProviders.fontsource()` and the families, weights and styles in spec 5.7. Every family gets:
- `subsets: ['latin', 'latin-ext']` (design doc decision)
- `formats: ['woff2']`
- `display: 'swap'`
- `fallbacks` ending in a generic family, so Astro generates optimised fallbacks. The stacks come from the designs: Fraunces → `Georgia, serif`; Source Sans 3 → `system-ui, sans-serif`; JetBrains Mono → `Menlo, monospace`; Holtwood/Alfa/Rye → `serif`; Oswald → `sans-serif`.

- [ ] **Step 2: Check the fonts resolve** — `npm run build`. Expected: the build succeeds. Nothing renders `<Font>` yet, so no `@font-face` ships; a temporary page that renders all seven `<Font>`s (deleted after this step) must build.

- [ ] **Step 3: Check Fraunces's axes (R5)**

Look at the Fraunces file the temporary page references in `dist/_astro/fonts/`, and the `src` URL in its `@font-face`. Fontsource names its variable files by axis, so a URL or file containing `wght` but not `opsz`/`full` means the `opsz` axis is missing.

If `opsz` is missing:
1. `npm i -D @fontsource-variable/fraunces`.
2. Switch Fraunces to `fontProviders.local()`, pointing at the package's full-axes woff2 files (normal and italic) under `node_modules/@fontsource-variable/fraunces/files/`. Use the file whose name contains `full` or `opsz`.
3. Rebuild and repeat the check.

Record the outcome in the ledger.

- [ ] **Step 4: Remove the temporary page; check the rest still passes** — `npm run build && npm run test:e2e`. Expected: green.
- [ ] **Step 5: Commit** — `git commit -m "Configure self-hosted fonts"`.

---

### Task 3: Base and theme styles

**Files:**
- Create: `src/styles/base.css`, `src/styles/themes/hp.css`, `src/styles/themes/code.css`, `src/styles/themes/on.css`

**Interfaces:**
- Produces `base.css`:
  - a modern reset, `.sr-only`, a `:focus-visible` outline using `--focus`, and the reduced-motion block;
  - `@view-transition { navigation: auto; }` (Q7);
  - the geometry tokens `--bar-h: 66px`, `--wrap: 1120px`, `--gutter: 24px` (16px under 480) and `--rule: 2px`;
  - a comment documenting the 480/760/900 breakpoints.
- Produces the theme token contract, defined by all three theme files under `:root[data-theme="<theme>"]` and consumed by the shared components:

| Token | Meaning |
|---|---|
| `--page-bg`, `--ink`, `--muted`, `--focus` | page colours |
| `--bar-bg`, `--bar-rule` | top bar background and 2px bottom rule colour |
| `--wordmark-font`, `--wordmark-weight`, `--wordmark-style`, `--wordmark-tracking`, `--wordmark-color` | wordmark |
| `--mark-w`, `--mark-h`, `--mark-bg`, `--mark-shadow`, `--mark-rotate` | wordmark mark |
| `--nav-font`, `--nav-color`, `--nav-transform`, `--nav-tracking` | nav links |
| `--nav-current-color`, `--nav-current-rule` | current link text and the 3px inset underline colour |
| `--texture-pattern`, `--texture-grain`, `--texture-opacity`, `--grain-opacity` | `Texture` layers |

The values come from each theme's top bar in `Site-Life-List`, `Site-Code-List` and `Site-On-List`, plus the texture CSS in each file's `<helmet>`. HP and Code also define their footer and Dymo/chip tokens there as those components need them. Theme-only rules sit in the theme files:
- `code.css`: `.site-mark` blinks inside `@media (prefers-reduced-motion: no-preference)`.
- `on.css`: `.site-nav` is uppercase with `.12em` tracking, through the tokens.

- [ ] **Step 1: Write the files.** Nothing imports them yet, so there's nothing to test in isolation; Tasks 5, 7 and 8 test them through the components.
- [ ] **Step 2: Check** — `npm run build && npm run check`. Expected: green.
- [ ] **Step 3: Commit** — `git commit -m "Add base styles and theme tokens"`.

---

### Task 4: New BaseLayout; legacy layout moved aside

**Files:**
- Move: `src/layouts/BaseLayout.astro` → `src/layouts/legacy/LegacyBaseLayout.astro`, fixing its relative imports
- Modify: every importer of the old layout (`src/components/legacy/*.astro`, `src/pages/**/*.astro`)
- Create: `src/layouts/BaseLayout.astro`, `tests/unit/base-layout.test.ts`

**Interfaces:**
- Consumes: `pagePath` (Task 1).
- Produces `BaseLayout`:
  - Props: `{ theme: 'hp' | 'code' | 'on'; title: string; description: string; ogType?: 'website' | 'article'; noindex?: boolean }`.
  - Renders `<html lang="en-NZ" data-theme={theme}>`, imports `base.css`, and outputs:
    - charset and viewport;
    - `<title>`;
    - the meta description;
    - when `noindex`: `<meta name="robots" content="noindex">` and no canonical;
    - otherwise: `<link rel="canonical" href={new URL(pagePath(Astro.url), Astro.site)}>`;
    - `og:title`, `og:description`, `og:url` (same as the canonical), `og:type` (default `website`) and `og:site_name` (`sasky.nz`);
    - `twitter:card` `summary`;
    - the RSS `<link rel="alternate" type="application/rss+xml" href="/rss.xml">`;
    - `<slot name="head" />`, then `<body><slot /></body>`.
  - No `ClientRouter`.

- [ ] **Step 1: Write the failing container tests** in `tests/unit/base-layout.test.ts`

Use `experimental_AstroContainer`. Render with `request: new Request('https://sasky.nz/code/hide-n-seek-game.html')`, a slot, and props `{ theme: 'code', title: 'T', description: 'D' }`. Expect:
- `data-theme="code"`
- `<title>T</title>`
- `rel="canonical" href="https://sasky.nz/code/hide-n-seek-game"`
- `og:url` with the same URL
- no `ClientRouter` script

A second render with `noindex: true` expects `noindex` and no `rel="canonical"`.

Pass the container `site: 'https://sasky.nz'` if `Astro.site` is otherwise undefined.

- [ ] **Step 2: Run the tests** — `npm test`. Expected: FAIL, because the module is missing (the old layout has moved).
- [ ] **Step 3: Move the legacy layout and implement the new `BaseLayout`.**
- [ ] **Step 4: Run every check** — `npm test && npm run build && npm run check && npm run check:links && npm run test:e2e`. Expected: all green. The legacy pages still render through `LegacyBaseLayout`, so the six Phase 2 e2e tests pass.
- [ ] **Step 5: Commit** — `git commit -m "Add new BaseLayout; move the old one to legacy"`.

---

### Task 5: TopBar, SkipLink and Texture

**Files:**
- Create: `src/components/site/TopBar.astro`, `SkipLink.astro`, `Texture.astro`, `tests/unit/topbar.test.ts`

**Interfaces:**
- Consumes: `pagePath` and `sectionForPath` (Task 1), `SECTIONS` and `SECTION_ORDER`, and the token contract (Task 3).
- Produces:
  - **`TopBar`.** Props `{ current?: Section; isListing?: boolean }`; when they're omitted, it derives them from `sectionForPath(pagePath(Astro.url))`.
    - Markup:
      - `<header class="site-bar">` holding the wrapper;
      - the wordmark `<a class="site-wordmark" href="/">`, which contains `<span class="site-mark" aria-hidden="true">` and `sasky.nz` and gets `aria-current="page"` on Home;
      - `<nav class="site-nav" aria-label="Sections">` with one link per `SECTION_ORDER` entry, `href="/" + SECTIONS[s].path`, text `SECTIONS[s].label`.
    - The current link gets `aria-current="page"` on a listing and `"true"` on a post.
    - Geometry is from spec 6.1, styled only through tokens.
  - **`SkipLink`.** `<a class="skip-link" href="#main">Skip to content</a>`, visually hidden until focused.
  - **`Texture`.** Props `{ opacity?: number }`. Renders `<div class="texture" aria-hidden="true">` with a pattern layer and a grain layer:
    - `position: fixed; inset: 0; pointer-events: none; z-index: 0; user-select: none`;
    - backgrounds from `--texture-pattern` and `--texture-grain`;
    - opacity from the prop, falling back to `--texture-opacity`.

- [ ] **Step 1: Write the failing container tests** — render `TopBar` with these request URLs:

| URL | Expected |
|---|---|
| `https://sasky.nz/meditations.html` | the On link (`href="/meditations"`, text `On`) has `aria-current="page"`; no other element has `aria-current` |
| `https://sasky.nz/meditations/on-happiness.html` | the On link has `aria-current="true"` |
| `https://sasky.nz/index.html` | the wordmark has `aria-current="page"`; no nav link has `aria-current` |
| `https://sasky.nz/tags/music.html` | no `aria-current` anywhere |
| all of the above | the link order is Code, Life, On, with hrefs `/code`, `/life` and `/meditations` |

Also render `Texture` and expect `aria-hidden="true"`.

- [ ] **Step 2: Run the tests** — `npm test`. Expected: FAIL, because the modules are missing.
- [ ] **Step 3: Implement the three components.**
- [ ] **Step 4: Run the tests** — `npm test`. Expected: PASS. Then run `npm run check`; expected: 0 errors.
- [ ] **Step 5: Commit** — `git commit -m "Add TopBar, SkipLink and Texture"`.

---

### Task 6: Footers and small shared components

**Files:**
- Create in `src/components/site/`: `HpFooter.astro`, `CodeFooter.astro`, `OnFooter.astro`, `Dymo.astro`, `SectionChip.astro`, `TagLinks.astro`, `Manicule.astro`, `Fleuron.astro`
- Create: `src/data/social.ts`, `tests/unit/site-components.test.ts`

**Interfaces:**
- Consumes: `toRoman` (Phase 2 `format.ts`) and `SECTIONS`.
- Produces:
  - `src/data/social.ts`: `SOCIAL: { label: string; href: string }[]`.
    - Mastodon `https://mastodon.social/@sasky`
    - LinkedIn `https://www.linkedin.com/in/cameron-grant-5802b45b/`
    - GitHub `https://github.com/sasky/`
    - RSS `/rss.xml`
    - No `target="_blank"` on any of them.
  - **Footers.** Markup and values come from each design's footer block: HP from `Site-Life-List`, Code from `Site-Code-List`, On from `Site-On-Post` (the correspondence row plus colophon).
    - **Years:**
      - `HpFooter` shows `© {year} Cameron Grant`.
      - `CodeFooter` shows `-- NORMAL --`, then lowercase links (`rss` in amber `#f2b45a`), then `© {year} Cameron Grant`.
      - `OnFooter` (props `{ placement?: 'inside' | 'after' }`, default `'after'`) shows `© {toRoman(year)}`.
      - `year` is `new Date().getUTCFullYear()`.
    - Each footer's CSS is scoped and only its own theme imports it, so these three may hold theme values directly.
  - **`Dymo`.** Props `{ tone: 'navy' | 'blue' | 'orange'; tilt?: number; as?: string }`; values from the HP Dymo labels.
  - **`SectionChip`.** Props `{ section: Section }`. Text `SECTIONS[section].label`, 104px wide, background Code navy / Life blue / On orange.
  - **`TagLinks`.** Props `{ tags: string[]; theme: 'hp' | 'code' | 'on' }`.
    - Renders nothing when `tags` is empty.
    - Otherwise each tag is `<a href="/tags/{tag}">`: plain text for `hp`, `[tag]` for `code`, plain text for `on` (CSS-stamped).
    - Its styling comes only from `--tag-*` tokens. The Phase 4–6 themes add those tokens when they first use `TagLinks`. For now, define HP's in `hp.css`.
  - **`Manicule` and `Fleuron`.** Props `{ dir?: 'left' | 'right' }`. Inline `aria-hidden` SVGs that use `currentColor` (G8).

- [ ] **Step 1: Write the failing container tests**
  - `TagLinks` with `[]` renders an empty string.
  - `TagLinks` with `['pico8', 'family']` and theme `code` renders `href="/tags/pico8"` with text `[pico8]`.
  - `TagLinks` with theme `hp` renders text `pico8`.
  - `HpFooter` contains `© ${year} Cameron Grant` for the current UTC year, and the four `SOCIAL` hrefs.
  - `OnFooter` contains `© ${toRoman(year)}`.
  - `CodeFooter` contains `-- NORMAL --`.
  - `SectionChip` with `on` renders `On`.
  - No footer output contains `target="_blank"`.

- [ ] **Step 2: Run the tests** — `npm test`. Expected: FAIL, because the modules are missing.
- [ ] **Step 3: Implement the components.**
- [ ] **Step 4: Run the tests** — `npm test && npm run check`. Expected: PASS and 0 errors.
- [ ] **Step 5: Commit** — `git commit -m "Add footers and small shared components"`.

---

### Task 7: Theme layouts and temporary demo pages

**Files:**
- Create:
  - `src/layouts/HpLayout.astro`, `src/layouts/CodeLayout.astro`, `src/layouts/OnLayout.astro`
  - `src/pages/sandbox/[theme].astro` (temporary)
  - `tests/e2e/sandbox.spec.ts` (temporary)

**Interfaces:**
- Consumes: `BaseLayout` (Task 4), the Task 5 and Task 6 components, the fonts (Task 2) and the theme CSS (Task 3).
- Produces each `<Theme>Layout`:
  - Props: `{ title: string; description: string; ogType?: 'website' | 'article'; noindex?: boolean; texture?: number }`.
  - Imports its own `themes/<theme>.css`.
  - In `slot="head"`, renders `<Font>` for its families:
    - HP: Fraunces (preload), Source Sans 3, JetBrains Mono.
    - Code: JetBrains Mono (preload).
    - On: Holtwood One SC (preload), Alfa Slab One, Rye, Oswald.
  - Then renders `SkipLink`, `Texture opacity={texture}`, `TopBar`, `<main id="main"><slot /></main>` and its footer.
  - Home's extra fonts are added in Phase 4.
- The demo page `src/pages/sandbox/[theme].astro` has `getStaticPaths` over `hp`, `code` and `on`. Each renders its layout with a heading and a paragraph.

- [ ] **Step 1: Write the failing temporary e2e test** in `tests/e2e/sandbox.spec.ts`. For each of `/sandbox/hp`, `/sandbox/code` and `/sandbox/on`:
  - **At 1280:**
    - `header.site-bar` height ≥ 66;
    - its inner wrapper width ≤ 1120, centred, with 24px left padding;
    - every `.site-nav a` is 44px tall;
    - the header height is equal across all three pages.
  - **At 390:** 16px wrapper padding.
  - **Tab order:** the first `Tab` focuses `.skip-link`, which becomes visible (its bounding box is inside the viewport); the second focuses `.site-wordmark`; the third focuses the first nav link.
  - **Textures:** `.texture` has `aria-hidden="true"` and computed `pointer-events: none`.
  - **Reduced motion (`/sandbox/code` only):** with `page.emulateMedia({ reducedMotion: 'reduce' })`, `.site-mark` has computed `animation-name: none`. Without it, the animation name is not `none`.
- [ ] **Step 2: Run the test** — `npm run build && npm run test:e2e`. Expected: FAIL (404s, because nothing exists yet).
- [ ] **Step 3: Implement the three layouts and the demo page.**
- [ ] **Step 4: Run the tests** — `npm run build && npm run test:e2e && npm run check:links`. Expected: all green. If `check:links` fails on the demo pages, fix the cause.
- [ ] **Step 5: Commit** — `git commit -m "Add theme layouts with temporary demo pages"`.

---

### Task 8: 404 page and the lasting chrome tests

**Files:**
- Create: `src/pages/404.astro`, `tests/e2e/chrome.spec.ts`

**Interfaces:**
- Consumes: `HpLayout`, `Dymo`.
- Produces the 404 page:
  - `HpLayout` with `title="Page not found — sasky.nz"`, a short description, `noindex` and `texture={0.8}`.
  - A navy `Dymo` reading `404`.
  - The H1 "This page has wandered off", in the Life listing's header style (`Site-Life-List.dc.html`, the listing band: Fraunces 800, 120px, scaled down at 760/480 as that file's `@media` rules do).
  - One short lede with links to Home (`/`), Code, Life and On (built from `SECTIONS`). For example: "It might have moved when the site was reorganised. Try the [Code], [Life] or [On] sections, or head [home]." The builder may adjust the wording but must keep it short, with no placeholders.

- [ ] **Step 1: Write the failing e2e tests** in `tests/e2e/chrome.spec.ts`:
  - `page.goto('/no-such-page')` → response status `404`, `h1` text `This page has wandered off`, and a `meta[name=robots][content=noindex]`.
  - The same tab-order, top-bar geometry (1280 and 390) and texture assertions as Task 7, run against `/no-such-page`.
  - **No theme leakage:**
    1. Collect the text of every `link[rel=stylesheet]` (fetched through `request`) and every `<style>` on the page.
    2. Expect it to contain `data-theme="hp"` or `data-theme=hp`.
    3. Expect it not to match `/data-theme=["']?(code|on)/`.
    4. Expect every `@font-face` `font-family` to be one of Fraunces, Source Sans 3 or JetBrains Mono, or an Astro-generated fallback name containing one of them.
- [ ] **Step 2: Run the tests** — `npm run build && npm run test:e2e`. Expected: the new tests FAIL.
- [ ] **Step 3: Implement `src/pages/404.astro`.**
- [ ] **Step 4: Run the tests** — `npm run build && npm run test:e2e`. Expected: all green.
- [ ] **Step 5: Commit** — `git commit -m "Add the 404 page and lasting chrome tests"`.

---

### Task 9: Finish the phase

**Files:**
- Delete: `src/pages/sandbox/`, `tests/e2e/sandbox.spec.ts`
- Modify: `docs/redesign-roadmap.md`

- [ ] **Step 1: Remove the demo pages** — `git rm -r src/pages/sandbox tests/e2e/sandbox.spec.ts` and commit with `git commit -m "Remove temporary demo pages"`.

- [ ] **Step 2: Full verification**

Run:

```bash
npm run build && npm run check && npm test && TZ=Pacific/Auckland npx vitest run && npm run check:links && npm run check:redirects -- --dist && npm run test:e2e
```

Expected: all green. Then:
- `find dist -name '*.html' | sort` lists the 17 Phase 2 pages plus `404.html`, and nothing under `sandbox`.
- `grep -L ClientRouter dist/404.html` prints the file (no ClientRouter).

- [ ] **Step 3: Check the 404 on Netlify's emulator**

Run `npx netlify-cli dev --offline --dir dist --port 8888` in the background, then `curl -s -o /dev/null -w "%{http_code}" http://localhost:8888/no-such-page`. Expected: `404`, and the body contains `This page has wandered off`. Also run `npm run check:redirects -- --url http://localhost:8888` and expect `10 rules, 0 errors`. Stop the server.

- [ ] **Step 4: Update the roadmap**

Tick 3.1–3.4, update the Status table and anything carried forward, and commit with `git commit -m "Roadmap: Phase 3 done"`.

- [ ] **Step 5: Final review, then the PR**

After the final review, open the PR into `feature/redesign` as the sasky account. The PR body covers:
- what was built;
- the Fraunces axis outcome;
- the `latin-ext` change;
- the legacy layout move;
- the deleted demo pages;
- test counts.

Then link the PR in the roadmap.
