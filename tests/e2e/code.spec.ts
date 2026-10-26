// Code listing and Code posts (terminal theme), spec 6.3.
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { expectInertTexture, expectOnlyThemeCss, expectTabOrder, expectTopBarGeometry } from "./helpers/chrome";

test("Code listing heading, stats and entries", async ({ page }) => {
  await page.goto("/code");
  await expect(page).toHaveTitle("Code — sasky.nz");
  await expect(page.locator("h1")).toHaveText("# Code");
  await expect(page.locator("h1")).toHaveAccessibleName("Code");
  await expect(page.locator("h2#all")).toHaveText("# every code post, newest first");
  await expect(page.locator(".stats")).toContainText("total 2 posts");
  await expect(page.locator(".stats")).toContainText("since January 2024");
  await expect(page.locator("main article h3")).toHaveText([
    "> Cheap and easy Silverstripe hosting",
    "> Hide n Seek",
  ]);
  for (const text of await page.locator("main p").allTextContents()) expect(text).not.toContain("[");
});

test("Code listing chrome", async ({ page, request }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/code");
  await expectTopBarGeometry(page, 24);
  await expect(page.locator('.site-nav-link[href="/code"]')).toHaveAttribute("aria-current", "page");
  await expectTabOrder(page);
  await expectInertTexture(page);
  await expectOnlyThemeCss(page, request, "code", /JetBrains Mono/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/code");
  await expectTopBarGeometry(page, 16);
});

test("reduced motion stops both cursors", async ({ page }) => {
  await page.goto("/code");
  expect(await page.locator(".prompt-cursor").evaluate((el) => getComputedStyle(el).animationName)).not.toBe("none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/code");
  for (const selector of [".site-mark", ".prompt-cursor"]) {
    expect(await page.locator(selector).evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  }
});

test("Code listing has no horizontal overflow at 390", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/code");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("Code pages turn off font ligatures", async ({ page }) => {
  await page.goto("/code");
  expect(await page.locator(".entry-perms").first().evaluate((el) => getComputedStyle(el).fontVariantLigatures)).toBe(
    "none",
  );
});

const silverstripe = "/code/silverstripe-app-platform";
const hideNSeek = "/code/hide-n-seek-game";

test("Code post header and TOC", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(silverstripe);
  await expect(page).toHaveTitle("Cheap and easy Silverstripe hosting — Code — sasky.nz");
  const crumbs = page.locator('nav[aria-label="Breadcrumb"] a');
  expect(await crumbs.evaluateAll((links) => links.map((a) => a.getAttribute("href")))).toEqual(["/", "/code"]);
  const tocTargets = await page
    .locator('aside[aria-label="On this page"] .toc-link')
    .evaluateAll((links) => links.map((a) => a.getAttribute("href")));
  const headingIds = await page
    .locator(".prose-code :is(h2, h3)")
    .evaluateAll((headings) => headings.map((h) => `#${h.id}`));
  expect(tocTargets).toHaveLength(5);
  expect(tocTargets).toEqual(headingIds);
  await expect(page.locator('.site-nav-link[href="/code"]')).toHaveAttribute("aria-current", "true");
});

test("More in Code follows G7", async ({ page }) => {
  await page.goto(silverstripe);
  const newest = page.locator('nav[aria-label="More in Code"] a');
  expect(await newest.evaluateAll((links) => links.map((a) => a.getAttribute("href")))).toEqual([
    hideNSeek,
    "/code",
  ]);
  await page.goto(hideNSeek);
  const oldest = page.locator('nav[aria-label="More in Code"] a');
  expect(await oldest.evaluateAll((links) => links.map((a) => a.getAttribute("href")))).toEqual([silverstripe]);
});

