# Phase 2: Content Collections, Routes and Redirects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve every post from one `posts` content collection at its new `/code`, `/life` or `/meditations` URL, still in the old look, with 301s from the old URLs.

**Architecture:**
- **Pure helpers** in `src/lib/` (`format`, `text`, `posts`) are unit tested without the Astro runtime.
- **A single collection wrapper**, `src/lib/get-posts.ts`, is the only file that touches `astro:content`.
- **Section pages reuse the old shell** (`BaseLayout`) through two temporary legacy components.
- **The redirect checker parses `public/_redirects`**, so the redirect table exists in one place only.

**Tech Stack:** Astro 7.3.4 content collections (`glob()` loader, `z` from `astro/zod`), MDX, `@astrojs/rss`, Vitest 5, Playwright 1.64, Netlify `_redirects`.

**Spec:** [`docs/redesign-plan.md`](../../redesign-plan.md): Phase 2 (tasks 2.1–2.5), sections 5.1–5.4, 5.6, 5.9, 5.10 (only the rows that apply here), 5.12 and Q1. Tracked in [`docs/redesign-roadmap.md`](../../redesign-roadmap.md).

## Global Constraints

- Astro 7 APIs only: collections in `src/content.config.ts`, `glob` from `astro/loaders`, `z` from `astro/zod`, `render(post)` from `astro:content`.
- **Dates are date-only.** Format them with UTC getters or `timeZone: 'UTC'`. `npm test` runs under `TZ=America/Los_Angeles`, the zone where a local-time bug shows up.
- **Never hand-build section URLs.** Every link goes through `postUrl()` or `SECTIONS[s].path`. The On section's key is `on`, but its URL path is `meditations`.
- **Old look stays.** The pages are still the old `BaseLayout`, `Header`, `Footer` and `global.css`. Nothing new is styled in this phase.
- **Tags (Q1, accepted):**
  - Drop `life` everywhere.
  - Hide n Seek gets `family`.
  - The concert and NZ Music posts get `music`.
  - Happiness and the Moment get `philosophy`.
  - Classy gets no tags (Cam to choose later; this also exercises the zero-tag case).
- Branch `redesign/phase-2-content`, cut from `feature/redesign`, in the main checkout. Commit as `sasky` / `cam@sasky.nz` and end every commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Redirects are verified locally (Cam, 26 Oct), not on a Netlify deploy preview.** `check-redirects --url` runs against Netlify's local emulator: `npx netlify-cli dev --offline --dir dist`. Plain `astro preview` ignores `_redirects`.
- **Tags are interim.** Cam will review content later (tags and minor copy edits). Classy keeps `tags: []` until then.

**Deviations from the redesign plan, on purpose:**
- The `getPosts()` wrapper goes in its own file, `src/lib/get-posts.ts`, rather than `posts.ts`. That keeps `posts.ts` importable by Vitest with no `astro:content`.
- `src/data/sections.ts` moves from task 2.2 into 2.1, because `postUrl()` needs it.
- Task 2.1 is split into three tasks, one per helper file.
- `MarkdownPostLayout.astro` is deleted in Task 5, not Phase 9, because `LegacyPost.astro` replaces it there.
- Two deferred link-checker minors from Phase 1 are fixed in Task 7, because the redirect check reuses `resolveInDist`:
  - A malformed `%` escape now counts as broken instead of crashing.
  - A trailing-slash link only matches `x/index.html`.
- `check-redirects` reads `public/_redirects` instead of keeping its own copy of the table.

## Review Focus

