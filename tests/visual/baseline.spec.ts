// One-off screenshots of every built page at desktop and phone width,
// written to qa/baseline/ (gitignored). Run: npm run build && npm run baseline
import { globSync } from "node:fs";
import { expect, test } from "@playwright/test";

const routes = globSync("**/*.html", { cwd: "dist" })
  .map((file) => "/" + file.replace(/(^|\/)index\.html$/, "").replace(/\.html$/, ""))
  .sort();

const widths = [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
];

const fileName = (route: string) => (route === "/" ? "home" : route.slice(1).replaceAll("/", "__"));

for (const route of routes) {
  for (const viewport of widths) {
    test(`${route} @ ${viewport.width}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      // Load lazy images now (Chrome defers them if we scroll past too fast),
      // scroll through for anything else that loads on scroll, then wait.
      await page.evaluate(async () => {
        document.querySelectorAll<HTMLImageElement>("img[loading=lazy]").forEach((img) => (img.loading = "eager"));
        for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 100));
        }
        window.scrollTo(0, 0);
      });
      await expect
        .poll(() => page.evaluate(() => [...document.images].every((img) => img.complete)), {
          timeout: 15_000,
        })
        .toBe(true);
      await page.screenshot({
        path: `qa/baseline/${fileName(route)}-${viewport.width}.png`,
        fullPage: true,
        animations: "disabled",
      });
    });
  }
}
