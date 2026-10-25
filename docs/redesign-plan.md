# sasky.nz redesign: implementation plan

> **Status:** draft for Cam's review (25 Oct 2026). Nothing outside this file has been changed. No packages have been installed.
> **Inputs:** `design-handoff/PROMPT.md`, `README.md`, `DECISIONS.md`, the eight `design/*.dc.html` files, and the repo at `9f8f20b` on `feature/redesign`.

## Summary

The build has three moves, each shipped as its own reviewable PR into `feature/redesign`, with a final PR from there into `main`.

1. **Restructure without restyling.** Move the posts into one `posts` content collection, add the `/code`, `/life` and `/meditations` routes, the Netlify 301s, and RSS and tags built from the collection. The site keeps its old look but serves the new URLs. That makes the risky URL work reviewable on its own.
2. **Lay the foundations.** Self-hosted fonts through Astro 7's built-in Fonts API, one shared base stylesheet, one CSS file per theme, a `BaseLayout` with a layout per theme, and the shared top bar and three footers.
3. **Build the templates theme by theme:** HP (Home, Life listing, Life post), then Code, then On. After that come tags, RSS and SEO polish, a QA pass at 1280px and 390px, and cleanup.

Two findings in the repo change how the brief assumed things would work (details under "Corrections to the brief"):

- **Astro 7's Markdown/MDX pipeline is Sätteri, not remark/rehype.** The On tip numerals use a Sätteri hast plugin, not a rehype plugin. Code-block chrome uses a Shiki transformer plus a `pre` component override.
- **Astro 7 has a stable Fonts API** (`fonts` in `astro.config.mjs` and `<Font />`). It downloads fonts at build time and self-hosts them, so we don't need Fontsource packages or hand-written `@font-face`.

## Open questions for Cam

**All answered (Cam, 26 Oct).** Q5 and Q6 are decided as marked below. Q1–Q4, Q7 and G1–G8 are accepted as recommended.