1. **Posts with the same `pubDate`.** Ordering, `neighbours()` and `seriesNumber()` must be stable. Ties break by `id` ascending. Pinned in Task 3's `sortNewest` tie test.
2. **A section with zero posts.** `sectionStats([])` must not throw: it returns `{ count: 0 }` with no `since` or `latest`. Pinned in Task 3.
3. **A stray trailing-slash internal link** (`/code/`) under `trailingSlash: 'never'`. The link checker must report it, not resolve it to `code.html`. Pinned in Task 7, Step 1.
4. **A redirect whose old path still exists in `dist`.** Netlify serves the file and silently skips the non-forced rule. `checkDist` must report it. Pinned in Task 7's `checkDist` test.
5. **The 23 h difference between Auckland and Los Angeles.** A date formatter using local getters prints the 10th instead of the 11th in LA. Pinned by running `npm test` under `TZ=America/Los_Angeles` (Task 1), plus one Auckland run in Task 8.

---

### Task 1: Date and number formatters

**Files:**
- Create: `src/lib/format.ts`, `tests/unit/format.test.ts`
- Modify: `package.json` (`test` script)

**Interfaces:**
- Produces, from `src/lib/format.ts`:
  - `formatDateLong(d: Date): string`
  - `formatDateISO(d: Date): string`
  - `formatDateOn(d: Date): string`
  - `formatDateOnShort(d: Date): string`
  - `formatMonthYear(d: Date): string`
  - `toRoman(n: number): string`
  - `ordinalSuffix(n: number): string`
  - `ordinalWord(n: number): string`
  - `plural(n: number, one: string, many?: string): string`

- [ ] **Step 1: Branch, and pin the test time zone**

```bash
git switch feature/redesign && git switch -c redesign/phase-2-content
npm pkg set scripts.test="TZ=America/Los_Angeles vitest run"
```

- [ ] **Step 2: Write the failing tests** in `tests/unit/format.test.ts`

All dates are built with `new Date('YYYY-MM-DD')` (UTC midnight, as `z.coerce.date()` produces).

| Call | Expected |
|---|---|
| `formatDateLong(d('2024-05-17'))` | `"17 May 2024"` |
| `formatDateISO(d('2024-04-01'))` | `"2024-04-01"` |
| `formatDateOn(d('2026-09-11'))` | `"11th September 2026"` |
| `formatDateOnShort(d('2026-09-11'))` | `"11th Sept. 2026"` |
| `formatDateOnShort(d('2026-06-20'))` | `"20th June 2026"` |
| `formatDateOnShort(d('2026-01-02'))` | `"2nd Jan. 2026"` |
| `formatDateOnShort(d('2026-03-03'))` | `"3rd March 2026"` |
| `formatDateOnShort(d('2026-10-18'))` | `"18th Oct. 2026"` |
| `formatMonthYear(d('2024-05-17'))` | `"May 2024"` |
| `toRoman` of 1, 4, 9, 14, 40, 2026 | `"I"`, `"IV"`, `"IX"`, `"XIV"`, `"XL"`, `"MMXXVI"` |
| `ordinalSuffix` of 1, 2, 3, 4, 11, 12, 13, 21, 22, 111 | `"1st"`, `"2nd"`, `"3rd"`, `"4th"`, `"11th"`, `"12th"`, `"13th"`, `"21st"`, `"22nd"`, `"111th"` |
| `ordinalWord` of 1, 2, 3, 4, 12, 20, 21, 99 | `"First"`, `"Second"`, `"Third"`, `"Fourth"`, `"Twelfth"`, `"Twentieth"`, `"Twenty-First"`, `"Ninety-Ninth"` |
| `ordinalWord(0)`, `ordinalWord(100)` | throw `RangeError` |
| `plural(1, 'post')`, `plural(4, 'meditation')`, `plural(0, 'post')`, `plural(2, 'entry', 'entries')` | `"1 post"`, `"4 meditations"`, `"0 posts"`, `"2 entries"` |

Write them as `test.each` tables.

- [ ] **Step 3: Run the tests** — `npm test`. Expected: FAIL, because `src/lib/format.ts` doesn't exist.

- [ ] **Step 4: Implement `src/lib/format.ts`**

