# Phase 6: On Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move `/meditations` and `/meditations/[slug]` onto the Sideshow handbill theme: a bill-framed listing with a headliner and the programme, posts with computed Roman tip numerals, and On-styled prose and video cards.

**Architecture:**
- **Pages** use `OnLayout`. On page parts live in a new `src/components/on/`; the one MDX component the posts use (`Ornament`) lives in `src/components/mdx/` and is token-only.
- **Tip numerals:** a Sätteri hast plugin (`src/markdown/on-tips.ts`) registered with `markdown.processor: satteri({ hastPlugins: [onTips] })`, which MDX inherits. It rewrites `## N. text` in On posts only, and leaves the DOM flat (spec 6.4).
- **Prose:** `.prose-on` in `on.css` has two modes. With `h2.tip` present (`:has()`), it's the numbered list; otherwise it's the G1 essay styles.

**Tech Stack:** Astro 7.3.4, `@astrojs/markdown-satteri` 0.4.2 (`satteri` 0.10), Vitest 5, Playwright 1.64.

**Spec:**
- [`docs/redesign-plan.md`](../../redesign-plan.md): 5.6 (components and helpers), 5.10 (Classy row), 5.15, 5.16 (titles), 6.4, G1, G2, G6, G7 (On), G8, R2, R11, and tasks 6.1–6.3. It wins on conflicts.
- Design values: `design-handoff/design/Site-On-List.dc.html` and `Site-On-Post.dc.html`.
- Roadmap carry-forwards for Phase 6 (see `docs/redesign-roadmap.md`, "Carried forward"):
  - the lasting chrome checks;
  - On `--vid-*` tokens, plus `--vid-grain` and `--vid-play-shadow`;
  - reuse `Manicule`;
  - the `home.spec.ts` and `phase2.spec.ts` selectors that read legacy On markup;
  - `OnFooter` placements and `--mark-margin`;
  - the neutral fence-line rule;
  - ligatures;
  - and `excerpt()` skipping lists, quotes and MDX comments.

## Calls made in place of a brainstorm

Cam's standing preference is to skip the brainstorm Q&A and review these calls with the PR.

1. **Breakpoints:** the boards switch at 820px; we use 760px, because the global constraint allows only 480, 760 and 900.
2. **Tip heading ids** follow the rendered text. Sätteri's heading-id plugin runs after `onTips`, so Classy's anchors become `#i-never-run-in-the-rain` instead of `#1-never-run-in-the-rain`. Nothing links to them today.
3. **Footer placements:**
   - The correspondence row becomes its own component, `OnCorrespondence`.
   - `OnFooter placement="after"` renders the row and the colophon, as now. `placement="inside"` renders only the colophon, and the listing puts `OnCorrespondence` inside its bill, as the board does.
   - `OnLayout` gets a `footer` prop (default `"after"`).
4. **G2 video card for On:**
   - The card is light paper (`--light`) with a fine ink halftone (`--vid-grain`) in place of HP's grid.
   - It has a 2px ink frame and a `6px 6px 0` ink shadow that turns rust on hover.
   - The play button is ink with a kraft triangle and no drop shadow (`--vid-play-shadow: none`).
   - The label is kraft with ink text in Oswald; the caption is Oswald in `--muted`.

   The spec names the ink frame, ink shadow, ink button, kraft triangle and kraft label; the paper background and halftone are my call, because an ink background would hide the ink button.