| # | Question | Recommendation |
|---|---|---|
| 1 | **The `life` tag** clashes with the Life section. It's on Hide n Seek, the concert post and all four On posts. | **Drop it.** The section now carries that meaning. Give Hide n Seek `family`. Cam picks new tags for the On and Life posts (suggestions: `music` for the concert and NZ music posts, `philosophy` for Happiness and the Moment). Templates hide "Filed under" and tag rows when a post has no tags. |
| 2 | **Work history and past project highlights** from `about.mdx` have no place in the design. | **Leave them out at launch.** The copy stays in git history, and `todo.md` already plans a work-history page. The `/about` 301 goes to `/#about`. |
| 3 | **Hobbies:** `about.mdx` lists 24, the design shows 17. It leaves out sourdough, swimming, running, bike riding, DJing, kombucha and meditation. | **Show all 24.** `about.mdx` is the source of truth, and the Dymo colour rhythm works at any count. Fix the typos on the way ("mediation" → "meditation", "Sour dough" → "sourdough", "dJing" → "DJing"). |
| 4 | **Tag link destinations** | **Keep `/tags/[tag]` pages.** Render them in the HP theme, reusing the Life listing row plus the section chip from the tag selector. They work without JS, links can be shared, and the old `/tags/*` URLs keep working with no redirects. Drop the `/tags` index and 301 it to `/#tags`. The alternative is to link to `/?tag=x#tags`. That needs JS to pre-select the tag, and without JS it shows the wrong tag. (This doesn't conflict with "a tag becomes a section once it has a landing page": these are generated lists, not landing pages with intro copy.) |
| 5 | **`on-being-in-the-moment-vs-past-and-future`**: is it On, and should the slug be shorter? | **Decided (Cam, 26 Oct): it's On, and the slug stays long:** `/meditations/on-being-in-the-moment-vs-past-and-future`. It becomes the headliner, "Meditation the Fourth", and the counts read "4 meditations". Consider title case too ("On Being in the Moment vs Past and Future"): the tag selector and Home set titles in Fraunces, where the lowercase shows. |
| 6 | **Section intro copy** (`[Intro copy…]` on Code, Life and On) | **Decided (Cam, 26 Oct): ship first-draft copy** (in 5.6), to be refined later. `intro` stays optional in `src/data/sections.ts` with a `// TODO(Cam): refine` marker, and the paragraph doesn't render when it's empty. |
| 7 | **View transitions** (`<ClientRouter />`) | **Drop it.** Every theme change swaps all the CSS and fonts, Pico-8 needs a full reload anyway, and keeping it means re-running every script on `astro:page-load`. Optionally add the no-JS cross-document fade with `@view-transition { navigation: auto; }` in `base.css` (it only applies in browsers that support it). |

**Design gaps.** The plan fills these with a proposal. A quick yes or no from Cam is enough.

- **G1. On posts without numbered tips.** Happiness, NZ Music and the Moment use plain `##` and `###` headings and paragraphs. Proposal: `##` in Rye, uppercase, 30px, centred between thin rules; `###` in Oswald 700, uppercase, 22px; body in Oswald 20px/1.6, left-aligned in the same 720px column as the tips; drop cap on the first paragraph.
- **G2. YouTube in the On theme** (the NZ Music post has 9 embeds). Proposal: the same video-card component with On tokens: ink frame, `6px 6px 0` ink shadow that turns rust on hover, ink play button with a kraft triangle, and a kraft "Video · YouTube" label in Oswald.
- **G3. Images in Code posts.** Hide n Seek has 9 comics in `ImageCollection`. Proposal: a 3-column grid on desktop (2 at 390px) inside the article column, each image in a `1px dashed #24382d` frame. No 100vw breakout, which would collide with the TOC.
- **G4. Where the Pico-8 game sits.** Proposal: a full-width (1120px) "terminal window" panel between the post header and the body/TOC grid. Caption bar `── hidenseek.p8` with the controls hint. The canvas is square, sized `min(80vh, 100%, 800px)`. That fixes the "large monitor" todo, because the game now scales with viewport height.
- **G5. Code TOC labels.** The design hand-shortens them ("### 1 · install locally"). Proposal: use the real heading text, clamped to two lines. This is an intentional difference.
- **G6. The programme line on the On listing.** The design sets a short description in bold uppercase (Classy) and a long one as the first sentence in sentence case (NZ Music). Proposal: show `firstSentence(description)`. Use the uppercase style when it's 60 characters or fewer, and the sentence-case style otherwise.
- **G7. Empty prev/next.**
  - **Code:** "older" card, then the right-hand card shows the newer post. If there's nothing newer, it shows "All Code posts · # newest post, nothing newer yet", as in the design.
  - **Life:** show the "older" card only when there is one. "All Life posts" always shows. Today Life has only one post, so only that card shows.
  - **On:** show only the cards that exist, centred.
- **G8. On manicules and ornaments.** ☞ ☜ ✥ aren't in Oswald or Holtwood, so they fall back to system fonts, and some Android and Windows setups render them as emoji or tofu. Proposal: tiny inline SVGs (`Manicule.astro`, `Fleuron.astro`) shaped like the glyphs, `aria-hidden`.

## Corrections to the brief (verified in the repo)

- **Versions:** Astro is **7.3.4**, `@astrojs/mdx` 8.0.2, `@astrojs/rss` 4.0.19 and `astro-embed-youtube` 0.5.10. Markdown and MDX go through **Sätteri** (`@astrojs/markdown-satteri`). The remark/rehype options are deprecated and only work with `unified()` from `@astrojs/markdown-remark`, which isn't installed. Sätteri plugins are `{ name, <nodeType>(node, ctx) }` objects with access to `ctx.fileURL` and `ctx.data`.
- **Fonts:** `fonts` is a stable top-level config, available since Astro 6. It comes with `fontProviders.{fontsource, google, local, …}` and a `<Font />` component.
- **Collections:** collections are defined in `src/content.config.ts` with `glob()` from `astro/loaders`. Import `z` from `astro/zod`, because `astro:schema` is deprecated. `src/components/Header.astro` imports `any` from `astro:schema` and never uses it.
- **About leaks into listings:** `index.astro` and `rss.xml.js` glob every `.mdx` in `src/pages`, so **`about.mdx` appears as a post** on Home and in the RSS feed today.
- **Content bugs:**
  - `hide-n-seek-game.mdx` has a stray `export const tags = ["pico8","learning"]` that contradicts its frontmatter.
  - `on-new-zealand-music.mdx` passes `Title=` (capital T) on three `<YouTube>` embeds, so those titles are lost.
  - Several posts import `Picture` or `YouTube` without using them.
- **Code fences:** Silverstripe's fences have no language except the PHP one, so they need languages and titles for the new captions.
- **Unused images:** five `src/images/Screenshot 2024-03-02 …png` files aren't referenced anywhere.
- **No tooling:** there's no test, type-check or lint setup (no `@astrojs/check`, `typescript`, Vitest or Playwright).
- **Branch:** the working branch is `feature/redesign`, not `redesign`. The plan uses `feature/redesign` as the integration branch.

## Global constraints

These apply to every task.

- **Stack:** Astro 7.x APIs only (collections in `src/content.config.ts`, `z` from `astro/zod`, the Fonts API, Sätteri plugins). No UI framework. Client JS is small vanilla `<script>` modules only.
- **Design values:** the `.dc.html` files are the source of truth for every value. Convert inline styles to scoped CSS and custom properties; never paste them. Design-time "tweaks" become fixed custom properties.
- **Computed values:** counts, "since" dates, latest posts, ordinals, numerals, reading time, tag counts and the © year (and MMXXVI) are all computed from content, never hard-coded.
- **Dates:** frontmatter dates are date-only. Format them with UTC getters, or `timeZone: 'UTC'`, so the day never shifts with the build machine's time zone.
- **Theme loading:** each page loads only its own theme's CSS and fonts. The one exception is Home, whose Sections doors need small Code and On previews (JetBrains Mono 800, Holtwood One SC and Oswald 600, none of them preloaded).
- **Accessibility:**
  - touch targets at least 44px
  - visible `:focus-visible`
  - `aria-current="page"` on the current listing, `aria-current="true"` on the section link from a post (as in the designs)
  - `prefers-reduced-motion` turns off blinking cursors, hover lifts and transitions
- **Placeholders:** never ship placeholder rows or `[bracketed]` copy.

## Review focus

These are the edge cases most likely to break, and the task that tests each one.

1. **A section with one post** (Life today) or a post with no neighbours renders no broken prev/next cards (G7). Tests: Task 2.1 `neighbours()`; visual checks in 4.4 and 6.3.
2. **A post with zero tags** (likely after Q1) hides its tag row and "Filed under", and the tag index skips it cleanly. Tests: Task 2.1 `buildTagIndex()`; checks in 4.4 and 6.3.
3. **Date-only frontmatter** formats the same day in any time zone. Test: Task 2.1 runs the formatters under `TZ=America/Los_Angeles` and `TZ=Pacific/Auckland`.
4. **Old URLs with a trailing slash, odd casing or `/tags/x`** all land on the right page. Test: Task 2.5 redirect script; repeated on the deploy preview in 9.3.
5. **No JS:**
   - The tag selector still shows a useful list.
   - Video cards still link to YouTube.
   - Code is still readable without the copy buttons.

   Check: Task 8.2 runs Playwright with JavaScript disabled.

---

## Inventory

| Path | Today | Fate |
|---|---|---|
| `src/pages/*.mdx` (7 posts) | Flat MDX pages using `MarkdownPostLayout` | Move to `src/content/posts/<slug>.mdx` (Task 2.2) |
| `src/pages/about.mdx` | About page, also listed as a post by mistake | Content goes into `src/data/home.ts`, then the file is deleted. `/about` → `/#about` |
| `src/pages/index.astro` | Lists every page glob | Rewritten as the HP Home |
| `src/pages/tags.astro`, `tags/[tag].astro` | Unstyled lists | `tags.astro` removed, `/tags` → `/#tags`; `[tag].astro` rebuilt in HP (Q4) |
| `src/pages/rss.xml.js` | `pagesGlobToRssItems` | Rewritten as `rss.xml.ts` from the collection |
| `src/layouts/BaseLayout.astro`, `MarkdownPostLayout.astro` | Old shell, `ClientRouter`, `global.css` | Replaced by the new `BaseLayout` and `HpLayout`, `CodeLayout`, `OnLayout`; old ones deleted in Phase 9 |
| `src/components/Header.astro`, `Hamburger.astro`, `Footer.astro`, `Social.astro` | Old chrome | Deleted (Phase 9) |
| `src/components/ImageCollection.astro` | 100vw breakout flex wrap | Restyled as an in-column grid (G3) |
| `src/components/Pico8.astro`, `public/pico8/*` | Pico-8 export, global IDs | Kept; frame restyled for Code (G4) |
| `src/scripts/utils.js` | `toAnchor` and `endsWithDash` for the old menu | Deleted |
| `src/styles/**` (global, theme, components, fonts, Hack and IBM Plex files, demo HTML) | Old look plus `open-props` | Deleted in Phase 9 |
| `src/images/*.jpg` (10) | Post images | Kept (aliased imports) |
| `src/images/Screenshot …png` (5) | Unreferenced | Deleted |
| `@astro-community/astro-embed-youtube`, `open-props` | Dependencies | Removed (see 5.15 and 5.5) |
| `design-handoff/` | Untracked reference | Committed for reference (outside `src/` and `public/`, so never built) |
| `sasky-redesign-handoff.zip`, `sasky-redesign-PROMPT.md` (repo root) | Untracked duplicates of `design-handoff/` | Delete after Cam confirms |
| `design/` (older boards) | Untracked | Cam's call; the plan doesn't touch it |

---

# Part 1: Code and content changes

### 5.1 Content model

**Recommendation: one `posts` collection with a `section` field.** Home doors, the tag selector, tag pages and RSS all query across sections. One schema keeps the frontmatter identical, and per-section queries are a single `filter`. Separate collections would mean three identical schemas plus merging them in four places.

- **Location:** `src/content/posts/<slug>.mdx`, kept flat. The filename is the slug, and `section` in frontmatter decides the URL prefix.
- **Schema** (`src/content.config.ts`):

  ```ts
  const posts = defineCollection({
    loader: glob({ pattern: '*.mdx', base: './src/content/posts' }),
    schema: ({ image }) => z.object({
      title: z.string(),
      description: z.string(),
      metaDescription: z.string().optional(),   // falls back to description
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      section: z.enum(['code', 'life', 'on']),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),        // excluded from prod builds
      pico8: z.string().optional(),             // cart name in public/pico8/
      image: z.object({ src: image(), alt: z.string() }).optional(),
      excerpt: z.string().optional(),           // overrides computed On excerpt
    }),
  });
  ```

- **Computed values, not stored:** reading time, prev/next, the On ordinal and programme numerals, counts and "since". See 5.6.
- **MDX imports after the move:** add aliases to `tsconfig.json` under `compilerOptions.paths` (`@components/*` → `src/components/*`, `@images/*` → `src/images/*`, `@assets/*` → `src/assets/*`). Every moved post imports through an alias (`import monkey from '@images/wheres_monkey.jpg'`, `import YouTube from '@components/mdx/YouTube.astro'`), so paths never depend on where a file lives.
  - `Picture` still comes from `astro:assets`.
  - `pico8` stays frontmatter-driven and is rendered by the Code post template, not the MDX file.
- **Remove from every post:** `layout:`, unused imports, and Hide n Seek's `export const tags`.

### 5.2 Section assignment and URLs (confirm)

| Current file | New file | Section | New URL |
|---|---|---|---|
| `silverstripe-app-platform.mdx` | `silverstripe-app-platform.mdx` | code | `/code/silverstripe-app-platform` |
| `hide-n-seek-game.mdx` | `hide-n-seek-game.mdx` | code | `/code/hide-n-seek-game` |
| `top-concertvids.mdx` | `top-concertvids.mdx` | life | `/life/top-concertvids` |
| `on-happiness.mdx` | `on-happiness.mdx` | on | `/meditations/on-happiness` |
| `top_ten_tips_on_class.mdx` | `on-being-classy.mdx` | on | `/meditations/on-being-classy` |
| `on-new-zealand-music.mdx` | `on-new-zealand-music.mdx` | on | `/meditations/on-new-zealand-music` |
| `on-being-in-the-moment-vs-past-and-future.mdx` | `on-being-in-the-moment-vs-past-and-future.mdx` | on | `/meditations/on-being-in-the-moment-vs-past-and-future` |
| `about.mdx` | (deleted; copy in `src/data/home.ts`) | none | `/about` → `/#about` |

The resulting counts are: Code 2 (since January 2024), Life 1 (since May 2024), On 4 (since June 2026). The On ordinals by date are: NZ Music I (First), Classy II, Happiness III, Moment IV (headliner).

### 5.3 Routing

| Route | File | Theme |
|---|---|---|
| `/` | `src/pages/index.astro` | HP |
| `/code`, `/code/[slug]` | `src/pages/code/index.astro`, `code/[slug].astro` | Code |
| `/life`, `/life/[slug]` | `src/pages/life/index.astro`, `life/[slug].astro` | HP |
| `/meditations`, `/meditations/[slug]` | `src/pages/meditations/index.astro`, `meditations/[slug].astro` | On |
| `/tags/[tag]` | `src/pages/tags/[tag].astro` (Q4) | HP |
| `/rss.xml` | `src/pages/rss.xml.ts` | none |
| 404 | `src/pages/404.astro` | HP |

- Each `[slug].astro` uses `getStaticPaths()` over `getPosts(section)`, with `params: { slug: post.id }`.
- **On lives at `/meditations`** (Cam, 26 Oct; this overrides the `/on` routes in `design-handoff/README.md`). It's short for "Pseudo Philosophy Meditations". The section key, theme name and `data-theme` stay `on`, and the nav label and post titles keep "On". Only the URL segment differs, so every link goes through `SECTIONS[s].path` or `postUrl()`, never a hand-built `/${section}`. The top bar marks the On link as current on any path starting with `/meditations`.
- **Config:** `trailingSlash: 'never'` and `build: { format: 'file' }`. That emits `code.html` and `code/hide-n-seek-game.html`, which Netlify serves at `/code` and `/code/hide-n-seek-game`. Canonical URLs, internal links, RSS links and redirect targets all use the no-slash form. Netlify's handling of `/x/` with `format: 'file'` gets verified on the first deploy preview (Task 2.5); if it misbehaves, the fallback is `format: 'directory'` plus `trailingSlash: 'always'` everywhere.

### 5.4 Redirects

`public/_redirects` (Netlify), with one rule per old path. The posts move out of `dist`, so the old paths 404 without them and no `!` force is needed.

```
/about                                      /#about                                 301
/silverstripe-app-platform                  /code/silverstripe-app-platform         301
/hide-n-seek-game                           /code/hide-n-seek-game                  301
/top-concertvids                            /life/top-concertvids                   301
/on-happiness                               /meditations/on-happiness               301
/top_ten_tips_on_class                      /meditations/on-being-classy            301
/on-new-zealand-music                       /meditations/on-new-zealand-music       301
/on-being-in-the-moment-vs-past-and-future  /meditations/on-being-in-the-moment-vs-past-and-future  301
/tags                                       /#tags                                  301
```

- `/tags/*` needs no rule if Q4 keeps the tag pages. If the answer is "home selector", add `/tags/:tag  /?tag=:tag#tags  301`.
- **Trailing slashes:** Netlify matches redirect rules with or without a trailing slash, and the script checks both forms anyway.
- **Hash fragments:** confirm on the deploy preview that the `#about` and `#tags` targets survive. If they don't, move those two rules to `netlify.toml`.
- **Proof:** `scripts/check-redirects.mjs` holds the old-path → new-path table and has two modes.
  1. **`--dist`** (runs in CI after build): asserts every target exists as a file in `dist/` and no old path does.
  2. **`--url <deploy-preview>`:** sends `fetch(…, { redirect: 'manual' })` for each old path, with and without a trailing slash, and asserts a `301` and the right `Location`, then follows it and asserts a `200`.

### 5.5 Theme architecture

- **How a page gets its theme:** `<html data-theme="hp|code|on">`, set by `BaseLayout` from a `theme` prop that each theme layout passes.
- **CSS files:**
  - `src/styles/base.css`: a modern reset, `.sr-only`, the skip link, `:focus-visible` defaults, shared geometry tokens, reduced-motion rules and `@view-transition` (Q7).
    - Geometry tokens: `--bar-h: 66px`, `--wrap: 1120px`, `--gutter: 24px` (16px under 480), `--rule: 2px`.
  - `src/styles/themes/hp.css`, `code.css`, `on.css`: each one's custom properties (colours, font stacks, shadows, texture opacities) plus the prose styles for that theme's post body. Each is imported **only** by its theme layout, so Astro bundles it only into that theme's pages.
- **Breakpoints,** consolidated from 480/720/760/820/900:
  - `480` (top bar tightens)
  - `760` (HP stacks; Code listing and On listing/post go single-column)
  - `900` (Code post drops the TOC)

  Documented as comments in `base.css`, since custom media isn't available.
- **Layout hierarchy:** `BaseLayout.astro` → `HpLayout.astro`, `CodeLayout.astro` and `OnLayout.astro` → page templates in `src/pages/**`.
- **Convert, don't copy:** every design block becomes a component with scoped `<style>`, and repeated values become tokens.
- **Textures:** `Texture.astro` renders the absolute, `pointer-events: none`, `aria-hidden` layers.
  - **HP:** graph grid at opacity .8, or .6 on Life posts, plus grain at `t × .12`.
  - **Code:** `tx-term` at .75, grain at `t × .13`.
  - **On:** `tx-kraft` at .85, grain and fibre at `t × .2`.

  Grain is a small tiled SVG-noise data URI as a background, not a full-page `feTurbulence` SVG, because the posts are up to about 6,900px tall and a full-page filter is expensive to paint.
- **Retire:** `global.css`, `theme.css`, `components.css`, `components/*`, `pages/index.css`, `fonts.css` and the font files. `open-props` is removed too, since nothing in the new design uses it.

### 5.6 Shared components and helpers

**Components** (`src/components/site/`):

| Component | Props | Notes |
|---|---|---|
| `TopBar.astro` | `theme: Theme; current?: Section; isListing?: boolean` | Wordmark (`aria-current="page"` on Home) and nav. `aria-current` is `page` on a listing and `true` on a post. Per-theme mark: HP orange square with blue offset; Code blinking cursor; On ink diamond. |
| `SkipLink.astro` | none | Targets `#main`. |
| `HpFooter.astro` | none | Wordmark, `© {year} Cameron Grant`, Mastodon, LinkedIn, GitHub, RSS (orange Dymo). |
| `CodeFooter.astro` | none | `-- NORMAL --`, lowercase links, amber `rss`, ©. |
| `OnFooter.astro` | `placement: 'inside' \| 'after'` | "Correspondence welcomed by way of …" plus the colophon with `© {toRoman(year)}`. On the listing the correspondence row sits inside the bill, per the design. |
| `Texture.astro` | `theme; opacity?` | See 5.5. |
| `Dymo.astro` | `tone: 'navy'\|'blue'\|'orange'; tilt?: number; as?: string` | Shared by HP labels and counts. |
| `SectionChip.astro` | `section` | Code navy, Life blue, On orange; 104px wide. |
| `TagLinks.astro` | `tags: string[]; theme` | HP outlined label, Code `[tag]`, On stamp. Renders nothing when `tags` is empty. |
| `Manicule.astro`, `Fleuron.astro` | `dir?: 'left'\|'right'` | Inline SVG (G8). |

**Data helpers.** These are pure functions, unit tested with Vitest, and take plain arrays so the tests need no Astro runtime.

`src/lib/format.ts`:

```ts
formatDateLong(d: Date): string        // "17 May 2024"          (HP; Code post meta & cards)
formatDateISO(d: Date): string         // "2024-04-01"           (Code listing)
formatDateOn(d: Date): string          // "11th September 2026"
formatDateOnShort(d: Date): string     // "11th Sept. 2026", "20th June 2026" (AP months: Jan. Feb. Aug. Sept. Oct. Nov. Dec.; March–July in full)
formatMonthYear(d: Date): string       // "May 2024"
toRoman(n: number): string             // 4 → "IV", 2026 → "MMXXVI"
ordinalSuffix(n: number): string       // 11 → "11th", 22 → "22nd", 1 → "1st"
ordinalWord(n: number): string         // 4 → "Fourth", 21 → "Twenty-First" (1–99)
plural(n: number, one: string, many?: string): string  // "1 post", "4 meditations"
```

`src/lib/text.ts`:

```ts
readingTime(body: string): number      // minutes; strips import/export lines, JSX tags, code fences; ceil(words / 220), min 1
excerpt(body: string): string          // first prose paragraph: skips imports, headings, JSX, blank lines; strips md emphasis/links
firstSentence(s: string): string
```

`src/lib/posts.ts` (pure core, plus thin `astro:content` wrappers):

```ts
type Section = 'code' | 'life' | 'on'
sortNewest(posts: Post[]): Post[]
neighbours(posts: Post[], id: string): { older?: Post; newer?: Post }   // within the given (section) list
seriesNumber(posts: Post[], id: string): number                         // 1-based by pubDate ascending
sectionStats(posts: Post[]): { count: number; since: Date; latest?: Post }
buildTagIndex(posts: Post[]): { tag: string; count: number; posts: Post[] }[]  // count desc, then name; posts newest first
postUrl(post: Post): string                                             // `/${SECTIONS[section].path}/${id}`
// wrappers
getPosts(section?: Section): Promise<Post[]>    // drafts excluded when import.meta.env.PROD; newest first
```

`src/data/sections.ts` holds `{ code, life, on }`, each with a URL `path` (`code`, `life`, `meditations`), label, blurb, listing title, and an optional `intro` (Q6). The blurbs are taken verbatim from the designs: "Code, hosting & small games", "Music, family & other non-code things", "Satire, humour & philosophy", plus the On subtitle "A Series of Essays Satirical, Humorous & Philosophical!".

First-draft intros (Q6), marked `// TODO(Cam): refine`:

| Section | `intro` | Rendered as |
|---|---|---|
| Code | Notes from the day job and the weekend side projects: hosting, deploying and the odd small game. Mostly written so future me can remember how past me did it. | Wrapped in `<!-- … -->` by the template, not stored in the string |
| Life | Everything that isn't code: music I can't stop playing, family, and whatever else has taken over the weekend. Expect enthusiasm, not expertise. | Plain paragraph |
| On | Pseudo philosophy meditations, in which one takes a small, everyday thing far too seriously and follows it somewhere it probably shouldn't go. Some are satire, some are sincere, and one is not always sure which. | Plain paragraph |

### 5.7 Fonts

Configure them in `astro.config.mjs` with `fonts: [...]` and `fontProviders.fontsource()`. Astro downloads them at build time and serves them from `/_astro/fonts`, so they're self-hosted. Each family uses the `latin` subset, `woff2`, and `font-display: swap`.

| Family | Weights and styles | `cssVariable` | Used by | Preload |
|---|---|---|---|---|
| Fraunces (variable) | `100 900`, normal and italic | `--font-fraunces` | HP | HP: yes |
| Source Sans 3 | 400, 600, 700; italic 400 | `--font-source-sans` | HP | no |
| JetBrains Mono | 400, 500, 700, 800; italic 400 | `--font-jetbrains` | HP labels, Code | Code: yes |
| Holtwood One SC | 400 | `--font-holtwood` | On (+ Home door) | On: yes |
| Alfa Slab One | 400 | `--font-alfa` | On | no |
| Rye | 400 | `--font-rye` | On | no |
| Oswald (variable) | `400 700` | `--font-oswald` | On (+ Home door) | no |

- **Per-layout loading:** each theme layout renders `<Font cssVariable="…" />` only for its own families, so only those `@font-face` rules ship. Home also renders Holtwood, Oswald and JetBrains Mono without preloading them.
- **Fraunces's `opsz` axis:** the design relies on it (it loads Google's `opsz 9..144`). If the provider only returns the `wght` axis, the large headlines will look different. If so, use `fontProviders.local()` with the full-axes Fontsource variable file (Risk R5).
- **Not loaded:** Source Serif 4, which Home's font link loads but nothing uses.
- **Delete:** `src/styles/fonts/*` and `fonts.css`.

