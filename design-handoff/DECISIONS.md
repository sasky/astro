# sasky.nz redesign: decisions (as of 25 Oct 2026)

These come from Cam's notes on the design canvas. Treat them as settled unless Cam says otherwise.

## Structure and naming

- **Three sections, as sub pages (not tags): Code · Life · On.**
  - "Tech" was renamed Code. "Personal" was renamed Life.
  - The nav label for the third section stays "On".
- **The On series is now "Pseudo Philosophy Meditations".** It was "The ‘On’ Papers". Each post is a "meditation", so the ordinal reads "Meditation the Second".
- **URLs move to `/section/slug`, with permanent 301 redirects on Netlify** from today's flat URLs.
- **About folds into the homepage.** It's global; the copy will change later.
- **One global RSS feed.**
- **A tag becomes a main section only once it has a landing page.** Everything else stays a tag.
- **No "Elsewhere" section on articles.**

## Homepage

- **Hero "J · Blue wash" (locked):**
  - Paper with a graph grid, and faint orange plus marks on the left.
  - A blue panel on the right that fades to nothing towards the left.
  - The natural-colour cutout portrait with a soft shadow.
  - Two blue striped ghost silhouettes trailing left of the head.
  - Orange stripes on the lower jacket only.
  - A navy Dymo name label.
  - H1: "Hello, welcome to my *little corner* of the internet", with an orange highlighter on "little corner". Lede: "Hello, I’m Cameron. International man of leisure".
- **About (locked):**
  - "Hobbies, past and present include but not limited to…" as Dymo labels.
  - "I also do web development for a living." with four orange-asterisk statements.
- **Sections:** three rectangular doorway cards that side-scroll on small screens, with a count label, a small theme preview, the latest post, and "Enter X →".
- **"Browse by tag":**
  - Picking a tag lists every post with that tag, with no pagination.
  - There is no "All posts tagged …" link.
- **No orange highlighter under the "Sections" or "Browse by tag" titles.**

## Themes

- **The HP theme (from the homepage) is used for Home and Life.**
- **Code** uses the terminal theme.
  - The background is the home terminal glow, not the old tech-post background.
  - Inline links are blue, with hover and active states.
- **On** uses the Sideshow handbill style.
- **Shared top bar:** spacing and alignment are the same across all themes; colours and fonts change per theme. The nav sits on the right on every theme.

## Listings

- **Code:** every Code post, newest first, labelled "# every code post, newest first". Pagination can come later, once there is enough content. There's no duplicate section-directory block.
- **Life:**
  - No featured cards.
  - A flat list laid out like Code's, in the HP theme.
  - Not raised: no card or shadow around the list, unlike the tag selector.
- **On:**
  - Headliner: the latest meditation, "!Now Showing · Meditation the Nth!".
  - Then "Also Appearing": the full programme, newest first, with roman numerals.

## Posts

- **On post:** tip numerals are roman numerals in an ordered `<span>` inside each tip heading, hung to the left of the heading text with generous space. On phones they sit above the heading.
- **Life post:** HP theme, with a pull quote, section headings, and YouTube embeds styled as framed cards.

## Mobile

Every page type needs a mobile version. The canvas has 390px boards for all seven templates.
