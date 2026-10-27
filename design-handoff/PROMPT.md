# Plan the sasky.nz redesign

You're working in Cam's Astro repo for sasky.nz (github.com/sasky/astro). It's deployed on Netlify. A full redesign has been designed and signed off, and your job right now is to **plan** the build, not do it.

Produce a written, step-by-step implementation plan in `docs/redesign-plan.md` with two main parts:

1. **Code and content changes:** the restructuring the new design needs (content model, URLs, redirects, layouts, theming, fonts, assets, RSS, tags and so on).
2. **Building each theme's page types:** how to build every page template in each of the three themes.

Then stop and wait for Cam to review. Don't change any other files, install packages or start implementing until he approves the plan.

---

## 1. Read these first

- `design-handoff/README.md`: how to read the design files, the asset map, and a token summary for each theme. **Read this before opening the designs.**
- `design-handoff/DECISIONS.md`: everything Cam has already decided. Don't reopen these.
- `design-handoff/design/*.dc.html`: the eight design files. They are the source of truth for layout, exact CSS values and copy. Read every one in full, including each `<helmet>` style block and its `@media` rules.
- `design-handoff/design/assets/`: the hero portrait cutout and its two masks.
- The repo itself: `astro.config.mjs`, `package.json`, `src/pages/**`, `src/layouts/**`, `src/components/**`, `src/styles/**`, `src/scripts/utils.js`, `public/**` and `todo.md`.

Check the installed Astro version (`package.json` says `astro ^7.x`) and use the current docs for that version, especially for content collections, routing, images and fonts. Don't assume older APIs.

## 2. The site today (verify, and correct anything that's wrong)

- **Stack:** Astro, `@astrojs/mdx` (Shiki, `dracula` theme), `@astrojs/rss`, `open-props`, and `@astro-community/astro-embed-youtube`. `BaseLayout` uses `<ClientRouter />` view transitions.
- **Posts are flat MDX pages** in `src/pages/*.mdx` with `layout: ../layouts/MarkdownPostLayout.astro`, so URLs are `/<filename>`.
  - Frontmatter fields: `title`, `description`, `metaDescription`, `pubDate`, `tags`, and optionally `pico8` and `image`.
  - Posts import `Picture`, `YouTube`, `ImageCollection` and images from `src/images/` by relative path.
- **Other pages and features:**
  - `index.astro` lists every post.
  - `/tags` and `/tags/[tag]` exist.
  - `rss.xml.js` uses `pagesGlobToRssItems`.
  - `about.mdx` is a page.
  - Fonts are self-hosted Hack and IBM Plex Sans.
  - `hide-n-seek-game.mdx` embeds a Pico-8 game through `Pico8.astro` and `public/pico8/`. Home links to it with `data-astro-reload`.
- **No `netlify.toml` or `public/_redirects` yet.**

## 3. The new design, in brief

There are three sections, each with its own theme, plus a homepage:

- **HP theme** (used for **Home** and **Life**): warm paper with a blue graph grid, navy type, neon blue and orange accents, Fraunces display type, mono Dymo-style labels and hard offset shadows.
  - The homepage hero has Cam's cutout portrait on a blue wash, with striped "ghost" silhouettes and orange jacket stripes.
- **Code** (terminal theme): dark terminal, JetBrains Mono, green accent, shell-prompt framing such as `cam@sasky:~/code$ ls -lt`, and blue inline links.
- **On** (Sideshow handbill theme): an early-1900s kraft-paper handbill, with Holtwood One SC, Alfa Slab One, Rye and Oswald, ornaments and manicules.
  - The series is called **Pseudo Philosophy Meditations**.
- **Shared top bar:** identical geometry on every page (wordmark left, Code · Life · On right). Only colours and fonts change per theme.

Every template has a 390px mobile board on the canvas. The mobile behaviour is whatever each file's `@media` rules produce at that width.

## 4. Settled decisions (summary; full list in DECISIONS.md)

- Sections are sub pages: `/code`, `/life`, `/on`. Posts live at `/section/slug`. Netlify 301s go from every old URL.
- "Personal" is now **Life**. "The ‘On’ Papers" is now **Pseudo Philosophy Meditations**, and each post is a "meditation". The nav label stays "On".
- About folds into the homepage. There's one global RSS feed.
- **Listings:** all listings show every post, newest first, with no pagination for now.
  - **Life:** no featured cards, and a flat, un-raised list.
  - **On:** a headliner (the latest post) plus the full programme.