### 5.8 Assets

- **Location:** `design-handoff/design/assets/*` → `src/assets/hero/`, keeping `portrait-cutout.webp`, `mask-silhouette.png` and `mask-jacket-stripes.png`.
- **Portrait:** `<Image src={portrait} widths={[480, 760, 1000, 1527]} sizes="(max-width: 760px) 100vw, 60vw" alt="" loading="eager" fetchpriority="high" />` with explicit width and height. The alt text is empty because the photo is decorative: the name label and H1 carry the meaning.
- **Masks:** import both PNGs and pass `url(${mask.src})` into the component's scoped CSS through `define:vars` (`--mask-sil`, `--mask-jacket`). All three layers share one box with `aspect-ratio: 1527 / 1500`.
- **Post images:** the existing images keep working through `@images/*` and `Picture`.

### 5.9 Homepage content

- **Location:** `src/data/home.ts`, a typed data file. The copy is short and structured (lists drive Dymo rhythm and asterisk bullets), so a TS module beats an MDX partial.
- **Hero:**
  - H1: "Hello, welcome to my *little corner* of the internet" (the highlighted run is a separate field).
  - Lede: "Hello, I’m Cameron. International man of leisure".
  - Label: "Cameron Grant · Wellington, Aotearoa".
- **About:**
  - Heading: "Hobbies, past and present include but not limited to…", followed by `hobbies: string[]` (all 24, per Q3).
  - Heading: "I also do web development for a living.", followed by the four statements verbatim from the design.
