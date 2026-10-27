# sasky.nz redesign: roadmap

The tracker for the redesign. The detail lives in [`redesign-plan.md`](redesign-plan.md) (the "plan"); this file lists the phases and tasks, what's done, and how each phase gets run.

- **Branches:** each phase is built on `redesign/phase-N-<name>` and merged by PR into `feature/redesign`. The launch (task 9.3) is the PR from `feature/redesign` into `main`.
- **Account:** `~/Sasky/` repos use the `sasky` GitHub account (cam@sasky.nz). Check `gh auth status` and `git config user.email` before pushing.
- **Every PR runs:** `npm run build`, `npm run check`, `npm test`, `npm run check:links`, `npm run check:redirects -- --dist` and `npm run test:e2e`.

## Status (27 Oct 2026)

| Phase | State | PR |
|---|---|---|
| 1. Tooling and baseline | Merged into `feature/redesign` | [#3](https://github.com/sasky/astro/pull/3) |
| 2. Collections, routes, redirects | Merged into `feature/redesign` | [#4](https://github.com/sasky/astro/pull/4) |
| 3. Foundations | Merged into `feature/redesign` | [#5](https://github.com/sasky/astro/pull/5) |
| 4. HP pages | Merged into `feature/redesign` | [#6](https://github.com/sasky/astro/pull/6) |
| 5. Code pages | Merged into `feature/redesign` | [#7](https://github.com/sasky/astro/pull/7) |
| 6. On pages | Merged into `feature/redesign` | [#8](https://github.com/sasky/astro/pull/8) |
| 7. Tags, RSS, SEO | Merged into `feature/redesign` | [#9](https://github.com/sasky/astro/pull/9) |
| 8. QA | Merged into `feature/redesign` | [#10](https://github.com/sasky/astro/pull/10) |
| 9. Cleanup and launch | Cleanup (9.1, 9.2) merged into `feature/redesign`. Launch (9.3) not started: it waits on Cam's fresh-context review | [#11](https://github.com/sasky/astro/pull/11) |

**Waiting on Cam**
- **A fresh-context review of the whole redesign**, before the launch PR. See "For the review" below.
- **Content review**, any time before launch (the posts are in `src/content/posts/`):
  - Pick tags for every post. The current ones are interim (Q1), and Classy has none.
  - NZ Music's computed excerpt is its link-only first paragraph ("Waiata 100. what is Atearoa's favourite song"). Set `excerpt:` in its frontmatter for the On listing if you want something else.
  - Copy slips: "Atearoa" (NZ Music), "indented audience" (Silverstripe), the "Scott J Mason (2014" embed title missing its `)`.
  - Optional: title-case the Moment post's title (Q5).
  - Refine the draft section intros in `src/data/sections.ts` (marked `TODO(Cam)`).
  - From the Phase 8 compare sheet: Silverstripe's `SS_DEFAULT_ADMIN`, `_config.php` and `_config.yml` have no backticks, so they aren't code chips as on the board; quotes are curled in post text but straight in titles (the board curls "one’s" in the concert title).
- **Compare sheet sign-off (spec 8.1):** `npm run build && npm run qa:compare`, then open `qa/compare/index.html`. Also look at the manicule and fleuron SVG shapes (solid hands, a thin star), which differ from the board's glyphs.
- **`src/images/cameron_grant_holding_a_soft_toy.jpeg`** has been unreferenced since `about.mdx` went (Phase 2). Keep it for a future page, or delete it.
- **Pico-8 on a real phone (spec 6.3):** the touch controls are untested on a device. At 390×664 the started canvas can sit partly under the d-pad depending on scroll position; consider scrolling `#p8_frame_0` to the top when a touch device starts the game.

**Carried forward**
- **Phase 4–8 review (Cam):** these phases skipped the brainstorm ("just do your best, we will do a detailed review later"). The calls a brainstorm would have settled are listed under "Calls made in place of a brainstorm" in the plans for [Phase 4](superpowers/plans/2026-10-26-phase-4-hp-pages.md), [5](superpowers/plans/2026-10-26-phase-5-code-pages.md), [6](superpowers/plans/2026-10-26-phase-6-on-pages.md), [7](superpowers/plans/2026-10-26-phase-7-tags-rss-seo.md) and [8](superpowers/plans/2026-10-26-phase-8-qa.md). Review them with the pages.
- **Launch PR (`feature/redesign` into `main`), on its Netlify deploy preview:**
  - Check the redirects there; so far only Netlify's local emulator has.
  - Run `npm run qa:lighthouse <preview URL>` there. Home scores 94–95 locally (target 95), against an uncompressed local server.
  - Read `/rss.xml` and spot-check a page per theme.
- **After Cam merges the launch PR:** re-run `npm run check:redirects -- --url https://sasky.nz`, and request indexing for `/code`, `/life` and `/meditations` in Search Console if it's set up.
- **After launch (minor, from the Phase 8 reviews):**
  - `<?php` isn't amber as on the board: Shiki's PHP grammar reads it as `<`, `?`, `php`. It needs a one-token transformer.
  - Tag chips are 44px tall; the board's are 48px (content-box, the same cause as the rows fixed in Phase 8).
  - Copying a Code block by hand drops its blank lines (the copy button is exact).
  - Test tightening:
    - the no-JS video-card and copy-button checks should assert a count first;
    - the font-size budget test should await its response bodies;
    - the arrows test is Mac-specific (it asserts "not Arial or Courier New");
    - the chip-name test's comment overstates.
  - The chip plural is hard-coded beside `plural()`.
  - `scripts/lighthouse.mjs` imports `playwright-core` without declaring it.
  - `aria-current="page"` repeats on every row's current tag link (valid; Phase 7 call).
  - Same-date ties are only pinned through `sortNewest`; `HpFooter` finds RSS by its label.

## Resuming in a fresh session

Read this file first, then [`redesign-plan.md`](redesign-plan.md) (the spec), then the design files in `design-handoff/`. The plans and designs for finished phases are in `docs/superpowers/plans/` and `docs/superpowers/specs/`. They're useful as examples of the format.

**Where things stand**
- **Branch:** `feature/redesign` holds Phases 1–9 (cleanup), all merged; no phase branch is open. `main` is still the live old site.
- **Live pages:**
  - **On the new HP theme:** Home, `/life`, `/life/[slug]`, `/tags/[tag]` and the 404.
  - **On the new Code theme:** `/code` and `/code/[slug]`.
  - **On the new On theme:** `/meditations` and `/meditations/[slug]`.
  - **The old site's code is gone** (Phase 9): the old components, legacy layout, global styles, font files and `open-props`.
- **Components:**
  - `src/components/site/` holds the shared chrome.
  - `src/components/hp/` holds the HP page parts: `Hero`, `AboutSection`, `SectionDoors`/`Door` with the three previews, `TagSelector`, `ListingBand` (its one-word heading sized by `headingFit()` in `src/lib/fit.ts`), `PostList`, `PostRow`, `PostHeader` and `HpPrevNext`.
  - `src/components/code/` holds the Code page parts: `Prompt`, `CodeListEntry`, `CodePostHeader`, `Toc`, `CodePrevNext`, and `CodeBlock`, the `pre` override that only the Code post template passes.
  - `src/components/on/` holds the On page parts: `Bill`, `DoubleRule`, `DiamondRule`, `NowShowing`, `Eye`, `OnCorrespondence`, `Programme`, `OnPostHeader` and `FurtherMeditations`.
  - `src/components/mdx/` holds the theme-neutral MDX components, `YouTube`, `ImageCollection` and `Ornament`. A unit test keeps hard-coded colours out of this folder.
  - `src/components/Pico8.astro` is the game panel.
- **Markdown:** `markdown.processor: satteri({ hastPlugins: [onTips] })`; `src/markdown/on-tips.ts` turns `## N. Tip` in On posts into `h2.tip` with a Roman `span.num`.
- **Highlighting:** `src/shiki/sasky-terminal.json` plus the `metaToData` transformer (fence `title="…"` → `data-title`; drops the newlines between lines), set in `markdown.shikiConfig`.
- **Client JS:** `src/scripts/video-card.ts`, `tag-selector.ts` and `copy-code.ts` (Clipboard API, then `execCommand("copy")`, then selecting the code).
- **Fonts:** Fraunces comes from Google (opsz and wght only); everything else from Fontsource, with Source Sans 3 and JetBrains Mono as variable fonts. HP preloads Fraunces; Code preloads JetBrains Mono; On preloads Holtwood and Oswald.
- **QA tools:**
  - `tests/e2e/a11y.spec.ts`: axe (WCAG 2.2 AA), keyboard, reduced motion, no JS.
  - `tests/e2e/network.spec.ts`: no off-site requests, theme fonts only, fonts ≤ 100 KB, no layout shift as fonts load, hero size.
  - `npm run qa:lighthouse` (needs `astro preview` on 4322, or pass a URL).
  - `npm run qa:compare`: the board-vs-site sheet in `qa/compare/`.
- **Content:**
  - Posts are in the `posts` collection (`src/content/posts/`), read through `getPosts()` in `src/lib/get-posts.ts`.
  - The pure helpers are in `src/lib/` (`format`, `text`, `posts`, `paths`, `slug`, `feed`, `fit`).
  - Copy and data are in `src/data/` (`sections`, `home`, `social`, `site`).
- **RSS:** `src/pages/rss.xml.ts` maps posts through `feedItem()` (section label, then tags, as categories) and adds `atom:link rel="self"`.
- **SEO:** `BaseLayout` emits title, description, canonical and OG tags; `tests/e2e/meta.spec.ts` pins them for one page of each type.

**For the review** (Cam, in a fresh context)
- **Start with:**
  - the [README](../README.md), the guide to the codebase as it is now;
  - this file's "Where things stand" and "Waiting on Cam".
- **The decisions to check:** each phase plan lists the calls made in place of a brainstorm, and its PR lists the rulings made during the build. Phases 4–9 skipped the brainstorm:
  - plans: [4](superpowers/plans/2026-10-26-phase-4-hp-pages.md), [5](superpowers/plans/2026-10-26-phase-5-code-pages.md), [6](superpowers/plans/2026-10-26-phase-6-on-pages.md), [7](superpowers/plans/2026-10-26-phase-7-tags-rss-seo.md), [8](superpowers/plans/2026-10-26-phase-8-qa.md), [9](superpowers/plans/2026-10-26-phase-9-launch.md);
  - PRs: [#6](https://github.com/sasky/astro/pull/6)–[#11](https://github.com/sasky/astro/pull/11).
- **The pages against the designs:** run `npm run build && npm run qa:compare`, then open `qa/compare/index.html`. It lists the intentional differences at the top.
- **Run it yourself:** `npm run build && npm run preview`. The full check list is under "Scripts" in the README.
- **Known open items:** "Carried forward" above. The "after launch" minors don't block launch.

**Next: launch (Phase 9, task 9.3)** — after the review
- Open the PR from `feature/redesign` into `main`; Netlify builds a deploy preview for it.
- Run the launch checks above on that preview, and put the results in the PR body.
- Cam merges the launch PR; then run the post-merge checks above.
- **Before launch, Cam:** the content review, the compare-sheet sign-off and the Pico-8 phone test (all under "Waiting on Cam").
- **After launch:** the README is the guide to the codebase; this file stays the record of the redesign.

**How Cam likes to work**
- **Each phase:**
  - No brainstorm Q&A. Cam prefers a plan written straight from the spec, with the calls a brainstorm would have settled listed in it for later review.
  - Then native execution, with one fresh reviewer at the end.
  - Then a PR into `feature/redesign`, which Cam merges.
- **Review:** in-between states are reviewed as code only; no browser review needed.
- **Redirects** are verified locally with Netlify's emulator during the phases. The launch PR into `main` is the first with a deploy preview, so the redirects get checked there as well.
- **Content** (tags, copy slips, section intros) waits for Cam's own review; don't change post copy.
- **This file** gets updated at the end of every phase.

**Gotchas found so far**
- **`build.format: 'file'`** makes `Astro.url.pathname` end in `.html`. Use `pagePath()`.
- **`astro preview` backgrounds itself under AI agents.** Playwright's config passes `--ignore-lock` to keep it in the foreground.
- **Astro bundles a component's scoped CSS into every page that imports it.** Keep shared components token-only.
- **`<Font preload>` with no filter preloads every face.** Always pass a filter, such as `preload={[{ subset: "latin" }]}`.
- **`overflow: hidden` on a wrapper breaks `position: sticky`.** Use `overflow: clip`.
- **Component tests** use `experimental_AstroContainer` from `astro/container` (see `tests/unit/topbar.test.ts`).
- **Temporary demo pages** go under a route that doesn't start with `_`, because Astro skips those. Delete them before the PR.
- **Astro renders a component's `<script>` inline** after the component's first use, so inside MDX prose a `<script>` element can sit between siblings. Sibling-based tests must skip `SCRIPT`.
- **Smartypants curls quotes** in Markdown text but not in frontmatter titles, so a test should expect `I’m` in a body and `I'm` in a `<title>`.
- **Scripts that replace elements** (such as the tag chips) must copy the `data-astro-cid-*` attribute, or the scoped styles stop matching.
- **Code fences:** Astro passes the fence meta to Shiki as `meta.__raw`, and MDX's `pre` mapping (`<Content components={{ pre }} />`) receives the highlighted `pre`'s attributes as props.
- **A sticky box inside a grid item** needs that item to stretch (`align-self: stretch`), or it has nowhere to stick.
- **UA `pre` and `code` use the system monospace,** so set `font-family: inherit` to keep the theme font.
- **Astro's `<Image>` defaults to `decoding="async"`,** so a screenshot taken straight after `goto` can miss the hero photo. Wait before capturing.
- **Sätteri hast plugins** (`{ name, element: { filter, visit } }`) can return a replacement node; `ctx.data.astro.frontmatter` holds the post's raw frontmatter. Astro's heading-id plugin runs after user plugins, so ids follow the rewritten text. Tests that pass `data` to `markdownToHtml`/`mdxToJs` must give the full `astro` shape (`headings`, `localImagePaths`, `remoteImagePaths`) or `astro check` fails.
- **`Manicule` is 1.6em wide,** so size it at the board's ☞ glyph size ÷ 1.6.
- **Fraunces's optical-size axis widens letters at small sizes** (0.53em per character at 50px against 0.43em at 120px). Anything that sizes Fraunces text to fit must measure at the smallest size it reaches; `src/lib/fit.ts` holds widths measured at 24px.
- **Fontsource serves a variable font's "full" file** when it has unregistered axes (Fraunces's SOFT and WONK), at twice the size. Google's provider takes `options.experimental.variableAxis` and serves only the axes asked for; neither trims a weight range.
- **Astro's size-matched fallback faces** (`<Family> fallback: Arial`) have no `unicode-range`, so they draw any glyph the web font's subset lacks (← and →, for example). Draw those in a chosen face (`.arrow`).
- **The boards' `min-height` is content-box;** the site is border-box. A board row with `min-height: 44px` and 14px padding is 72px tall.
- **`content-visibility: auto` drops skipped content from Chrome's accessibility tree,** so it's not safe for sections people navigate by.
- **Headless Chromium** never requests `/favicon.ico`, and doesn't reliably report a new tab or window opened to another origin as a page.
- **Board screenshots** need an HTTP origin (the compare spec routes `http://boards.test/`): Chrome blocks CSS mask images on `file://` pages.
- **A component whose root uses `align-self: stretch`** (`DoubleRule`, `DiamondRule`) collapses to zero width inside a `display: flex` row wrapper. Wrap it in a block, or pass it straight into a column.

## Standing rules

- **URLs are lowercase kebab-case** (`a-z`, `0-9`, single `-`; no capitals or `_`). Post filenames are the slugs. Three checks enforce it:
  - the content schema rejects bad tags;
  - a unit test rejects bad post filenames;
  - `check:links` fails on any built page link that breaks the rule.

  Old URLs that break it (such as `/top_ten_tips_on_class`) appear only as redirect sources in `public/_redirects`.
- **URL shape:** no trailing slash. Section paths come from `SECTIONS[s].path` and post URLs from `postUrl()`. The On section is `/meditations`.
- **Redirects are checked locally:** `npm run build`, then `npx netlify-cli dev --offline --dir dist --port 8888`, then `npm run check:redirects -- --url http://localhost:8888`.
- **Dates:** `npm test` runs under `TZ=America/Los_Angeles`, so any date formatting that depends on the build machine's time zone fails.
- **Theme isolation:** a theme's tokens live under `:root[data-theme="…"]` in its own CSS file, imported only by its layout. Shared components use tokens only, and theme link rules are wrapped in `:where()` so component styles win. The 404 test fails if Code or On styles or fonts reach an HP page.
- **Page paths:** use `pagePath(Astro.url)` (it strips `.html`), never a raw `Astro.url`, for canonical URLs and the current section.
- **Baseline screenshots** of the old site are in `qa/baseline/` (gitignored). Regenerate them from `main` with `npm run build && npm run baseline`.

## How each phase runs

Each phase starts with the superpowers sessions it needs, in this order:

1. **Brainstorm** (`superpowers:brainstorming`), only when the phase still has open design choices. The output is a short spec in `docs/superpowers/specs/`, and Cam signs it off.
2. **Plan** (`superpowers:writing-plans`), always. It turns the phase's tasks in the plan into a step-by-step plan in `docs/superpowers/plans/YYYY-MM-DD-phase-N-<name>.md`. Cam reviews it and picks how it's executed.
3. **Implement** on the phase branch, test first where there's logic to test:
   - **Native** (`superpowers:executing-plans`) for small phases.
   - **Subagent-driven** (`superpowers:subagent-driven-development`) where a mistake would cost more, with a review after each task.
4. **Finish:** `superpowers:verification-before-completion`, then `superpowers:requesting-code-review`, then `superpowers:finishing-a-development-branch` to open the PR into `feature/redesign`.
5. **Update this file:** tick the tasks and add the PR link.

| Phase | Brainstorm? | Suggested execution | Why |
|---|---|---|---|
| 1. Tooling and baseline | No | Native (used) | Config only, nothing to decide. |
| 2. Collections, routes, redirects | No | Native (used) | URLs and redirects are settled; automated link, redirect and e2e checks plus one final review covered the risk. |
| 3. Foundations | Light (done) | Native (used) | Layout props and how theme CSS is scoped get reused by every later phase. |
| 4. HP pages | Skipped by Cam | Native (used) | Calls listed in the plan for Cam's review. |
| 5. Code pages | Skipped by Cam | Native (used) | Calls listed in the plan for Cam's review. |
| 6. On pages | Skipped by Cam | Native (used) | Calls listed in the plan for Cam's review. |
| 7. Tags, RSS, SEO | No | Native (used) | Calls listed in the plan for Cam's review. |
| 8. QA | No | Native (used) | Calls listed in the plan for Cam's review. |
| 9. Cleanup and launch | No | Native (used) | Deletions, docs and the PR into `main`. |

## Phases and tasks

Sizes: **S** is under 2 hours, **M** is half a day, **L** is a day or more. Task numbers match the plan.

### Phase 1: Tooling and baseline

PR: [#3](https://github.com/sasky/astro/pull/3)

- [x] 1.1 Dev tooling: `astro check`, Vitest, Playwright, link checker (S)
- [x] 1.2 Baseline screenshots of every current route at 1280 and 390 (S)
- [x] 1.3 Housekeeping (S)
  - [x] Commit `design-handoff/`; delete the zip and duplicate prompt
  - [x] Add `qa/` to `.gitignore`

### Phase 2: Content collections, routes and redirects (old look, new URLs)

PR: [#4](https://github.com/sasky/astro/pull/4)

- [x] 2.1 Pure helpers (`format`, `text`, `posts`) with tests first (M)
- [x] 2.2 Move the posts into the `posts` collection (M)
- [x] 2.3 `/code`, `/life` and `/meditations` routes in the old look (M)
- [x] 2.4 Routing config: no trailing slash, `format: 'file'` (S)
- [x] 2.5 `_redirects` and the redirect check script; verified on Netlify's local emulator (S)
- [x] Lowercase kebab-case URL rule, enforced by the schema, a unit test and `check:links` (added in review)

### Phase 3: Foundations

PR: [#5](https://github.com/sasky/astro/pull/5)

- [x] 3.1 Fonts through the Astro Fonts API (S)
- [x] 3.2 Base styles and theme tokens (M)
- [x] 3.3 Layouts and shared chrome: top bar, skip link, footers (M)
- [x] 3.4 404 page (S)

### Phase 4: HP pages (Home and Life)

PR: [#6](https://github.com/sasky/astro/pull/6)

- [x] 4.1 YouTube component (S)
- [x] 4.2 Home: hero, about, section doors, browse by tag (L)
- [x] 4.3 Life listing (M), with `ListingBand` and `PostRow`; the 404 moved onto `ListingBand`
- [x] 4.4 Life post and concert post edits (M)

### Phase 5: Code pages

PR: [#7](https://github.com/sasky/astro/pull/7)

- [x] 5.1 Shiki theme and code blocks (M)
- [x] 5.2 Code listing (S)
- [x] 5.3 Code post, with TOC and Pico-8 panel (L)

### Phase 6: On pages

PR: [#8](https://github.com/sasky/astro/pull/8)

- [x] 6.1 On primitives: bills, rules, manicules, fleurons (M)
- [x] 6.2 `onTips` Sätteri plugin (S)
- [x] 6.3 On listing and post (L)

### Phase 7: Tags, RSS and SEO

PR: [#9](https://github.com/sasky/astro/pull/9)

- [x] 7.1 Tag pages (M)
- [x] 7.2 RSS categories (S)
- [x] 7.3 Meta and titles (S)

### Phase 8: QA

PR: [#10](https://github.com/sasky/astro/pull/10)

- [x] Carry-forwards: Code copy and accessibility polish, On polish, Phase 4 test tightening, Phase 6 and 7 minors
- [x] 8.1 Visual comparison against the designs at 1280 and 390 (M); the sheet awaits Cam's sign-off
- [x] 8.2 Accessibility, adding `@axe-core/playwright` (M)
- [x] 8.3 Performance (S)

### Phase 9: Cleanup and launch

PR: [#11](https://github.com/sasky/astro/pull/11) (cleanup, merged); the launch PR into `main` comes after Cam's review

- [x] 9.1 Remove the old code (S); also kept Code line numbers out of screen readers
- [x] 9.2 Docs (S)
- [ ] 9.3 Launch checklist and the PR into `main` (S)
