// Tag pages (HP theme), spec 5.11 and Q4.
import { expect, test, type Page } from "@playwright/test";
import { headingFit } from "../../src/lib/fit";
import { expectOnlyThemeCss } from "./helpers/chrome";

test("music tag page", async ({ page }) => {
  await page.goto("/tags/music");
  await expect(page).toHaveTitle("#music — sasky.nz");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "hp");
  await expect(page.locator("h1")).toHaveText("#music");
  await expect(page.locator(".band .dymo")).toHaveText("2 posts");
  await expect(page.locator(".band .lede")).toHaveText("Posts from Life and On. Pick another tag on the home page.");
  await expect(page.locator('.band .lede a[href="/#tags"]')).toHaveText("home page");
  await expect(page.locator("h2#all")).toHaveText("Every post tagged music, newest first");
  const rows = page.locator("main article");
  await expect(rows.locator("h3 a")).toHaveText([
    "On New Zealand Music",
    "Concert youtube vids to temporarily restore one's faith in humanity",
  ]);
  await expect(rows.locator(".chip")).toHaveText(["On", "Life"]);
  const current = rows.locator('.tag-link[href="/tags/music"]');
  await expect(current).toHaveCount(2);
  for (const link of await current.all()) await expect(link).toHaveAttribute("aria-current", "page");
});

test("every tag in the index has a page with its posts", async ({ page }) => {
  await page.goto("/");
  const chips = await page
    .locator(".tg-chip[data-tag]")
    .evaluateAll((els) => els.map((el) => [el.getAttribute("data-tag")!, Number(el.querySelector(".tg-count")!.textContent)] as const));
  expect(chips.length).toBeGreaterThan(0);
  for (const [tag, count] of chips) {
    const response = await page.goto(`/tags/${tag}`);
    expect(response!.status()).toBe(200);
    await expect(page.locator("main article")).toHaveCount(count);
    // Classy has no tags, so no tag page lists it.
    await expect(page.locator('main a[href="/meditations/on-being-classy"]')).toHaveCount(0);
  }
});

test("tag page loads only HP styles", async ({ page, request }) => {
  await page.goto("/tags/music");
  await expectOnlyThemeCss(page, request, "hp", /Fraunces|Source Sans 3|JetBrains Mono/);
});

test("no section is current on a tag page", async ({ page }) => {
  await page.goto("/tags/music");
  await expect(page.locator(".site-nav-link")).toHaveCount(3);
  await expect(page.locator(".site-nav-link[aria-current]")).toHaveCount(0);
});

test("post pages mark no tag current", async ({ page }) => {
  await page.goto("/life/top-concertvids");
  await expect(page.locator('.tag-link[href="/tags/music"]')).toHaveCount(1);
  await expect(page.locator(".tag-link[aria-current]")).toHaveCount(0);
});

/** The h1's text is one line, inside the band's content box, and not tiny. */
async function expectHeadingFits(page: Page, label: string, width: number) {
  const fit = await page.locator("h1").evaluate((h1) => {
    const band = h1.closest(".band-in")!;
    const style = getComputedStyle(band);
    const inner = band.getBoundingClientRect();
    const left = inner.left + parseFloat(style.paddingLeft);
    const right = inner.right - parseFloat(style.paddingRight);
    const box = h1.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(h1);
    const text = range.getBoundingClientRect();
    return {
      lines: range.getClientRects().length,
      fontSize: parseFloat(getComputedStyle(h1).fontSize),
      inside: text.left >= left - 0.5 && text.right <= right + 0.5 && box.right <= right + 0.5,
    };
  });
  expect(fit.lines, label).toBe(1);
  expect(fit.inside, label).toBe(true);
  expect(fit.fontSize, label).toBeGreaterThanOrEqual(width < 760 ? 20 : 60);
}

// Wide letters (m, w, o), a long hyphenated tag and every digit, as a future tag might be.
const WIDE = ["#homework", "#woodwork", "#swimming", "#mmmm", "#wwwwwwww", "#0123456789", "#home-made-sourdough"];

// Every tag, since Fraunces's optical size widens letters at small sizes.
for (const width of [320, 390, 768, 1280]) {
  test(`tag headings fit on one line at ${width}`, async ({ page }) => {
    await page.goto("/");
    const tags = await page.locator(".tg-chip[data-tag]").evaluateAll((els) => els.map((el) => el.getAttribute("data-tag")!));
    expect(tags.length).toBeGreaterThan(0);
    await page.setViewportSize({ width, height: 900 });
    for (const tag of tags) {
      await page.goto(`/tags/${tag}`);
      await expectHeadingFits(page, tag, width);
    }
  });

  test(`wide future tags fit on one line at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/tags/music");
    for (const title of WIDE) {
      await page.locator("h1").evaluate((h1, [text, style]) => {
        h1.textContent = text;
        h1.setAttribute("style", style);
      }, [title, headingFit(title)]);
      await expectHeadingFits(page, title, width);
    }
  });
}

test("the current tag looks current", async ({ page }) => {
  await page.goto("/tags/learning");
  const fill = (href: string) =>
    page.locator(`.tag-link[href="${href}"] .tag-label`).first().evaluate((el) => getComputedStyle(el).backgroundColor);
  const current = await fill("/tags/learning");
  expect(current).not.toBe(await fill("/tags/pico8"));
  expect(current).not.toBe("rgba(0, 0, 0, 0)");
});
