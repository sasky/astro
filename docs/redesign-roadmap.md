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
| 4. HP pages | Built on `redesign/phase-4-hp-pages`, PR open for Cam | _PR link below_ |
| 5–9 | Not started | — |

**Waiting on Cam**
- **Content review**, any time before Phase 9 (the posts are now in `src/content/posts/`):
  - Pick tags for every post. The current ones are interim (Q1), and Classy has none.
  - NZ Music's computed excerpt is its link-only first paragraph ("Waiata 100. what is Atearoa's favourite song"). Set `excerpt:` in its frontmatter for the On listing if you want something else.
  - Copy slips: "Atearoa" (NZ Music), "indented audience" (Silverstripe), the "Scott J Mason (2014" embed title missing its `)`.
  - Optional: title-case the Moment post's title (Q5).
  - Refine the draft section intros in `src/data/sections.ts` (marked `TODO(Cam)`).

**Carried forward**
- **Phase 4 review (Cam):** Phase 4 skipped the brainstorm ("just do your best, we will do a detailed review later"). The calls it would have settled are listed under "Calls made in place of a brainstorm" in [`plans/2026-10-26-phase-4-hp-pages.md`](superpowers/plans/2026-10-26-phase-4-hp-pages.md). Review those with the pages.
- **Phase 6:** `excerpt()` doesn't yet skip list, blockquote or MDX-comment blocks, or strip backticks. Fix before an On post opens with a quote or list.
- **Phase 7:** `/code/` (trailing slash) is served as a duplicate of `/code`. Canonical URLs cover it. The RSS feed also lacks an `atom:link rel="self"` (a validator warning).
- **Phase 9:** check the redirects on a real Netlify preview of the PR into `main`. So far they're verified only on Netlify's local emulator.
- **Phase 5:**
  - Repeat the lasting chrome checks on the first Code page: top-bar geometry, tab order, inert texture and no theme leakage.
  - Re-pin the reduced-motion test for the cursor; it was deleted with the Phase 3 demo pages.
  - Gate the Code listing's prompt cursor under `prefers-reduced-motion` the same way.
- **Phase 6:**
  - Repeat the lasting chrome checks on the first On page.
  - Set the On `--vid-*` tokens in `on.css` (G2). `YouTube.astro` falls back to HP colours until then, which is what the legacy NZ Music page shows now.
  - The On door on Home already uses `Manicule`; reuse it on the On pages.
  - Add `--vid-grain` and `--vid-play-shadow` tokens so the G2 card can drop the grid grain.
  - Until then, legacy NZ Music cards sit flush against the next paragraph: `post.css` still targets `lite-youtube`, and open-props zeroes figure margins.
  - `home.spec.ts` "doors show computed counts" reads the newest On title from the legacy `/meditations` list (`main li a`). Update the selector, or read it from `/rss.xml`.
- **Phase 8 (test tightening, from the Phase 4 review):**
  - Make the modifier-click video test assert that the default action ran, and add a Shift case.
  - At 390 the hero `srcset` should pick the 480w file.
  - Add `expectOnlyThemeCss` on the Life post.
- **Phase 7:**
  - `tags/[tag].astro` is still legacy. Rebuild it on `HpLayout` with `ListingBand` (`variant="message"` suits `#tag`) and `PostRow chip`.
  - Legacy Code and On post headers link to `/#code-…` anchors that the new Home doesn't have. They land at the top of Home until Phases 5 and 6 replace those headers.
  - `OnLayout` always renders `<OnFooter placement="after">`. The On listing needs `placement="inside"`, so add a footer prop or slot.
  - The On wordmark mark lacks the design's `margin: 0 1px`. Add a `--mark-margin` token.
- **Phase 8:** check the Fraunces SOFT/WONK defaults against the design in the visual comparison.
- **Minor:**
  - Same-date ties are only pinned through `sortNewest`.
  - There's no lasting test that Fraunces keeps its `opsz` axis.
  - `HpFooter` finds RSS by its label.
  - Legacy pages import `LegacyBaseLayout` under the local name `BaseLayout`.

## Resuming in a fresh session

Read this file first, then [`redesign-plan.md`](redesign-plan.md) (the spec), then the design files in `design-handoff/`. The plans and designs for finished phases are in `docs/superpowers/plans/` and `docs/superpowers/specs/`. They're useful as examples of the format.

**Where things stand**
- **Branch:** `feature/redesign` holds Phases 1–3, merged; Phase 4 is on `redesign/phase-4-hp-pages` until its PR merges. `main` is still the live old site.
- **Live pages:**
  - **On the new HP theme:** Home, `/life`, `/life/[slug]` and the 404.
  - **Still legacy:** Code, On and `/tags/[tag]`, through `src/components/legacy/` and `src/layouts/legacy/LegacyBaseLayout.astro`.
- **Components:**
  - `src/components/site/` holds the shared chrome.
  - `src/components/hp/` holds the HP page parts: `Hero`, `AboutSection`, `SectionDoors`/`Door` with the three previews, `TagSelector`, `ListingBand`, `PostRow`, `PostHeader` and `HpPrevNext`.
  - `src/components/mdx/YouTube.astro` is the click-to-load video card, used by any post.
- **Client JS:** `src/scripts/video-card.ts` and `src/scripts/tag-selector.ts`.
- **Content:**
  - Posts are in the `posts` collection (`src/content/posts/`), read through `getPosts()` in `src/lib/get-posts.ts`.
  - The pure helpers are in `src/lib/` (`format`, `text`, `posts`, `paths`, `slug`).
  - Copy and data are in `src/data/` (`sections`, `home`, `social`).

**Next: Phase 5 (Code pages)**
- **Brainstorm (light):** spec 6.3, `Site-Code-List.dc.html` and `Site-Code-Post.dc.html`. Cover the code-block caption bar, the Pico-8 panel (G4) and the image grid (G3).
- **Reuse from Phase 4:**
  - `Dymo` takes a `class` prop. A parent sizes it with `.parent :global(.that-class)`, because attribute-scoped CSS doesn't reach a child component's root.
  - `expectOnlyThemeCss()` in `tests/e2e/helpers/chrome.ts` checks a page's theme isolation.

**How Cam likes to work**
- **Each phase:** a brainstorm only when there are open design choices, then a plan, then native execution with one fresh reviewer at the end. Then a PR into `feature/redesign`, which Cam merges.
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
- **Astro's `<Image>` defaults to `decoding="async"`,** so a screenshot taken straight after `goto` can miss the hero photo. Wait before capturing.

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
| 5. Code pages | Light | Subagent-driven | Code-block caption bar, Pico-8 panel (G4), image grid (G3). |
| 6. On pages | Yes | Subagent-driven | `onTips` plugin, prose for posts without tips (G1), On video cards (G2). |
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

PR: _none yet_

- [x] 4.1 YouTube component (S)
- [x] 4.2 Home: hero, about, section doors, browse by tag (L)
- [x] 4.3 Life listing (M), with `ListingBand` and `PostRow`; the 404 moved onto `ListingBand`
- [x] 4.4 Life post and concert post edits (M)

### Phase 5: Code pages

PR: _none yet_

- [ ] 5.1 Shiki theme and code blocks (M)
- [ ] 5.2 Code listing (S)
- [ ] 5.3 Code post, with TOC and Pico-8 panel (L)

### Phase 6: On pages

PR: _none yet_

- [ ] 6.1 On primitives: bills, rules, manicules, fleurons (M)
- [ ] 6.2 `onTips` Sätteri plugin (S)
- [ ] 6.3 On listing and post (L)

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
