# Phase 7: Tags, RSS and SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move `/tags/[tag]` onto the HP theme (retiring the last legacy page), give the RSS feed categories and a self link, and pin every page type's title, description, canonical and Open Graph tags with tests.

**Architecture:**
- **Tag pages** reuse the Life listing's parts: `ListingBand` (count Dymo, `#tag` heading, lede) and `PostRow chip`. `ListingBand`'s one-word heading learns to shrink to fit its text, so long tags never overflow or split.
- **RSS:** a pure `feedItem(post)` in `src/lib/feed.ts` builds each item (unit-tested); `rss.xml.ts` adds the Atom namespace and `atom:link rel="self"`.
- **SEO:** `BaseLayout` already emits the 5.16 tags (Phase 3), and every page passes the 5.16 title. Task 3 pins them with one Playwright test per page type and fixes any gap it finds.

**Tech Stack:** Astro 7.3.4, `@astrojs/rss` 4.0.19, Vitest 5, Playwright 1.64.

**Spec:**
- [`docs/redesign-plan.md`](../../redesign-plan.md): Q4, 5.11, 5.12, 5.16, 6.5 (tag pages), Review focus 2, and tasks 7.1–7.3. It wins on conflicts.
- There is no design board for tag pages (Q4: "reusing the Life listing row plus the section chip"). Values come from `Site-Life-List.dc.html` through the existing components.
- Roadmap carry-forwards for Phase 7 (`docs/redesign-roadmap.md`, "Carried forward" and "Next"):
  - rebuild `tags/[tag].astro` on `HpLayout` with `ListingBand` and `PostRow chip`;
  - move `phase2.spec.ts`'s legacy tag test;
  - RSS `atom:link rel="self"`;
  - `/code/` duplicate covered by canonicals.

## Calls made in place of a brainstorm

Cam's standing preference is to skip the brainstorm Q&A and review these calls with the PR.

1. **Tag heading style:** the one-word section heading (Fraunces 800, 120px, `-0.045em`, as "Life"), not the 404's sentence style. `#tag` is one word, and the page is a listing like Life. The roadmap suggested `variant="message"`; its `12ch` cap and `9vw` size would overflow on `#silverstripe` at 390.
2. **Fit to width:** the section heading's size becomes `min(120px, 100cqi ÷ width)` (72px cap at ≤760). `width` is the title's width in em, which `headingFit()` (`src/lib/fit.ts`) adds up at build time from a table of Fraunces 800 glyph widths measured at 24px (the widest, because of the optical-size axis), plus 2%. "Life" never reaches the limit, so the Life listing doesn't change. A very long tag stays on one line at a small size (a 20-character tag is about 24px at 320) rather than wrapping. (Changed after review: a per-character average clipped wide tags such as `#homework` on phones.)
3. **Dymo:** the post count only ("2 posts"), as spec 5.11 says. No "since" date: a tag isn't a series.
4. **Lede** (computed, no new copy to review beyond the pattern): "Posts from Life and On. Pick another tag on the home page." The sections are the ones the tag's posts are in, in Code, Life, On order; "home page" links to `/#tags`.
5. **List heading:** "Every post tagged music, newest first", in the Life listing's small mono `h2` style.
6. **The current tag** is marked `aria-current="page"` in each row's tag list on its own tag page (the global constraint's `aria-current` rule, applied to tags). It stays a link, like the current section link in the top bar, and shows the theme's hover fill (navy with white text) so sighted readers see it too.
7. **Top bar:** no section is current on a tag page (tags cross sections).
8. **Meta:** title `#{tag} — sasky.nz` (5.16); description "Every post tagged {tag} on sasky.nz, from {sections}."
9. **Feed channel:** the title becomes `sasky.nz` (it was `Sasky.nz`), matching `og:site_name` and the `<link rel="alternate">` title. The description becomes Home's meta description, "Personal and professional website of Cameron Grant" (it was "Cameron's website"). Both now come from one `SITE` constant in `src/data/site.ts`.
10. **Feed categories:** the section's short label (`Code`, `Life`, `On`), then the tags, as 5.12 says. An untagged post (Classy) has only its section.
11. **Legacy folders** (`src/components/legacy/`, `src/layouts/legacy/`) become unused but stay until Phase 9.1, which owns removing old code.

