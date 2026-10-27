# Phase 4: HP Pages (Home and Life) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Home, `/life` and `/life/[slug]` onto the HP theme, with our own no-request YouTube card, so the first real pages show the redesign.

**Architecture:**
- **Pages** use `HpLayout`. HP page components live in a new `src/components/hp/`; the MDX `YouTube` card lives in `src/components/mdx/`. Shared chrome stays in `src/components/site/`.
- **Data** comes from `getPosts()` plus the pure helpers in `src/lib/` (`sectionStats`, `buildTagIndex`, `neighbours`, `readingTime`, the formatters). Nothing that can be counted is hard-coded.
- **Client JS** is two small vanilla modules: `video-card.ts` (click to swap in the iframe) and `tag-selector.ts` (links become toggle buttons). Both pages work fully without them.

**Tech Stack:** Astro 7.3.4 (`astro:assets` `Image`, `<Font>`, `experimental_AstroContainer`), Vitest 5, Playwright 1.64.

**Spec:**
- [`docs/redesign-plan.md`](../../redesign-plan.md): 5.6, 5.8, 5.9, 5.10 (`top-concertvids`; the `Title=` fix in `on-new-zealand-music`), 5.11, 5.13, 5.15, 5.16 (titles), 6.2 and tasks 4.1–4.4. It wins on conflicts.
- Design values: `design-handoff/design/Site-Home.dc.html`, `TagSelector.dc.html`, `Site-Life-List.dc.html` and `Site-Life-Post.dc.html`. Each task names the block to read.
- Cam skipped the brainstorm ("just do your best, we will do a detailed review later"), so the calls the brainstorm would have settled are listed below for that review.

## Calls made in place of a brainstorm

1. **Which pages switch now:** Home, `/life` and `/life/[slug]`. `/tags/[tag]` keeps the legacy look until task 7.1, as the spec's phases have it; it will reuse `ListingBand`, `PostRow` and `SectionChip` from this phase.
2. **Component homes:** HP page components go in `src/components/hp/`; `YouTube.astro` goes in `src/components/mdx/` (spec 5.15).
3. **`YouTube` theming:** the card's colours come from `--vid-*` tokens set in `hp.css`. Each `var()` carries the HP value as a fallback, so the NZ Music post (On, still legacy until Phase 6) renders a sensible card. Phase 6 sets the On tokens (G2).
4. **Count nouns:** `SECTIONS[s].unit` (`"post"`, `"post"`, `"meditation"`) plus `countLabel()` give "2 posts", "1 post", "4 meditations" on the doors and listings.
5. **`ListingBand`** is extracted now, and the 404 moves onto it (`wash={false}`, `variant="message"`, a linked lede through a `lede` slot).
6. **Home's extra fonts:** `HpLayout` forwards a `head` slot. Home uses it to render `<Font>` for Holtwood One SC and Oswald without preloading them (spec 5.7). JetBrains Mono is already in HpLayout.
7. **Tag selector live region:** only the summary line is `aria-live`, not the list, so a pick announces "2 posts tagged learning" rather than the whole list.
8. **Video card clicks with a modifier key** (Ctrl, Cmd, Shift, middle-click) are left to the browser, so they still open YouTube in a new tab.
9. **Phase 2 e2e tests** that pinned the legacy Home ("Home keeps its site title" and the Home half of "a post's menu link…") are replaced by the new Home tests. The legacy Code and On posts' "menu" link still points at `/#code-…`, which now lands at the top of Home. That's harmless until Phases 5 and 6 replace those headers.
10. **Concert post edits** are limited to the markup changes spec 5.10 lists. They add `title`/`caption` text taken verbatim from the design and change no words of the post.

## Global Constraints