5. **G1 details beyond the spec:**
   - `####` (NZ Music's closing line) is Oswald 600, uppercase, 18px, with `.12em` tracking.
   - Spacing is 20px between blocks, 44px above `##` and 32px above `###`/`####`.
   - Links are ink, underlined.
6. **Post subtitle (the description):** 31px uppercase, as on the board, when it's 60 characters or fewer. Longer descriptions (NZ Music, the Moment, Happiness) show in full, in sentence case at 22px/1.4, weight 500, so they don't become a wall of capitals. This uses the same 60-character threshold as G6. The listing's headliner description keeps the spec's uppercase 26px.
7. **Drop cap:** the first paragraph of every On post gets it, as the spec says. In NZ Music that paragraph is a link, so the drop cap is the link's "W".
8. **Ligatures** stay at the default on On pages. The Code problem was JetBrains Mono's programming ligatures (`-->` into an arrow). The handbill faces have only standard typographic ligatures, and the 1280 screenshots are checked for stray substitutions.
9. **"Also Appearing"** lists every meditation except the headliner, newest first, as on the board (today: III, II, I).
10. **G7 for On:** a post with one neighbour shows that single card centred at half the grid's width; "☞ The Full Programme of Meditations ☜" always shows.
11. **Untagged posts** (Classy today) hide the whole "Filed under" row; "Finis" still shows.
12. **Content edits** stay within spec 5.10: Classy's tip 5 parenthetical becomes `<small>…</small>`, and `<Ornament />` (with its import) goes between tips 5 and 6. NZ Music's `Title=` fix was already made in Phase 2.
13. **`excerpt()`** now skips list, blockquote and MDX-comment blocks and strips backticks (carry-forward). No On post needs it today, but the headliner excerpt would otherwise break the first time a post opens with a quote.

## Global Constraints

- Astro 7 APIs only, no UI framework, no new client JS (the video card script already exists).
- **Design values** come from the two On boards, converted to scoped CSS and custom properties; never paste inline styles. `{{texture}}` is `.85`. The `.inline` double shadow is `2px 2px 0 var(--kraft), 4px 4px 0 var(--ink-on)`.
- **Computed values:**
  - ordinals and numerals: `seriesNumber`, `ordinalWord`, `toRoman`;
  - counts: "4 meditations" via `countLabel`;
  - "since June 2026";
  - dates: `formatDateOn` / `formatDateOnShort`;
  - the headliner: `sectionStats().latest`;
  - excerpts: `excerpt` or the frontmatter `excerpt`;
  - neighbours: `neighbours`;
  - the colophon year: `toRoman`.

  Nothing is hard-coded.
- **Dates** use the UTC helpers in `src/lib/format.ts`; `npm test` runs under `TZ=America/Los_Angeles`.
- **Theme isolation:** On pages load only `on.css` and Holtwood One SC, Alfa Slab One, Rye and Oswald. Shared components and `src/components/mdx/` stay token-only (`mdx-isolation.test.ts`).
- **Breakpoints:** 480, 760 and 900 only.
- **Accessibility:**
  - 44px targets;
  - visible `:focus-visible` (2px ink);
  - `aria-current` comes from `TopBar`;
  - ornaments, rules, manicules, fleurons, the Eye and the programme numerals are `aria-hidden`;
  - under `prefers-reduced-motion: reduce`, hover transitions are off.
- **Headings:** `h1` is the page title; listing sections are `h2` (`#headliner`, `#also`); post body headings keep their Markdown levels.
- **Placeholders:** no `[bracketed]` copy. The intro comes from `SECTIONS.on.intro`.
- **Content:** no post copy changes beyond call 12.
- **URLs:** build them with `postUrl()` and `SECTIONS.on.path`; never hand-write `/meditations`.
- **Branch:** `redesign/phase-6-on-pages`, cut from `feature/redesign`. Commit as `sasky` / `cam@sasky.nz`, ending each message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stage paths explicitly; never stage `design/`.

## Review Focus

1. **The Moment's long title at 390px** (R11) in Holtwood: no horizontal scroll on the post or the listing, and the H1 wraps inside the bill. Pinned in Tasks 3 and 4.
2. **A post with one neighbour:** NZ Music (the oldest) shows only a "Later" card and the Moment (the newest) only an "Earlier" card, each centred, with no empty slot. Pinned in Task 4.
3. **`onTips` leaves everything else alone:**
   - Code and Life posts with `## 1. …` headings;
   - On headings without a number (the Moment's "Hypnotised by awe");
   - "## 10.5 things", which has no space after the dot.

   Pinned in Task 1.
4. **An untagged post** (Classy) shows no "Filed under" text and no empty stamp row. Pinned in Task 4.
5. **On video cards:** without JS they're links to YouTube, and with JS a click swaps in the player. They use On colours, not the HP fallbacks. Pinned in Task 4.

---

### Task 1: `onTips` Sätteri plugin

**Files:**
- Create: `src/markdown/on-tips.ts`, `tests/unit/on-tips.test.ts`
- Modify: `astro.config.mjs`, `package.json` (add `@astrojs/markdown-satteri` as a direct dependency at the installed `0.4.2`)

**Interfaces:**
- Produces: `onTips: HastPluginDefinition` (type from `satteri`), `{ name: "on-tips", element: { filter: ["h2"], visit } }`. For a document whose `ctx.data.astro?.frontmatter?.section === "on"`, an `h2` whose first child is a text node matching `/^(\d+)\.\s+/` is returned as a copy with `className` including `"tip"`. Its children become `[span.num("{toRoman(n)}."), text(" " + rest), ...otherChildren]`. Otherwise `visit` returns nothing.

- [ ] **Step 1: Write the failing tests.** In `tests/unit/on-tips.test.ts`, use `markdownToHtml` and `mdxToJs` from `satteri` with `hastPlugins: [onTips]` and `data: { astro: { frontmatter: { section } } }`:
  - `"numbers On tips in Roman numerals"`: `## 1. Never run\n\n## 10. Get into it` → contains `<h2 class="tip"><span class="num">I.</span> Never run</h2>` and `<span class="num">X.</span> Get into it`.
  - `"keeps inline children after the number"`: `## 5. Have jokes <small>(one clean)</small>` through `mdxToJs` → the code contains `"num"`, `"V."` and `_components.small`.
  - `"leaves On headings without a number alone"`: `## Hypnotised by awe` and `## 10.5 things` → no `tip` class and no `num` span.
  - `"is a no-op outside On"`: the same `## 1. Never run` with `section: "code"`, with `section: "life"`, and with no frontmatter → `<h2>1. Never run</h2>`.
  - `"leaves h3 alone"`: `### 1. Step` in On → no `num`.
- [ ] **Step 2: Run** `npx vitest run tests/unit/on-tips.test.ts`. Expected: FAIL (cannot resolve `src/markdown/on-tips`).
- [ ] **Step 3: Implement** `src/markdown/on-tips.ts`. `visit` returns a new element node, keeps `properties`, and appends `"tip"` to any existing `className`. A pre-plan spike confirmed that a returned node replaces the `h2` in both `markdownToHtml` and `mdxToJs`, and that MDX keeps JSX children such as `<small>`.
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Register it.** Run `npm install @astrojs/markdown-satteri@0.4.2`. In `astro.config.mjs`, set `markdown: { processor: satteri({ hastPlugins: [onTips] }), shikiConfig: … }`, importing `satteri` from `@astrojs/markdown-satteri`.
- [ ] **Step 6: Verify the build.** Run `npm run build && grep -o 'class="num"' dist/meditations/on-being-classy.html | wc -l`. Expected: `10`. Also run `grep -c 'class="num"' dist/code/*.html dist/life/*.html`. Expected: all `0`. Run `npm test`. Expected: all green (smart quotes and highlighting unchanged).
- [ ] **Step 7: Commit:** `feat(on): onTips Sätteri plugin numbers On tips in Roman numerals`.

### Task 2: On primitives, footer placements and the mark margin (6.1)

**Files:**
- Create in `src/components/on/`: `Bill.astro`, `DoubleRule.astro`, `DiamondRule.astro`, `NowShowing.astro`, `Eye.astro`, `OnCorrespondence.astro`.
- Create: `src/components/mdx/Ornament.astro`, `tests/unit/on-components.test.ts`.
- Modify: `src/components/site/OnFooter.astro`, `src/layouts/OnLayout.astro`, `src/components/site/TopBar.astro` (mark `margin: var(--mark-margin, 0)`), `src/styles/themes/on.css` (`--mark-margin: 0 1px`, plus the shared `.on-inline` shadow utility and the `.on-ink` link style), `tests/unit/site-components.test.ts`.

**Interfaces:**
- `Bill`:
  - props `{ as?: "div" | "article"; class?: string }`, with a default slot;
  - renders `.bill-frame` (max 900px, 6px padding, 2px ink border), then `.bill` (1px ink border, centred column, gap 14px, padding `34px 48px 30px`; `24px 14px 22px` at ≤760), then the slot;
  - four `Fleuron` corners at 22px, `aria-hidden`.
- `DoubleRule`: props `{ order: "thick-thin" | "thin-thick" }`. A 4px bar and a 1px bar, gap 3px, `aria-hidden`.
- `DiamondRule`: no props. A 3px bar, a 12px diamond, an 18px outlined diamond (3px), a 12px diamond, then a 3px bar, gap 10px, `aria-hidden`.
- `NowShowing`:
  - props `{ text: string; topRule?: boolean }`;
  - a `Manicule dir="right"` and a `Manicule dir="left"` at 38px around the text, which is Alfa Slab 32px (22px at ≤760);
  - a 1px bottom rule; with `topRule`, also a 3px top rule and `6px 0 8px` padding, otherwise `4px 0 10px`;
  - the text is not hidden: it's the "Now Showing" heading line.
- `Eye`:
  - 640×300 with the `.rays` repeating-conic-gradient masked by the board's radial mask, and the board's SVG eye at 300×150;
  - at ≤760 it's `width: 100%` × 190px with the SVG at 200×100;
  - colours from `--kraft`, `--ink-on` and `--light`, plus the pupil's `#0f0a06`;
  - `aria-hidden`.
- `OnCorrespondence`: the existing row from `OnFooter` (text, `SOCIAL` links and "· Absolutely free of charge ·"), moved here unchanged.
- `OnFooter`:
  - props `{ placement?: "inside" | "after" }`;
  - `"after"` renders `<footer>` with `OnCorrespondence` and the colophon, 22px apart;
  - `"inside"` renders `<footer>` with only the colophon.
- `OnLayout`: new prop `footer?: "inside" | "after"` (default `"after"`), passed to `OnFooter`.
- `Ornament`:
  - renders `<div class="ornament" aria-hidden="true">` with right and left manicules at 30px and the three diamonds from `DiamondRule`, centred, gap 18px;
  - `currentColor` only (it sits in the token-only `mdx/` folder).

- [ ] **Step 1: Write the failing tests.** `tests/unit/on-components.test.ts` (Astro container):
  - `Bill` renders its slot, four `aria-hidden` fleurons, and an `<article>` with `as: "article"`.
  - `DoubleRule` puts the thick bar first for `thick-thin` and last for `thin-thick` (class order).
  - `NowShowing` shows its text, has two `aria-hidden` manicules, and adds the `top-rule` class with `topRule`.
  - `Eye` and `Ornament` are `aria-hidden="true"` at the root.
  - `OnFooter` `placement: "inside"` has the colophon and no "Correspondence" text; `"after"` has both.

  Add `"OnLayout passes the footer placement"` only if the container can render layouts (it can render `BaseLayout`, see `base-layout.test.ts`); otherwise the e2e listing test in Task 3 covers it.
- [ ] **Step 2: Run** `npx vitest run tests/unit/on-components.test.ts`. Expected: FAIL (missing modules).
- [ ] **Step 3: Implement** the components and the `OnFooter`/`OnLayout`/`TopBar`/`on.css` changes.
- [ ] **Step 4: Run** the new tests plus `site-components.test.ts`, `topbar.test.ts` and `mdx-isolation.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit:** `feat(on): handbill primitives, footer placements and mark margin`.

### Task 3: On listing

**Files:**
- Create: `src/components/on/Programme.astro`, `tests/e2e/on.spec.ts`.
- Modify: `src/pages/meditations/index.astro`, `src/lib/text.ts` (`programmeLine`, the `excerpt` fixes), `tests/unit/text.test.ts`, `tests/e2e/home.spec.ts`, `tests/e2e/phase2.spec.ts`.

**Interfaces:**
- `programmeLine(description: string): { text: string; long: boolean }`: `text = firstSentence(description)`, and `long = text.length > 60` (G6).
- `excerpt(body)` also skips blocks starting with `>`, `-`, `*`, `+` (followed by a space), `\d+\.` (followed by a space) or `{/*`, and strips backticks.
- `Programme`:
  - props `{ posts: PostEntry[]; all: PostEntry[] }`;
  - renders `<ol>` rows, each a link (`.prog`): an `aria-hidden` numeral `toRoman(seriesNumber(all, id)) + "."`, then the title (Holtwood 32px, `.on-inline`), then the programme line (`.prog-line`, plus `.prog-line-long` when long), then `<time>` with `formatDateOnShort`;
  - the grid is `88px minmax(0,1fr) auto` with gap 24px; at ≤760 it's `52px minmax(0,1fr)` with gap 14px, the date in column 2, and a 24px title.
- **Page** (`OnLayout`, `footer="inside"`, title `"Pseudo Philosophy Meditations — sasky.nz"`): the `.on-wrap` (max 1000px, padding `44px 28px 22px`; `28px 12px 22px` at ≤760) holds a `Bill` with, in order:
  1. "Cameron Grant of Wellington, Aotearoa, presents";
  2. `DoubleRule thick-thin`;
  3. `h1.on-inline` (72px; 30px at ≤760);
  4. `DoubleRule thin-thick`;
  5. the subtitle (`SECTIONS.on.subtitle`);
  6. `Eye`;
  7. the intro;
  8. "{countLabel} · since {formatMonthYear}";
  9. the headliner `section[aria-labelledby=headliner]`:
     - `NowShowing` "!Now Showing · Meditation the {ordinalWord}!";
     - `h2#headliner` holding the title link (68px; 40px at ≤760);
     - `DiamondRule`;
     - the description (uppercase 26px/700);
     - the side-ruled box with the excerpt, "By Cameron Grant · {formatDateOn}" and "☞ Read On, if You Dare! ☜";
  10. `section[aria-labelledby=also]` with "Also Appearing", "The full programme · newest first" and `Programme`;
  11. `OnCorrespondence`.

- [ ] **Step 1: Write the failing unit tests:**
  - `programmeLine("Top Ten Tips for Staying Classy")` → `{ text: same, long: false }`.
  - The NZ Music description → its first sentence, `long: true`.
  - `excerpt` skips `> quote`, `- item`, `1. item` and `{/* note */}` blocks, and `excerpt("Use \`npm\` now.")` → `"Use npm now."`.
- [ ] **Step 2: Write the failing e2e tests** in `tests/e2e/on.spec.ts`:
  - `"On listing heading, stats and headliner"`:
    - the title;
    - `h1` "Pseudo Philosophy Meditations";
    - stats contain "4 meditations" and "since June 2026";
    - `NowShowing` text "!Now Showing · Meditation the Fourth!";
    - the `#headliner` link `href` is the Moment's URL;
    - the excerpt starts "You do not realise at first";
    - the byline contains "18th October 2026".
  - `"Also Appearing lists the rest, newest first, with computed numerals"`:
    - row titles are Happiness, Classy, NZ Music;
    - numerals are `III.`, `II.`, `I.`;
    - dates are "22nd Sept. 2026", "11th Sept. 2026", "20th June 2026";
    - Classy's line has no `.prog-line-long` and computed `text-transform: uppercase`;
    - NZ Music's line has `.prog-line-long` and ends at "songs.".
  - `"On listing chrome"`: at 1280, `expectTopBarGeometry(page, 24)`, `aria-current="page"` on the On link, `expectTabOrder`, `expectInertTexture`, and `expectOnlyThemeCss(page, request, "on", /Holtwood One SC|Alfa Slab One|Rye|Oswald/)`; at 390, `expectTopBarGeometry(page, 16)`.
  - `"correspondence sits inside the bill, colophon after"`:
    - `.bill .on-correspondence` is visible;
    - the `footer` holds only the colophon, with "© MMXXVI";
    - `footer` has no "Correspondence" text.
  - `"listing at 390: no sideways scroll, Eye inside the bill, rows stack"`:
    - `scrollWidth <= 390`;
    - the Eye's box is inside `.bill`'s box;
    - the first row's date `x` equals its title's `x` (±1).
  - `"no console errors on the On listing"`.
- [ ] **Step 3: Update** `home.spec.ts` so "doors show computed counts" reads `newestOn` from `#headliner a` on `/meditations`. Delete `phase2.spec.ts`'s "meditations lists the four On posts, newest first" test, which the On tests now cover.
- [ ] **Step 4: Run** `npx vitest run tests/unit/text.test.ts` and `npm run build && npx playwright test tests/e2e/on.spec.ts tests/e2e/home.spec.ts`. Expected: FAIL (legacy page).
- [ ] **Step 5: Implement** `programmeLine`, the `excerpt` fixes, `Programme` and the page.
- [ ] **Step 6: Run** the same commands. Expected: PASS. Take 1280 and 390 screenshots with a temporary `tests/e2e/zz-shot.spec.ts`, compare them by eye against the board, then delete the file.
- [ ] **Step 7: Commit:** `feat(on): handbill listing with headliner and programme`.

### Task 4: On post, prose and video cards

**Files:**
- Create: `src/components/on/OnPostHeader.astro`, `src/components/on/FurtherMeditations.astro`.
- Modify:
  - `src/pages/meditations/[slug].astro`;
  - `src/styles/themes/on.css` (`.prose-on`, the `--tag-*` stamp tokens, the On `--vid-*` tokens);
  - `src/components/mdx/YouTube.astro` (`--vid-grain`, `--vid-play-shadow` with the current HP values as fallbacks);
  - `src/styles/base.css` (the neutral `.astro-code .line { display: block; min-height: 1lh }`);
  - `src/content/posts/on-being-classy.mdx` (call 12);
  - `tests/e2e/on.spec.ts`, `tests/e2e/phase2.spec.ts`, `tests/unit/on-components.test.ts`.

**Interfaces:**
- `OnPostHeader`:
  - props `{ number: number; title: string; description: string; pubDate: Date }`;
  - renders `<header>` with, in order:
    1. "Cameron Grant of Wellington, Aotearoa, presents";
    2. `NowShowing topRule` "!Meditation the {ordinalWord(number)}!";
    3. `nav[aria-label=Breadcrumb]` holding the `SECTIONS.on.title` link to `/${SECTIONS.on.path}` (24px, `.22em` tracking, uppercase, 44px tall);
    4. `DoubleRule thick-thin`;
    5. `h1.on-inline` (88px; 46px at ≤760; `text-wrap: balance; overflow-wrap: anywhere`);
    6. `DoubleRule thin-thick`;
    7. `p.subtitle` (plus `.subtitle-long` when `description.length > 60`, call 6);
    8. "By Cameron Grant · Wellington · {formatDateOn}" with `<time>`;
    9. `DiamondRule`.
- `FurtherMeditations`:
  - props `{ older?: { post: PostEntry; number: number }; newer?: { post: PostEntry; number: number } }`;
  - renders `nav[aria-labelledby=further]` with `h2#further` "Further Meditations in this Series", then the cards, then the "☞ The Full Programme of Meditations ☜" link;
  - each card is a `.further` link with a label ("☜ Earlier · Meditation the {ordinalWord}" or "Later · Meditation the {ordinalWord} ☞", with the manicule `aria-hidden`), the title (28px `.on-inline`) and a `formatDateOn` `<time>`;
  - the grid is two columns (one at ≤760); a lone card spans one column, centred (call 10).
- **Post page:** `OnLayout` titled `"{title} — Pseudo Philosophy Meditations — sasky.nz"`. The `.on-wrap` holds:
  - `Bill as="article"`, containing:
    - `OnPostHeader`;
    - `div.prose-on` with `<Content />`;
    - `DoubleRule thick-thin`;
    - the "Finis" row (manicules and Alfa 30px with `.3em` tracking);
    - when there are tags, the "Filed under" row with `TagLinks theme="on"`.
  - then `FurtherMeditations`.

  Neighbours and numbers come from `getStaticPaths` (`neighbours`, `seriesNumber`).
- **`.prose-on`:**
  - **Base (G1):**
    - `max-width: 720px`, centred, `text-align: left`; Oswald 20px/1.6;
    - `> * + *` gets 20px;
    - h2: Rye 30px, uppercase, centred between 1px ink rules via `::before`/`::after` flex lines, 44px above;
    - h3: Oswald 700, uppercase, 22px; h4 per call 5, both 32px above;
    - figures 32px above and below.
  - **Drop cap:** `> p:first-of-type::first-letter` is Holtwood, 3.3em, `line-height .9`, padding `6px 12px 0 0`, with shadow `2px 2px 0 var(--kraft), 3px 3px 0 var(--ink-on)`.
  - **Tips mode** (`.prose-on:has(> h2.tip)`):
    - `h2.tip`:
      - Oswald 700, uppercase, 26px/1.2, `position: relative`;
      - `padding: 30px 0 0 104px`, with `border-top: 2px dotted` (3px solid on the first `h2.tip`);
      - a `p + h2.tip` gets 30px above.
    - `.num`:
      - `position: absolute; top: 21px; right: calc(100% - 64px)`;
      - Holtwood 40px/1, `text-transform: none`, `white-space: nowrap`.
    - `h2.tip small` is weight 500, `text-transform: none`, `font-size: inherit`.
    - Every other non-heading child except `.ornament` gets `margin-left: 104px`, and a paragraph straight after an `h2.tip` gets 10px above.
    - `.ornament` has a 2px dotted top rule, padding `18px 0 26px`, and 30px above.
    - **≤760:**
      - `h2.tip` `padding: 24px 0 0`;
      - `.num` is static and block, 30px, `margin: 0 0 8px`;
      - the 104px indents go to 0.
- **On tokens:**
  - The `--tag-*` stamp tokens:
    - 2px ink border, padding `0 16px`, min-height 44px;
    - Oswald 600 15px, `.16em` tracking, uppercase;
    - on hover, an ink background with kraft text.
  - The `--vid-*` tokens per call 4.

- [ ] **Step 1: Write the failing unit tests** (`on-components.test.ts`):
  - `OnPostHeader` with number 2 has "!Meditation the Second!", the breadcrumb `href="/meditations"`, `datetime="2026-09-11"` with "11th September 2026", and no `subtitle-long` for "Top Ten Tips for Staying Classy". It has `subtitle-long` for a 61-character description.
  - `FurtherMeditations` with both neighbours shows "Earlier · Meditation the First" before "Later · Meditation the Third".
  - With only `newer`, it has one card and the full-programme link.
- [ ] **Step 2: Write the failing e2e tests** (append to `on.spec.ts`):
  - `"Classy tips get Roman numerals"`:
    - the `.prose-on h2.tip .num` texts are `I.` through `X.`;
    - tip 5's `small` has weight 500 and `text-transform: none`;
    - the first `h2.tip` has a 3px solid top border and the second has 2px dotted;
    - `.ornament` sits between tips V and VI.
  - `"other On headings are untouched"`: the Moment and NZ Music have zero `h2.tip` and zero `.num`, and their first `h2` is in Rye.
  - `"post header, numbering and title"`: Classy shows "!Meditation the Second!", the title, and the breadcrumb `href="/meditations"`; the On nav link has `aria-current="true"`.
  - `"Further Meditations follow G7"`:
    - Classy: "Earlier · Meditation the First" (NZ Music) and "Later · Meditation the Third" (Happiness).
    - NZ Music: one card, "Later", with the card's centre within 1px of the grid's centre.
    - The Moment: one card, "Earlier".
  - `"untagged post hides Filed under"`: Classy has no "Filed under"; Happiness has the `philosophy` stamp linking to `/tags/philosophy`.
  - `"drop cap on the first paragraph"`: the `::first-letter` font family on `.prose-on > p:first-of-type` matches `/Holtwood/`.
  - `"On video cards use On tokens and still play"`:
    - an NZ Music `.vid` has border colour `rgb(35, 23, 14)` and a background colour other than navy `rgb(18, 22, 61)`;
    - clicking the first card puts a `youtube-nocookie.com` iframe in its figure.
  - `"post at 390"`:
    - no sideways scroll for Classy and the Moment;
    - the H1 font size is 46px;
    - Classy's first `.num` has `position: static`;
    - the Further cards stack.
  - `"Code post loads no On styles"` is already covered by `expectOnlyThemeCss` in `code.spec.ts`. Add `expectOnlyThemeCss(page, request, "on", …)` on Classy here.
  - `"no console errors on On posts"`: all four posts, `networkidle`.

  Then replace `phase2.spec.ts`'s "legacy post header still links Home" with nothing; the breadcrumb test covers On post headers now.
- [ ] **Step 3: Run** `npm run build && npx playwright test tests/e2e/on.spec.ts` and the unit tests. Expected: FAIL.
- [ ] **Step 4: Implement** the components, the page, the `on.css` prose and tokens, the `YouTube` tokens, the `base.css` line rule and the Classy edits.
- [ ] **Step 5: Run** the same commands, plus `tests/e2e/video-card.spec.ts`, `life.spec.ts` and `code.spec.ts` (the `YouTube` and `base.css` changes touch them). Expected: PASS. Take 1280 and 390 screenshots of Classy, NZ Music and the Moment with `zz-shot.spec.ts`, compare them against the post board, then delete the file.
- [ ] **Step 6: Commit:** `feat(on): handbill posts with Roman tips, G1 prose, On video cards and further meditations`.

### Task 5: Phase checks and roadmap

**Files:** `docs/redesign-roadmap.md`.

- [ ] **Step 1:** Run `npm run build && npm run check && npm test && npm run check:links && npm run check:redirects -- --dist && npm run test:e2e`. Expected: 0 errors and all green.
- [ ] **Step 2:** Run `npx netlify-cli dev --offline --dir dist --port 8888` in the background, then `npm run check:redirects -- --url http://localhost:8888`. Expected: every rule passes (the On redirects land on the new pages).
- [ ] **Step 3: Update the roadmap:**
  - Phase 5 merged (#7); Phase 6 ticked with its PR;
  - "Where things stand": On is on the new theme, and `src/components/on/` and `src/markdown/` exist;
  - remove the Phase 6 carry-forwards this phase closed, and add any new ones;
  - "Next: Phase 7".
- [ ] **Step 4: Commit:** `docs: Phase 6 done`.