## Global Constraints

- Astro 7 APIs only, no UI framework, no new client JS.
- **Theme isolation:** the tag page loads only HP CSS and fonts (`expectOnlyThemeCss`).
- **Computed values:** counts, section lists and tag lists come from content, never hard-coded.
- **Accessibility:** touch targets at least 44px; visible `:focus-visible`; `aria-current` as call 6.
- **Breakpoints:** 480, 760 and 900 only.
- **URLs:** lowercase kebab-case, no trailing slash; tag URLs are `/tags/{tag}`.
- **No post copy changes.**
- **Titles (5.16):** Home `sasky.nz — Home`; listings `{Section title} — sasky.nz`; posts `{title} — {Section title} — sasky.nz`; tags `#{tag} — sasky.nz`; 404 `Page not found — sasky.nz`.
- **Meta description:** `metaDescription ?? description` on posts.

## Review Focus

1. **A long tag** (`#silverstripe` today; any future tag) stays on one line and inside the band at 320, 390, 768 and 1280. Test: Task 1 e2e "tag heading fits".
2. **A tag whose posts are all in one section** reads "Posts from Code." with no stray "and". Test: Task 1 `formatList` and `sectionsOf` units.
3. **An untagged post** has only its section as a feed category, and never appears on a tag page. Tests: Task 2 `feedItem` unit; Task 1 e2e checks Classy is on no tag page.
4. **Characters that need escaping** (`&`, `'`) in titles and descriptions keep the feed well-formed. Test: Task 2 e2e parses the feed with `DOMParser`.
5. **The current tag link** is marked current only on its own tag page, never on others or on post pages. Test: Task 1 `TagLinks` unit and e2e.

---

### Task 1: Tag pages (7.1)

**Files:**
- Modify: `src/lib/format.ts`, `src/lib/posts.ts`
- Modify: `src/components/hp/ListingBand.astro`, `src/components/hp/PostRow.astro`, `src/components/site/TagLinks.astro`
- Rewrite: `src/pages/tags/[tag].astro`
- Test: `tests/unit/format.test.ts`, `tests/unit/posts.test.ts`, `tests/unit/hp-components.test.ts`, `tests/unit/site-components.test.ts`
- Create: `tests/e2e/tags.spec.ts`; remove the tag test from `tests/e2e/phase2.spec.ts`

**Interfaces:**
- Produces:
  - `formatList(items: string[]): string` in `format.ts` (`Intl.ListFormat("en-NZ", { type: "conjunction" })`).
  - `sectionsOf(posts: Post[]): Section[]` in `posts.ts`, in `SECTION_ORDER`, no duplicates.
  - `TagLinks` prop `current?: string`; `PostRow` prop `currentTag?: string`, passed through.
  - `ListingBand` section heading carries `style="--chars: N"` (N = `[...title].length`).

- [ ] **Step 1: Write the failing unit tests**

