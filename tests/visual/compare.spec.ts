// Board-vs-site compare sheet (spec 8.1): each design board and the page it
// designs, full page at 1280×900 and 390×844, side by side in
// qa/compare/index.html (gitignored). Run: npm run build && npm run qa:compare
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";
import { fillBoard } from "./board-shim";

const OUT = "qa/compare";
const PAIRS = [
  { name: "home", board: "Site-Home", path: "/" },
  { name: "tag-selector", board: "TagSelector", path: "/", element: "#tags", widths: [1040] },
  { name: "code-list", board: "Site-Code-List", path: "/code" },
  { name: "code-post", board: "Site-Code-Post", path: "/code/silverstripe-app-platform" },
  { name: "life-list", board: "Site-Life-List", path: "/life" },
  { name: "life-post", board: "Site-Life-Post", path: "/life/top-concertvids" },
  { name: "on-list", board: "Site-On-List", path: "/meditations" },
  { name: "on-post", board: "Site-On-Post", path: "/meditations/on-being-classy" },
];
const HEIGHT: Record<number, number> = { 1280: 900, 390: 844, 1040: 900 };

/** Fonts ready, lazy images loaded, back at the top. */
async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    document.querySelectorAll<HTMLImageElement>("img[loading=lazy]").forEach((img) => (img.loading = "eager"));
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await expect.poll(() => page.evaluate(() => [...document.images].every((img) => img.complete)), { timeout: 15_000 }).toBe(true);
  await page.waitForTimeout(300);
}

mkdirSync(OUT, { recursive: true });

for (const { name, board, path, element, widths = [1280, 390] } of PAIRS) {
  for (const width of widths) {
    test(`${name} @ ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: HEIGHT[width] });
      await page.goto(pathToFileURL(resolve("design-handoff/design", `${board}.dc.html`)).href);
      await fillBoard(page);
      await settle(page);
      await page.screenshot({ path: `${OUT}/${name}-${width}-board.png`, fullPage: true, animations: "disabled" });

      await page.goto(path);
      await settle(page);
      const shot = { path: `${OUT}/${name}-${width}-site.png`, animations: "disabled" as const };
      if (element) await page.locator(element).screenshot(shot);
      else await page.screenshot({ ...shot, fullPage: true });
    });
  }
}

// Differences the plan made on purpose; everything else on the sheet should match.
const INTENTIONAL = [
  "Real content and computed counts, dates, numerals and tags (the boards use placeholder data, such as the dropped `life` tag).",
  "G1: On essays without numbered tips use Rye `##` headings between rules and a drop cap (Happiness, NZ Music, the Moment).",
  "G2: video cards in On posts use the On tokens (paper, ink frame and button).",
  "G3: Code post images sit in a 3-column grid (2 at 390) inside the article column.",
  "G4: the Pico-8 game sits in a full-width terminal panel above the post body.",
  "G5: the Code TOC shows the real heading text, clamped to two lines, not the board's shortened labels.",
  "G6: programme lines on the On listing: uppercase up to 60 characters, sentence case beyond.",
  "G7: prev/next shows only the cards that exist (Life: older only; On: centred).",
  "G8: manicules and fleurons are inline SVGs, not the ☞ ☜ ✥ glyphs.",
  "The On programme is a reversed `<ol>`, so screen readers count III, II, I.",
  "Code comments (#6f8a7a), punctuation (#687f71) and the Code intro (#6f8a7a) are lighter than the board's greys, to meet AA.",
  "Fraunces is loaded with opsz and wght only (as the boards load it), so SOFT and WONK are at their defaults.",
  "Calls made in place of a brainstorm in Phases 4–8: see docs/superpowers/plans/2026-10-26-phase-{4,5,6,7,8}-*.md.",
];

test.afterAll(() => {
  const rows = PAIRS.flatMap(({ name, board, path, widths = [1280, 390] }) =>
    widths.map(
      (width) => `<section>
  <h2>${name} @ ${width} <small>${board}.dc.html ↔ <a href="https://sasky.nz${path}">${path}</a></small></h2>
  <div class="pair">
    <figure><figcaption>Board</figcaption><img src="${name}-${width}-board.png" alt="${board} board at ${width}"></figure>
    <figure><figcaption>Site</figcaption><img src="${name}-${width}-site.png" alt="${path} at ${width}"></figure>
  </div>
</section>`,
    ),
  );
  writeFileSync(
    `${OUT}/index.html`,
    `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Board vs site — sasky.nz</title>
<style>
  body { margin: 0; padding: 24px; background: #eee; font: 15px/1.5 system-ui, sans-serif; color: #222; }
  h1 { margin: 0 0 8px; } h2 { margin: 40px 0 12px; font-size: 18px; } small { color: #666; font-weight: 400; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
  figure { margin: 0; background: #fff; padding: 8px; } figcaption { font-weight: 600; margin-bottom: 6px; }
  img { width: 100%; height: auto; display: block; border: 1px solid #ccc; }
  li { margin: 4px 0; } code { background: #fff; padding: 0 3px; }
</style>
<h1>Board vs site</h1>
<p>Each design board (left) beside the built page (right), full page. Generated by <code>npm run qa:compare</code>.</p>
<h2>Intentional differences</h2>
<ul>${INTENTIONAL.map((line) => `<li>${line.replace(/`([^`]+)`/g, "<code>$1</code>")}</li>`).join("")}</ul>
${rows.join("\n")}
`,
  );
});
