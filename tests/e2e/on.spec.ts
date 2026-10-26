// On listing and On posts (handbill theme), spec 6.4.
import { expect, test, type Page } from "@playwright/test";
import { expectInertTexture, expectOnlyThemeCss, expectTabOrder, expectTopBarGeometry } from "./helpers/chrome";

const listing = "/meditations";
const moment = "/meditations/on-being-in-the-moment-vs-past-and-future";
const classy = "/meditations/on-being-classy";
const happiness = "/meditations/on-happiness";
const nzMusic = "/meditations/on-new-zealand-music";
const onFonts = /Holtwood One SC|Alfa Slab One|Rye|Oswald/;

const noSidewaysScroll = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );

test("On listing heading, stats and headliner", async ({ page }) => {
  await page.goto(listing);
  await expect(page).toHaveTitle("Pseudo Philosophy Meditations — sasky.nz");
  await expect(page.locator("h1")).toHaveText("Pseudo Philosophy Meditations");
  await expect(page.locator(".stats")).toContainText("4 meditations");
  await expect(page.locator(".stats")).toContainText("since June 2026");
  const headliner = page.locator('section[aria-labelledby="headliner"]');
  await expect(headliner.locator(".now-showing")).toHaveText("!Now Showing · Meditation the Fourth!");
  await expect(page.locator("#headliner a")).toHaveAttribute("href", moment);
  await expect(headliner.locator(".excerpt")).toHaveText(/^You do not realise at first/);
  await expect(headliner.locator(".byline")).toContainText("18th October 2026");
  await expect(headliner.locator("a.on-ink")).toHaveAttribute("href", moment);
});

test("Also Appearing lists the rest, newest first, with computed numerals", async ({ page }) => {
  await page.goto(listing);
  const rows = page.locator('section[aria-labelledby="also"] li');
  await expect(rows.locator(".prog-title")).toHaveText(["On Happiness", "On Being Classy", "On New Zealand Music"]);
  await expect(rows.locator(".prog-num")).toHaveText(["III.", "II.", "I."]);
  await expect(rows.locator("time")).toHaveText(["22nd Sept. 2026", "11th Sept. 2026", "20th June 2026"]);
  const classyLine = rows.nth(1).locator(".prog-line");
  await expect(classyLine).toHaveText("Top Ten Tips for Staying Classy");
  await expect(classyLine).not.toHaveClass(/prog-line-long/);
  expect(await classyLine.evaluate((el) => getComputedStyle(el).textTransform)).toBe("uppercase");
  const nzLine = rows.nth(2).locator(".prog-line");
  await expect(nzLine).toHaveClass(/prog-line-long/);
  await expect(nzLine).toHaveText(/songs\.$/);
  expect(await nzLine.evaluate((el) => getComputedStyle(el).textTransform)).toBe("none");
});

test("On listing chrome", async ({ page, request }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(listing);
  await expectTopBarGeometry(page, 24);
  await expect(page.locator('.site-nav-link[href="/meditations"]')).toHaveAttribute("aria-current", "page");
  expect(await page.locator(".site-mark").evaluate((el) => getComputedStyle(el).margin)).toBe("0px 1px");
  await expectTabOrder(page);
  await expectInertTexture(page);
  await expectOnlyThemeCss(page, request, "on", onFonts);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(listing);
  await expectTopBarGeometry(page, 16);
});

test("correspondence sits inside the bill, colophon after", async ({ page }) => {
  await page.goto(listing);
  await expect(page.locator(".bill .on-correspondence")).toBeVisible();
  const footer = page.locator("footer.on-footer");
  await expect(footer).toContainText("© MMXXVI Cameron Grant");
  await expect(footer).not.toContainText("Correspondence");
});

test("listing at 390: no sideways scroll, Eye inside the bill, rows stack", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(listing);
  await noSidewaysScroll(page);
  const eye = (await page.locator(".eye").boundingBox())!;
  const bill = (await page.locator(".bill").boundingBox())!;
  expect(eye.x).toBeGreaterThanOrEqual(bill.x);
  expect(eye.x + eye.width).toBeLessThanOrEqual(bill.x + bill.width);
  const row = page.locator('section[aria-labelledby="also"] li').first();
  const title = (await row.locator(".prog-title").boundingBox())!;
  const date = (await row.locator("time").boundingBox())!;
  expect(Math.abs(date.x - title.x)).toBeLessThanOrEqual(1);
  expect(date.y).toBeGreaterThan(title.y);
});

test("no console errors on the On listing", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(listing, { waitUntil: "networkidle" });
  expect(errors).toEqual([]);
});