- All date parts come from UTC getters (`getUTCDate` and so on). No `toLocaleDateString` without `timeZone: 'UTC'`.
- AP short months: `Jan.`, `Feb.`, `March`, `April`, `May`, `June`, `July`, `Aug.`, `Sept.`, `Oct.`, `Nov.`, `Dec.`.

- [ ] **Step 5: Run the tests** — `npm test`. Expected: all pass. Then run `TZ=Pacific/Auckland npx vitest run`; expected: all pass too.

- [ ] **Step 6: Commit** — `git commit -m "Add date and number formatters"` (package.json, format.ts, test).

---

### Task 2: Text helpers

**Files:**
- Create: `src/lib/text.ts`, `tests/unit/text.test.ts`

**Interfaces:**
- Produces:
  - `readingTime(body: string): number`
  - `excerpt(body: string): string`
  - `firstSentence(s: string): string`

- [ ] **Step 1: Write the failing tests**

```ts
const words = (n: number) => Array(n).fill('word').join(' ')

test('readingTime rounds up at 220 wpm, min 1', () => {
  expect(readingTime(words(220))).toBe(1)
  expect(readingTime(words(221))).toBe(2)
  expect(readingTime('')).toBe(1)
})
test('readingTime ignores imports, JSX and code fences', () => {
  const body = `import x from "y";\n\n<YouTube id="abc" />\n\n\`\`\`bash\n${words(500)}\n\`\`\`\n\n${words(10)}`
  expect(readingTime(body)).toBe(1)
})
test('excerpt returns the first prose paragraph, plain text', () => {
  const body = 'import { Picture } from "astro:assets";\n\n## Heading\n\n<Picture src={x} />\n\nFirst *real* paragraph with a [link](https://x.y).\nSecond line.\n\nSecond paragraph.'
  expect(excerpt(body)).toBe('First real paragraph with a link. Second line.')
})
test('firstSentence', () => {
  expect(firstSentence('One. Two.')).toBe('One.')
  expect(firstSentence('What? Yes.')).toBe('What?')
  expect(firstSentence('No stop')).toBe('No stop')
})
```

- [ ] **Step 2: Run the tests** — `npm test`. Expected: FAIL, because the module is missing.

- [ ] **Step 3: Implement `src/lib/text.ts`**

- **Paragraphs:** split the body on blank lines.
- **Skipped as non-prose:** blocks that start with `import `, `export `, `#`, `<` or a fence.
- **Stripped:** `*`/`_` emphasis and `[text](url)` → `text`.
- **Line joins:** lines within a paragraph join with a single space.
- **Sentences:** a sentence ends at the first `.`, `!` or `?` followed by whitespace or the end of the string.

- [ ] **Step 4: Run the tests** — `npm test`. Expected: PASS.

- [ ] **Step 5: Commit** — `git commit -m "Add reading time, excerpt and first-sentence helpers"`.

---

### Task 3: Sections data and post helpers

**Files:**
- Create: `src/data/sections.ts`, `src/lib/posts.ts`, `tests/unit/posts.test.ts`

**Interfaces:**
- Produces, from `src/data/sections.ts`:
  - `type Section = 'code' | 'life' | 'on'`
  - `interface SectionInfo { path: string; label: string; blurb: string; title: string; subtitle?: string; intro?: string }`
  - `SECTIONS: Record<Section, SectionInfo>`
  - `SECTION_ORDER: Section[]`, which is `['code', 'life', 'on']`
- Produces, from `src/lib/posts.ts`. Each function is generic over `P extends Post`, so `CollectionEntry<'posts'>` passes through with its full type.
  - `interface Post { id: string; body?: string; data: { title: string; pubDate: Date; section: Section; tags: string[] } }`
  - `sortNewest<P>(posts: P[]): P[]`: a new array, newest first; ties broken by `id` ascending.
  - `neighbours<P>(posts: P[], id: string): { older?: P; newer?: P }`
  - `seriesNumber<P>(posts: P[], id: string): number`: 1-based, oldest first; throws `Error` for an unknown id.
  - `sectionStats<P>(posts: P[]): { count: number; since?: Date; latest?: P }`
  - `buildTagIndex<P>(posts: P[]): { tag: string; count: number; posts: P[] }[]`
  - `postUrl(post: Post): string`

