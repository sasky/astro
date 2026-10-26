// Life listing and Life post (HP theme), spec 6.2.
import { expect, test } from "@playwright/test";
import { expectOnlyThemeCss } from "./helpers/chrome";

test("Life listing heading, count and rows", async ({ page }) => {
  await page.goto("/life");
  await expect(page).toHaveTitle("Life — sasky.nz");
  await expect(page.locator("h1")).toHaveText("Life");
  await expect(page.locator(".band .dymo")).toHaveText("1 post · since May 2024");
  await expect(page.locator("h2#all")).toHaveText("Every Life post, newest first");
  await expect(page.locator("main article")).toHaveCount(1);
  await expect(page.locator("main article h3 a")).toHaveAttribute("href", "/life/top-concertvids");
  expect(await page.locator("main").innerText()).not.toContain("[");
});

test("Life listing loads only HP styles", async ({ page, request }) => {
  await page.goto("/life");
  await expectOnlyThemeCss(page, request, "hp", /Fraunces|Source Sans 3|JetBrains Mono/);
});

test("Life nav link is current", async ({ page }) => {
  await page.goto("/life");
  await expect(page.locator('.site-nav-link[href="/life"]')).toHaveAttribute("aria-current", "page");
});

const concert = "/life/top-concertvids";

test("concert post order: heading, card, caption, text", async ({ page }) => {
  await page.goto(concert);
  const order = await page.locator(".prose-life h2").evaluateAll((headings) =>
    headings.map((h2) => {
      // Skip the card's bundled <script>, which Astro renders after the first card.
      const next = (el: Element | null | undefined) => {
        let sibling = el?.nextElementSibling;
        while (sibling?.tagName === "SCRIPT") sibling = sibling.nextElementSibling;
        return sibling;
      };
      const figure = next(h2);
      return [
        figure?.matches("figure.video") && !!figure.querySelector("a.vid") && !!figure.querySelector("figcaption"),
        next(figure)?.tagName,
      ];
    }),
  );
  expect(order).toHaveLength(5);
  for (const [hasCard, next] of order) {
    expect(hasCard).toBe(true);
    expect(next).toBe("P");
  }
});

test("concert post has the pull quote, sign-off and P.S.", async ({ page }) => {
  await page.goto(concert);
  await expect(page.locator(".prose-life blockquote")).toHaveText("Some people say I’m a dreamer, but I’m not the only one.");
  await expect(page.locator(".prose-life strong")).toHaveText("Cam out");
  await expect(page.locator(".prose-life .ps")).toHaveCount(1);
});

test("concert post title and More in Life", async ({ page }) => {
  await page.goto(concert);
  await expect(page).toHaveTitle("Concert youtube vids to temporarily restore one's faith in humanity — Life — sasky.nz");
  const more = page.locator('nav[aria-label="More in Life"] a');
  await expect(more).toHaveCount(1);
  await expect(more).toHaveAttribute("href", "/life");
});

test("Life post section link is aria-current=true", async ({ page }) => {
  await page.goto(concert);
  await expect(page.locator('.site-nav-link[href="/life"]')).toHaveAttribute("aria-current", "true");
});

test("Life post has no horizontal overflow at 390", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(concert);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