```ts
// format.test.ts
test("formatList joins with commas and 'and'", () => {
  expect(formatList(["Code"])).toBe("Code");
  expect(formatList(["Life", "On"])).toBe("Life and On");
  expect(formatList(["Code", "Life", "On"])).toBe("Code, Life and On");
});
// posts.test.ts
test("sectionsOf lists each section once, in section order", () => {
  expect(sectionsOf([make("a", "on", "2026-01-01"), make("b", "code", "2026-01-02"), make("c", "on", "2026-01-03")])).toEqual(["code", "on"]);
  expect(sectionsOf([])).toEqual([]);
});
// site-components.test.ts
test("TagLinks marks only the current tag", async () => {
  const html = await container.renderToString(TagLinks, { props: { tags: ["music", "learning"], theme: "hp", current: "music" } });
  expect(html).toMatch(/href="\/tags\/music"[^>]*aria-current="page"/);
  expect(html).not.toMatch(/href="\/tags\/learning"[^>]*aria-current/);
  expect(await container.renderToString(TagLinks, { props: { tags: ["music"], theme: "hp" } })).not.toContain("aria-current");
});
// hp-components.test.ts
test("PostRow passes the current tag to its tags", async () => {
  const html = await container.renderToString(PostRow, { props: { post: concert, chip: true, currentTag: "music" } });
  expect(html).toMatch(/aria-current="page"/);
  expect(html).toContain("chip-life");
});
test("ListingBand section heading carries its length", async () => {
  const html = await container.renderToString(ListingBand, { props: { headingId: "t", label: "2 posts", title: "#silverstripe" } });
  expect(html).toMatch(/<h1[^>]*style="--chars: ?13"/);
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm test -- format posts site-components hp-components`
Expected: FAIL (`formatList`/`sectionsOf` not exported; no `aria-current`; no `--chars`).

- [ ] **Step 3: Implement the helpers and component props**

`ListingBand`: `.band-in` gets `container-type: inline-size`; `.band-section h1` font-size `min(120px, calc(100cqi / (var(--chars) * 0.56)))`, and `min(72px, …)` at ≤760. `--chars` is set only for `variant="section"`.

- [ ] **Step 4: Run them to verify they pass**

Run: `npm test`
Expected: all pass.

- [ ] **Step 5: Write the failing e2e tests** in `tests/e2e/tags.spec.ts`

- "music tag page": title `#music — sasky.nz`; `html[data-theme="hp"]`; `h1` `#music`; `.band .dymo` `2 posts`; lede `Posts from Life and On. Pick another tag on the home page.` with `a[href="/#tags"]`; `h2` `Every post tagged music, newest first`; row titles `["On New Zealand Music", "Concert youtube vids to temporarily restore one's faith in humanity"]`; row chips `["On", "Life"]`; each row's `/tags/music` link has `aria-current="page"`.
- "every tag in the index has a page": for each tag on Home's selector (`.tg-chip[data-tag]`), `/tags/{tag}` returns 200 and its row count equals the chip's count; Classy (`/meditations/on-being-classy`) is linked from no tag page.
- "tag page loads only HP styles": `expectOnlyThemeCss(page, request, "hp", /Fraunces|Source Sans 3|JetBrains Mono/)`.
- "no section is current on a tag page": no `.site-nav-link[aria-current]`.
- "tag heading fits": `/tags/silverstripe` at 320, 390, 768 and 1280: the `h1` is one line (height < 1.5 × font size) and its box is inside `.band-in`'s content box.
- "post pages mark no tag current": `/life/top-concertvids` has no `.tag-link[aria-current]`.

Delete "tag page lists posts across sections" from `phase2.spec.ts`.

- [ ] **Step 6: Run them to verify they fail**

Run: `npm run build && npx playwright test --project=e2e tags`
Expected: FAIL (legacy page: no `data-theme="hp"`, no band).

- [ ] **Step 7: Rewrite `src/pages/tags/[tag].astro`** on `HpLayout` with `ListingBand` (lede slot), the Life listing's list markup, and `PostRow chip currentTag={tag}`.

- [ ] **Step 8: Run all checks**

Run: `npm run build && npm run check && npm test && npm run check:links && npx playwright test --project=e2e`
Expected: all pass; `check:links` 0 broken.

- [ ] **Step 9: Commit** `feat(tags): HP tag pages with fitted #tag heading and current-tag marking`

### Task 2: RSS (7.2)