**`SECTIONS` values** (blurbs, title and subtitle verbatim from the designs; intros from spec 5.6, each marked `// TODO(Cam): refine`):

| key | path | label | blurb | title | subtitle | intro |
|---|---|---|---|---|---|---|
| code | `code` | Code | Code, hosting & small games | Code | — | Notes from the day job and the weekend side projects: hosting, deploying and the odd small game. Mostly written so future me can remember how past me did it. |
| life | `life` | Life | Music, family & other non-code things | Life | — | Everything that isn't code: music I can't stop playing, family, and whatever else has taken over the weekend. Expect enthusiasm, not expertise. |
| on | `meditations` | On | Satire, humour & philosophy | Pseudo Philosophy Meditations | A Series of Essays Satirical, Humorous & Philosophical! | Pseudo philosophy meditations, in which one takes a small, everyday thing far too seriously and follows it somewhere it probably shouldn't go. Some are satire, some are sincere, and one is not always sure which. |

- [ ] **Step 1: Write the failing tests**

Use a `make(id, section, 'YYYY-MM-DD', tags = [])` fixture builder. The four real On posts are `nz` 2026-06-20, `classy` 2026-09-11, `happiness` 2026-09-22 and `moment` 2026-10-18.

| Test | Assertion |
|---|---|
| sortNewest order | `[nz, moment, classy]` → `[moment, classy, nz]`; the input array is unchanged |
| sortNewest tie | two posts on the same date with ids `b`, `a` → `a` first |
| neighbours middle | in `[nz, classy, happiness]`, `neighbours(…, 'classy')` → `{ older: nz, newer: happiness }` |
| neighbours ends | `'nz'` → `older` undefined; `'happiness'` → `newer` undefined |
| neighbours lone | a single-post list → `{}` (both undefined) |
| seriesNumber | nz 1, classy 2, happiness 3, moment 4; `'nope'` throws |
| sectionStats | the four On posts → `count` 4, `since` equals `2026-06-20`, `latest` is moment |
| sectionStats empty | `sectionStats([])` → `{ count: 0 }` |
| buildTagIndex | `p1['a','b']` (2024), `p2['a']` (2025), `p3[]` → `[{tag:'a',count:2,posts:[p2,p1]},{tag:'b',count:1,posts:[p1]}]` |
| buildTagIndex tie | equal counts sort by tag name |
| postUrl | on → `'/meditations/on-happiness'`, code → `'/code/hide-n-seek-game'`, life → `'/life/top-concertvids'` |

- [ ] **Step 2: Run the tests** — `npm test`. Expected: FAIL, because the modules are missing.

- [ ] **Step 3: Implement `src/data/sections.ts` and `src/lib/posts.ts`**

`posts.ts` imports only `SECTIONS` and the types from `sections.ts`. It must not import from `astro:content`.

- [ ] **Step 4: Run the tests** — `npm test`. Expected: PASS. Then run `npm run check`; expected: 0 errors.

- [ ] **Step 5: Commit** — `git commit -m "Add sections data and post helpers"`.

---

### Task 4: Move the posts into the collection

**Files:**
- Create: `src/content.config.ts`, `src/data/home.ts`, `tests/unit/home.test.ts`
- Modify: `tsconfig.json` (`compilerOptions.paths` with `./`-relative targets, e.g. `"@images/*": ["./src/images/*"]`; no `baseUrl`, which TypeScript 6 deprecates)
- Move: `src/pages/*.mdx` (7 posts) to `src/content/posts/`
- Delete: `src/pages/about.mdx`

**Interfaces:**
- Produces:
  - the `posts` collection, with exactly the spec 5.1 schema (copy it verbatim)
  - `@components/*`, `@images/*` and `@assets/*` aliases
  - from `src/data/home.ts`: `hero` and `about` (below)