- **Work history and past project highlights:** not migrated (Q2).

### 5.10 Content edits the designs imply

| Post | Edits |
|---|---|
| All | Add `section`; remove `layout:` and unused imports; switch imports to aliases; apply new `tags` per Q1. |
| `top-concertvids` | 1. "Some people say I'm a dreamer, but I'm not the only one." becomes `> …`.<br>2. Move each of the 5 `<YouTube>` embeds to sit **after** its `##` heading.<br>3. Add `title` and `caption` from the design, e.g. `title="Lorde, Royals, live 2013" caption="Lorde — Royals, live 2013"`.<br>4. "Cam out" becomes `**Cam out**`.<br>5. Wrap the P.S. as `<p class="ps">P.S. check out this <a href="…">vid</a> …</p>` (smaller sans and muted in the design). |
| `on-being-classy` (renamed) | 1. Keep `## 1. …` through `## 10. …` as written; the plugin in 6.4 renders the numerals.<br>2. Tip 5 becomes `## 5. Have at least three go-to jokes <small>(one clean, one dirty, and one long and dirty)</small>`.<br>3. Add `<Ornament />` between tips 5 and 6, as in the design. |
| `on-new-zealand-music` | 1. `Title=` → `title=` (3 embeds).<br>2. Captions are optional (G2). |
| `on-being-in-the-moment-vs-past-and-future` | Section `on`; title case (optional, Q5) and tags per Q1. |
| `silverstripe-app-platform` | 1. Fence languages and titles: ```` ```bash ````; ```` ```dotenv title=".env · database" ````; ```` ```dotenv title=".env · silverstripe" ````; ```` ```dotenv title=".env · mail" ````; ```` ```bash title="build command" ```` (drop the `build command: ` prefix from the code line); ```` ```php title="app/_config.php" ````.<br>2. Wrap "Down that path, there be dragons," in `<mark>` (amber in Code prose).<br>3. "Cam out." becomes `**Cam out.**`. |
| `hide-n-seek-game` | Remove `export const tags`; remove `life` from tags (Q1); aliased imports. |

### 5.11 Tags

- **Home tag selector:**
  - **Data:** `buildTagIndex(getPosts())` at build time.
  - **Default tag:** the first in the index (most posts).
  - **Markup:** all tags' result lists are rendered into the HTML (a few dozen rows at most); only the default list is visible.
  - **Without JS:** chips are `<a href="/tags/{tag}">`. `src/scripts/tag-selector.ts` swaps each one for a `<button aria-pressed>`, shows the matching list, and updates the `aria-live` summary ("5 posts tagged life").
- **Tag links everywhere else:** they go to `/tags/{tag}`, per Q4.
- **Tag page:** HP theme with a Dymo count, H1 `#tag`, then `PostRow` rows with a `SectionChip` added.
- **The `life` clash:** see Q1.

### 5.12 RSS

`src/pages/rss.xml.ts` uses `rss()` over `getPosts()`. Each item has `link: postUrl(p)`, `title`, `description`, `pubDate`, and `categories: [sectionLabel, ...tags]`; the channel gets `customData: '<language>en-nz</language>'`. `about` disappears from the feed.

**Expected side effect:** the item GUIDs (links) change, so subscribers will see every post as new once.

### 5.13 Client-side JS

There are three small `<script>` modules, each bundled only by the components that use it:

1. `tag-selector.ts` (Home)
2. `copy-code.ts` (Code posts): `navigator.clipboard.writeText` from the `pre`'s text, the button label flips to "copied" for 2s, and `aria-live` announces it.
3. `video-card.ts` (any post with a video): on click, swaps the card for a `youtube-nocookie.com` iframe with `autoplay=1`.

`ClientRouter` is removed (Q7), so no `astro:page-load` handling is needed and Pico-8 links need no `data-astro-reload`.

