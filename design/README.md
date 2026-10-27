# sasky.nz redesign — build brief

Three themes, one site. The homepage and tech posts use **Terminal**, personal posts use **Personal** (a long-read layout), and the "On" series uses **The ‘On’ Papers** (an early-1900s periodical look). Every theme has subtle background texture, and the body text stays easy to read.

- **Visual source of truth:** the design canvas (Cam's private link: https://claude.ai/artifact/5thn9jfj2PFQYGomBjoyqC).
- **Board source files:** `design/boards/*.dc.html` in this repo (described below).
- **The site's real content stays in `src/pages/*.mdx`.** The boards use real post copy only as sample text. Never hardcode post copy from a board.

---

## 1. Reading the board files

Each `design/boards/*.dc.html` is one artboard from the design canvas. They don't render on their own in a browser; read them as a spec.

- **Ignore the canvas runtime parts.** That means `<x-dc>`, `<helmet>`, `<script src="./support.js">`, the `data-dc-script` block at the bottom and `data-props`.
- **Inline `style="…"` values are the spec.** Use the exact px sizes, colours, gaps, borders and shadows. Turn them into Astro components with scoped CSS and per-theme custom properties. Don't copy the inline styles verbatim.
- **`{{holes}}` are design tweaks.** Use these default values:

| hole | board | value |
|---|---|---|
| `{{accent}}` | Main, Tech-Post | `#6ee7a0` |
| `{{glow}}` | Main | `rgba(110,231,160,.35)` |
| `{{accent}}` / `{{accent2}}` | Personal-Post | `#3d5a80` / `#c4893b` |
| `{{accentSoft}}` / `{{accentWash}}` | Personal-Post | `rgba(61,90,128,.28)` / `rgba(61,90,128,.07)` |
| `{{texture}}` | all | Terminal `.75`, Personal `.8`, On `.85` (opacity of the gradient texture layer) |
| `{{grain}}` | all | Terminal `.10` (normal blend), Personal `.09` (multiply), On `.14` (multiply) |

- **Links to `X.dc.html` are routes:**

| board | route |
|---|---|
| `Themes.dc.html` | none (the theme reference sheet) |
| `Main.dc.html` | `/` |
| `Tech-Post.dc.html` | any Terminal post, e.g. `/silverstripe-app-platform` |
| `Personal-Post.dc.html` | any Personal post, e.g. `/top-concertvids` |
| `On-Index.dc.html` | `/on` (new page) |
| `On-Post.dc.html` | any On post, e.g. `/top_ten_tips_on_class` |

- **`On-Post.dc.html` is partly out of date.** It still uses **League Gothic** for headings, but the On theme has moved to **Libre Franklin** (see `On-Index.dc.html` and `Themes.dc.html`). Use Libre Franklin throughout the On theme.

---

## 2. The repo today (what you're changing)

- Astro 6, posts are MDX **pages** in `src/pages/*.mdx` with `layout: ../layouts/MarkdownPostLayout.astro` in frontmatter.
- `src/pages/index.astro` globs `../pages/*.mdx` for the post list. `src/pages/tags/[tag].astro` and `tags.astro` exist. `rss.xml.js` exists.
- `BaseLayout.astro` uses `<ClientRouter />` (view transitions), `Header`, `Footer`, and `global.css`.
- `global.css` imports `open-props`, **`open-props/normalize/dark`** and **`buttons/dark`**. These force a dark scheme and will fight the two light themes, so scope or remove them.
- Fonts are self-hosted Hack and IBM Plex Sans in `src/styles/fonts/`. The redesign doesn't use them (see §8).
- MDX code highlighting uses Shiki with the `dracula` theme. `@astro-community/astro-embed-youtube` handles the videos (`<YouTube>`).
- `hide-n-seek-game.mdx` embeds Pico-8 and the homepage links it with `data-astro-reload`. **Keep that behaviour.**
- **Existing post URLs are live, so don't change any slugs.**

---

## 3. Theme routing

Add a `theme` frontmatter field (`terminal | personal | on`) to every post:

| file | theme |
|---|---|
| `silverstripe-app-platform.mdx` | `terminal` |
| `hide-n-seek-game.mdx` | `terminal` |
| `top-concertvids.mdx` | `personal` |
| `about.mdx` | `personal` |
| `on-happiness.mdx` | `on` |
| `on-new-zealand-music.mdx` | `on` |
| `top_ten_tips_on_class.mdx` | `on` |

If a post has no `theme`, fall back in this order:

1. Any tag in `silverstripe`, `learning` or `pico8` → `terminal`.
2. The title starts with `On ` → `on`.
3. Anything else → `personal`.

Note that *Concert vids* is tagged `life` like the On posts, so the `life` tag alone can't decide the theme.

- `/`, `/tags`, `/tags/[tag]` and 404 use `terminal`.
- `MarkdownPostLayout.astro` becomes a dispatcher that picks `TerminalPost`, `PersonalPost` or `OnPost`.
- Set `data-theme` on `<html>` and scope all theme CSS under it. Confirm it updates on client-side navigation with `ClientRouter`. If it doesn't, set it in an `astro:after-swap` handler.

---

## 4. Shared across themes

Each theme names all three sections in its own voice:

| theme | nav |
|---|---|
| Terminal | `[sasky.nz]` · `0:~/tech` · `1:~/personal` · `2:~/on` · right side: `about`, `cam@wellington` |
| Personal | `sasky.nz` wordmark · Tech · Personal · On · About |
| On | Technical Matters ✦ Personal Correspondence ✦ The ‘On’ Papers ✦ The Author |

- **Section targets:** tech is `/`, personal is `/personal` (new), on is `/on` (new), about is `/about`.
- **Contact links:** Mastodon `https://mastodon.social/@sasky`, LinkedIn `https://www.linkedin.com/in/cameron-grant-5802b45b/`, GitHub `https://github.com/sasky/`.
- Use `aria-current="page"` on the active section.

---

## 5. Theme: Terminal (`Main.dc.html`, `Tech-Post.dc.html`)

**Type:** JetBrains Mono, all of it. Weights 400, 700 and 800 (plus 400 italic). Base size 15px with line-height 1.7. Post body is 16px with line-height 1.8, max 70ch.

**Colours**

| token | value |
|---|---|
| bg | `#0b0f0d` (footer `#0d1511`, nav bar `#101a15`, active tab `#1b2b22`) |
| text / bright / dim | `#c8d6cb` / `#eef5f0` / `#7d8f82` (secondary `#9fb3a5`) |
| phosphor accent | `#6ee7a0` (alternates: amber `#ffb454`, blue `#7cc4ff`) |
| tags / amber | `#f2b45a` |
| path blue | `#8cc8ff` |
| rules | `#24382d` dashed, `#1d2e25` solid |
| code bg / inline code bg | `#070a09` / `#14201a` |

**Home (`/`)**

- **Nav:** a tmux-style status bar, 44px tall. The active tab ends in `*`.
- **Banner:** ASCII "sasky.nz" (figlet *slant*). Copy the six lines from `Main.dc.html`. Use `aria-hidden` plus a visually-hidden `<h1>`, 17px, with glow `text-shadow: 0 0 18px <accent 35%>`. Drop to 10px under 720px.
- **Prompt line component:** `cam@sasky` (accent, bold), `:`, the path (`#8cc8ff`), `$ `, then the command (`#eef5f0`). Sections in order:
  1. `whoami`: the short bio from the board.
  2. `ls -lt ~/tech`: terminal posts, newest first. Each row has the date and `drwxr-xr-x` in a 150px column, then the title (22px/800, prefixed `> `), the description as a `# comment`, and tags as `[tag]` links.
  3. `ls -l ~`: three directory rows with **live counts** of posts per theme (tech/personal/on).
  4. `cat ~/.contact`: the contact links.
  5. A final prompt with a blinking block cursor. Stop the blink under `prefers-reduced-motion`.
- **Footer:** a statusline reading `-- NORMAL --`, `© {year} Cameron Grant · built with Astro`, `utf-8 · en-NZ`.

**Post**

- **Header block:**
  - A breadcrumb prompt: `cam@sasky:~/tech$ cat <slug>.md`.
  - The H1 at 44px/800 with an accent `# ` prefix.
  - The description as `> …`, italic, `#9fb3a5`.
  - A meta row: `date YYYY-MM-DD`, `read ~N min` (about 200 words per minute, computed), and `tags [x] [y]`.
- **Layout:** a 2-column grid `minmax(0,1fr) 250px`, gap 64.
- **Contents sidebar:** sticky, headed `$ grep '^#' post.md`. Build it from the MDX `headings` the layout receives. Hide it under 900px.
- **Headings:** h2 gets an accent `## ` prefix (26px/800). h3 gets a `### ` prefix in `#4f6b5a` (19px/700).
- **Code blocks:**
  - A `<figure>` with a 44px caption bar: language or filename on the left, a working **copy** button on the right.
  - Line numbers via a CSS counter on Shiki's `.line` spans.
  - Swap Shiki's `dracula` for a **custom theme**: keys/names `#8cc8ff`, strings `#a6e3a1`, keywords/booleans `#f2b45a`, comments `#5f7a6a` italic, punctuation `#5d7466`, default `#c8d6cb`, bg `#070a09`.
- **Inline code:** bg `#14201a`, border `1px solid #24382d`, padding 1px 6px, text `#f2b45a`.
- **End of post:**
  - An `EOF` divider.
  - Two cards: `← older` / `newer →` within the same theme, plus a `cd ~ →` "All posts" card.
  - The footer statusline.

---

## 6. Theme: Personal (`Personal-Post.dc.html`)

**Type**

- **Source Serif 4** (variable, with optical size) for the title, subtitle, body, h2s, pull quote and "Written by".
- **Source Sans 3** for the UI: nav, kicker, byline, captions, tags and buttons.
- **Schibsted Grotesk** 800 for the `sasky.nz` wordmark only.

**Sizes**

- Title: 62px / 1.06 / 700 / -0.02em, dropping to 40px under 720px.
- Subtitle: 24px, `#5c5c5c`.
- Body: 21px / 1.68, `#242424`.
- h2: 32px / 1.22 / 700. Each has a 32×3px ochre rule 16px above it.
- Pull quote: 34px italic, with a two-tone bar on top (48px blue plus 14px ochre, 3px tall, 6px gap).

**Colours**

| token | value |
|---|---|
| bg | `#ffffff` |
| heading / body / muted | `#111111` / `#242424` / `#5c5c5c` (small text `#6b6b6b`) |
| hairline | `#e8e8e6` |
| accent (slate blue) | `#3d5a80` · soft `rgba(61,90,128,.28)` · wash `rgba(61,90,128,.07)` |
| accent2 (ochre) | `#c4893b` (lines and rings only, never text) |
| links | `#2f4a6d`, underline `rgba(196,137,59,.7)` |

**Layout**

- **Header:** 64px, sticky, white at 90%, with a **3px accent top border**, a soft-tinted bottom border and `box-shadow: 0 10px 24px -18px rgba(20,28,40,.35)`. The active nav item gets an inset 2px accent underline.
- **Column:** max-width 700px (748px including padding). Top padding 80px.
- **Article header:**
  - The kicker "Personal".
  - Title, then subtitle.
  - A byline row bordered in accent-soft. It holds a 44px avatar, name, `N min read · 17 May 2024`, and **Share** and **Copy link** icon buttons. Make Copy link work with `navigator.clipboard`.
  - The avatar is an accent-wash circle with an ochre ring and initials. Swap in a real photo if Cam wants: `src/images/cameron_grant_holding_a_soft_toy.jpeg` exists.
- **Videos:** keep `<YouTube>`, but give the embed radius 6px, a `1px #e8e8e6` border and `box-shadow: 0 2px 4px rgba(20,28,40,.08), 0 22px 44px -26px rgba(20,28,40,.5)`. Give the play button an ochre ring where the component allows it. Add a caption under each in muted 15px.
- **Pull quote:** style `<blockquote>` as the pull quote. **Don't edit Cam's copy to create one.** Mention it to him instead.
- **Tags:** pill chips (accent-wash bg, accent-soft border, accent text).
- **Author card:** a top rule in accent-soft. It has a 72px avatar, "Written by Cameron Grant", the short bio, the contact links and a "More about Cam" pill linking to `/about`.
- **"Elsewhere on sasky.nz":** two cards, each **drawn in its own theme**:
  - The latest Terminal post on a dark mono card with scanlines.
  - The latest On paper on a cream paper card with a blackletter mini-masthead.
  - Both get the drop shadow `0 1px 2px rgba(20,28,40,.06), 0 18px 36px -22px rgba(20,28,40,.38)` and lift 2px on hover.

**New `/personal` index (not designed yet).** List the personal posts using the same vocabulary as the post page: Source Serif titles, sans meta, ochre rule markers and accent-soft hairlines. Keep it simple. **`/about` uses this theme too.**

---

## 7. Theme: The ‘On’ Papers (`On-Index.dc.html`, `On-Post.dc.html`)

**Type**

- **UnifrakturMaguntia** for the masthead **only**.
- **Libre Franklin** 800/900 for headlines, kickers, labels, roman numerals and drop caps.
- **Libre Caslon Text** for the body: 19px / 1.7, justified with `hyphens: auto` (lang `en`). Use italic for decks.

**Colours**

| token | value |
|---|---|
| paper | `#f1e8d4` |
| ink / ink-strong / ink-soft | `#221c15` / `#1a150f` / `#4a3f33` (decks `#3a3026`) |
| oxblood | `#8a2a1b` |
| rule light | `#d8ccb2` |

**Rules and ornaments**

- Thick-thin rules: a 4px bar, a 3px gap, then a 1px bar.
- Double borders: `4px double`.
- Ornaments: ❦ (U+2766), ✦ (U+2726), ☞ (U+261E) and ⁂ (U+2042). These are text characters, not emoji.
- Dot-leader rows (`border-bottom: 2px dotted`).

**Date formats:** long is "22nd September 2026", short is "22 Sept.". Series order runs I, II, III and so on, by `pubDate` ascending.

**Front page `/on` (new)**

1. **Ribbon:** `Vol. I — No. {count as Roman}` · `Wellington, Aotearoa` · `Published Irregularly`.
2. **Masthead:** "The ‘On’ Papers" at 116px (58px under 820px). Below it, the italic subtitle "Being a Series of Essays Satirical, Humorous & Philosophical, by Cameron Grant". Then thick-thin rules and the nav.
3. **Lead (newest paper):**
   - Kicker "Latest · Paper the {Ordinal}".
   - Headline at 88px / 900 / uppercase.
   - The italic deck (the description).
   - A byline between hairlines.
   - The **first paragraph** with a drop cap, then "Continue reading ☞".
4. **Aside:**
   - "Contents of the Series": Roman numerals in oxblood, the title, dot leaders and the short date.
   - A **Notice** box (`4px double`) holding the contact links.
5. **The rest:** a ❦ divider, then the remaining papers in a 2-column grid (50px headlines), each with a drop-cap first paragraph.
6. **Colophon:** "Set in Libre Caslon & Libre Franklin · Printed upon the World Wide Web · {year in Roman}".

The first-paragraph excerpts need source text. Import the MDX with `?raw` and pull the first prose paragraph (skip frontmatter, imports and headings), or add an `excerpt` frontmatter field copied verbatim from the post. **Don't write new copy.**

**Post**

- **Header:** a compact strip with the blackletter masthead at 44px (linking to `/on`) on the left and the nav on the right, then thick-thin rules.
- **Article header (centred):**
  - Kicker "Paper the {Ordinal}".
  - The title in Franklin 900 uppercase, roughly 110px. Balance the lines, and drop to about 64px on phones.
  - A ❦ rule, then the italic deck at 28px.
  - Byline: "By Cameron Grant · Wellington · 11th September 2026".
- **Body:** max 800px. The first paragraph gets a drop cap (Franklin 900, oxblood, about 4.4em).
- **Numbered sections** (*On Being Classy* uses `## 1. Never run in the rain` and so on):
  - Render them as a grid with an 88px margin column holding the **Roman numeral** (Franklin 900, oxblood, about 64px) and the heading in Caslon bold 25px. Hairlines go between items.
  - Strip the `N. ` prefix at render time (a small remark or rehype step, or a CSS counter). **Don't edit the MDX copy.**
  - Unnumbered h2s, like those in *On Happiness* and *On NZ Music*, get a centred Franklin small-caps heading.
- **End:**
  - ❦ and "FINIS".
  - "Further Papers in this Series": the other On posts as `4px double` cards with kicker, headline and deck.
  - The colophon.

---

## 8. Textures and fonts (implementation)

**Texture layers**

- Use **one fixed, full-viewport layer per theme**: `html[data-theme=x] body::before` for the gradients and `::after` for the noise. Set `position: fixed; inset: 0; pointer-events: none`, keep content above it, and take colours from the boards.
- **Don't** use page-height SVG filters, which the boards use only because they're mockups.
- **Noise:** add `public/textures/noise.svg`, tiled at roughly 200px:
  ```svg
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>
  ```
  Also add `fibre.svg` with `baseFrequency=".012 .35"` and `numOctaves="2"` for the On paper, at roughly 60% of the grain strength.
- **Gradient stacks:** copy the `.tx-term`, `.tx-personal` and `.tx-paper` rules from the boards. Use the **Personal-Post** board for the light personal version and **On-Post** for the paper. Bake in each theme's texture opacity from §1.

**Fonts**

- Self-host via Fontsource packages or Astro's font support (check which one Astro 6 offers). Load only the families and weights listed above for each theme.
- Use `font-display: swap` with close fallbacks: `ui-monospace, Menlo` for Terminal, `Iowan Old Style, Georgia` for the serifs, and `Helvetica Neue, Arial` for Franklin.
- Remove the Hack and IBM Plex files once nothing references them (ask Cam first).

**Colour scheme:** set `color-scheme: dark` for Terminal and `light` for Personal and On.

---

## 9. Accessibility and responsive behaviour

- The boards were drawn to 4.5:1 contrast. Keep caption greys no lighter than the listed values.
- **Focus rings:** Terminal `#f2b45a`, Personal `#3d5a80`, On `#8a2a1b`. Use 2px outlines with a 3px offset.
- Hit targets are at least 44px. Use a real `<button>` for copy and share.
- Add a skip link. Honour `prefers-reduced-motion`, which stops the cursor blink and the card lifts.
- **Breakpoints:** 720px for Terminal and Personal, 900px for the Terminal post sidebar, 820px for On. Grids collapse to one column.

---

## 10. Suggested build order

1. Add the `theme` frontmatter, routing, `data-theme`, fonts, tokens as custom properties per theme, and texture layers. Neutralise the open-props dark normalize.
2. **Terminal:** the base layout, `/`, the post layout, the custom Shiki theme, code-block chrome and the copy button.
3. **Personal:** the post layout, `/personal` and `/about`.
4. **On:** the post layout and `/on`.
5. Tags pages (Terminal), 404, and checks that RSS and Pico-8 still work.
6. Run `npm run build`. Click through **every existing URL**, check at 390px and 1280px, and check contrast and keyboard focus.

## 11. Open decisions for Cam

- The masthead name "The ‘On’ Papers" is a placeholder.
- Should *Concert vids* get a `personal` tag?
- Is *Hide n Seek* meant to be Terminal?
- Should the avatar use a real photo?
- Should the Hack and IBM Plex fonts be removed?