- [ ] **Step 1: Write the failing `home.ts` test**

```ts
import { about, hero } from '../../src/data/home'
test('about lists all 24 hobbies, typos fixed', () => {
  expect(about.hobbies).toHaveLength(24)
  expect(about.hobbies).toEqual(expect.arrayContaining(['sourdough', 'DJing', 'meditation']))
  expect(about.hobbies).not.toContain('mediation')
})
test('four web-dev statements', () => expect(about.workStatements).toHaveLength(4))
test('hero title splits around the highlight', () =>
  expect(hero.titleBefore + hero.titleHighlight + hero.titleAfter).toBe('Hello, welcome to my little corner of the internet'))
```

Run `npm test`. Expected: FAIL, because the module is missing.

- [ ] **Step 2: Create `src/data/home.ts`**

**`hero`**
- `titleBefore`: `'Hello, welcome to my '`
- `titleHighlight`: `'little corner'`
- `titleAfter`: `' of the internet'`
- `lede`: `'Hello, I’m Cameron. International man of leisure'` (with a curly apostrophe)
- `label`: `'Cameron Grant · Wellington, Aotearoa'`

**`about`**
- `hobbiesHeading`: `'Hobbies, past and present include but not limited to…'`
- `hobbies`, in `about.mdx` order with the typos fixed:

  ```
  sourdough, learning the ukulele, eating too many chips, swimming, running,
  bike riding, DJing, extensively planning what to do when winning the lotto
  but never buying a ticket, kombucha, liking the idea of foraging but being
  too scared to eat anything, reading and watching many computer/software/web
  dev material, learning how to dad, configuring vim, ergonomic split
  mechanical keyboards, learning to spell the same words over and over again,
  eating extra hot curries, drinking whiskey, drawing cartoons, frisbee golf,
  buying second hand cowboy shirts off the internet, dwelling in existential
  despair, meditation, doing nothing, going on a potato diet
  ```

- `workHeading`: `'I also do web development for a living.'`
- `workStatements`, verbatim from `Site-Home.dc.html`:
  1. "I’m all about clean maintainable code."
  2. "I believe coding is best done as part of a team."
  3. "I believe in building software to last."
  4. "I believe in embracing test driven development, pair programming, fast feedback loops, a culture of refactoring and a obsession with simplicity."

Run `npm test`. Expected: PASS.

- [ ] **Step 3: Collection and aliases**

Create `src/content.config.ts` with the spec 5.1 schema, exported as `export const collections = { posts }`. Add the `paths` aliases to `tsconfig.json`.

- [ ] **Step 4: Move and edit the posts**

`git mv` each post into `src/content/posts/`, renaming `top_ten_tips_on_class.mdx` to `on-being-classy.mdx`, then edit them:

| Post | section | tags | Other edits |
|---|---|---|---|
| `silverstripe-app-platform` | code | `silverstripe`, `learning` | Remove the unused `Picture` import |
| `hide-n-seek-game` | code | `pico8`, `learning`, `family` | Delete `export const tags`; `../images/` → `@images/`; `../components/` → `@components/` |
| `top-concertvids` | life | `music` | Remove the unused `Picture` import and the commented-out `astro-embed` import |
| `on-new-zealand-music` | on | `music` | Remove `Picture`; change `Title=` to `title=` on all 3 embeds |
| `on-being-classy` | on | none (`tags: []`) | Remove `Picture` and the unused `YouTube` import |
| `on-happiness` | on | `philosophy` | Remove `Picture` and the unused `YouTube` import |
| `on-being-in-the-moment-vs-past-and-future` | on | `philosophy` | Remove `Picture` |

For every post: delete the `layout:` line and add `section:`. Delete `about.mdx` with `git rm`. Its photo `cameron_grant_holding_a_soft_toy.jpeg` stays until Phase 4 decides on it.

