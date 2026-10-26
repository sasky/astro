# sasky.nz redesign: roadmap

The tracker for the redesign. The detail lives in [`redesign-plan.md`](redesign-plan.md) (the "plan"); this file lists the phases and tasks, what's done, and how each phase gets run.

- **Branches:** each phase is built on `redesign/phase-N-<name>` and merged by PR into `feature/redesign`. Phase 9 opens the PR from `feature/redesign` into `main`.
- **Account:** `~/Sasky/` repos use the `sasky` GitHub account (cam@sasky.nz). Check `gh auth status` and `git config user.email` before pushing.
- **Every PR runs:** `npm run build`, `npm run check`, `npm test`, `npm run check:links`, `npm run check:redirects -- --dist` and `npm run test:e2e`.

## Status (26 Oct 2026)

| Phase | State | PR |
|---|---|---|
| 1. Tooling and baseline | Merged into `feature/redesign` | [#3](https://github.com/sasky/astro/pull/3) |
| 2. Collections, routes, redirects | Merged into `feature/redesign` | [#4](https://github.com/sasky/astro/pull/4) |
| 3. Foundations | Merged into `feature/redesign` | [#5](https://github.com/sasky/astro/pull/5) |
| 4. HP pages | Merged into `feature/redesign` | [#6](https://github.com/sasky/astro/pull/6) |
| 5. Code pages | Merged into `feature/redesign` | [#7](https://github.com/sasky/astro/pull/7) |
| 6. On pages | PR open for Cam's review | _PR link_ |
| 7–9 | Not started | — |

**Waiting on Cam**
- **Content review**, any time before Phase 9 (the posts are now in `src/content/posts/`):
  - Pick tags for every post. The current ones are interim (Q1), and Classy has none.
  - NZ Music's computed excerpt is its link-only first paragraph ("Waiata 100. what is Atearoa's favourite song"). Set `excerpt:` in its frontmatter for the On listing if you want something else.
  - Copy slips: "Atearoa" (NZ Music), "indented audience" (Silverstripe), the "Scott J Mason (2014" embed title missing its `)`.
  - Optional: title-case the Moment post's title (Q5).
  - Refine the draft section intros in `src/data/sections.ts` (marked `TODO(Cam)`).

**Carried forward**
- **Phase 4–6 review (Cam):** these phases skipped the brainstorm ("just do your best, we will do a detailed review later"). The calls a brainstorm would have settled are listed under "Calls made in place of a brainstorm" in [`plans/2026-10-26-phase-4-hp-pages.md`](superpowers/plans/2026-10-26-phase-4-hp-pages.md), [`plans/2026-10-26-phase-5-code-pages.md`](superpowers/plans/2026-10-26-phase-5-code-pages.md) and [`plans/2026-10-26-phase-6-on-pages.md`](superpowers/plans/2026-10-26-phase-6-on-pages.md). Review them with the pages.
- **Phase 7:** `/code/` (trailing slash) is served as a duplicate of `/code`. Canonical URLs cover it. The RSS feed also lacks an `atom:link rel="self"` (a validator warning).
- **Phase 9:** check the redirects on a real Netlify preview of the PR into `main`. So far they're verified only on Netlify's local emulator.
- **Phase 8 (test tightening, from the Phase 4 review):**
  - Make the modifier-click video test assert that the default action ran, and add a Shift case.
  - At 390 the hero `srcset` should pick the 480w file.
  - Add `expectOnlyThemeCss` on the Life post.
- **Phase 7:**
  - `tags/[tag].astro` is still legacy. Rebuild it on `HpLayout` with `ListingBand` (`variant="message"` suits `#tag`) and `PostRow chip`.
- **Phase 8:**
  - Check the Fraunces SOFT/WONK defaults against the design in the visual comparison.
  - Test the Pico-8 touch controls on a real phone (spec 6.3). The e2e tests only cover sizing at 390 and 2560×1440.
    - At 390×664 the started canvas can sit partly under the d-pad, depending on scroll position.
    - Consider scrolling `#p8_frame_0` to the top when a touch device starts the game.
  - **Code copy-button polish (from the Phase 5 review):**
    - fall back to selecting the code when the Clipboard API is missing or refuses;
    - clear the reset timer on repeat clicks;
    - hide the buttons without JS;
    - give each button its block's caption as a description.
  - **Small Code accessibility items:**
    - `aria-hidden` on the decorative `#`, `>` and `<!-- -->` prefixes in descriptions;
    - a `max-height` with scrolling on the sticky TOC;
    - no empty "More in Code" nav when the section has one post.
- **Phase 8 (from the Phase 6 review):**
  - G1 `##` headings are flex rows, so inline markup (`## The *real* point`) would come apart. Wrap the text in a span (`onTips` could do it) before a heading needs emphasis.
  - `## 0. Foo` renders an empty numeral, because `toRoman(0)` is `""`. Require `n >= 1` in `onTips`.
  - At 320, "Happiness" splits in the listing's 24px programme title. Size it like the post title (`cqi`).
  - Duplication: `.on-wrap`, `.presents` and the `rgba(35, 23, 14, .07/.14)` hover fills repeat across the On pages and components.
- **Phase 9:** delete `src/components/legacy/` and `src/layouts/legacy/` once the tag pages are off them (the On pages moved in Phase 6). `LegacyPost` and `LegacyPostList` are now used only by `tags/[tag].astro`; `LegacyPost` still imports `Pico8`, harmlessly.
- **Minor:**
  - Same-date ties are only pinned through `sortNewest`.
  - There's no lasting test that Fraunces keeps its `opsz` axis.
  - `HpFooter` finds RSS by its label.
  - Legacy pages import `LegacyBaseLayout` under the local name `BaseLayout`.

## Resuming in a fresh session

Read this file first, then [`redesign-plan.md`](redesign-plan.md) (the spec), then the design files in `design-handoff/`. The plans and designs for finished phases are in `docs/superpowers/plans/` and `docs/superpowers/specs/`. They're useful as examples of the format.

**Where things stand**
- **Branch:** `feature/redesign` holds Phases 1–5, merged; Phase 6 is on `redesign/phase-6-on-pages` until its PR merges. `main` is still the live old site.
- **Live pages:**
  - **On the new HP theme:** Home, `/life`, `/life/[slug]` and the 404.
  - **On the new Code theme:** `/code` and `/code/[slug]`.
  - **On the new On theme:** `/meditations` and `/meditations/[slug]`.
  - **Still legacy:** `/tags/[tag]`, through `src/components/legacy/` and `src/layouts/legacy/LegacyBaseLayout.astro`.
- **Components:**
  - `src/components/site/` holds the shared chrome.
  - `src/components/hp/` holds the HP page parts: `Hero`, `AboutSection`, `SectionDoors`/`Door` with the three previews, `TagSelector`, `ListingBand`, `PostRow`, `PostHeader` and `HpPrevNext`.
  - `src/components/code/` holds the Code page parts: `Prompt`, `CodeListEntry`, `CodePostHeader`, `Toc`, `CodePrevNext`, and `CodeBlock`, the `pre` override that only the Code post template passes.
  - `src/components/on/` holds the On page parts: `Bill`, `DoubleRule`, `DiamondRule`, `NowShowing`, `Eye`, `OnCorrespondence`, `Programme`, `OnPostHeader` and `FurtherMeditations`.
  - `src/components/mdx/` holds the theme-neutral MDX components, `YouTube`, `ImageCollection` and `Ornament`. A unit test keeps hard-coded colours out of this folder.
  - `src/components/Pico8.astro` is the game panel.
- **Markdown:** `markdown.processor: satteri({ hastPlugins: [onTips] })`; `src/markdown/on-tips.ts` turns `## N. Tip` in On posts into `h2.tip` with a Roman `span.num`.
- **Highlighting:** `src/shiki/sasky-terminal.json` plus the `metaToData` transformer (fence `title="…"` → `data-title`; drops the newlines between lines), set in `markdown.shikiConfig`.
- **Client JS:** `src/scripts/video-card.ts`, `tag-selector.ts` and `copy-code.ts`.
- **Content:**
  - Posts are in the `posts` collection (`src/content/posts/`), read through `getPosts()` in `src/lib/get-posts.ts`.
  - The pure helpers are in `src/lib/` (`format`, `text`, `posts`, `paths`, `slug`).
  - Copy and data are in `src/data/` (`sections`, `home`, `social`).

**Next: Phase 7 (Tags, RSS and SEO)**
- **Spec:** 5.11, 5.12, 5.16 and tasks 7.1–7.3.
- **Tag pages:** rebuild `tags/[tag].astro` on `HpLayout` with `ListingBand` (`variant="message"` suits `#tag`) and `PostRow chip`. That retires the last legacy page, and `phase2.spec.ts`'s "tag page lists posts across sections" (which reads legacy `main li a`) moves with it.
- **RSS:** categories (section label plus tags), `atom:link rel="self"`.
- **SEO:** check titles and descriptions on every page type; `/code/` duplicate is covered by canonicals.

**How Cam likes to work**
- **Each phase:**
  - No brainstorm Q&A. Cam prefers a plan written straight from the spec, with the calls a brainstorm would have settled listed in it for later review.
  - Then native execution, with one fresh reviewer at the end.
  - Then a PR into `feature/redesign`, which Cam merges.
- **Review:** in-between states are reviewed as code only; no browser review needed.
- **Redirects** are verified locally with Netlify's emulator, not on deploy previews.
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
| 7. Tags, RSS, SEO | No | Native | Specified in full in the plan. |
| 8. QA | No | Native | Checklist-driven. |
| 9. Cleanup and launch | No | Native | Deletions, docs and the PR into `main`. |

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

PR: _none yet_

- [x] 6.1 On primitives: bills, rules, manicules, fleurons (M)
- [x] 6.2 `onTips` Sätteri plugin (S)
- [x] 6.3 On listing and post (L)

### Phase 7: Tags, RSS and SEO

PR: _none yet_

- [ ] 7.1 Tag pages (M)
- [ ] 7.2 RSS categories (S)
- [ ] 7.3 Meta and titles (S)

### Phase 8: QA

PR: _none yet_

- [ ] 8.1 Visual comparison against the designs at 1280 and 390 (M)
- [ ] 8.2 Accessibility, adding `@axe-core/playwright` (M)
- [ ] 8.3 Performance (S)

### Phase 9: Cleanup and launch

PR: _none yet_

- [ ] 9.1 Remove the old code (S)
- [ ] 9.2 Docs (S)
- [ ] 9.3 Launch checklist and the PR into `main` (S)