### 5.14 Code highlighting

- **Theme:** `src/shiki/sasky-terminal.json`, a custom Shiki theme taken from the design's tokens.
  - Background `#070a09`, base text `#c8d6cb`.
  - Commands, keys and types `#8cc8ff`; strings and values `#a6e3a1`; keywords and booleans `#f2b45a`.
  - Punctuation `#5d7466`; comments `#5f7a6a` italic.
- **Config:** move the settings from `mdx({ shikiConfig })` to `markdown.shikiConfig` with `{ theme: terminal, transformers: [metaToData] }`. MDX inherits it.
- **`metaToData` transformer:** copies `title="…"` from the fence meta onto the `pre` as `data-title`. The language is already exposed as `data-language`.
- **`CodeBlock.astro`:** an MDX `pre` override, passed only by the Code post template (`<Content components={{ pre: CodeBlock }} />`). It renders a `<figure>`, then a `<figcaption>` with `── {title ?? language}` and a copy `<button>`, then the `pre`.
- **Line numbers:** CSS counters on `.line`. Lines are `display: block`, the newline text nodes between them are neutralised (R7), and the numbers come from `::before` in `#3d5446`. Long lines scroll horizontally (`overflow-x: auto`).
- **Inline `code`:** amber on `#14201a`, as in the design.

### 5.15 YouTube

Replace `@astro-community/astro-embed-youtube` with our own `src/components/mdx/YouTube.astro`, with props `id`, `title` and optional `caption`.

- **Why our own:** the design wants a navy box with no thumbnail, which the package can't produce without overriding its inline poster style. Our own component guarantees **zero requests to YouTube or ytimg before a click** (no poster, no preconnect on hover), matches the design markup exactly, and drops a dependency.
- **Markup:** `<figure>` → `<a class="vid" href="https://www.youtube.com/watch?v={id}" aria-label="Play video: {title}">` (navy frame, `6px 6px 0` blue shadow that turns orange with a lift on hover, 76px orange play button, rotated white "Video · YouTube" label) → optional `<figcaption>`.
- **Without JS** the link opens YouTube; with JS, `video-card.ts` swaps in the iframe.
- **Theming:** the colours are custom properties, so the On variant (G2) is a token swap.

### 5.16 Meta and SEO

`BaseLayout` takes `title`, `description`, `canonical` (defaults to `Astro.url` on `site`) and `ogType`, and emits `<title>`, the meta description, `<link rel="canonical">`, `og:title`, `og:description`, `og:url`, `og:type`, `og:site_name` and a `twitter:card` summary.

| Page | Title pattern (from the designs) |
|---|---|
| Home | `sasky.nz — Home` |
| Listings | `Code — sasky.nz` · `Life — sasky.nz` · `Pseudo Philosophy Meditations — sasky.nz` |
| Posts | `{title} — Code — sasky.nz` · `{title} — Life — sasky.nz` · `{title} — Pseudo Philosophy Meditations — sasky.nz` |
| Tags, 404 | `#{tag} — sasky.nz` · `Page not found — sasky.nz` |

- **Meta description:** `metaDescription ?? description`.
- **Out of scope:** `og:image` (suggested as a follow-up).

---

# Part 2: Page types by theme

Each spec lists the design file, components, data, behaviour at 390px, interactive parts and acceptance checks. Acceptance always includes: matches the design file at 1280px and 390px in Playwright screenshots (see 8.1), with any differences listed in the PR.

## 6.1 Shared foundations

- **Design files:** the top bar and footer blocks in every file, plus the README's "Themes at a glance".
- **Build:** `BaseLayout`, the three theme layouts, `TopBar`, `SkipLink`, `Texture`, the three footers, `base.css` and the theme token files (5.5 and 5.6).
- **Top bar:**
  - 66px minimum height, a 2px bottom rule, 1120px inner width, 24px gutters; wraps if needed.
  - Wordmark: a 13px mark at 24px.
  - Nav: 16px text; links 44px tall with 14px side padding and a 4px gap.
  - Current link: 3px inset underline. HP: orange underline with blue text. Code: accent underline and text, lowercase. On: ink underline, uppercase with `.12em` tracking.
  - Under 480px: 16px gutters, 20px wordmark, 10px link padding.
- **Acceptance:**
  - Top-bar geometry is pixel-identical across the three themes (overlay screenshots).
  - Tab order is skip link → wordmark → nav, and the skip link is visible on focus.
  - The Code cursor doesn't blink under reduced motion.
  - Textures can't be clicked or selected and are hidden from the accessibility tree.

## 6.2 HP theme

### Home (`Site-Home.dc.html` + `TagSelector.dc.html`)

- **Components:** `Hero`, `AboutSection`, `SectionDoors` with `Door` and its `CodePreview`, `LifePreview` and `OnPreview`, `TagSelector`, and `HpFooter`.
- **Data:** `home.ts`; `sections.ts`; `sectionStats(getPosts(s))` for each door (count label, latest title and date); `buildTagIndex`.
- **Hero** (880px minimum height):
  - **Layers, back to front:**
    1. paper and graph grid
    2. the orange plus pattern on the left 54% (opacity .55)
    3. the blue wash (66% wide, opacity .85, with the `.wash` mask and grid grain)
    4. the portrait box (`top: 4%`, `right: -40px`, `height: 104%`), holding two silhouette ghosts (`translate(-80px, 24px)` at .4 and `translate(-40px, 12px)` at .8), the photo with its drop shadow, and the jacket stripes (`translate(-5px, 3px)` at .9)
  - **Name label:** navy Dymo, `rotate(2.5deg)`, `left: 50%; bottom: 92px`.
  - **Copy:** max 520px wide; H1 is Fraunces 800, 80px/0.96, with the highlight at a `56%–90%` gradient; the lede is 26px italic.
- **About:**
  - Grid of `repeat(auto-fit, minmax(min(440px, 100%), 1fr))`.
  - Hobby Dymos: odd ones `-1.2deg`, every 4n `1.4deg`, 3n+2 blue, 5n+4 orange with navy text.
  - Statements: orange 40px Fraunces asterisks.
- **Doors:**
  - Cards are `flex: 1 0 300px` with scroll-snap, a 2px navy border, and a `6px` blue shadow that becomes `9px` orange with a `-2px` lift on hover (`3px` press on `:active`).
  - Each has a count Dymo at `top: -16px`, a 168px preview, the blurb (with an sr-only "Code: " prefix), the "Latest · date" line and title, and "Enter X →".
  - The previews are `aria-hidden`.
- **390px:**
  - The hero stacks, with the media 480px tall and the portrait centred and unmasked.
  - The wash goes full width, the plus marks and the floating label are hidden, and an inline label row (`.sm-only`) appears.
  - H1 is 44px and the lede 21px.
  - Main padding is `48px 20px 80px` with a 72px gap; section heads are 38px.
  - Doors side-scroll, and the tag card padding is `26px 18px 20px`.
- **Interactive:** the tag selector (5.11); door hover and active states.
- **Acceptance:**
  - Door counts and latest lines match the content (Code "2 posts", Life "1 post", On "4 meditations"; the On door latest is the Moment).
  - Hobbies show all of `home.ts`.
  - Picking a tag updates `aria-pressed`, the list and the live summary.
  - Without JS, the default tag's list is visible and the chips link to `/tags/x`.
  - The hero image is served at no more than the needed width (`srcset`).
  - `#about` and `#tags` anchors exist.

### Life listing (`Site-Life-List.dc.html`)

- **Components:** `ListingBand` (plus marks, wash at 58%, count Dymo, 120px H1, 28px lede, optional intro) and `PostRow`, which `/tags/[tag]` reuses.
- **`PostRow`:**
  - Grid of `170px 1fr` with a `32px` gap; padding `28px 12px`; dashed bottom rule.
  - Left column: date (bold navy) and "N min read".
  - Right column: Fraunces 800, 30px title link; 20px italic description; `TagLinks`.
  - Hover: blue tint plus a 3px orange underline on the title. Flat, with no card or shadow.
- **Data:** `getPosts('life')`, `sectionStats`, `readingTime`.
- **390px:** band padding `52px 20px 44px`, H1 72px, lede 22px, wash 100%; rows single-column with an 8px gap and 25px titles.
- **Acceptance:**
  - Heading reads "Every Life post, newest first".
  - Dymo reads "1 post · since May 2024".
  - No placeholder rows.
  - Row hover and active states match the design.