The site won't build between this step and Task 5, because `index.astro`, the tag pages and RSS still glob `src/pages/*.mdx`. That's expected.

- [ ] **Step 5: Check the schema**

1. Run `npx astro sync`. Expected: it succeeds.
2. Temporarily set Classy's `section: tech` and run `npx astro sync` again. Expected: it fails, naming `section`.
3. Revert that change.

- [ ] **Step 6: Commit** — `git commit -m "Move posts into the posts collection"`. Stage the moves, `home.ts`, the test, `content.config.ts` and `tsconfig.json`.

---

### Task 5: Section routes, Home, tags and RSS in the old look

**Files:**
- Create:
  - `src/lib/get-posts.ts`
  - `src/components/legacy/LegacyPost.astro`
  - `src/components/legacy/LegacyPostList.astro`
  - `src/pages/{code,life,meditations}/index.astro` and `[slug].astro`
  - `src/pages/rss.xml.ts`
  - `tests/e2e/phase2.spec.ts`
- Modify: `src/pages/index.astro`, `src/pages/tags/[tag].astro`
- Delete: `src/pages/tags.astro`, `src/pages/rss.xml.js`, `src/layouts/MarkdownPostLayout.astro`

**Interfaces:**
- Consumes: `sortNewest`, `buildTagIndex`, `postUrl` (Task 3); `SECTIONS` (Task 3); the `posts` collection (Task 4).
- Produces:
  - `getPosts(section?: Section): Promise<CollectionEntry<'posts'>[]>` from `src/lib/get-posts.ts`. It returns posts newest first, and drops `draft` posts when `import.meta.env.PROD`.
  - `LegacyPost` (props `{ post: CollectionEntry<'posts'> }`). It is `MarkdownPostLayout` adapted to take `post`:
    - `const { Content } = await render(post)`
    - the date as `toLocaleDateString('en-GB', { timeZone: 'UTC' })`
    - tag links `/tags/${tag}`
    - `<Pico8 pico8src={post.data.pico8} />` when the post has `pico8` set
  - `LegacyPostList` (props `{ posts; title? }`). It is today's Home list markup: each item `id={toAnchor(postUrl(post))}`, `href={postUrl(post)}`, `data-astro-reload` when `post.data.pico8` is set, then the description. Home, the three listings and the tag pages all use it.
  - Each `[slug].astro` uses `getStaticPaths` over `getPosts('<section>')` with `params: { slug: post.id }`, and renders `<LegacyPost post={post} />`.
  - Each listing uses `BaseLayout` with `pageTitle={SECTIONS[s].title}`.
  - RSS:
    - `title: 'Sasky.nz'`, `description: "Cameron's website"`
    - `customData: '<language>en-nz</language>'`
    - items with `title`, `description`, `pubDate` and `link: postUrl(p)`; no categories yet (Phase 7)

- [ ] **Step 1: Write the failing e2e test** in `tests/e2e/phase2.spec.ts`

```ts
test('meditations lists the four On posts, newest first', async ({ page }) => {
  await page.goto('/meditations')
  await expect(page.locator('main li a')).toHaveText([
    'On being in the moment vs past and future', 'On Happiness', 'On Being Classy', 'On New Zealand Music',
  ])
})
test('Hide n Seek loads its cart', async ({ page }) => {
  const cart = page.waitForResponse((r) => r.url().endsWith('/pico8/hidenseek.js') && r.ok())
  await page.goto('/code/hide-n-seek-game')
  await cart
  await expect(page.locator('#canvas')).toBeAttached()
})
test('RSS has the 7 posts and no About', async ({ request }) => {
  const xml = await (await request.get('/rss.xml')).text()
  expect(xml.match(/<item>/g)).toHaveLength(7)
  expect(xml).toContain('https://sasky.nz/meditations/on-being-classy')
  expect(xml).not.toContain('/about')
})
test('tag page lists posts across sections', async ({ page }) => {
  await page.goto('/tags/music')
  await expect(page.locator('main li a')).toHaveText([
    'On New Zealand Music', "Concert youtube vids to temporarily restore one's faith in humanity",
  ])
})
```