**Files:**
- Create: `src/data/site.ts`, `src/lib/feed.ts`
- Modify: `src/pages/rss.xml.ts`, `src/pages/index.astro` (description from `SITE`), `src/layouts/BaseLayout.astro` (`og:site_name` and the alternate link title from `SITE`)
- Test: `tests/unit/feed.test.ts`; create `tests/e2e/feed.spec.ts`; move the RSS test out of `phase2.spec.ts`

**Interfaces:**
- Produces:
  - `SITE = { name: "sasky.nz", description: "Personal and professional website of Cameron Grant" }`.
  - `feedItem(post: Post & { data: { description: string } }): { title; description; pubDate; link; categories: string[] }`.

- [ ] **Step 1: Write the failing unit test**

```ts
test("feedItem links the post and files it under its section and tags", () => {
  expect(feedItem(nzMusic)).toEqual({ title: "On New Zealand Music", description: "…", pubDate: nzMusic.data.pubDate, link: "/meditations/on-new-zealand-music", categories: ["On", "music"] });
  expect(feedItem(classy).categories).toEqual(["On"]);
});
```

- [ ] **Step 2: Run it to verify it fails** — `npm test -- feed`; Expected: FAIL (module missing).
- [ ] **Step 3: Implement `feedItem`, `SITE`, and the feed:** `xmlns: { atom: "http://www.w3.org/2005/Atom" }`; `customData` is `<language>en-nz</language>` plus `<atom:link href="{site}rss.xml" rel="self" type="application/rss+xml"/>`.
- [ ] **Step 4: Run it to verify it passes** — `npm test`; Expected: all pass.
- [ ] **Step 5: Write the failing e2e test** in `tests/e2e/feed.spec.ts`: fetch `/rss.xml`, parse it in the page with `DOMParser` (`application/xml`): no `parsererror`; channel title `sasky.nz`; language `en-nz`; one `atom:link` with `rel="self"` and href `https://sasky.nz/rss.xml`; 7 items, none linking `/about`; NZ Music's categories `["On", "music"]`; Hide n Seek's `["Code", "pico8", "learning", "family"]`; Classy's `["On"]`. Remove the RSS test from `phase2.spec.ts`.
- [ ] **Step 6: Run it to verify it fails, then passes after a rebuild** — `npx playwright test --project=e2e feed`.
- [ ] **Step 7: Commit** `feat(rss): categories, self link and the site name`

### Task 3: Meta and titles (7.3)

**Files:**
- Create: `tests/e2e/meta.spec.ts`
- Modify: whatever page the test finds wrong (none expected)
- Modify: `docs/redesign-roadmap.md`

- [ ] **Step 1: Write the e2e test**, one case per page type: Home, the three listings, one post per section, `/tags/music`, and the 404 (`/no-such-page`). Each asserts `<title>`, `meta[name=description]` (posts: `metaDescription ?? description`), `link[rel=canonical]` (`https://sasky.nz/…`, Home `https://sasky.nz/`), `og:title` = title, `og:description` = description, `og:url` = canonical, `og:type` (`article` on posts, else `website`), `og:site_name` `sasky.nz`, `twitter:card` `summary`. The 404 has `robots noindex` and no canonical or `og:url`.
- [ ] **Step 2: Run it** — `npx playwright test --project=e2e meta`. Expected: PASS (Phases 3–6 wired these). A failure is a gap: fix the page, rerun.
- [ ] **Step 3: Check `/code/` on Netlify's emulator** — `npx netlify-cli dev --offline --dir dist --port 8888`, then `curl -s localhost:8888/code/ | grep canonical`. Expected: the canonical is `https://sasky.nz/code`.
- [ ] **Step 4: Full checks** — build, check, test, links, redirects (`--dist` and the emulator), e2e.
- [ ] **Step 5: Update the roadmap** (status, ticks, carry-forwards, "Next: Phase 8") and commit `docs: Phase 7 done`.