### Life post (`Site-Life-Post.dc.html`)

- **Components:** `PostHeader` (mono breadcrumb `sasky.nz / Life`, 64px H1, 25px italic lede, meta row between 2px navy rules: date, orange diamond, read time), the prose styles in `hp.css` under `.prose-life`, `YouTube`, `TagLinks`, and `HpPrevNext`.
- **Prose:**
  - Fraunces 21px/1.65 in `#1d2150`, with 26px rhythm (`> * + *`).
  - `h2`: 32px/800, with a `::before` square mark (orange with a blue offset, `-8deg`).
  - `blockquote`: 52px left padding, a 72px orange `*` via `::before`, and a 34px italic quote.
  - Links: blue with a 2px orange underline.
  - `strong`: navy 800; `.ps`: Source Sans 17px muted.
- **Texture:** opacity .6.
- **390px:** main padding `40px 20px 72px`, H1 40px, lede 20px, body 19px, quote 26px, h2 26px.
- **Interactive:** video cards.
- **Acceptance:**
  - The concert post matches the design order: heading → card → caption → text.
  - No requests to youtube.com or ytimg before a click (Playwright network log).
  - "More in Life" follows G7.

## 6.3 Code theme

### Code listing (`Site-Code-List.dc.html`)

- **Components:** `Prompt` (`cam@sasky:{path}$ {cmd}`, where `~` links home), `CodeListEntry`, `CodeFooter`.
- **Header:**
  - The prompt reads `cat README.md`, followed by the H1 `# Code` at 60px with a green glow and `> Code, hosting & small games` in 19px italic.
  - The optional intro is an HTML-comment-styled line. Its colour moves from `#5f7a6a` to **`#6f8a7a`**, because `#5f7a6a` on `#0b0f0d` is 4.11:1 and fails AA for 15px text.
  - Stats: `total 2 posts` and `since January 2024`.
- **Entry:**
  - Grid of `150px 1fr`.
  - Left column: `-rw-r--r--` (hidden under 760px) and the ISO date.
  - Right column: `> ` + 22px/800 title; `# description`; amber `[tag]` links.
  - Hover: green tint plus an underline.
- **Close:** a prompt with a 9×18 blinking cursor, then the `-- NORMAL --` footer.
- **390px:** H1 40px; entries single-column with a 6px gap; main padding `44px 20px 72px`.
- **Acceptance:**
  - The label reads "# every code post, newest first".
  - There's no section-directory block.
  - Blue `.lnk` links show their hover and active states.

### Code post (`Site-Code-Post.dc.html`)

- **Components:** `Prompt` breadcrumb (`~/code$ cat {slug}.md`, where `~` and `code` are links), `CodeBlock`, `Toc`, `CodePrevNext`, `Pico8` (restyled per G4), `ImageCollection` (G3).
- **Header:**
  - H1 is 44px with a max of `24ch` and a green `# ` prefix.
  - `> description` in 17px italic.
  - Meta: `date 1 April 2024` (long format, as the design shows), `read N min read`, `tags [..]`.
- **Body:**
  - Grid of `1fr 250px` with a 64px gap; the article is max `70ch`, 16px/1.8.
  - Headings: `h2` gets an accent `## ` and `h3` a muted `### `. Both prefixes are added with `::before { content: "## " / "" }` so screen readers don't read them.
  - `**Cam out.**` is bright and bold, `<mark>` is amber, and an `EOF` rule closes the article.
- **TOC:**
  - Built from `render(post).headings`, depth 2–3.
  - Header: `$ grep '^#' post.md`. Each entry is a `##` or `###` link (G5); the bottom link is `← cd ~/code`.
  - Sticky at `top: 24px`, inside an `<aside aria-label="On this page">`.
- **More in Code:** "← older in ~/code · {long date}" card plus the newer-or-all card (G7).
- **390px:** under 900px the grid goes single-column, the TOC hides, the title is 30px and the padding `40px 20px 72px`. Code blocks scroll horizontally inside their frame.
- **Interactive:** the copy buttons; the Pico-8 game.
- **Acceptance:**
  - Each Silverstripe block's caption matches the design.
  - Line numbers can't be selected and aren't copied.
  - The copy button copies exactly the code.
  - Hide n Seek plays: on a 2560×1440 viewport the canvas fits without scrolling (`min(80vh, …)`), and at 390px the touch controls work.
  - There are no console errors.

## 6.4 On theme

### On listing (`Site-On-List.dc.html`)

- **Components:** `Bill` (2px outer frame, 6px gap, 1px inner frame, four `Fleuron` corners; slot), `DoubleRule` (`thick-thin` or `thin-thick`), `DiamondRule`, `NowShowing` (manicules plus Alfa Slab text), `Eye` (SVG plus `.rays` conic-gradient mask), `Programme`, `OnFooter`.
- **Data:** `getPosts('on')`, `seriesNumber`, `ordinalWord`, `toRoman`, `excerpt(post.body)` (or the `excerpt` frontmatter), `formatDateOn` and `formatDateOnShort`.
- **Header:**
  - "Cameron Grant of Wellington, Aotearoa, presents", a thick-thin rule, then the H1 "Pseudo Philosophy Meditations" (Holtwood 72px with the `.inline` double shadow).
  - A thin-thick rule, then the 31px subtitle, the Eye (640×300), the intro and "4 meditations · since June 2026".
- **Headliner:**
  - "!Now Showing · Meditation the Fourth!" with the title as a 68px link, then a `DiamondRule`.
  - Below that, the description as uppercase 26px/700, then a rounded side-ruled box holding the excerpt, "By Cameron Grant · 18th October 2026" and "☞ Read On, if You Dare! ☜".
- **"Also Appearing":**
  - Rye 40px, with "The full programme · newest first".
  - An `<ol>` of every meditation except the headliner, as the design shows. Each row is a grid of `88px 1fr auto`: numeral, 32px title, programme line (G6), short date.
- **390px:**
  - H1 30px; headliner title 40px; bill padding `24px 14px 22px`.
  - The Eye shrinks to 100% × 190px with a 200×100 SVG and must not overflow the frame.
  - Programme rows become `52px 1fr`, with the date under the title.
- **Acceptance:**
  - The ordinal and numerals come from the dates (the Moment is IV / Fourth).
  - The colophon reads "© MMXXVI".
  - No horizontal scroll at 390px (`scrollWidth === clientWidth`).

### On post (`Site-On-Post.dc.html`)

- **Components:** `Bill`, `NowShowing` ("!Meditation the Second!"), the breadcrumb link to `/meditations` (24px, `.22em` tracking), the 88px H1, the 31px uppercase subtitle, the byline "By Cameron Grant · Wellington · {formatDateOn}", `DiamondRule`, the body, the "Finis" block, the "Filed under" stamps, `FurtherMeditations`, the "☞ The Full Programme of Meditations ☜" link and `OnFooter`.
- **Numerals:** the `onTips` Sätteri hast plugin, registered with `satteri({ hastPlugins: [onTips] })`.
  - **When it runs:** only when `ctx.data.astro.frontmatter.section === 'on'`, and only on `h2` elements whose text starts with `/^(\d+)\.\s+/`.
  - **What it does:** replaces that prefix with `<span class="num">{toRoman(n)}.</span> ` and adds `class="tip"` to the `h2`.
  - **Structure:** the plugin doesn't wrap tips in `<ol>`/`<li>`. Each tip is a flat `h2.tip` followed by its paragraphs, styled from the parent `.prose-on:has(h2.tip)`: a 104px left indent, a 3px top rule on the first tip and 2px dotted rules on the rest. The numeral is hung with `position: absolute; right: 100%; margin-right: 40px`. That keeps the source and DOM simple and matches the visuals exactly. The design's `<ol>` is the one intentional DOM difference.
- **Drop cap:** `.prose-on > p:first-of-type::first-letter`, Holtwood at 3.3em.
- **`Ornament.astro`:** an MDX component rendering the manicule and diamond divider (`aria-hidden`).
- **Non-tip posts:** G1 styles; videos per G2.
- **390px:**
  - H1 46px; the numeral goes static (block, 30px, 8px below it), with tip padding `24px 0`.
  - The further-reading cards go single-column; bill padding `24px 14px 22px`.
- **Acceptance:**
  - Classy renders I–X numerals as real `<span>`s inside the `h2`s, with the tip 5 parenthetical lighter and in sentence case.
  - Headings without numbers in other On posts are untouched.
  - The plugin is a no-op for Code and Life posts (unit test with a fixture).
  - "Earlier · Meditation the First" and "Later · Meditation the Third" labels are computed.