Run `npm run build && npm run test:e2e`. Expected: FAIL. The build itself fails at this point (see Task 4, Step 4), which counts as RED.

- [ ] **Step 2: Implement the files listed above.**

- [ ] **Step 3: Check the routes**

Run: `npm run build && find dist -name '*.html' | sort`

Expected: exactly these 17 files:
- `index.html`
- `code/index.html`, `code/hide-n-seek-game/index.html`, `code/silverstripe-app-platform/index.html`
- `life/index.html`, `life/top-concertvids/index.html`
- `meditations/index.html`, plus `meditations/{on-being-classy,on-being-in-the-moment-vs-past-and-future,on-happiness,on-new-zealand-music}/index.html`
- `tags/{family,learning,music,philosophy,pico8,silverstripe}/index.html`

- [ ] **Step 4: Run every check** — `npm run check && npm test && npm run check:links && npm run test:e2e`. Expected: 0 errors, all tests passing, 0 broken links, and 4 e2e tests passing.

- [ ] **Step 5: Validate the feed**

Paste `dist/rss.xml` into the W3C validator's direct-input form at <https://validator.w3.org/feed/#validate_by_input>. Expected: "This is a valid RSS feed" (warnings are fine). Record the result in the ledger.

- [ ] **Step 6: Commit** — `git commit -m "Serve posts from the collection at section URLs"`.

---

### Task 6: Routing config

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Set the routing options** — add `trailingSlash: 'never'` and `build: { format: 'file' }`.

- [ ] **Step 2: Check the output**

Run: `npm run build && find dist -name '*.html' | sort`

Expected: the same 17 pages in file form:
- `index.html`
- `code.html`, plus `code/hide-n-seek-game.html` and `code/silverstripe-app-platform.html`
- `life.html`, `life/top-concertvids.html`
- `meditations.html`, plus `meditations/<slug>.html` for each of the four On posts
- `tags/<tag>.html` for each of the six tags

- [ ] **Step 3: Run the link and e2e checks** — `npm run check:links && npm run test:e2e`. Expected: 0 broken links and 4 e2e tests passing.

- [ ] **Step 4: Commit** — `git commit -m "Build file-format pages with no trailing slash"`.

---

### Task 7: Redirects and the redirect checker

**Files:**
- Modify: `scripts/check-links.mjs`, `tests/unit/check-links.test.ts`, `package.json` (`check:redirects` script)
- Create:
  - `public/_redirects`
  - `scripts/check-redirects.mjs`
  - `tests/unit/check-redirects.test.ts`
  - `tests/fixtures/dist-redirects/` containing `index.html`, `new.html` and `old.html`

**Interfaces:**
- Consumes: `resolveInDist(distDir, urlPath)` from `scripts/check-links.mjs`.
- Produces, from `scripts/check-redirects.mjs`:
  - `parseRedirects(text: string): { from: string; to: string; status: number }[]`. Skips blank lines and `#` comments.
  - `checkDist(distDir: string, rules): string[]`. Returns one error per rule whose target (with any `#…` removed) doesn't resolve, or whose `from` still resolves.
  - `checkUrl(base: string, rules): Promise<{ errors: string[]; notes: string[] }>`. For `from` and `from + '/'`, it fetches with `redirect: 'manual'` and expects `rule.status`. The `Location`, resolved against `base`, must equal `to` (pathname + hash). Fetching that location without its hash must then return 200. The upper-cased `from` gets the same checks, but its failures go to `notes`, not `errors`, because Netlify's case handling is unverified.
- CLI:
  - `node scripts/check-redirects.mjs --dist [dir]` or `--url <base>`. It reads `public/_redirects`, prints `N rules, M errors` (plus any notes), and exits 1 when there are errors.
  - `"check:redirects": "node scripts/check-redirects.mjs"`.

