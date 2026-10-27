# sasky.nz redesign: design handoff

This folder is reference material for building the redesign. It is not site code: don't import it, don't ship it, and leave it out of the build. Astro ignores anything outside `src/` and `public/`.

- `PROMPT.md`: the brief for Claude Code.
- `DECISIONS.md`: design status and every decision Cam has made on the canvas.
- `design/*.dc.html`: one file per page template, exported from the Claude design canvas ("sasky.nz Redesign", page "Site — for refinement"). These are the source of truth for layout, CSS values and copy.
- `design/assets/`: images the designs use.

## The design files

| File | Page type | Route |
|---|---|---|
| `Site-Home.dc.html` | Home (HP theme) | `/` |
| `TagSelector.dc.html` | "Browse by tag" component, embedded in Home | part of `/` |
| `Site-Life-List.dc.html` | Life listing (HP theme) | `/life` |
| `Site-Life-Post.dc.html` | Life post (HP theme) | `/life/top-concertvids` |
| `Site-Code-List.dc.html` | Code listing (terminal theme) | `/code` |
| `Site-Code-Post.dc.html` | Code post (terminal theme) | `/code/silverstripe-app-platform` |
| `Site-On-List.dc.html` | On listing (handbill theme) | `/on` |
| `Site-On-Post.dc.html` | On post (handbill theme) | `/on/on-being-classy` |

The canvas also has a 390px-wide mobile board for each template. Those boards are the same files at phone width, so the mobile design is whatever each file's `@media` rules produce at 390px. They aren't included separately.

## How to read a `.dc.html` file

- **`<helmet>`** is the `<head>`. It holds the Google Fonts link and one `<style>` block. That block has the only non-inline CSS: hover, focus and active states, `@media` rules, masks and background textures.
- **Everything else is inline styles.** Treat them as exact values (sizes, colours, spacing). Turn them into component-scoped CSS and custom properties; don't paste inline styles into the site.
- **`{{name}}`** is a value from `renderVals()` in the `<script type="text/x-dc">` block at the bottom. Defaults come from the `data-props` JSON on that script tag. For example, `{{blue}}` is `#2452ff`, `{{orange}}` is `#ff6a1f`, `{{accent}}` is `#6ee7a0` (Code green), and `{{texture}}` sets texture opacity. These "tweaks" were design-time controls. Bake the defaults into CSS custom properties; there are no runtime controls on the live site.
- **`<sc-for list="{{items}}" as="x">`** is a loop and **`<sc-if value="{{cond}}">`** is a conditional. The TagSelector uses both.
- **`<dc-import name="TagSelector">`** embeds `TagSelector.dc.html`. Its hover CSS lives in the importer's (Home's) `<helmet>`.
- **`<script src="./support.js">`** is the canvas runtime. Ignore it.
- **Copy in `[square brackets]`** is placeholder text. Examples: intro paragraphs, and the greyed "[Next Life post]" rows that only show the list rhythm. Don't build placeholder rows. Leave intro copy as a clearly marked TODO for Cam.
- **Hard-coded data is example data.** Counts like "2 posts", "3 meditations" and "since May 2024", latest-post lines, roman ordinals and tag counts must all be computed from content.

## Assets

| File | What it is | Used for |
|---|---|---|
| `assets/portrait-cutout.webp` | Colour photo of Cam with the background removed. 1527×1500, alpha. | Home hero portrait |
| `assets/mask-silhouette.png` | Alpha mask of the same silhouette, same size. | The two blue striped "ghost" silhouettes trailing left of the portrait, drawn with `mask-image` over a repeating-linear-gradient |
| `assets/mask-jacket-stripes.png` | Alpha mask of horizontal stripes on the lower jacket, same size. | Orange stripes on the jacket, drawn with `mask-image` over a solid orange fill, offset a few px for a misregistered print look |

All three share one box (`aspect-ratio: 1527 / 1500`) and stack exactly on top of each other.

## Themes at a glance

### Top bar (every template)

- **Geometry is the same everywhere:** full-width bar, 2px bottom rule, 1120px inner width, 24px gutters, 66px tall.
- **Left:** a 13px mark plus "sasky.nz" at 24px.
- **Right:** Code · Life · On at 16px. Links are 44px tall with 14px side padding and a 4px gap. The current section gets a 3px inset underline.
- **Under 480px:** 16px gutters, 20px wordmark, 10px link padding.
- **Only colours and fonts change per theme.**

### HP theme (Home and Life)

- **Paper:** `#f6f1e7`, with a blue graph grid (1px `rgba(36,82,255,.11)` lines every 28px) and SVG grain on multiply. Cards are `#fffdf8`.
- **Colours:**
  - Navy `#12163d` (text, borders).
  - Text tones: `#2a2f5c` (ledes), `#4a4e6e` (muted), `#1d2150` (Life post body).
  - Blue `#2452ff`, link blue `#1f3fd6`, orange `#ff6a1f`.
- **Type:**
  - Fraunces for display (800–900, italic) and the Life post body.
  - Source Sans 3 for UI.
  - JetBrains Mono for labels (uppercase, .06–.08em tracking).
- **Motifs:**
  - **Dymo labels:** navy, blue or orange chips; mono uppercase 13px/700; 3px radius; slight rotation.
  - **Hard offset shadows:** `6px 6px 0` blue, turning `9px 9px 0` orange on hover with a `translate(-2px,-2px)` lift.
  - **Small orange square mark:** blue offset shadow, rotated -8°.
  - **Orange plus-mark pattern.**
  - **Blue wash panel** that fades from the right edge to nothing on the left.
  - **Orange highlighter** on "little corner" in the hero h1. This is the only title with a marker.

### Code theme (terminal)

- **Surfaces:**
  - Background `#0b0f0d`, bar `#101a15`.
  - Rules `#1d2e25` (solid) and `#24382d` (dashed).
- **Text:**
  - Base `#c8d6cb`, bright `#eef5f0`, muted `#7d8f82` and `#9fb3a5`.
- **Accents:**
  - Green `#6ee7a0`, path blue `#8cc8ff`, tag amber `#f2b45a`.
  - Inline links blue `#6cb6ff` (hover `#b5dbff`; active fills blue).
- **Type and texture:** JetBrains Mono throughout. Background texture is scanlines plus a green glow pinned to the top of the page (`.tx-term`).

### On theme (Sideshow handbill)

- **Colours:** kraft `#d2ad6f`, ink `#23170e`, hover rust `#6b2c12`, light `#f0dcae`.
- **Type:**
  - Holtwood One SC for headlines, with an inline offset shadow `2px 2px 0 kraft, 4px 4px 0 ink`.
  - Alfa Slab One for the wordmark and banners.
  - Rye for section heads.
  - Oswald for body and labels.
- **Ornaments:** double rules, diamonds, ☞ ☜ manicules, ✥ corner ornaments, kraft texture with fold lines.
