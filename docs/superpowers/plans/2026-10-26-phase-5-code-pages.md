# Phase 5: Code Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move `/code` and `/code/[slug]` onto the terminal theme: our own Shiki theme with captioned, copyable, line-numbered code blocks, a sticky TOC, and Hide n Seek's game in a terminal-window panel.

**Architecture:**
- **Pages** use `CodeLayout`. Code page parts live in a new `src/components/code/`. The MDX overrides `CodeBlock` and `ImageCollection` live in `src/components/mdx/`.
- **Highlighting:** a custom Shiki theme (`src/shiki/sasky-terminal.json`) is set in `markdown.shikiConfig`, which MDX inherits. A `metaToData` transformer copies a fence's `title="…"` onto the `pre` and drops the newline text nodes between `.line` spans (R7).
- **The Code post template** passes `components={{ pre: CodeBlock }}` to `<Content />`, so only Code posts get the caption bar and copy button.

**Tech Stack:** Astro 7.3.4 (`markdown.shikiConfig`, `render()` headings), Shiki (bundled with Astro), Vitest 5, Playwright 1.64.

**Spec:**
- [`docs/redesign-plan.md`](../../redesign-plan.md): 5.10 (Silverstripe and Hide n Seek rows), 5.13 (`copy-code.ts`), 5.14, 5.16 (titles), 6.3, G3, G4, G5, G7 (Code), R4, R7, and tasks 5.1–5.3. It wins on conflicts.
- Design values: `design-handoff/design/Site-Code-List.dc.html` and `Site-Code-Post.dc.html`.
- Roadmap carry-forwards for Phase 5: repeat the chrome checks on the first Code page; re-pin the wordmark cursor's reduced-motion test; gate the listing prompt's cursor.

## Calls made in place of a brainstorm

Cam's standing preference is to skip the brainstorm Q&A and review these calls with the PR.

1. **Breakpoints:** the list board uses 720px; we use 760px, because the global constraint allows only 480, 760 and 900. The post board's 900px stays.
2. **TOC link height:** 44px, not the board's 36px, to meet the 44px target rule. The TOC is desktop-only, so the cost is a slightly taller box.
3. **G7 for Code:**
   - The older card shows when there is one.
   - The right card shows the newer post ("newer in ~/code · {date} →") when there is one, otherwise "All Code posts · # newest post, nothing newer yet".
   - With no older post (Hide n Seek), only the newer card shows. The TOC's "← cd ~/code" and the breadcrumb still lead back to the listing.