- [ ] **Step 1: Write the failing `check-links` tests** for the Phase 1 deferred minors

```ts
test('trailing slash only matches a directory index', () => {
  expect(resolveInDist(dist, '/code/')).toBeNull()
  expect(resolveInDist(dist, '/about/')).toMatch(/about\/index\.html$/)
})
test('malformed percent-encoding is unresolvable, not a crash', () => {
  expect(resolveInDist(dist, '/100%')).toBeNull()
})
```

Run `npm test`. Expected: both FAIL.

- [ ] **Step 2: Fix `resolveInDist`**

- Wrap the decode in `try/catch`, returning `null` on failure.
- When the path ends in `/`, try only `<path>/index.html`.

Run `npm test`. Expected: PASS.

- [ ] **Step 3: Write the failing `check-redirects` tests**

- **`parseRedirects` on a sample** with a `#` comment and a blank line returns 2 rules with the exact fields.
- **`parseRedirects` on `public/_redirects`:**
  - 9 rules, all `301`;
  - includes `{ from: '/top_ten_tips_on_class', to: '/meditations/on-being-classy', status: 301 }`;
  - every `to` is either a section URL or `/#about` / `/#tags`.
- **`checkDist(fixture, rules)`**, with rules `/gone → /new`, `/old → /new`, `/x → /missing` and `/a → /#about`, returns exactly 2 errors:
  - one naming `/old` (the old path still exists);
  - one naming `/missing` (the target is missing).
- **`checkUrl` against a local `node:http` server** on port 0:
  - The server answers `/gone` and `/gone/` with 301 → `/new`, `/new` with 200, and `/half` with 301 → `/wrong`. Everything else is 404.
  - For rules `/gone → /new` and `/half → /new`, the errors mention `/half` and none mention `/gone`.

Run `npm test`. Expected: FAIL, because the module is missing.

- [ ] **Step 4: Implement `scripts/check-redirects.mjs` and create `public/_redirects`**

`_redirects` is the spec 5.4 block, verbatim. Run the CLI only when `process.argv[1]` is set and matches this module.

Run `npm test`. Expected: PASS.

- [ ] **Step 5: Check against the build** — `npm run build && npm run check:redirects -- --dist`. Expected: `9 rules, 0 errors`.

- [ ] **Step 6: Commit** — `git commit -m "Add Netlify redirects and redirect checker"`.

- [ ] **Step 7: Check the redirects locally with Netlify's emulator**

Run `npm run build`, then start `npx netlify-cli dev --offline --dir dist --port 8888` in the background. Then run `npm run check:redirects -- --url http://localhost:8888`.

Expected: `9 rules, 0 errors`. Record the notes in the PR (upper-case variants, what `/code/` returns, whether `/about` keeps `#about`), then stop the server.

If the emulator won't start without a Netlify login, record that as a ruling, rely on `--dist`, and say so in the PR.

---

### Task 8: Finish the phase

**Files:**
- Modify: `docs/redesign-roadmap.md`

- [ ] **Step 1: Full verification**

Run:

```bash
npm run build && npm run check && npm test && TZ=Pacific/Auckland npx vitest run \
  && npm run check:links && npm run check:redirects -- --dist && npm run test:e2e
```

Expected: every command exits 0.

- [ ] **Step 2: Update the roadmap** — tick 2.1–2.5 and commit with `git commit -m "Roadmap: Phase 2 done"`.

- [ ] **Step 3: Open the PR into `feature/redesign`**

- Run `gh auth switch --user sasky`.
- Push the branch, then run `gh pr create --base feature/redesign`.
- **PR body:**
  - the URL table (old → new);
  - the tag changes (Q1), noting that Classy has no tags until Cam picks some;
  - that RSS GUIDs change, so readers will see every post once more;
  - the redirect check result;
  - the deviations listed above;
  - the local emulator result from Task 7, Step 7.
- Add the PR link to the roadmap, commit, and push.