- **Tag selector on Home:** picking a tag shows every post with it. There's no "All posts tagged" link.
- **On posts:** the roman numeral is a `<span>` inside each tip's heading, hung left of the heading text, and stacked above it on phones.

---

## 5. Part 1: code and content changes (the plan must cover each item)

For each item, say what changes, which files are touched or created, and how to verify it.

**5.1 Content model.** Move posts out of `src/pages/` into content collections. Use one `posts` collection with a `section` field, or one collection per section; recommend one and say why.

- **Schema:** define it with zod. Cover the existing fields, `section: 'code' | 'life' | 'on'`, a real `Date` for `pubDate`, an optional `draft`, optional `pico8`, and anything the templates need.
- **Computed values:** derive these rather than storing them by hand: reading time, prev/next, the On ordinal ("Meditation the Fourth") and programme numerals.
- **MDX after the move:** plan how imports keep working once files move, i.e. image paths, `Picture`, `YouTube`, `ImageCollection` and the Pico-8 component.

**5.2 Section assignment and URLs.** This is a proposed table; confirm it with Cam.

| Current file | Section | New URL |
|---|---|---|
| `silverstripe-app-platform.mdx` | code | `/code/silverstripe-app-platform` |
| `hide-n-seek-game.mdx` | code | `/code/hide-n-seek-game` |
| `top-concertvids.mdx` | life | `/life/top-concertvids` |
| `on-happiness.mdx` | on | `/on/on-happiness` |
| `top_ten_tips_on_class.mdx` | on | `/on/on-being-classy` |
| `on-new-zealand-music.mdx` | on | `/on/on-new-zealand-music` |
| `on-being-in-the-moment-vs-past-and-future.mdx` | on (confirm) | `/on/on-being-in-the-moment-vs-past-and-future` (or a shorter slug, if Cam wants one) |
| `about.mdx` | not a post | Content moves into the homepage About; `/about` → `/#about` |

`on-being-in-the-moment…` (18 Oct 2026) is newer than anything the designs know about. If it's On, it becomes the headliner on `/on`, and the design's "Meditation the Third" becomes "Fourth".

**5.3 Routing.** Plan these routes: `/`, `/code`, `/code/[slug]`, `/life`, `/life/[slug]`, `/on`, `/on/[slug]`, `/rss.xml`, a 404 page, and whatever is decided for tags (see 5.11). State the trailing-slash and `build.format` choice, and keep it consistent with the redirects.

**5.4 Redirects.**

- Add `public/_redirects` (or `netlify.toml`) with a 301 for every old post URL, plus `/about`.
- Old `/tags/*` URLs need either a redirect or a replacement.
- Check how Netlify handles trailing slashes on these.
- Include a script or checklist that proves every old URL lands on the right new page.

**5.5 Theme architecture.**

- **How a page gets its theme:** for example, `data-theme="hp|code|on"` on `<html>`, set by the layout.
- **CSS split:** one shared token file for top-bar geometry, spacing, breakpoints, focus styles and the like. Then one CSS file per theme with its custom properties and textures. Each page should load only its own theme's CSS and fonts.
- **Layout hierarchy:** a `BaseLayout` (head, meta, fonts, top bar, footer slot), then theme layouts, then page-type templates.
- **Convert, don't copy:** turn the designs' inline styles into scoped component CSS. Don't paste inline styles.
- **Retire the old styles:** remove `global.css`, `theme.css`, the component CSS and `open-props` once they're replaced. Keep `open-props` only if it's genuinely still used.

**5.6 Shared components and helpers.**

- **Components:** `TopBar` (props: theme, current section; sets `aria-current`) and the three footer variants (HP footer; Code `-- NORMAL --` status line; On "Correspondence welcomed…" plus colophon).
- **Data helpers:**
  - posts by section, newest first
  - latest post per section
  - counts and "since" dates
  - prev/next within a section
  - roman numerals and ordinal words
  - reading time
- **Date formatters, one per theme:** HP "17 May 2024"; Code "2024-04-01"; On "11th September 2026", plus the short programme form "11th Sept. 2026".

**5.7 Fonts.**