4. **Copy text** is built from the block's `.line` elements joined with `\n`. That's necessary because R7's fix removes the newline text nodes, so `textContent` alone would run the lines together.
5. **Empty code lines** get `min-height: 1lh`, so blank lines keep their height once the `\n` nodes are gone.
6. **Pico-8 panel caption** reads "── hidenseek.p8" on the left and "arrow keys + X" on the right (spec G4 asks for "the controls hint"; this is the shortest wording of the post's own instructions). The post's own "**use the arrow and X keys to play**" line stays as written.
7. **Pico-8 sizing:** `#p8_frame` becomes a square, `width: min(100%, 80vh, 800px); aspect-ratio: 1`. The loader sizes the canvas to `min(frame width, frame height)`, so this gives the spec's `min(80vh, 100%, 800px)` with no loader changes.
8. **Code tag links** take their `--tag-*` tokens from `code.css`: amber `[tag]`, `#ffd08f` underlined on hover, as on the boards.
9. **Content edits** stay within spec 5.10:
   - the Silverstripe fence languages and titles, dropping the `build command: ` prefix from that code line;
   - `<mark>` around "Down that path, there be dragons,";
   - `**Cam out.**`;
   - Hide n Seek's aliased `ImageCollection` import (already aliased).

   The board also adds backticks around a few words (`SS_DEFAULT_ADMIN` and others) and a different `MAILER_DSN` value. Those aren't in 5.10, so they're left alone.

## Global Constraints

- Astro 7 APIs only, no UI framework; client JS is small vanilla `<script>` modules bundled only by the components that use them.
- **Design values** come from the `.dc.html` boards, converted to scoped CSS and custom properties; never paste inline styles. `{{accent}}` is `#6ee7a0`, `{{texture}}` is `.75`, and `{{glow}}` is `rgba(110,231,160,.35)` (the Home door's glow value).
- **Computed values:** counts, since-dates, reading times, ISO dates, neighbours and TOC entries all come from content.
- **Dates** are formatted with the UTC helpers in `src/lib/format.ts`. `npm test` runs under `TZ=America/Los_Angeles`.
- **Theme isolation:** Code pages load only `code.css` and JetBrains Mono. Shared components stay token-only, and Code values go in `code.css` or in Code-only components.
- **Breakpoints:** 480, 760 and 900 only.
- **Accessibility:** 44px targets; a visible `:focus-visible` (amber 2px); `aria-current` from TopBar. Under `prefers-reduced-motion: reduce`, both cursors stop blinking and transitions turn off. Heading prefixes (`##`, `###`) use `content: "## " / ""` so screen readers skip them.
- **Placeholders:** no `[bracketed]` copy. The intro comes from `SECTIONS.code.intro`, and is omitted when it's empty.
- **Content:** no post copy changes beyond the calls in 9 above.
- **URLs:** lowercase kebab-case with no trailing slash; build them with `postUrl()` and `SECTIONS`.
- **Branch:** `redesign/phase-5-code-pages`, cut from `feature/redesign`. Commit as `sasky` / `cam@sasky.nz`, ending each message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stage paths explicitly; never stage `design/`.

## Review Focus

1. **Copying a block** must give exactly the source code: no line numbers, no caption text, a `\n` between lines, and blank lines kept. Pinned in Task 4: the PHP block, which has blank lines, round-trips through the clipboard.
2. **Long code lines at 390px** (the 60-character database host) scroll inside the block, and the page itself doesn't scroll sideways. Pinned in Task 4.
3. **The Code post with no older neighbour** (Hide n Seek) shows only the newer card, and the newest post (Silverstripe) shows its older card plus "All Code posts". Pinned in Task 3.
4. **Pico-8 on a 2560×1440 screen:** the started canvas is at most 800px and fits the viewport height. Pinned in Task 5. The existing Phase 2 "loads its cart when started" test must stay green.
5. **Reduced motion on Code pages:** the wordmark mark and the listing prompt cursor both report `animation-name: none`. Pinned in Task 2.

---

### Task 1: Terminal Shiki theme and the `metaToData` transformer

**Files:**
- Create: `src/shiki/sasky-terminal.json`, `src/shiki/meta-to-data.ts`, `tests/unit/shiki.test.ts`
- Modify: `astro.config.mjs` (move the Shiki settings from `mdx({ shikiConfig })` to `markdown.shikiConfig`)

**Interfaces:**
- Produces: `metaToData: ShikiTransformer` (from `@shikijs/types` or `shiki`), with:
  - `pre(node)`: sets `node.properties["data-title"]` from `title="…"` in `this.options.meta?.__raw`.
  - `code(node)`: removes the whitespace-only text children that sit between `.line` spans.

- [ ] **Step 1: Write the failing tests** in `tests/unit/shiki.test.ts`. Use `codeToHtml` from `shiki` with `{ lang, theme: terminal, transformers: [metaToData], meta: { __raw } }`.
  - `"title from the fence meta lands on the pre"`: `meta: { __raw: 'title=".env · database"' }` gives `data-title=".env · database"`.
  - `"no title, no data-title"`: no meta gives no `data-title`.
  - `"lines are not separated by newline text nodes"`: a 3-line bash snippet's `<code>` matches `/<\/span><span class="line">/` and not `/<\/span>\n<span class="line">/`.
  - `"theme colours"`: in a `dotenv` snippet `A=1`, the key renders `#8CC8FF` and the value `#A6E3A1`; a `php` comment renders `#5F7A6A` with `font-style:italic`. Compare case-insensitively.
  - `"theme background"`: the `pre` style contains `background-color:#070a09` (case-insensitive).
- [ ] **Step 2: Run** `npm test -- shiki`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement the theme and the transformer.**
  - **Theme** (spec 5.14): background `#070a09`, foreground `#c8d6cb`.
  - **`tokenColors` scopes:**
    - `#8cc8ff`: `entity.name.function`, `support.function`, `entity.name.type`, `support.class`, `entity.name.command`, `variable.other.env`, `variable.other.constant`, `entity.other.attribute-name`, `variable.other.readwrite`.
    - `#a6e3a1`: `string`, `string.unquoted`.
    - `#f2b45a`: `keyword`, `storage`, `constant.language`, `punctuation.section.embedded`, `meta.tag.php`.
    - `#5d7466`: `punctuation`, `keyword.operator.assignment`.
    - `#5f7a6a` italic: `comment`.

    Adjust the scopes by inspecting `codeToTokens` output until the tests pass. The `dotenv`, `bash` and `php` grammars are what this site uses.
  - **Transformer:** in `src/shiki/meta-to-data.ts`, parse `title="([^"]*)"` from the raw meta.
- [ ] **Step 4: Run** `npm test -- shiki`. Expected: PASS.
- [ ] **Step 5: Move the config.** Set `markdown: { shikiConfig: { theme: terminal, transformers: [metaToData] } }` and make `mdx()` take no Shiki options. Import the theme JSON with `import terminal from "./src/shiki/sasky-terminal.json" with { type: "json" };`.
- [ ] **Step 6: Run** `npm run build && npm test && npm run test:e2e`. Expected: PASS. Legacy Code posts lose their newlines between lines here; that's acceptable, because Task 4 restores line layout on the new template, and the posts switch over in Task 3.
- [ ] **Step 7: Commit:** `feat(code): terminal Shiki theme and metaToData transformer`.

### Task 2: Code listing

**Files:**
- Create: `src/components/code/Prompt.astro`, `src/components/code/CodeListEntry.astro`, `tests/unit/code-components.test.ts`, `tests/e2e/code.spec.ts`
- Modify: `src/styles/themes/code.css` (the `--tag-*` tokens and the `.lnk` link style), `src/pages/code/index.astro`

**Interfaces:**
- Produces:
  - `Prompt.astro`: `{ path?: string; cmd?: string; cursor?: boolean; crumbs?: boolean }`. It renders `cam@sasky:` + path + `$ ` + cmd. When the path starts with `~`, the `~` links to `/`. With `crumbs`, the path `~/code` renders as `nav[aria-label="Breadcrumb"]`, with `~` linking to `/` and `code` linking to `/code`. `cursor` appends a 9×18 accent block (`.prompt-cursor`, `aria-hidden`) that blinks except under reduced motion.
  - `CodeListEntry.astro`: `{ post: PostEntry }`.
  - In `code.css`, `.lnk` is the blue link (`#6cb6ff`; hover `#b5dbff` on a 12% tint; active `#07110b` on `#6cb6ff`), and the HTML links in `.prose-code` use the same rules (Task 3).

- [ ] **Step 1: Write the failing component tests** in `tests/unit/code-components.test.ts`.
  - `"Prompt links ~ home"`: `{ path: "~/code", cmd: "cat README.md" }` gives `href="/"`, the text `/code`, `$`, and `cat README.md`.
  - `"Prompt breadcrumb"`: with `crumbs: true`, a `nav[aria-label="Breadcrumb"]` containing `href="/"` and `href="/code"`.
  - `"CodeListEntry"`: for a fake code post (as in `hp-components.test.ts`, `pubDate` 2024-04-01, tags `["silverstripe","learning"]`), `datetime="2024-04-01"` with the text `2024-04-01`, `-rw-r--r--`, a title link to `/code/{id}`, `# {description}`, and `[silverstripe]` linking to `/tags/silverstripe`.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement `Prompt`, `CodeListEntry` and the `code.css` tokens.**
  - **Tag tokens:**
    - `--tag-color: var(--amber)`, `--tag-font: var(--font-jetbrains)`, `--tag-size: 13px`, `--tag-weight: 400`;
    - `--tag-tracking: normal`, `--tag-transform: none`, `--tag-min-h: auto`, `--tag-padding: 0`, `--tag-border: 0`, `--tag-radius: 0`;
    - `--tag-hover-bg: transparent`, `--tag-hover-color: #ffd08f`, `--tag-hover-decoration: underline`;
    - `--tag-gap: 0 16px`.
  - **`CodeListEntry`** takes its values from `article.entry` in the list board:
    - grid `150px minmax(0,1fr)`, 24px gap, padding `24px 12px`, dashed `--rule-dashed` bottom;
    - left column: `-rw-r--r--` (hidden at 760px and below) and the ISO date in `--muted-2`;
    - right column: an `h3` 22px/1.35 800 link with an accent `> ` prefix (`aria-hidden`), `# {description}` in muted, and `TagLinks theme="code"`;
    - row hover: `rgba(110,231,160,.06)` and an underlined title; `:active` `.12`;
    - at 760px and below: single column, 6px gap.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Rewrite `src/pages/code/index.astro`** on `CodeLayout`: title `Code — sasky.nz`, description `SECTIONS.code.blurb`.
  - **`main.code-main`:** max 1040px, padding `72px 32px 96px`, gap 72px. At 760px and below, padding `44px 20px 72px` and gap 52px.
  - **Header** (16px gap, 40px bottom padding, dashed bottom rule):
    - `Prompt path="~/code" cmd="cat README.md"`;
    - H1 `# Code`: 60px/1.05 800, `-0.02em`, bright, with a `0 0 22px rgba(110,231,160,.35)` glow; the `# ` is accent and `aria-hidden`; 40px at 760px and below;
    - `> {blurb}` in 19px italic `--muted-2`, max `60ch`;
    - the intro (when set) as `<!-- {intro} -->` in `#6f8a7a`, max `64ch`;
    - stats `total {countLabel}` and `since {formatMonthYear(since)}` in 13px, labels muted, values bright, gap `8px 28px`.
  - **Section** (20px gap):
    - `Prompt path="~/code" cmd="ls -lt"`;
    - `h2#all` "# every code post, newest first", 15px muted 400;
    - the entries inside a dashed top rule.
  - **Close:** `Prompt path="~/code" cursor`.
- [ ] **Step 6: Write `tests/e2e/code.spec.ts`:**
  - `"Code listing heading, stats and entries"`:
    - title `Code — sasky.nz`;
    - `h1` text `# Code`, with the accessible name `Code`;
    - `h2#all` is `# every code post, newest first`;
    - stats text contains `total 2 posts` and `since January 2024`;
    - 2 `article`s, newest first: Silverstripe, then Hide n Seek;
    - no `[` inside `main` except the `[tag]` links (assert that `main p` texts contain no `[`).
  - `"Code listing chrome"`:
    - `expectTopBarGeometry` at 1280 (24) and 390 (16);
    - `expectTabOrder`, `expectInertTexture`;
    - `expectOnlyThemeCss(page, request, "code", /JetBrains Mono/)`;
    - `.site-nav-link[href="/code"]` has `aria-current="page"`.
  - `"reduced motion stops both cursors"`: under `emulateMedia({ reducedMotion: "reduce" })`, `.site-mark` and `.prompt-cursor` both have `animationName` `none`. Without reduced motion, `.prompt-cursor`'s is not `none`.
  - `"Code listing has no horizontal overflow at 390"`.
- [ ] **Step 7: Run** `npm run build && npm run test:e2e && npm test && npm run check:links`. Expected: PASS.
- [ ] **Step 8: Commit:** `feat(code): terminal Code listing`.

### Task 3: Code post template, TOC and prev/next

**Files:**
- Create: `src/components/code/CodePostHeader.astro`, `src/components/code/Toc.astro`, `src/components/code/CodePrevNext.astro`
- Modify: `src/styles/themes/code.css` (`.prose-code`), `src/pages/code/[slug].astro`, `tests/unit/code-components.test.ts`, `tests/e2e/code.spec.ts`

**Interfaces:**
- Consumes: `Prompt` (Task 2), `neighbours()`, `readingTime()`, and `render(post)` returning `{ Content, headings }`.
- Produces:
  - `CodePostHeader.astro`: `{ slug: string; title: string; description: string; pubDate: Date; minutes: number; tags: string[] }`.
  - `Toc.astro`: `{ headings: { depth: number; slug: string; text: string }[] }`. Renders only depth 2 and 3; renders nothing when none are left.
  - `CodePrevNext.astro`: `{ older?: PostEntry; newer?: PostEntry }`.

- [ ] **Step 1: Write the failing component tests:**
  - **`"Toc lists h2 and h3 with prefixes"`:**
    - headings at depths 1, 2, 3 and 4 give exactly 2 links, `href="#setup-steps"` and `href="#step-1"`, each with an `aria-hidden` prefix of `##` or `###`;
    - the box starts with `$ grep '^#' post.md`;
    - the last link goes to `/code`, with the text `← cd ~/code`.
  - **`"Toc renders nothing without headings"`.**
  - **`"CodePrevNext older and newest"`:** with only `older` (Hide n Seek): `← older in ~/code · 29 January 2024`, `Hide n Seek`, `# Building a game for my girls`, then `All Code posts` and `# newest post, nothing newer yet` linking to `/code`.
  - **`"CodePrevNext newer only"`:** with only `newer` (Silverstripe): exactly one `<a`, the text `newer in ~/code · 1 April 2024 →`, linking to `/code/silverstripe-app-platform`.
  - **`"CodePostHeader"`:** the breadcrumb prompt `cat {slug}.md`, `<h1>` containing the title, `> {description}`, `date`, `1 April 2024`, `read`, `6 min read` and the `[tag]` links.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement the three components** with values from `Site-Code-Post.dc.html`.
  - **`CodePostHeader`:** 18px gap, 32px bottom padding, dashed rule.
    - Prompt with `crumbs`.
    - H1 44px/1.18 800, max `24ch`, balanced, with an accent `# ` prefix (`aria-hidden`); 30px at 900px and below.
    - `> description` in 17px italic, max `64ch`.
    - Meta row with gap `0 28px`: `date`, `read` and `tags`, followed by `TagLinks theme="code"` with `--tag-gap: 0 12px`.
  - **`Toc`:** `aside[aria-label="On this page"]` > `.toc`.
    - Sticky at `top: 24px`; 16px gap, 20px padding, dashed border, `rgba(11,15,13,.6)` background, 13px/1.5.
    - Links: depth-2 in bright, depth-3 in `--muted-2`; hover bright; `:active` `#07110b` on accent; 44px min-height; text clamped to 2 lines (G5).
    - The `← cd ~/code` link has the `.lnk` style, a dashed top rule and 6px top padding.
  - **`CodePrevNext`:** `nav[aria-label="More in Code"]`.
    - Grid `repeat(auto-fit, minmax(min(300px,100%),1fr))`, 16px gap, 16px top padding.
    - Cards: dashed border, padding `22px 24px`, 6px gap; hover is a 5% accent tint with an underlined title; `:active` 10%.
    - Labels 12px muted, titles 18px 800 bright, descriptions `# …` muted. The right card is right-aligned.
    - G7 as in call 3.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Add `.prose-code` to `code.css`** (under `:where([data-theme="code"])`). Values from the board's `.prose`:
  - 16px/1.8, max `70ch`, `> * + * { margin-top: 22px }`;
  - `h2`: 26px/1.3 800 bright, `::before { content: "## " / ""; color: var(--accent) }`;
  - `h3`: 19px/1.4 700 bright, `margin-top: 40px`, `::before { content: "### " / ""; color: #4f6b5a }`;
  - links as `.lnk`;
  - inline `code`: amber on `#14201a`, 1px `--rule-dashed` border, `1px 6px` padding, `.92em`;
  - `strong`: bright 700;
  - `mark`: transparent background, amber.
- [ ] **Step 6: Rewrite `src/pages/code/[slug].astro`** on `CodeLayout`:
  - title `{title} — Code — sasky.nz`, description `metaDescription ?? description`, `ogType="article"`;
  - `main.code-main`: max 1120px, padding `56px 32px 96px`, gap 40px; `40px 20px 72px` at 900px and below;
  - `CodePostHeader`, then (for `pico8` posts) the slot Task 5 fills, then `.post-grid` (`minmax(0,1fr) 250px`, gap 64px, `align-items: start`; single column at 900px and below, TOC hidden);
  - inside the grid: `article.prose-code` holding `<Content />` and the aria-hidden `EOF` rule (dashed rules either side, 12px `#4f6b5a`, 16px top margin), then `Toc`;
  - then `CodePrevNext` with `neighbours(await getPosts("code"), post.id)`.

  Render the legacy `Pico8` above the grid for now when `post.data.pico8` is set, so the game keeps working until Task 5.
- [ ] **Step 7: Add the e2e tests:**
  - `"Code post header and TOC"`:
    - on `/code/silverstripe-app-platform`: title `Cheap and easy Silverstripe hosting — Code — sasky.nz`;
    - the `nav[aria-label="Breadcrumb"]` links are `/` and `/code`;
    - the TOC lists 5 links whose `href`s match the ids of the `h2` and `h3` elements in `.prose-code`, in order;
    - `.site-nav-link[href="/code"]` has `aria-current="true"`.
  - `"More in Code follows G7"`: Silverstripe has 2 cards (older Hide n Seek, then `/code`); Hide n Seek has 1 card linking to `/code/silverstripe-app-platform`.
  - `"TOC hides under 900 and the post doesn't overflow at 390"`.
  - `"Code post chrome"`: `expectOnlyThemeCss(..., "code", /JetBrains Mono/)`.
- [ ] **Step 8: Run** `npm run build && npm run test:e2e && npm test && npm run check:links`. Expected: PASS, including Phase 2's Pico-8 test.
- [ ] **Step 9: Commit:** `feat(code): terminal Code post with TOC and prev/next`.

### Task 4: Code blocks: caption, copy and line numbers, plus the Silverstripe edits

**Files:**
- Create: `src/components/mdx/CodeBlock.astro`, `src/scripts/copy-code.ts`
- Modify: `src/pages/code/[slug].astro` (pass `components={{ pre: CodeBlock }}`), `src/content/posts/silverstripe-app-platform.mdx`, `tests/e2e/code.spec.ts`

**Interfaces:**
- Consumes: `data-title` and `data-language` on the `pre` (Task 1).
- Produces: `CodeBlock.astro`, which receives the `pre`'s attributes as props and renders `figure.code-block` > `figcaption` (`span.code-title` `── {title ?? language}` + `button.copy` "copy") + `<pre {...attrs}><slot /></pre>`.

- [ ] **Step 1: Apply the spec 5.10 Silverstripe edits:**
  - The fences become ```` ```bash ````, ```` ```dotenv title=".env · database" ````, ```` ```dotenv title=".env · silverstripe" ````, ```` ```dotenv title=".env · mail" ````, ```` ```bash title="build command" ```` (with the code line `vendor/bin/sake dev/build "flush=1"`) and ```` ```php title="app/_config.php" ````.
  - "Down that path, there be dragons," becomes `<mark>…</mark>`.
  - "Cam out." becomes `**Cam out.**`.
- [ ] **Step 2: Write the e2e tests** in `code.spec.ts` (`/code/silverstripe-app-platform`):
  - `"block captions match the design"`: the `.code-title` texts are exactly `["── bash", "── .env · database", "── .env · silverstripe", "── .env · mail", "── build command", "── app/_config.php"]`.
  - `"copy gives exactly the code"`:
    - `context.grantPermissions(["clipboard-read", "clipboard-write"])`;
    - click the last block's copy button and read `navigator.clipboard.readText()`;
    - it equals the PHP block's source from the MDX, read from disk with `fs` and extracted between the fence lines;
    - the button text becomes `copied`.
  - `"line numbers aren't copied or selectable"`: select the first `.line` of the database block and read `getSelection().toString()`; it doesn't start with a digit and equals `SS_DATABASE_CLASS=MySQLDatabase`.
  - `"blank lines keep their height"`: in the PHP block, every `.line` height is at least 20px.
  - `"long lines scroll inside the block at 390"`: at 390 the page `scrollWidth` is at most 390, and the database block's `pre` has `scrollWidth > clientWidth`.
  - `"mark and sign-off"`: `.prose-code mark` has the text `Down that path, there be dragons,`, and `.prose-code strong` is `Cam out.`.
- [ ] **Step 3: Run** `npm run build && npm run test:e2e -- code`. Expected: the new tests FAIL.
- [ ] **Step 4: Implement `CodeBlock.astro` and `copy-code.ts`.** Values come from the board's `figure` blocks:
  - **Frame:** 1px `--rule-dashed` border, `#070a09` background, `margin: 4px 0`.
  - **Caption:** flex row, space-between, bottom border, `#0d1511` background, 12px muted, label padding `0 14px`.
  - **Copy button:**
    - 44px tall, padding `0 16px`, left border, transparent, `--muted-2`;
    - hover bright on `#14201a`; `:active` `#07110b` on accent;
    - label in a `span[aria-live="polite"]`.
  - **`pre`:** padding `16px 20px 16px 8px`, 13.5px/1.75, `overflow-x: auto`, no margin.
  - **Line numbers:** `code { counter-reset: ln }`; `.line { display: block; position: relative; padding-left: 3.4em; min-height: 1lh; counter-increment: ln }`; `.line::before { content: counter(ln); position: absolute; left: 0; width: 2.4em; text-align: right; color: #3d5446; user-select: none }`. Use `:global()` where the selector reaches into the slotted code.
  - **`copy-code.ts`:** a delegated click on `button.copy` inside `figure.code-block`. It writes `[...figure.querySelectorAll("code .line")].map((l) => l.textContent).join("\n")` with `navigator.clipboard.writeText`, sets the label to `copied`, and resets it to `copy` after 2000ms.
- [ ] **Step 5: Pass `components={{ pre: CodeBlock }}`** to `<Content />` in `code/[slug].astro`.
- [ ] **Step 6: Run** `npm run build && npm run test:e2e && npm test && npm run check:links`. Expected: PASS.
- [ ] **Step 7: Commit:** `feat(code): captioned, copyable, line-numbered code blocks; Silverstripe fences per spec 5.10`.

### Task 5: Pico-8 panel (G4) and the image grid (G3)

**Files:**
- Modify: `src/components/Pico8.astro` (restyle in place; keep every id the loader uses), `src/components/ImageCollection.astro` (move it to `src/components/mdx/ImageCollection.astro`, and update the import in `hide-n-seek-game.mdx`), `src/pages/code/[slug].astro`, `tests/e2e/code.spec.ts`

**Interfaces:**
- Produces:
  - `Pico8.astro`: `{ pico8src: string }`, a full-width `figure.pico8-panel` with the caption bar (call 6) above the existing `#body_0` markup.
  - `ImageCollection.astro`: a scoped grid.

- [ ] **Step 1: Write the e2e tests** in `code.spec.ts` (`/code/hide-n-seek-game`):
  - `"Pico-8 panel caption and placement"`:
    - `.pico8-panel figcaption` contains `── hidenseek.p8` and `arrow keys + X`;
    - the panel sits after the post header and before `.post-grid`;
    - at 1280 its width is greater than the article's.
  - `"Pico-8 fits a 2560×1440 screen"`:
    - at 2560×1440, click `#p8_container` and wait for `/pico8/hidenseek.js`;
    - wait until `#canvas` has a non-zero height;
    - the canvas bounding box height is at most 800 and at most 1440.
  - `"Pico-8 at 390 fits the width"`: at 390, `#p8_frame` width is at most 350 and the page `scrollWidth` is at most 390.
  - `"comics in a 3-column grid, 2 at 390"`:
    - the grid's computed `grid-template-columns` has 3 tracks at 1280 and 2 at 390;
    - every image is inside the article column (its right edge is at most the article's right edge).
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Restyle `Pico8.astro`.**
  - **Move the sizing inline styles into scoped CSS:** `#p8_frame { display: flex; width: min(100%, 80vh, 800px); aspect-ratio: 1; margin: 0 auto }` (call 7). Keep the inline styles the loader toggles at runtime (`display` on `#p8_playarea` and the touch overlays).
  - **Wrap it** in `figure.pico8-panel`: 1px `--rule-dashed` border, `#070a09` background. The `figcaption` matches the code-block caption bar, with `── hidenseek.p8` on the left and `arrow keys + X` on the right.
  - **Background:** `#body_0` is `#070a09`.
  - **Template:** in `code/[slug].astro`, render `<Pico8 pico8src={post.data.pico8} />` between the header and `.post-grid`, and remove the Task 3 placeholder.
- [ ] **Step 4: Rebuild `ImageCollection`** as a scoped grid:
  - `display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px`, with 2 columns at 760px and below;
  - `:global(picture), :global(img)` get `display: block; width: 100%; height: auto`;
  - each picture gets a 1px dashed `--rule-dashed` frame with 6px padding;
  - drop the `100vw` breakout (G3).

  Move the file to `src/components/mdx/` and update the post's import to `@components/mdx/ImageCollection.astro`.
- [ ] **Step 5: Run** `npm run build && npm run test:e2e && npm test && npm run check:links`. Expected: PASS, including Phase 2's "Hide n Seek loads its cart when started".
- [ ] **Step 6: Commit:** `feat(code): Pico-8 terminal panel (G4) and comic grid (G3)`.

### Task 6: Phase checks and roadmap

**Files:**
- Modify: `docs/redesign-roadmap.md`; delete `src/components/legacy/LegacyPost.astro`'s Pico-8 import only if nothing else needs it (On posts don't use `pico8`)

- [ ] **Step 1: Run the full suite:** `npm run check && npm test && npm run build && npm run check:links && npm run check:redirects -- --dist && npm run test:e2e`. Expected: all pass.
- [ ] **Step 2: Check the redirects** on Netlify's local emulator: run `npx netlify-cli dev --offline --dir dist --port 8888`, then `npm run check:redirects -- --url http://localhost:8888`. Expected: 0 errors.
- [ ] **Step 3: Check the console.** Add a test to `code.spec.ts`, `"no console errors on Code pages"`, which collects `console` errors and `pageerror`s on `/code`, `/code/silverstripe-app-platform` and `/code/hide-n-seek-game` (before starting the game). Expect none.
- [ ] **Step 4: Update the roadmap:**
  - mark Phase 5 done;
  - list the calls for Cam's review;
  - move the Phase 5 carry-forwards out;
  - add new carry-forwards: legacy On posts still render through `LegacyPost`; the new Shiki theme applies to them too, but they have no code blocks;
  - refresh "Resuming in a fresh session" (next is Phase 6, On pages).
- [ ] **Step 5: Commit:** `docs: Phase 5 done`. Then the finish steps: verification, one fresh reviewer, and a PR into `feature/redesign`.