## 6.5 Everything else

- **Tag pages:** see 5.11 and Q4.
- **404 (HP):**
  - Navy Dymo "404" and the H1 "This page has wandered off".
  - A lede with links to Code, Life and On, plus Home.
  - The copy is short placeholder-free text; Cam can edit it.
- **About:** `/about` → `/#about`. After the redirect, the browser lands on the About section, below the hero.

---

# Phases and tasks

Each phase is one PR into `feature/redesign`. Phase 9 opens the PR from `feature/redesign` into `main`. Sizes: **S** is under 2h, **M** is half a day, **L** is a day or more. Every PR runs `npm run build`, `npm run check`, `npm test` and `npm run check:links`.

## Phase 1: Branch, tooling and baseline

- [ ] **1.1 Dev tooling (S)**
  - **Do:** add these devDependencies:
    - `@astrojs/check`, `typescript`
    - `vitest`
    - `@playwright/test`, `@axe-core/playwright`

    Add scripts: `check` (`astro check`), `test` (`vitest run`), `test:e2e` (`playwright test`), `check:links`, `check:redirects`.
  - **Files:** `package.json`, `package-lock.json`, `vitest.config.ts`, `playwright.config.ts`, `scripts/check-links.mjs`.
  - **Depends on:** none.
  - **Verify:** `npm run check` runs (fix or baseline existing type errors); `npm test` passes with zero tests; `check:links` finds no broken internal `href`s in `dist`.
  - **What `check-links.mjs` does:** scans `dist/**/*.html` for root-relative `href` and `src` values and asserts each target file exists.
- [ ] **1.2 Baseline screenshots (S)**
  - **Do:** `tests/visual/baseline.spec.ts` captures every current route at 1280 and 390 (full page) into `qa/baseline/`. The folder is gitignored, and the images are attached to the PR.
  - **Depends on:** 1.1.
  - **Verify:** 9 routes × 2 widths captured.
- [ ] **1.3 Housekeeping (S)**
  - **Do:** commit `design-handoff/`, and delete the root zip and duplicate prompt (after Cam OKs it). Add `qa/` to `.gitignore`.
  - **Verify:** `git status` is clean apart from Cam's `design/`.

## Phase 2: Content collections, routes and redirects (old look, new URLs)

- [ ] **2.1 Pure helpers with tests first (M)**
  - **Do:** write the Vitest specs, then implement `src/lib/format.ts`, `text.ts` and the pure core of `posts.ts` (5.6).
  - **Required test cases:**
    - `formatDateOnShort(2026-09-11)` → `"11th Sept. 2026"` and `(2026-06-20)` → `"20th June 2026"`
    - `toRoman(2026)` → `"MMXXVI"`
    - `ordinalWord(4)` → `"Fourth"` and `ordinalWord(21)` → `"Twenty-First"`
    - `ordinalSuffix` for 1, 2, 3, 4, 11, 12, 13, 21, 22 and 111
    - `excerpt()` on a body starting with imports and a heading returns the first prose paragraph
    - `neighbours()` at both ends returns `undefined` on the open side
    - `buildTagIndex()` with an untagged post
    - every date formatter gives the same output under `TZ=Pacific/Auckland` and `TZ=America/Los_Angeles`
  - **Files:** `src/lib/{format,text,posts}.ts` and their `*.test.ts` files.
  - **Depends on:** 1.1.
  - **Verify:** `npm test` passes.
- [ ] **2.2 Move posts into the collection (M)**
  - **Do:**
    - Create `src/content.config.ts` (5.1).
    - Add the tsconfig `paths` aliases.
    - `git mv` the 7 posts into `src/content/posts/`, applying the 5.2 renames.
    - Add `section` and remove `layout:` and the stray exports and unused imports.
    - Switch imports to aliases and fix `Title=`.
    - Delete `about.mdx` and move its copy into `src/data/home.ts`.
  - **Files:** `src/content.config.ts`, `tsconfig.json`, `src/content/posts/*.mdx`, `src/data/home.ts`, `src/data/sections.ts`.
  - **Depends on:** 2.1.
  - **Verify:** `astro sync` and `npm run check` pass; the schema rejects a deliberately bad `section` (temporary local check).
- [ ] **2.3 Section routes in the old look (M)**
  - **Do:**
    - Add `src/pages/{code,life,on}/index.astro` and `[slug].astro` using the existing `BaseLayout`, rendering via `render(post)` inside a temporary `LegacyPost.astro` (the old `MarkdownPostLayout` adapted to take `post`).
    - Rewrite `index.astro` and `tags/[tag].astro` to read from `getPosts()`, and delete `tags.astro`.
    - Rewrite RSS from the collection (5.12, minus categories).
  - **Depends on:** 2.2.
  - **Verify:**
    - `npm run build` output has exactly the 5.3 routes.
    - `check:links` passes.
    - Hide n Seek plays.
    - The RSS validates (W3C feed validator) and doesn't include About.
- [ ] **2.4 Routing config (S)**
  - **Do:** set `trailingSlash: 'never'` and `build.format: 'file'`.
  - **Files:** `astro.config.mjs`.
  - **Depends on:** 2.3.
  - **Verify:** `dist/` has `code.html` and `code/<slug>.html`; `check:links` passes.
- [ ] **2.5 Redirects and proof script (S)**
  - **Do:** add `public/_redirects` (5.4) and `scripts/check-redirects.mjs` with `--dist` and `--url` modes.
  - **Depends on:** 2.4.
  - **Verify:**
    - `npm run check:redirects -- --dist` passes.
    - On the Netlify deploy preview, `--url <preview>` passes, including the trailing-slash variants and `/about` landing on `/#about`.
    - Record the trailing-slash behaviour in the PR.

## Phase 3: Foundations

- [ ] **3.1 Fonts (S)**
  - **Do:** add the `fonts` config (5.7) and delete the old font files and `fonts.css` once nothing imports them (Phase 9 if the legacy layout still does).
  - **Files:** `astro.config.mjs`; later `src/styles/fonts/*` and `src/styles/fonts.css` (deleted).
  - **Depends on:** Phase 2.
  - **Verify:** the build emits only the configured families; Fraunces `opsz` axis present (R5).
- [ ] **3.2 Base and theme tokens (M)**
  - **Do:** add `src/styles/base.css` and `src/styles/themes/{hp,code,on}.css`, with tokens, textures and the reduced-motion rules.
  - **Depends on:** 3.1.
  - **Verify:** the stylesheet a test page links to contains one theme's tokens only.
- [ ] **3.3 Layouts and chrome (M)**
  - **Do:** build `BaseLayout` (new, with meta from 5.16 and no `ClientRouter`), `HpLayout`, `CodeLayout`, `OnLayout`, `TopBar`, `SkipLink`, `Texture`, the three footers, `Dymo`, `SectionChip`, `TagLinks`, `Manicule` and `Fleuron`.
  - **Depends on:** 3.2.
  - **Verify:** a temporary `/_sandbox/{hp,code,on}` page per theme (deleted before merge) passes the top-bar acceptance in 6.1.
- [ ] **3.4 404 page (S)**
  - **Do:** `src/pages/404.astro` in HP (6.5).
  - **Depends on:** 3.3.
  - **Verify:** `dist/404.html` exists; the deploy preview's unknown path renders it with a 404 status.

## Phase 4: HP pages

- [ ] **4.1 YouTube component (S)**
  - **Do:** build `src/components/mdx/YouTube.astro` and `src/scripts/video-card.ts`, and switch every post import to it.
  - **Depends on:** Phase 3.
  - **Verify:** zero youtube.com or ytimg requests before a click (Playwright network log); click plays; without JS the link opens YouTube.
- [ ] **4.2 Home (L)**
  - **Do:** build `Hero`, `AboutSection`, `SectionDoors` and `Door`, `TagSelector` with `tag-selector.ts`, and assets in `src/assets/hero/` (5.8). Swap `index.astro` onto `HpLayout`.
  - **Depends on:** 3.3.
  - **Verify:** the 6.2 Home acceptance checks.
- [ ] **4.3 Life listing (M)**
  - **Do:** build `ListingBand` and `PostRow`, then `life/index.astro`.
  - **Depends on:** 3.3.
  - **Verify:** the 6.2 Life listing acceptance checks.