- **Swap the typefaces:** replace Hack and IBM Plex with Fraunces (variable, with italics), Source Sans 3, JetBrains Mono, Holtwood One SC, Alfa Slab One, Rye and Oswald.
- **How to load them:** self-host (Fontsource, or Astro's built-in fonts support if this version has it), subset, `font-display: swap`, and preload only the display face each theme needs.
- **Cleanup:** delete the unused font files.

**5.8 Assets.**

- Put the hero portrait into `src/assets/` and render it with Astro's image pipeline (responsive sizes, explicit dimensions).
- Reference the two masks from CSS (`mask-image`). The three files share one box (`aspect-ratio: 1527/1500`).
- Existing post images must keep working.

**5.9 Homepage content.**

- **Hero copy:** H1 and lede.
- **About:** the hobbies (Dymo labels) and "I also do web development for a living." with its four statements.
- **Hobbies list:** `about.mdx` has more hobbies than the 17 shown in the design. Treat `about.mdx` as the source of truth, and ask Cam whether to show all of them.
- **Copy with no home in the design:** decide where About's "Work history" and "Past project highlights" go. See the open questions.
- **Content location:** say whether homepage content lives in a data file, an MDX partial or the page itself.

**5.10 Content edits the designs imply.**

- **`top-concertvids.mdx`:**
  - "Some people say I'm a dreamer, but I'm not the only one." becomes a blockquote.
  - Each `<YouTube>` currently comes *before* its `##` heading. The design order is heading → video card → caption → text, so reorder the source and add captions.
- **`top_ten_tips_on_class.mdx`:**
  - Tips are written as `## 1. Never run in the rain`. They must render as a roman-numeral span inside the h2 (see 6.4).
  - Tip 5's "(one clean, one dirty, and one long and dirty)" is set lighter in the design.
- List any other markup changes the templates need.

**5.11 Tags.**

- **Home tag selector:** data is built at compile time.
- **Tag links:** decide where the tag links in listings and posts go. Options are kept `/tags/[tag]` pages (they'd need a design, probably reusing the Life list style) or `/?tag=x#tags` pre-selecting the home selector. Recommend one.
- **The "life" tag clash:** see the open questions.

**5.12 RSS.** One feed built from the collections, using the new absolute URLs, with the section included as a category.

**5.13 Client-side JS.**

- **Keep it minimal:** small vanilla scripts only, with no UI framework.
- **Scripts needed:** the tag selector (an `aria-pressed` toggle and an `aria-live` results list) and the copy buttons on code blocks.
- **`ClientRouter`:** decide whether to keep it now that themes swap CSS and fonts between pages. If you keep it, scripts must re-init on `astro:page-load`, and Pico-8 links still need `data-astro-reload`.

**5.14 Code highlighting.**

- Match the terminal code blocks: a caption bar (`── bash` plus a copy button), CSS line numbers and horizontal scroll.
- Use a Shiki theme close to the terminal palette, or a custom one, and Shiki transformers or a rehype plugin for the chrome.

**5.15 YouTube.** Style the existing lite embed to match the Life post's video cards:

- navy frame
- blue offset shadow
- orange play button
- a "Video · YouTube" label

It must still load nothing from YouTube until clicked.

**5.16 Meta and SEO.**

- **Titles:** use the designs' title pattern, e.g. `On Being Classy — Pseudo Philosophy Meditations — sasky.nz`.
- **Head tags:** meta description, canonical URL and basic Open Graph tags.

---

## 6. Part 2: building each theme's page types

For every page type, the plan should list:

- the design file to follow
- the components to build
- the data it needs and where that data comes from
- its responsive behaviour at 390px
- any interactive parts
- acceptance checks (what "matches the design" means)

Suggested build order is foundations, then HP, then Code, then On.

### 6.1 Shared foundations

- **Top bar** (spec in README):
  - 66px tall, 1120px inner width, 24px gutters, 2px bottom rule.
  - Each theme has its own mark: HP an orange square with a blue offset; Code a blinking green cursor block; On a dark diamond.
  - The current section gets a 3px underline.
  - Under 480px it tightens (16px gutters, 20px wordmark).
- **Base:** skip link, focus-visible styles, `prefers-reduced-motion` handling, and the page textures (graph grid, terminal scanlines and glow, kraft with fold lines). Textures must be non-interactive background layers.
- **Breakpoints:** consolidate the ones in the designs (480, 720/760, 820, 900) into a small shared set.

### 6.2 HP theme: Home, Life listing, Life post

**Home** (`Site-Home.dc.html` plus `TagSelector.dc.html`)

- **Hero:**
  - **Layers:** paper and graph grid; an orange plus-mark pattern over the left half; a blue wash panel (about 66% wide) masked to fade out towards the left; the portrait box anchored right.
  - **Inside the portrait box:**
    - two striped ghost silhouettes (mask plus repeating gradient), offset 40px and 80px to the left
    - the cutout photo with a drop shadow
    - the orange jacket-stripe mask, misregistered by about 5px
  - **Copy and label:** a navy Dymo name label, the H1 with an orange highlighter on "little corner", and the italic lede.
  - **Phones:** the hero stacks, with the photo about 480px tall above the copy and the plus marks and label hidden.
  - **Tweaks:** bake the design defaults into CSS custom properties (field .85, stripes .9, misregister 5px, ghost 40px, photo offset -40px, crosses .55, texture .8).
- **About:** two columns (one on phones).
  - **Hobbies:** Dymo labels with the colour rhythm (every 3rd blue, every 5th orange) and slight tilts.
  - **Web dev:** four statements with orange asterisk bullets.
- **Sections:** three rectangular doorway cards (Code, Life, On), each with:
  - a navy border and blue offset shadow, turning orange and lifting on hover
  - a Dymo count label overlapping the top edge
  - a small preview in that section's theme
  - the section blurb, the latest post with its date, and "Enter X →"
  - Cards side-scroll with scroll-snap when they don't fit.
- **Browse by tag:**
  - an HP card
  - Dymo tag chips with counts; the selected chip is navy and tilted
  - results rows with a section label (Code navy, Life blue, On orange), the title and the date
  - all posts for the tag, with no pagination and no "see all" link
  - It must work without JS: either render the default tag's results server-side, or degrade to the full list.
- **Footer:** the small wordmark and ©, then mono uppercase links, with RSS as an orange Dymo label.

**Life listing** (`Site-Life-List.dc.html`)

- **Header band:** plus marks on the left and the blue wash on the right, a Dymo count label, a huge "Life" title, the lede and an intro placeholder.
- **The list:** "Every Life post, newest first", laid out like Code's listing. Each row has:
  - a date and read-time column
  - a Fraunces title link
  - the italic description
  - outlined tag labels
- **Style:** flat, not raised. Rows get a hover tint and an orange underline on the title.
- **Placeholders:** don't build the greyed placeholder rows.

**Life post** (`Site-Life-Post.dc.html`)

- **Header:** a mono breadcrumb, the H1, the italic lede, and a meta row between navy rules (date, orange diamond, read time).
- **Body:** Fraunces at about 21px, with MDX elements mapped to the design:
  - `h2` with the orange/blue mark
  - `blockquote` with a big orange asterisk
  - links in blue with an orange underline
  - video cards
- **After the body:** tag labels, then "More in Life" (older post, plus a link to all Life posts).

### 6.3 Code theme: listing, post

**Code listing** (`Site-Code-List.dc.html`)

- **Header:** `cat README.md` prompt, `# Code`, the tagline, an intro placeholder and the `total` / `since` stats.
- **Listing:** the `ls -lt` prompt and "# every code post, newest first", then entries with a perms string, ISO date, `>` title, `#` description and `[tag]` links.
- **Close:** a prompt line with a blinking cursor, and the `-- NORMAL --` footer.

**Code post** (`Site-Code-Post.dc.html`)

- **Header:** the prompt breadcrumb `cam@sasky:~/code$ cat <slug>.md`, the title and the meta.
- **Body:** prose styles, `###` heading prefixes, and terminal code blocks (caption bar, copy button, line numbers).
- **Sidebar:** a sticky "On this page" table of contents built from the headings, hidden under 900px.
- **After the body:** "More in Code" with prev/next.
- **Pico-8:** the Hide n Seek embed must sit well in this theme. Note the todo about large monitors.

### 6.4 On theme: listing, post

**On listing** (`Site-On-List.dc.html`)

- **Frame:** a double-framed handbill with "Cameron Grant of Wellington, Aotearoa, presents" and the H1 "Pseudo Philosophy Meditations".
- **Eye illustration:** an SVG eye with conic-gradient rays. On phones it shrinks and must stay inside the frame.
- **Header copy:** the intro placeholder, then the count and "since" line.
- **Headliner:** the latest meditation, with "!Now Showing · Meditation the Nth!", title, description, excerpt, byline and date, and "Read On, if You Dare!".
- **"Also Appearing":** the full programme, newest first, with roman numerals.
- **Close:** the correspondence footer and the colophon.

**On post** (`Site-On-Post.dc.html`)

- **Header:** the handbill frame and "!Meditation the Second!" (ordinal computed by date). Then a breadcrumb to the series, the H1, the description as subtitle, and the byline and date in ordinal style.
- **Body:**
  - a drop cap on the first paragraph
  - the numbered tips, written in MDX as `## 1. …` and rendered as `<h2><span class="num">I.</span> …</h2>`, with the numeral hung about 40px left of the heading text (above it on phones)
  - an optional ornament divider as an MDX component
- **Implementation of the numerals:** use an MDX component override or a rehype plugin, scoped to On posts only.
- **After the body:** "Finis", the "Filed under" tags, and "Further Meditations in this Series" (prev/next), plus "The Full Programme of Meditations".

### 6.5 Everything else

- **Tag pages:** whatever 5.11 decides.
- **404 page:** in the HP theme.
- **About:** confirm that the `/about` redirect lands on the homepage About section.

---

## 7. Quality bar (include these checks in the plan)

- **Builds:** `npm run build` and `astro check` pass. No broken internal links, and every old URL 301s to the right page.
- **Visual comparison:** Playwright screenshots of every page type at 1280px and 390px, compared side by side with the design files. Note any intentional differences.
- **Accessibility:**
  - 44px touch targets, visible focus, correct `aria-current` and `aria-pressed`.
  - Readable contrast; check orange on navy, light text on blue, and muted text on paper.
  - Reduced motion: no blinking cursor or hover lifts.
- **Performance:** a Lighthouse pass on Home and one post per theme. Only each theme's fonts load, the hero image is properly sized, and no YouTube requests fire before click.

## 8. Open questions to raise with Cam

Ask these up front if any of them block the plan. Otherwise list them at the top of the plan with your recommendation for each.

1. **The "life" tag:** posts still carry a `life` tag (Hide n Seek, the concert post, the On posts), and the Life section now has the same name. Rename the tag, drop it, or keep it?
2. **About content with no home:** where do "Work history" and "Past project highlights" go? Options: a section on the homepage, a separate page, or dropped for now.
3. **Hobbies:** show the full list from `about.mdx`, or the 17 in the design?
4. **Tag links:** keep `/tags/[tag]` pages (needs a design) or link to the homepage tag selector?
5. **`on-being-in-the-moment-vs-past-and-future`:** is it an On meditation, and does it want a shorter slug?
6. **Section intro copy:** the designs have `[Intro copy…]` placeholders for Code, Life and On. Ship them as TODOs, or wait for copy?
7. **View transitions:** keep `ClientRouter` across themes, or drop it?

## 9. What the plan document should look like

- **Opening:** a short summary of the approach, then the open questions with your recommendation for each.
- **Inventory:** the current state of the repo (what exists and what will be removed).
- **Part 1 (code and content changes)** and **Part 2 (page types by theme)**, as above.
- **Phases.** Suggested phases:
  1. Branch and baseline screenshots of the current site.
  2. Content collections, routes and redirects, so the site still works in the old look at the new URLs.
  3. Foundations: tokens, fonts, top bar, footers, layouts.
  4. HP pages.
  5. Code pages.
  6. On pages.
  7. Tags, RSS and SEO.
  8. Mobile, accessibility and performance QA.
  9. Cleanup and launch checklist.
- **Phase contents:** each phase is a reviewable PR on a `redesign` branch.
- **Task fields:** within phases, each task gives what to do, the files touched, its dependencies, how to verify it, and a size (S/M/L).
- **Risks and mitigations:** for example, MDX import paths breaking after the move, view transitions with per-theme CSS, the Pico-8 embed, redirect edge cases, and font weight and FOUT.
- **Snippets:** keep code to short illustrative snippets only. Don't implement.

When the plan is written, summarise it in a few lines, list the open questions, and wait.
