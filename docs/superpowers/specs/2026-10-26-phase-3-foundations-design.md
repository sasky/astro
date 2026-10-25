# Phase 3: Foundations — design

**Status:** for Cam's approval. **Parent spec:** [`docs/redesign-plan.md`](../../redesign-plan.md). Phase 3 covers tasks 3.1–3.4, using sections 5.5 (theme architecture), 5.6 (shared components), 5.7 (fonts), 5.16 (meta), 6.1 (shared foundations) and 6.5 (404). This document records only the decisions the parent spec leaves open. Where they disagree, this document wins for Phase 3.

## Intent

Build the shared base every redesigned page will sit on, so Phases 4–6 only have to build page content:
- self-hosted fonts;
- base and per-theme CSS tokens;
- the layout chain;
- the shared top bar, skip link, textures and footers;
- the small shared components;
- the 404 page.

The live site keeps its old look until Phases 4–6 replace each page.

## Goals

- **Layout chain** (`BaseLayout` → `HpLayout`, `CodeLayout`, `OnLayout`), with meta tags per spec 5.16.
- **Fonts through Astro's Fonts API** (spec 5.7). Each theme layout loads only its own families.
- **Styles:**
  - `src/styles/base.css`: reset, `.sr-only`, skip link, `:focus-visible`, geometry tokens, reduced motion and `@view-transition` (Q7).
  - `src/styles/themes/{hp,code,on}.css`: each theme's tokens and textures.
  - The design-file values for each theme are summarised in `design-handoff/README.md` under "Themes at a glance". The `.dc.html` files are the source of truth.
- **Shared components** in `src/components/site/`, as listed in spec 5.6:
  - `TopBar`, `SkipLink`, `Texture`, `HpFooter`, `CodeFooter`, `OnFooter`;
  - `Dymo`, `SectionChip`, `TagLinks`, `Manicule`, `Fleuron`.
- **404 page:** `src/pages/404.astro` in the HP theme, per spec 6.5. It shows a navy Dymo "404", the H1 "This page has wandered off", and a short lede linking to Home, Code, Life and On. The title is `Page not found — sasky.nz`.

## Non-goals

- **No live page switches to the new look.** Home, the listings, the posts and the tag pages stay on the legacy components from Phase 2.
- **No prose styles yet.** The post-body styles for each theme arrive with their templates in Phases 4–6.
- **No `og:image`** (spec 5.16).

## Anti-goals

These would make Phase 3 a failure even if it builds:
- **Theme leakage:** one theme's CSS or fonts loading on another theme's page.
- **Pasted inline styles:** copying the design files' inline styles instead of turning them into scoped CSS and tokens.
- **Old-look regressions:** any visible change to the old pages.
- **Shipped demo pages:** a demo or sandbox page reaching production.

## Decisions (Cam)

- **Review is code-only.** Cam doesn't need to see the in-between state in a browser.

## Decisions (Claude's calls, accepted by Cam in chat)

1. **The old layout moves aside.** `src/layouts/BaseLayout.astro` becomes `src/layouts/legacy/LegacyBaseLayout.astro`, and every legacy page and component is updated to import it.
   - Legacy pages keep `ClientRouter`, `global.css` and the old fonts until they are replaced.
   - The old font files and `fonts.css` stay until Phase 9, because the legacy layout still imports them. Spec task 3.1 allows this.
2. **Demo pages are temporary.** One demo page per theme is used while building, then deleted before the PR. Deleting them is the phase's last commit. They never ship.
3. **The 404 page carries the lasting tests.** It's the only real page in a new theme this phase, so the lasting Playwright tests run against `/404`:
   - Tab order: skip link → wordmark → nav. The skip link is visible on focus and targets `#main`.
   - Top-bar geometry: 66px minimum height, 1120px inner width, 24px gutters, 44px-tall nav links. Under 480px: 16px gutters and the smaller wordmark.
   - Texture layers are `aria-hidden` and `pointer-events: none`.
   - **No theme leakage:** the 404 page's stylesheets contain HP tokens and none of Code's or On's, and its `@font-face` rules cover only the HP families.

   The demo pages also prove the Code and On top bars and footers have the same geometry while they exist. When the real Code and On pages arrive in Phases 5–6, the same assertions are repeated against them.

## Decisions (Claude's calls, made while writing this up)