- [ ] **4.4 Life post and concert edits (M)**
  - **Do:** build `PostHeader`, `.prose-life`, `HpPrevNext` and `life/[slug].astro`, and apply the 5.10 concert edits.
  - **Depends on:** 4.1 and 4.3.
  - **Verify:** the 6.2 Life post acceptance checks.

## Phase 5: Code pages

- [ ] **5.1 Shiki theme and code blocks (M)**
  - **Do:** add `src/shiki/sasky-terminal.json`, the `metaToData` transformer, `CodeBlock.astro`, `copy-code.ts` and the line-number CSS. Apply the Silverstripe fence edits.
  - **Depends on:** Phase 3.
  - **Verify:** the captions match the design; copy round-trips exactly (Playwright clipboard read); line numbers aren't copied.
- [ ] **5.2 Code listing (S)**
  - **Do:** build `Prompt` and `CodeListEntry`, then `code/index.astro`.
  - **Depends on:** 3.3.
  - **Verify:** the 6.3 listing acceptance checks.
- [ ] **5.3 Code post (L)**
  - **Do:** build `code/[slug].astro`, `Toc` and `CodePrevNext`; restyle `Pico8` (G4) and `ImageCollection` (G3).
  - **Depends on:** 5.1 and 5.2.
  - **Verify:** the 6.3 post acceptance checks, including the 2560×1440 Pico-8 check.

## Phase 6: On pages

- [ ] **6.1 On primitives (M)**
  - **Do:** build `Bill`, `DoubleRule`, `DiamondRule`, `NowShowing`, `Eye`, `Ornament` and the `OnFooter` placements.
  - **Depends on:** 3.3.
  - **Verify:** sandbox render at 1280 and 390; the Eye stays inside the frame at 390.
- [ ] **6.2 `onTips` plugin (S)**
  - **Do:** build `src/markdown/on-tips.ts` and register it in `astro.config.mjs`. Write a Vitest suite first that runs Sätteri's `mdxToJs` or `markdownToHtml` with the plugin on fixtures (an On post with numbered tips, an On post without them, a Code post).
  - **Depends on:** 2.2.
  - **Verify:** the suite passes; the Classy output has `<span class="num">X.</span>`.
- [ ] **6.3 On listing and post (L)**
  - **Do:** build `meditations/index.astro`, `meditations/[slug].astro`, `Programme`, `FurtherMeditations` and `.prose-on`, including the G1 and G2 styles. Apply the Classy edits.
  - **Depends on:** 6.1 and 6.2.
  - **Verify:** the 6.4 acceptance checks.

## Phase 7: Tags, RSS and SEO

- [ ] **7.1 Tag pages (M)**
  - **Do:** restyle `tags/[tag].astro` in HP (or, if Q4 goes the other way, remove it and add the redirect), and point `TagLinks` at the agreed destination.
  - **Depends on:** 4.3.
  - **Verify:** every tag link resolves (`check:links`); old `/tags/*` URLs work.
- [ ] **7.2 RSS categories (S)**
  - **Do:** add `categories` and `<language>en-nz</language>`.
  - **Depends on:** 2.3.
  - **Verify:** the feed validates; the items carry the section and tags.
- [ ] **7.3 Meta and titles (S)**
  - **Do:** wire the 5.16 titles, descriptions, canonical and OG tags on every page.
  - **Depends on:** Phases 4–6.
  - **Verify:** a Playwright test asserts the `<title>` and canonical for one page of each type.

## Phase 8: QA

- [ ] **8.1 Visual comparison (M)**
  - **Do:**
    - `tests/visual/compare.spec.ts` screenshots every page type at 1280×900 and 390×844 (full page).
    - A companion script serves `design-handoff/design/` statically and screenshots the matching `.dc.html` files at the same widths. The tweaks render at their defaults; `support.js` is missing, so the `{{…}}` values are filled by a small shim that reads the `data-props` defaults.
    - Pair them side by side in `qa/compare/index.html`.
    - List the intentional differences: G1–G8, the On `<ol>`, the TOC labels and the real content counts.
  - **Verify:** Cam signs off the compare sheet.
- [ ] **8.2 Accessibility (M)**
  - **Do:**
    - Axe on every page type, which must show zero serious or critical violations.
    - Keyboard pass (skip link, nav, doors, chips, copy buttons, video cards).
    - Check `aria-current` and `aria-pressed`.
    - Run with `prefers-reduced-motion: reduce`: no blinking or lifts.
    - Run with JavaScript disabled (Review focus 5).
    - Spot-check contrast, using the pairs already measured:

      | Pair | Ratio | Result |
      |---|---|---|
      | Orange and navy (either way round) | 6.07 | ✓ |
      | White on blue | 5.64 | ✓ |
      | Muted on paper | 7.16 | ✓ |
      | Code muted | 5.63 | ✓ |
      | Code intro `#5f7a6a` | 4.11 | ✗, fixed to `#6f8a7a` |
      | `###` prefix | 3.29 | Decorative, hidden from AT |
      | Ink on kraft | 8.29 | ✓ |
      | Rust on kraft | 4.99 | ✓ |
- [ ] **8.3 Performance (S)**
  - **Do:** run Lighthouse (mobile) on Home and one post per theme.
  - **Targets:** performance ≥ 95; CLS < 0.05; only that theme's font files in the network log (plus Home's three door faces); the hero image ≤ the rendered size × DPR; no third-party requests before interaction.
  - **Verify:** the reports are attached to the PR.

## Phase 9: Cleanup and launch

- [ ] **9.1 Remove the old code (S)**
  - **Do:** delete the old layouts, components, styles, fonts, `utils.js`, the unused screenshots and `LegacyPost.astro`. Uninstall `open-props` and `@astro-community/astro-embed-youtube`.
  - **Verify:** `rg "open-props|global.css|astro-embed|astro:schema" src` returns nothing; the build, `check` and tests all pass.
- [ ] **9.2 Docs (S)**
  - **Do:** rewrite the README (content model, adding a post, themes, scripts); prune the completed items from `todo.md`.
- [ ] **9.3 Launch checklist (S)**
  - **Do:**
    - Final deploy preview: run `check:redirects -- --url`, `check:links`, and an RSS read in a feed reader.
    - Open a PR from `feature/redesign` into `main` and merge it.
    - After deploy, re-run `check:redirects` against https://sasky.nz.
    - Request indexing for the new section URLs in Search Console, if it's set up.

---

## Risks and mitigations

| # | Risk | Mitigation |
|---|---|---|
| R1 | MDX import paths break after the move | Path aliases, so imports no longer depend on file location; `astro check` and the build in 2.2 catch any misses. |
| R2 | Sätteri plugin API differences (new in Astro 7, `satteri` 0.10) | Keep the `onTips` plugin tiny and test it directly against Sätteri in 6.2. Fallback: an `h2` component override passed only by the On template (parses the leading `N.` from rendered children). |
| R3 | Per-theme CSS leaks or font duplication | No `ClientRouter`; theme CSS is imported only by the theme layouts; the 8.3 network check. |
| R4 | Pico-8 relies on global IDs and `window.pico8src` | One game per page (already true); no client router; a 2560×1440 and 390 play test in 5.3. |
| R5 | Fraunces via the Fonts API lacks the `opsz` axis | Check the downloaded file's axes in 3.1; fall back to `fontProviders.local()` with the full-axes variable woff2. |
| R6 | FOUT or layout shift from display faces | `font-display: swap` plus Astro's optimised fallbacks (`optimizedFallbacks: true`); preload only one display face per theme; CLS checked in 8.3. |
| R7 | Shiki emits a `\n` text node between `.line` spans, so block lines double-space | In `metaToData`, also drop the whitespace-only text children of `code`, or set `code { display: grid }`; covered by the 5.1 visual check. |
| R8 | Redirect edge cases (trailing slash, fragment targets, case) | The `check:redirects --url` matrix on the preview; fall back to `netlify.toml` for the fragment rules; all slugs are lowercase already. |
| R9 | The URL change makes feed readers show every post as new again | Accept and mention it in the launch post; it's one-time. |
| R10 | Full-page textures are expensive to paint on long pages | Tiled noise backgrounds instead of full-page SVG filters (5.5); Lighthouse in 8.3. |
| R11 | Long titles in Holtwood (88px) overflow at 390 | `text-wrap: balance`, `overflow-wrap: anywhere` on On headings; the Moment's long title is in the 390 compare set. |
| R12 | `.dc.html` screenshots need the canvas runtime (`support.js` isn't included) | The tiny shim in 8.1, or compare against the canvas exports Cam can screenshot directly. |
