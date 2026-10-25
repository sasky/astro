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