- **Normalising paths for the `.html` build.** With `build.format: 'file'`, `Astro.url.pathname` ends in `.html`. Phase 2's review hit this in the old header.
  - Add a helper, `pagePath(url: URL): string`, in `src/lib/`. It strips a trailing `.html` and `/index`, returns `/` for Home, and is unit tested.
  - `TopBar` uses it to mark the current section. The canonical URL is `site` + `pagePath(Astro.url)`, never a raw `Astro.url`.
- **The current section in the top bar** comes from `pagePath`:
  - A listing (`/code`, `/life`, `/meditations`) gets `aria-current="page"`.
  - A post under one of those paths gets `aria-current="true"`.
  - Home gets `aria-current="page"` on the wordmark.
  - The On link is current for any path under `/meditations` (spec 5.3).
  - The section paths come from `SECTIONS`, never hard-coded.
- **Footer links.** These are reused from the old `Footer.astro`:
  - Mastodon `https://mastodon.social/@sasky`
  - LinkedIn `https://www.linkedin.com/in/cameron-grant-5802b45b/`
  - GitHub `https://github.com/sasky/`
  - RSS `/rss.xml`

  External links open in the same tab. The old site's `target="_blank"` isn't carried over.
- **Footer years** come from the build date: `© {year}` in HP and Code, and `© {toRoman(year)}` in On.
- **Fonts and the `opsz` axis (risk R5).** Task 3.1 checks the downloaded Fraunces file for an `opsz` axis.
  - If the axis is missing, switch Fraunces to `fontProviders.local()` with the full-axes Fontsource variable woff2, and record the switch in the PR.
  - That swap is a dev dependency on `@fontsource-variable/fraunces`, which is the only new package this phase may add.

## Decisions (Claude's calls, from the builder check)

- **Shared components stay theme-neutral.** Astro bundles a component's scoped CSS into every page that imports it, so a theme-specific rule inside a shared component would reach every theme.
  - `TopBar`, `TagLinks` and the other shared components therefore take their colours, fonts, casing and marks from tokens (`var(--…)`) only.
  - Anything specific to one theme (for example the Code cursor's blink keyframes, or On's uppercase nav) lives in that theme's CSS file.
  - This is what the 404 no-leakage test enforces.
- **`TopBar` reads the current section from the URL.** It derives `current` and listing-versus-post from `pagePath`, and spec 5.6's `current` and `isListing` props remain as optional overrides.
- **The 404 page is built from HP pieces, since there's no design file for it:**
  - the Dymo;
  - a header in the Life listing's style;
  - the HP texture at .8.

  It gets `<meta name="robots" content="noindex">` instead of a canonical URL. With no design to compare against, Phase 8 checks it for consistency with the HP pages only.
- **The font subsets are `latin` and `latin-ext`.** This differs from spec 5.7, which says `latin` only: NZ Music has "MĀ" in a video title, and the macron isn't in `latin`. Browsers only download a subset when a page uses one of its characters, so this costs nothing elsewhere. Flag it in the PR.

## Constraints

- **Stack:** Astro 7 APIs only. No UI framework; client JS is limited to small vanilla `<script>` modules. Every global constraint in spec "Global constraints" applies.
- **Design values:** taken from the `.dc.html` files, converted to scoped CSS and custom properties. The design-time tweaks become fixed tokens (`design-handoff/README.md`, "How to read a `.dc.html` file").
- **Breakpoints:** 480, 760 and 900 only, documented in `base.css`.
- **Every existing check stays green:** `build`, `check`, `test`, `check:links`, `check:redirects --dist` and `test:e2e`.
- **Merged repo state:**
  - The new `BaseLayout` emits no `ClientRouter`.
  - `open-props` and the old CSS stay installed, because the legacy pages still use them. They are removed in Phase 9.

## Left to the builder

- **Component internals:** markup structure, class names, prop defaults beyond spec 5.6, and how components are split, as long as the spec 5.6 props hold.
- **Texture technique:** how the grain data URI is generated, as long as it's a small tiled background and not a full-page SVG filter (spec 5.5).
- **Demo page content** and route name. It must not start with `_`, because Astro doesn't build routes that start with an underscore.
- **How each test measures** geometry and stylesheet contents.
- **The exact 404 lede wording,** within spec 6.5: short, no placeholders, and links to Home, Code, Life and On.
