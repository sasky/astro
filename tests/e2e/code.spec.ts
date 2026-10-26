// Code listing and Code posts (terminal theme), spec 6.3.
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