test("TOC hides under 900 and the post doesn't overflow at 390", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(silverstripe);
  await expect(page.locator('aside[aria-label="On this page"]')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("Code post loads only Code styles", async ({ page, request }) => {
  await page.goto(silverstripe);
  await expectOnlyThemeCss(page, request, "code", /JetBrains Mono/);
});

test("block captions match the design", async ({ page }) => {
  await page.goto(silverstripe);
  await expect(page.locator(".code-title")).toHaveText([
    "── bash",
    "── .env · database",
    "── .env · silverstripe",
    "── .env · mail",
    "── build command",
    "── app/_config.php",
  ]);
});

test("copy gives exactly the code", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(silverstripe);
  const mdx = readFileSync("src/content/posts/silverstripe-app-platform.mdx", "utf8");
  const php = mdx.match(/```php[^\n]*\n([\s\S]*?)\n```/)![1];
  const button = page.locator("figure.code-block").last().locator("button.copy");
  await button.click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(php);
  await expect(button).toHaveText("copied");
});

test("line numbers aren't copied or selectable", async ({ page }) => {
  await page.goto(silverstripe);
  const selected = await page.locator("figure.code-block").nth(1).locator(".line").first().evaluate((line) => {
    const range = document.createRange();
    range.selectNodeContents(line);
    const selection = getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    return selection.toString();
  });
  expect(selected).toBe("SS_DATABASE_CLASS=MySQLDatabase");
});

test("blank lines keep their height", async ({ page }) => {
  await page.goto(silverstripe);
  const heights = await page
    .locator("figure.code-block")
    .last()
    .locator(".line")
    .evaluateAll((lines) => lines.map((line) => line.getBoundingClientRect().height));
  expect(heights.length).toBeGreaterThan(5);
  for (const height of heights) expect(height).toBeGreaterThanOrEqual(20);
});

test("long lines scroll inside the block at 390", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(silverstripe);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const pre = page.locator("figure.code-block").nth(1).locator("pre");
  expect(await pre.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
});

test("mark and sign-off", async ({ page }) => {
  await page.goto(silverstripe);
  await expect(page.locator(".prose-code mark")).toHaveText("Down that path, there be dragons,");
  await expect(page.locator(".prose-code strong")).toHaveText("Cam out.");
});

test("TOC stays in view while reading", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(silverstripe);
  await page.locator("figure.code-block").nth(2).scrollIntoViewIfNeeded();
  const box = await page.locator(".toc").boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(Math.abs(box!.y - 24)).toBeLessThanOrEqual(1);
});

test("code uses the terminal font", async ({ page }) => {
  await page.goto(silverstripe);
  const family = await page.locator("figure.code-block .line").first().evaluate((el) => getComputedStyle(el).fontFamily);
  expect(family).toMatch(/JetBrains Mono/);
});

test("Pico-8 panel caption and placement", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(hideNSeek);
  const caption = page.locator(".pico8-panel figcaption");
  await expect(caption).toContainText("── hidenseek.p8");
  await expect(caption).toContainText("arrow keys + X");
  const order = await page.evaluate(() => {
    const header = document.querySelector(".post-header")!;
    const panel = document.querySelector(".pico8-panel")!;
    const grid = document.querySelector(".post-grid")!;
    return [
      header.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING,
      panel.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING,
    ];
  });
  expect(order.every(Boolean)).toBe(true);
  const panel = (await page.locator(".pico8-panel").boundingBox())!;
  const article = (await page.locator(".prose-code").boundingBox())!;
  expect(panel.width).toBeGreaterThan(article.width);
});

test("Pico-8 fits a 2560×1440 screen", async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.goto(hideNSeek);
  const cart = page.waitForResponse((r) => r.url().endsWith("/pico8/hidenseek.js") && r.ok());
  await page.locator("#p8_container").click();
  await cart;
  const canvas = page.locator("#canvas");
  await expect.poll(async () => (await canvas.boundingBox())?.height ?? 0).toBeGreaterThan(0);
  const box = (await canvas.boundingBox())!;
  expect(box.height).toBeLessThanOrEqual(800);
  expect(box.height).toBeLessThanOrEqual(1440);
});

test("Pico-8 at 390 fits the width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(hideNSeek);
  expect((await page.locator("#p8_frame").boundingBox())!.width).toBeLessThanOrEqual(350);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("comics in a 3-column grid, 2 at 390", async ({ page }) => {
  const tracks = async () =>
    (await page.locator(".image-collection").evaluate((el) => getComputedStyle(el).gridTemplateColumns)).split(" ")
      .length;
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(hideNSeek);
  expect(await tracks()).toBe(3);
  const articleRight = await page.locator(".prose-code").evaluate((el) => el.getBoundingClientRect().right);
  const rights = await page
    .locator(".image-collection img")
    .evaluateAll((imgs) => imgs.map((img) => img.getBoundingClientRect().right));
  expect(rights).toHaveLength(9);
  for (const right of rights) expect(right).toBeLessThanOrEqual(articleRight + 0.5);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(hideNSeek);
  expect(await tracks()).toBe(2);
});

test("no console errors on Code pages", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of ["/code", silverstripe, hideNSeek]) await page.goto(path, { waitUntil: "networkidle" });
  expect(errors).toEqual([]);
});