- Astro 7 APIs only, with no UI framework. Client JS is small vanilla `<script>` modules, bundled only by the components that use them.
- **Design values:** take exact values from the `.dc.html` files and convert them into scoped CSS plus custom properties. Never paste inline styles. Fixed tweak values: `{{blue}}` `#2452ff`, `{{orange}}` `#ff6a1f`, `{{field}}` `.85`, `{{stripes}}` `.9`, `{{misregister}}` `5px` (so `misX` `-5px`, `misY` `3px`, per spec 6.2), `{{ghost}}` `40px`, `{{photoRight}}` `-40px`, `{{crosses}}` `.55`.
- **Computed values:** counts, "since" dates, latest posts, reading times, tag counts and the © year are computed from content, never typed in.
- **Dates:** format with the UTC helpers in `src/lib/format.ts`. `npm test` runs under `TZ=America/Los_Angeles`.
- **Theme isolation:** pages load only HP CSS. Home adds only the Holtwood One SC and Oswald `@font-face` rules (no preload). Shared components in `src/components/site/` and `src/components/mdx/` contain no theme selectors. Keep the scoped CSS of shared components token-only.
- **Breakpoints:** 480, 760 and 900 only.
- **Accessibility:** 44px targets, visible `:focus-visible`, `aria-current` from TopBar, and `prefers-reduced-motion: reduce` turns off the cursor blink, hover lifts and transitions.
- **Placeholders:** ship no placeholder rows or `[bracketed]` copy (the Life list board's grey rows and `[Older post title]` card are not built).
- **Content:** change no post copy. The 5.10 markup edits on `top-concertvids` and `Title=` → `title=` in `on-new-zealand-music` are the only content edits.
- **URLs:** lowercase kebab-case, no trailing slash. Build links with `postUrl()` and `SECTIONS[s].path`, and use `pagePath()` for paths.
- **Branch:** `redesign/phase-4-hp-pages`, cut from `feature/redesign`. Commit as `sasky` / `cam@sasky.nz`, ending each message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stage paths explicitly; never stage the untracked `design/` folder.

## Review Focus

1. **Modifier-clicks on a video card** (Ctrl/Cmd/Shift or middle-click) open YouTube as a normal link and don't swap in the iframe. Pinned in Task 1.
2. **Horizontal overflow at 390px** from long unbroken content (the 80-character lotto hobby Dymo, the long concert H1, the door scroller): `scrollWidth` must stay at most the viewport width on Home and the Life post. Pinned in Tasks 3 and 4.
3. **Duplicate `id`s on Home,** because every tag's list renders the same posts again. The page must have no duplicate `id` values. Pinned in Task 6.
4. **Singular counts:** a tag with one post reads "1 post tagged pico8", and a door with one post reads "1 post". Pinned in Tasks 2 and 6.
5. **Reduced motion on Home:** the Code door's cursor has `animation-name: none`, and hovering a door doesn't move it. Pinned in Task 5.

---

### Task 1: YouTube card

**Files:**
- Create: `src/components/mdx/YouTube.astro`, `src/scripts/video-card.ts`, `tests/unit/youtube.test.ts`, `tests/e2e/video-card.spec.ts`
- Modify: `src/styles/themes/hp.css` (the `--vid-*` tokens), `src/content/posts/top-concertvids.mdx` (import only, plus `title`/`caption` on each embed), `src/content/posts/on-new-zealand-music.mdx` (import; `Title=` → `title=`), `package.json` and `package-lock.json` (remove `@astro-community/astro-embed-youtube`)

**Interfaces:**
- Produces: `YouTube.astro` with props `{ id: string; title: string; caption?: string }`. MDX imports it as `import YouTube from "@components/mdx/YouTube.astro";`.
- Markup: `<figure class="video">` → `<a class="vid" href="https://www.youtube.com/watch?v={id}" data-video-id={id} data-video-title={title} aria-label="Play video: {title}">` (play button and "Video · YouTube" label inside, both `aria-hidden`) → `<figcaption>` only when `caption` is set.

- [ ] **Step 1: Write the failing component tests** in `tests/unit/youtube.test.ts` (AstroContainer, as in `site-components.test.ts`):
  - `"links to YouTube with an accessible name"`: the props `{ id: "u7T64Qo3bdU", title: "Lorde, Royals, live 2013" }` give `href="https://www.youtube.com/watch?v=u7T64Qo3bdU"` and `aria-label="Play video: Lorde, Royals, live 2013"`.
  - `"makes no requests to YouTube before a click"`: the HTML contains no `<iframe`, no `<img`, no `ytimg` and no `youtube-nocookie`.
  - `"caption is optional"`: no `<figcaption` without `caption`; with `caption: "Lorde — Royals, live 2013"`, a figcaption with that text.
- [ ] **Step 2: Run** `npm test -- youtube`. Expected: FAIL (the module isn't found).
- [ ] **Step 3: Implement `YouTube.astro`.** Values come from the `.vid` figure in `Site-Life-Post.dc.html`:
  - navy box `aspect-ratio: 16/9`, 2px border, grid grain;
  - `6px 6px 0` blue shadow, becoming `9px` orange with a `-2px` lift on hover and `2px` with a `3px` press on `:active`;
  - 76px orange play circle that scales to 1.06 on hover;
  - white "Video · YouTube" label at `left 14px; bottom 12px`, rotated `-1.5deg`;
  - caption in 13px mono, muted, centred.

  Every colour and font goes through a `--vid-*` custom property with the HP value as its `var()` fallback, and `hp.css` sets the same values. Reduced motion turns off the transitions and transforms. Style the iframe that `video-card.ts` inserts with `.video :global(iframe)` (block, `width: 100%`, `aspect-ratio: 16/9`, same border, no shadow). Include `<script>import "../../scripts/video-card";</script>`.
- [ ] **Step 4: Implement `src/scripts/video-card.ts`.** Add one delegated `click` listener on `document` for `a.vid[data-video-id]`:
  - Return early (let the browser handle it) when `event.defaultPrevented`, `button !== 0`, or any of `ctrlKey`, `metaKey`, `shiftKey` or `altKey` is set.
  - Otherwise `preventDefault()`, then replace the anchor with an `iframe`:
    - `src="https://www.youtube-nocookie.com/embed/{id}?autoplay=1"`
    - `title={data-video-title}`
    - `allow="autoplay; encrypted-media; picture-in-picture; fullscreen"`
    - `allowfullscreen`
    - `referrerpolicy="strict-origin-when-cross-origin"`
  - Then move focus to the iframe.
- [ ] **Step 5: Run** `npm test -- youtube`. Expected: PASS.
- [ ] **Step 6: Switch both posts to the new component.**
  - In `top-concertvids.mdx`, replace the package import. Give the five embeds `title` and `caption`, verbatim from the board's `aria-label` (minus "Play video: ") and `<figcaption>`. Lorde gets `title="Lorde, Royals, live 2013" caption="Lorde — Royals, live 2013"`, and so on through Green Day. Don't move the embeds yet (Task 3).
  - In `on-new-zealand-music.mdx`, replace the import and rename the three `Title=` props to `title=`.
  - Run `npm uninstall @astro-community/astro-embed-youtube`.
  - `grep -rn astro-embed src package.json` must return nothing.
- [ ] **Step 7: Write the e2e tests** in `tests/e2e/video-card.spec.ts` against `/life/top-concertvids` (still legacy-rendered, but the card is ours). Use `page.route(/youtube-nocookie\.com/, (r) => r.abort())` so no test needs the network.
  - `"no YouTube requests before a click"`: record every request URL from `goto` until load finishes, then expect none to match `/youtube\.com|ytimg\.com|youtube-nocookie\.com|googlevideo/`.
  - `"clicking a card swaps in the nocookie player"`: click the first `a.vid`. Expect a `.video iframe` whose `src` is `https://www.youtube-nocookie.com/embed/u7T64Qo3bdU?autoplay=1` and that is focused, and expect the first figure to have no `a.vid` left.
  - `"modifier-click leaves the link alone"`: `click({ modifiers: ["ControlOrMeta"] })` on the first card; expect `a.vid` count unchanged and no iframe. Close any popup page the click opened.
  - `"without JS the card is a YouTube link"`: `test.use({ javaScriptEnabled: false })` in a `describe` block. Expect the first `a.vid` `href` to be `https://www.youtube.com/watch?v=u7T64Qo3bdU`.
  - `"NZ Music cards have titles"`: on `/meditations/on-new-zealand-music`, every `a.vid` has an `aria-label` starting `Play video: ` and longer than 12 characters.
- [ ] **Step 8: Run** `npm run build && npm run test:e2e -- video-card`. Expected: PASS. Also run `npm test`. Expected: PASS.
- [ ] **Step 9: Commit:** `feat(youtube): own click-to-load YouTube card; drop astro-embed-youtube`.

### Task 2: Life listing, `ListingBand`, `PostRow`

**Files:**
- Create: `src/components/hp/ListingBand.astro`, `src/components/hp/PostRow.astro`, `tests/unit/hp-components.test.ts`, `tests/e2e/life.spec.ts`
- Modify: `src/data/sections.ts` (add `unit`), `src/lib/posts.ts` (add `countLabel`), `tests/unit/posts.test.ts`, `src/components/site/Dymo.astro` (accept `class`), `src/pages/life/index.astro`, `src/pages/404.astro`

**Interfaces:**
- Produces:
  - `SectionInfo.unit: string` holds `"post"` for code and life and `"meditation"` for on.
  - `countLabel(section: Section, count: number): string` returns `plural(count, SECTIONS[section].unit)`, for example `"4 meditations"`.
  - `Dymo` takes an optional `class?: string`, merged into `class:list`, so a parent's scoped class can size it.
  - `ListingBand.astro` takes the props `{ headingId: string; label: string; title: string; lede?: string; intro?: string; wash?: boolean /* default true */; variant?: "section" | "message" /* default "section" */ }` and a named slot `lede` that, when used, replaces the `lede` prop inside the same `<p class="lede">`.
  - `PostRow.astro` takes the props `{ post: PostEntry; chip?: boolean /* show SectionChip, for tag pages */ }`.

- [ ] **Step 1: Write the failing unit tests.**
  - In `posts.test.ts`, `"countLabel uses the section's unit"`: `countLabel("on", 4)` is `"4 meditations"`, `countLabel("life", 1)` is `"1 post"`, and `countLabel("code", 2)` is `"2 posts"`.
  - In `hp-components.test.ts`, pass a fake post cast to `PostEntry`: `{ id: "top-concertvids", body: "word ".repeat(1200), data: { title: "Concert vids", description: "Briefly…", pubDate: new Date("2024-05-17"), section: "life", tags: ["music"] } }`.
    - `"PostRow shows date, reading time, title link, description and tags"`: `datetime="2024-05-17"`, `17 May 2024`, `6 min read`, `href="/life/top-concertvids"`, the description, and `href="/tags/music"`.
    - `"PostRow hides the tag row for an untagged post"`: with `tags: []`, no `tag-links`.
    - `"PostRow adds the section chip on request"`: with `chip: true`, the HTML matches `/>\s*Life\s*</` inside a `chip` element.
    - `"ListingBand omits an empty intro"`: with `intro: undefined`, no `class="intro"` element.
    - `"ListingBand without wash"`: with `wash: false`, no `wash` element.
- [ ] **Step 2: Run** `npm test`. Expected: the new tests FAIL.
- [ ] **Step 3: Implement** `unit`, `countLabel`, the `Dymo` `class` prop, `ListingBand` and `PostRow`.
  - **`ListingBand`** takes its values from the `<section aria-labelledby="life-h">` band in `Site-Life-List.dc.html`: plus marks on the left 54% (opacity .55), wash 58% wide (opacity .85, `.wash` mask, `.wash-grain`), padding `88px 24px 72px`, 20px gap, navy `Dymo` with `as="p"`, H1 Fraunces 800 120px/0.9 `-0.045em`, lede 28px italic (max 560px), intro 18px muted (max `52ch`), 2px navy bottom rule. At 760px and below: padding `52px 20px 44px`, H1 72px, lede 22px, wash 100%.
  - **`variant="message"`** keeps the 404's current H1 rule (`clamp(48px, 9vw, 96px)`, `max-width: 12ch`, `-0.03em`, `word-spacing: 0.06em`, `line-height: 0.95`, `text-wrap: balance`) and drops the bottom rule.
  - **Plus-pattern ids** are made unique per instance from `headingId`.
  - **`PostRow`** takes its values from `article.entry.row` in the same board:
    - grid `170px minmax(0,1fr)`, gap 32px, padding `28px 12px`, dashed bottom rule;
    - left: `<time>` bold navy and `"{readingTime(post.body ?? '')} min read"`;
    - right: `<h3>` 30px title link (`postUrl`), 20px italic description, `TagLinks theme="hp"`;
    - hover: blue tint, plus a 3px orange underline on the title; `:active` orange tint;
    - at 760px and below: single column, gap 8px, padding `22px 4px`, title 25px;
    - with `chip`, a `SectionChip` above the title.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Rewrite `src/pages/life/index.astro`** on `HpLayout`:
  - title `Life — sasky.nz`, description `SECTIONS.life.blurb`;
  - `ListingBand`: `headingId="life-h"`, `label={`${countLabel("life", count)} · since ${formatMonthYear(since)}`}`, `title={SECTIONS.life.title}`, `lede={SECTIONS.life.blurb}`, `intro={SECTIONS.life.intro}`;
  - then a section (max-width 900px, padding `64px 24px 112px`, `40px 20px 72px` at 760px and below) with the mono h2 "Every Life post, newest first", a 2px navy top rule, and one `PostRow` per `getPosts("life")` post.
- [ ] **Step 6: Move `404.astro` onto `ListingBand`.** Use `wash={false}`, `variant="message"`, `label="404"`, the existing H1 text, and its linked lede in the `lede` slot. Delete the page's own band CSS.
- [ ] **Step 7: Write `tests/e2e/life.spec.ts`:**
  - `"Life listing heading, count and rows"`: on `/life`, the h1 is `Life`; `.dymo` has the text `1 post · since May 2024`; h2 `Every Life post, newest first`; one `article` whose title link `href` is `/life/top-concertvids`; and the page body doesn't contain `[`.
  - `"Life listing loads only HP styles"`: reuse the stylesheet check from `chrome.spec.ts`. Move it into `tests/e2e/helpers/chrome.ts` as `expectOnlyThemeCss(page, request, "hp", allowedFamilies: RegExp)` and use it from both specs.
  - `"Life nav link is current"`: `.site-nav-link[href="/life"]` has `aria-current="page"`.
- [ ] **Step 8: Run** `npm run build && npm run test:e2e && npm test`. Expected: PASS, including the 404 tests in `chrome.spec.ts`.
- [ ] **Step 9: Commit:** `feat(life): HP Life listing with ListingBand and PostRow; 404 on ListingBand`.

### Task 3: Life post and the concert post edits

**Files:**
- Create: `src/components/hp/PostHeader.astro`, `src/components/hp/HpPrevNext.astro`
- Modify: `src/styles/themes/hp.css` (`.prose-life`), `src/pages/life/[slug].astro`, `src/content/posts/top-concertvids.mdx`, `tests/unit/hp-components.test.ts`, `tests/e2e/life.spec.ts`

**Interfaces:**
- Consumes: `YouTube` (Task 1); `neighbours()`, `readingTime()`, `formatDateLong()`, `formatDateISO()`.
- Produces:
  - `PostHeader.astro`: `{ section: Section; title: string; description: string; pubDate: Date; minutes: number }`.
  - `HpPrevNext.astro`: `{ section: Section; older?: PostEntry }`.

- [ ] **Step 1: Write the failing component tests** in `hp-components.test.ts`:
  - `"HpPrevNext without an older post shows only All Life posts"`: `{ section: "life" }` has exactly one `<a`, with `href="/life"`, the text `All Life posts` and `Life →`. There's no `Older in Life`.
  - `"HpPrevNext with an older post links it first"`: `older` is the fake post, giving `← Older in Life`, the post title and `href="/life/top-concertvids"` before `href="/life"`.
  - `"PostHeader breadcrumb and meta"`: links `href="/"` (text `sasky.nz`) and `href="/life"` (text `Life`) inside `nav[aria-label="Breadcrumb"]`, `<h1>` with the title, `datetime="2024-05-17"`, and `6 min read`.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement** `PostHeader` and `HpPrevNext`, with values from `Site-Life-Post.dc.html`.
  - **`PostHeader`:**
    - mono 13px breadcrumb with 44px link targets; the section link is blue and underlined;
    - H1 64px/1.02, 800 weight, `-0.035em`, balanced; lede 25px italic;
    - meta row: 2px navy rules above and below, `14px 0` padding, then date, an 8px orange diamond (`aria-hidden`) and the read time;
    - 48px bottom margin;
    - at 760px and below: H1 40px, lede 20px.
  - **`HpPrevNext`** is `nav[aria-label="More in {label}"]`:
    - grid `repeat(auto-fit, minmax(min(280px,100%),1fr))`, gap 24px, `margin-top: 56px; padding-top: 40px`, 2px navy top rule;
    - `.more` cards: hover gets a 6px blue shadow, a `-2px` lift and an underlined title; `:active` gets a 2px orange shadow and a `1px` press;
    - the right card is right-aligned;
    - reduced motion turns off the lift.
- [ ] **Step 4: Add `.prose-life` to `hp.css`** (scoped under `:where([data-theme="hp"]) .prose-life`). Values from the board's `.body`:
  - Fraunces 21px/1.65, `#1d2150`;
  - `> * + * { margin-top: 26px }`, `p { text-wrap: pretty }`;
  - `h2`: 32px/1.2, 800, `-0.02em`, `margin-top: 56px`, flex with 16px gap, and a `::before` 13px square that's orange with a `4px 4px 0` blue shadow, rotated `-8deg`, `margin-top: 12px`;
  - `blockquote`: `margin: 44px 0`, `padding-left: 52px`, relative, with a `::before` `*` at 72px/900 in orange at `top: -10px`; its `p` is 34px/1.25 600 italic `-0.015em` navy;
  - `strong`: navy 800;
  - `.ps`: Source Sans 17px muted;
  - `.video`: no extra rules.
  - At 760px and below: body 19px, `blockquote p` 26px, `h2` 26px.
- [ ] **Step 5: Rewrite `src/pages/life/[slug].astro`** on `HpLayout`:
  - `title="{post title} — Life — sasky.nz"`, `description={metaDescription ?? description}`, `ogType="article"`, `texture={0.6}`;
  - `<article>` holds `PostHeader`, `<div class="prose-life"><Content /></div>`, then `TagLinks theme="hp"` (40px top margin), then `HpPrevNext` with `older` from `neighbours(await getPosts("life"), post.id)`;
  - main column `max-width: 748px`, padding `72px 24px 96px`, and `40px 20px 72px` at 760px and below.
- [ ] **Step 6: Apply the remaining spec 5.10 concert edits** to `top-concertvids.mdx`. They change markup only; keep every word:
  1. "Some people say I'm a dreamer, but I'm not the only one." becomes a `>` blockquote.
  2. Move each `<YouTube …/>` to sit directly **after** its `##` heading, with a blank line either side.
  3. "Cam out" becomes `**Cam out**`.
  4. Wrap the P.S. as `<p class="ps">P.S. check out this <a href="https://www.youtube.com/watch?v=63a3m-DZMVM">vid</a> to see Ninjas Kata in all it's glory</p>`.
- [ ] **Step 7: Add e2e tests** to `life.spec.ts`:
  - `"concert post order: heading, card, caption, text"`: for each `.prose-life h2`, the next element sibling is `figure.video` containing `a.vid` and `figcaption`, and the one after that is a `p`.
  - `"concert post has the pull quote, sign-off and P.S."`: `.prose-life blockquote` has the text `Some people say I'm a dreamer, but I'm not the only one.`; `strong` has `Cam out`; `.ps` exists.
  - `"More in Life shows only All Life posts"`: `nav[aria-label="More in Life"] a` has count 1 and `href` `/life`.
  - `"Life post section link is aria-current=true"`.
  - `"no horizontal overflow at 390"`: at viewport 390×844, `document.documentElement.scrollWidth <= 390`.
- [ ] **Step 8: Run** `npm run build && npm run test:e2e && npm test && npm run check:links`. Expected: PASS.
- [ ] **Step 9: Commit:** `feat(life): HP Life post template; concert post markup per spec 5.10`.

### Task 4: Home hero, About, and the page switch

**Files:**
- Create: `src/assets/hero/portrait-cutout.webp`, `src/assets/hero/mask-silhouette.png`, `src/assets/hero/mask-jacket-stripes.png` (copied from `design-handoff/design/assets/`), `src/components/hp/Hero.astro`, `src/components/hp/AboutSection.astro`, `tests/e2e/home.spec.ts`
- Modify: `src/layouts/HpLayout.astro` (forward a `head` slot), `src/pages/index.astro`, `tests/e2e/phase2.spec.ts`

**Interfaces:**
- Consumes: `hero` and `about` from `src/data/home.ts`; `Dymo` with `class` (Task 2).
- Produces: `index.astro` with a `<div class="home-sections">` (max 1120px, padding `64px 24px 112px`, flex column, gap 96px; `48px 20px 80px` with a 72px gap at 760px and below) that Tasks 5 and 6 append to.

- [ ] **Step 1: Write the e2e tests** in `tests/e2e/home.spec.ts`:
  - `"Home hero"`: title `sasky.nz — Home`; one `h1` with the text `Hello, welcome to my little corner of the internet` and an `em` `little corner`; the lede text is `Hello, I’m Cameron. International man of leisure`.
  - `"About lists every hobby and statement"`: `#about` exists, `#about .hobbies li` has count `about.hobbies.length` (24), `#about .statements li` has count 4.
  - `"hero portrait has a srcset and stays within the needed width"`: the `img` in `.hero` has `srcset` containing `480w`, `760w`, `1000w` and `1527w`, `loading="eager"`, `fetchpriority="high"` and an empty `alt`. At viewport 1280, `naturalWidth <= 1527`.
  - `"Home loads only HP styles plus the door fonts"`: `expectOnlyThemeCss(page, request, "hp", /Fraunces|Source Sans 3|JetBrains Mono|Holtwood One SC|Oswald/)`, and preload links are at most 2.
  - `"Home top bar"`: `expectTopBarGeometry` at 1280 (24) and 390 (16), `expectTabOrder`, `expectInertTexture`, and `.site-wordmark` has `aria-current="page"`.
  - `"no horizontal overflow at 390"`: `scrollWidth <= 390`.
  - `"390 layout stacks the hero"`: at 390, `.hero-label-float` is hidden and `.hero-label-inline` is visible.
- [ ] **Step 2: Run** `npm run build && npm run test:e2e -- home`. Expected: FAIL.
- [ ] **Step 3: Forward a head slot in `HpLayout`.** Add `<slot name="head" />` inside its existing `<Fragment slot="head">`, after the three `<Font>`s.
- [ ] **Step 4: Implement `Hero.astro`.** Values come from `section.hero` in `Site-Home.dc.html` and spec 6.2 / 5.8.
  - **The media layer** is `aria-hidden` and holds the four layers in order: plus pattern, wash, portrait box, then name label.
  - **Assets:** import the three images from `@assets/hero/`. Pass the masks as `style={`--mask-sil: url(${sil.src}); --mask-jacket: url(${jacket.src})`}` on the portrait box.
  - **Portrait:** `<Image src={portrait} widths={[480, 760, 1000, 1527]} sizes="(max-width: 760px) 100vw, 60vw" alt="" loading="eager" fetchpriority="high" />`.
  - **Classes:** `hero-label-float` for the rotated navy Dymo (14px, `min-height: 40px`, `padding: 6px 16px`, `rotate(2.5deg)`, `left: 50%; bottom: 92px`) and `hero-label-inline` for the 390px label row (orange square + uppercase 14px).
  - **The 760px rules** come from the board's media block: stack, media 480px, portrait centred with no mask, wash full width, plus marks and float label hidden, inline label shown, H1 44px, lede 21px, copy padding `0 20px 56px`.
  - **Pattern id** is unique (`hero-plus`).
- [ ] **Step 5: Implement `AboutSection.astro`.** It's `<section id="about" aria-labelledby="about-h">` with an sr-only `h2` "About" and the two-column grid from the board.
  - **Hobbies:** a `ul.hobbies` with the board's `.dymo li` rhythm (odd `-1.2deg`, 4n `1.4deg`, 3n+2 blue, 5n+4 orange with navy text). Long items must wrap (`overflow-wrap: anywhere`) and not overflow at 390.
  - **Statements:** a `ul.statements` with the 40px orange Fraunces asterisks.
  - **Headings:** both `h3`s are 36px, from `about.hobbiesHeading` and `about.workHeading`.
- [ ] **Step 6: Rewrite `src/pages/index.astro`** on `HpLayout`:
  - title `sasky.nz — Home`, description `Personal and professional website of Cameron Grant`;
  - in the `head` slot: `<Font cssVariable="--font-holtwood" />` and `<Font cssVariable="--font-oswald" />`;
  - body: `Hero`, then `div.home-sections` holding `AboutSection`.
- [ ] **Step 7: Update `phase2.spec.ts`.** Delete `"Home keeps its site title"`. In `"a post's menu link returns to its entry on Home"`, keep only the assertion on the post's `a.header-link` `href` and rename the test `"legacy post header still links Home"`. Nothing on the new Home renders the legacy `#code-…` anchors.
- [ ] **Step 8: Run** `npm run build && npm run test:e2e && npm test && npm run check:links`. Expected: PASS.
- [ ] **Step 9: Commit:** `feat(home): HP Home with hero and About`.

### Task 5: Section doors

**Files:**
- Create: `src/components/hp/SectionDoors.astro`, `src/components/hp/Door.astro`, `src/components/hp/CodePreview.astro`, `src/components/hp/LifePreview.astro`, `src/components/hp/OnPreview.astro`
- Modify: `src/pages/index.astro`, `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: `countLabel`, `sectionStats`, `postUrl`, `formatDateLong`, `formatDateISO`, `SECTIONS`, `Manicule` (`dir: "left" | "right"`), `Dymo`.
- Produces: `SectionDoors.astro` props `{ doors: { section: Section; count: number; latest?: PostEntry }[] }`. `Door.astro` props `{ section: Section; count: number; latest?: PostEntry }`. The preview slot is chosen by section.

- [ ] **Step 1: Write the e2e tests** in `home.spec.ts`:
  - `"doors show computed counts and latest posts"`:
    - the three `a.door` have `href`s `/code`, `/life` and `/meditations`;
    - their count Dymos read `2 posts`, `1 post` and `4 meditations`;
    - the On door's latest title is the newest On post's title (`On being in the moment vs past and future` today; read it from `/meditations`' first row in the test rather than hard-coding it);
    - each door's accessible name starts with its sr-only `Code: `, `Life: ` or `On: ` prefix and contains `Enter`.
  - `"door previews are hidden from assistive tech"`: every `.door-preview` has `aria-hidden="true"`.
  - `"reduced motion: no blink, no lift"`: `page.emulateMedia({ reducedMotion: "reduce" })`. The `.cursor` computed `animation-name` is `none`. Hovering the first door leaves its `transform` at `none`.
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Implement the five components.** Values come from the `section[aria-labelledby="doors-h"]` block of `Site-Home.dc.html`.
  - **`SectionDoors`:** `h2` "Sections" at 48px (38px at 760px and below), then the scroller (`overflow-x: auto`, `scroll-snap-type: x mandatory`, the board's negative-margin/padding trick so the shadows aren't clipped, thin scrollbar).
  - **`Door`:**
    - `flex: 1 0 300px`, `scroll-snap-align: start`, 2px navy border, `--card` background;
    - shadows: `6px` blue, then `9px` orange with a `-2px` lift on hover, then `2px` with a `3px` press on `:active`;
    - the count `Dymo` at `top: -16px; right: 18px`, `aria-hidden`; tone is navy, blue or orange by section, tilts `2`, `-2` and `1.5`;
    - then the 168px preview, the blurb with an sr-only `{label}: ` prefix, "Latest · `<time>`" with the title, and "Enter {label} →" (the underline shows on door hover).
  - **Previews** are each wrapped in `span.door-preview` with `aria-hidden="true"` and are purely decorative:
    - **Code:** `cam@sasky:~$ cd code` plus `#Code` with the blinking `.cursor`. JetBrains Mono 800 and the `.gl-code` background.
    - **Life:** the graph plus a 62% `.gl-life-wash`, the orange/blue mark and "Life".
    - **On:** `Manicule` "Now showing" `Manicule`, then `SECTIONS.on.title` in Holtwood One SC with the `.inline` text-shadow, then the double rule. Oswald 600 and `.gl-on`.
  - **Reduced motion:** turns off the cursor animation, the door transitions and the transforms.
- [ ] **Step 4: Wire the doors into `index.astro`.** Build `doors` from `SECTION_ORDER.map(async (s) => ({ section: s, ...sectionStats(await getPosts(s)) }))` and render `SectionDoors` after `AboutSection`.
- [ ] **Step 5: Run** `npm run build && npm run test:e2e -- home && npm run check:links`. Expected: PASS, including the 390 overflow test (the scroller must contain its own overflow).
- [ ] **Step 6: Commit:** `feat(home): section doors with computed counts and latest posts`.

### Task 6: Tag selector

**Files:**
- Create: `src/components/hp/TagSelector.astro`, `src/scripts/tag-selector.ts`
- Modify: `src/pages/index.astro`, `tests/unit/hp-components.test.ts`, `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: `buildTagIndex()` output `{ tag: string; count: number; posts: PostEntry[] }[]`; `SectionChip`; `plural`; `postUrl`; `formatDateLong`; `formatDateISO`.
- Produces: `TagSelector.astro` props `{ index: { tag: string; count: number; posts: PostEntry[] }[] }`. The first entry is the default tag. The markup contract with the script:
  - `section#tags[data-tag-selector]`
  - chips `a.tg-chip[data-tag][href="/tags/{tag}"][aria-label="{tag}, {plural(count,'post')}"]`; the default chip has `data-selected`
  - the summary `p.tg-summary[aria-live="polite"]`
  - lists `ul.tg-list[data-tag-list="{tag}"][data-summary="{plural(count,'post')} tagged {tag}"]`, all `hidden` except the default

- [ ] **Step 1: Write the failing component tests** in `hp-components.test.ts`. The index has two entries: `music` (2 fake posts across `on` and `life`) and `pico8` (1 `code` post).
  - `"TagSelector without JS: links, default list visible"`: `href="/tags/music"` and `href="/tags/pico8"`; the `music` list has no `hidden`; the `pico8` list has `hidden`; the summary reads `2 posts tagged music`.
  - `"TagSelector singular summary"`: `data-summary="1 post tagged pico8"`.
  - `"TagSelector rows show the section chip, title and date"`: the music list contains a chip `On` and a chip `Life`, each post's `href`, and a `<time datetime=…>`.
  - `"TagSelector renders no ids inside the lists"`: the `<ul class="tg-list"…>` blocks contain no `id=` attributes.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement `TagSelector.astro`.** Values come from `TagSelector.dc.html`:
  - **Card:** `--card`, 2px navy border, `8px 8px 0` blue shadow, padding `36px 40px 30px` (`26px 18px 20px` with a 22px gap at 760px and below), 28px gap.
  - **Text:** `h2#tags-h` "Browse by tag" at 48px (38px at 760px and below); the intro line "Tags run across Code, Life and On. Pick one to see every post with it." at 20px italic.
  - **Chips** sit in a `role="group" aria-label="Tags"`:
    - selected: navy fill, white text, `rotate(-1.5deg)`, orange count;
    - unselected: outlined, with a faint navy count and a blue-tint hover;
    - `:active` moves `translate: 0 1px`;
    - the count `span` is `aria-hidden`.
  - **Rows:** a `SectionChip`, a 22px Fraunces 700 title (flex `1 1 280px`) and a mono date, with a dashed rule, a blue-tint hover and an underlined title. Padding is `14px 8px`, or `12px 4px` at 760px and below.
  - **Script:** include `<script>import "../../scripts/tag-selector";</script>`.
- [ ] **Step 4: Implement `src/scripts/tag-selector.ts`.** For each `[data-tag-selector]`:
  - Replace each `a.tg-chip` with a `button type="button"` that keeps its class, `data-tag`, `aria-label` and children, with `aria-pressed` `"true"` on the `data-selected` chip and `"false"` on the rest.
  - On a click, select that tag:
    - set `aria-pressed` on every chip;
    - toggle `hidden` on each `ul.tg-list` by matching `data-tag-list`;
    - set the summary's `textContent` to that list's `data-summary`.
  - Style the selected state in the component with `[aria-pressed="true"], a[data-selected]` so the no-JS default looks selected too.
- [ ] **Step 5: Run** `npm test`. Expected: PASS.
- [ ] **Step 6: Wire it into `index.astro`.** After `SectionDoors`, render `<TagSelector index={buildTagIndex(await getPosts())} />`.
- [ ] **Step 7: Add the e2e tests** to `home.spec.ts`:
  - `"picking a tag updates pressed state, list and summary"`:
    - read the second chip's `data-tag` as `t` and click it;
    - exactly one `[aria-pressed="true"]`, and it's that chip;
    - the visible `ul.tg-list` has `data-tag-list` `t`;
    - the summary equals that list's `data-summary`;
    - pressing `Enter` on the first chip, when focused, switches back.
  - `"without JS: default list visible, chips link to tag pages"`: in a `describe` with `javaScriptEnabled: false`:
    - chips are `a` elements with `href` `/tags/…`;
    - exactly one `ul.tg-list` is visible, and it's the first chip's tag;
    - following the second chip's link reaches a 200 page.
  - `"no duplicate ids on Home"`: collect `[id]` values and expect them to have no duplicates.
  - `"#tags anchor exists"`: `#tags` is attached.
- [ ] **Step 8: Run** `npm run build && npm run test:e2e && npm test && npm run check:links`. Expected: PASS.
- [ ] **Step 9: Commit:** `feat(home): browse-by-tag selector that works without JS`.

### Task 7: Phase checks and roadmap

**Files:**
- Modify: `docs/redesign-roadmap.md`, `docs/redesign-plan.md` (tick 4.1–4.4)

- [ ] **Step 1: Run the full suite:** `npm run check && npm test && npm run build && npm run check:links && npm run test:e2e`. Expected: all pass, with no `astro check` errors.
- [ ] **Step 2: Check the redirects locally.** Run `npx netlify-cli dev --offline --dir dist --port 8888`, then `npm run check:redirects -- --url http://localhost:8888`. Expected: PASS. Then curl `/about` and `/tags`, check that they 301 to `/#about` and `/#tags`, and check that both ids exist in `dist/index.html`.
- [ ] **Step 3: Grep the build** for leftovers. Search `dist/index.html`, `dist/life.html` and `dist/life/top-concertvids.html` for `\[` placeholder copy, `astro-embed`, `ytimg` and `lite-youtube`. Expected: no matches.
- [ ] **Step 4: Update the roadmap:**
  - mark Phase 4's tasks done;
  - list the "Calls made in place of a brainstorm" for Cam's detailed review;
  - move the Phase 4 carry-forwards out (the `#about`/`#tags` anchors are done);
  - add to Phase 7: the tag page reuses `ListingBand`, `PostRow chip`;
  - add to Phase 6: set the On `--vid-*` tokens;
  - refresh "Resuming in a fresh session" (live pages: Home and Life are on HP; next is Phase 5).
- [ ] **Step 5: Commit:** `docs: Phase 4 done`. Then follow the finish steps in the roadmap: verification, one fresh reviewer, and a PR into `feature/redesign`.
