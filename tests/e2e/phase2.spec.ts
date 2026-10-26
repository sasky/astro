import { expect, test } from "@playwright/test";

test("meditations lists the four On posts, newest first", async ({ page }) => {
  await page.goto("/meditations");
  await expect(page.locator("main li a")).toHaveText([
    "On being in the moment vs past and future",
    "On Happiness",
    "On Being Classy",
    "On New Zealand Music",
  ]);
});

test("Hide n Seek loads its cart when started", async ({ page }) => {
  await page.goto("/code/hide-n-seek-game");
  const cart = page.waitForResponse((r) => r.url().endsWith("/pico8/hidenseek.js") && r.ok());
  await page.locator("#p8_container").click();
  await cart;
  await expect(page.locator("#canvas")).toBeAttached();
});

test("RSS has the 7 posts and no About", async ({ request }) => {
  const xml = await (await request.get("/rss.xml")).text();
  expect(xml.match(/<item>/g)).toHaveLength(7);
  expect(xml).toContain("<link>https://sasky.nz/meditations/on-being-classy</link>");
  expect(xml).not.toContain("/about");
});

test("tag page lists posts across sections", async ({ page }) => {
  await page.goto("/tags/music");
  await expect(page.locator("main li a")).toHaveText([
    "On New Zealand Music",
    "Concert youtube vids to temporarily restore one's faith in humanity",
  ]);
});

test("legacy post header still links Home", async ({ page }) => {
  await page.goto("/meditations/on-happiness");
  await expect(page.locator("a.header-link")).toHaveAttribute("href", "/#meditations-on-happiness");
});
