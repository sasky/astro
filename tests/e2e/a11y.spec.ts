// Accessibility audit (spec 8.2): axe, keyboard, aria-current/pressed,
// reduced motion and no JS, over every page type.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const PAGES = [
  "/",
  "/code",
  "/life",
  "/meditations",
  "/code/silverstripe-app-platform",
  "/code/hide-n-seek-game",
  "/life/top-concertvids",
  "/meditations/on-being-classy",
  "/meditations/on-new-zealand-music",
  "/tags/music",
  "/no-such-page",
];

for (const width of [1280, 390]) {
  for (const path of PAGES) {
    test(`axe: ${path} at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const serious = violations
        .filter(({ impact }) => impact === "serious" || impact === "critical")
        .map(({ id, impact, nodes }) => `${impact} ${id}: ${nodes.map(({ target }) => target.join(" ")).join(", ")}`);
      expect(serious).toEqual([]);
    });
  }
}

const focusRing = (page: Page, selector: string) =>
  page.locator(selector).first().evaluate((el) => {
    const style = getComputedStyle(el);
    return style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2;
  });

test("keyboard: tag chips toggle with Enter and Space", async ({ page }) => {
  await page.goto("/");
  const chips = page.locator(".tg-chip");
  await expect(chips.first()).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".tg-chip[aria-pressed=true]")).toHaveCount(1);
  const second = chips.nth(1);
  const tag = (await second.getAttribute("data-tag"))!;
  await second.focus();
  await page.keyboard.press("Enter");
  await expect(second).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".tg-summary")).toContainText(`tagged ${tag}`);
  await expect(page.locator(".tg-chip[aria-pressed=true]")).toHaveCount(1);
  const third = chips.nth(2);
  await third.focus();
  await page.keyboard.press("Space");
  await expect(third).toHaveAttribute("aria-pressed", "true");
  expect(await focusRing(page, ".tg-chip:focus-visible")).toBe(true);
});

test("keyboard: doors and video cards show a focus ring", async ({ page }) => {
  await page.goto("/");
  await page.locator(".door").first().focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  expect(await focusRing(page, ".door:focus-visible")).toBe(true);
  await page.route(/youtube/, (route) => route.abort());
  await page.goto("/life/top-concertvids");
  await page.locator("a.vid").first().focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  expect(await focusRing(page, "a.vid:focus-visible")).toBe(true);
  await page.keyboard.press("Enter");
  await expect(page.locator("figure.video iframe").first()).toBeFocused();
});

test("keyboard: a copy button works with Enter", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/code/silverstripe-app-platform");
  const button = page.locator("button.copy").first();
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toHaveText("copied");
});

test("aria-current: listings are the page, posts are in the section", async ({ page }) => {
  for (const [path, nav, value] of [
    ["/code", "/code", "page"],
    ["/life", "/life", "page"],
    ["/meditations", "/meditations", "page"],
    ["/code/silverstripe-app-platform", "/code", "true"],
    ["/life/top-concertvids", "/life", "true"],
    ["/meditations/on-being-classy", "/meditations", "true"],
  ]) {
    await page.goto(path);
    await expect(page.locator(".site-nav-link[aria-current]")).toHaveCount(1);
    await expect(page.locator(`.site-nav-link[href="${nav}"]`)).toHaveAttribute("aria-current", value);
  }
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  for (const path of PAGES) {
    test(`no animation or transition: ${path}`, async ({ page }) => {
      await page.goto(path);
      // base.css shortens every animation and transition to 0.01ms (one run),
      // so a longer duration, or an animation still running once the page has
      // settled, is real motion.
      const moving = () =>
        page.evaluate(() => [
          ...document
            .getAnimations()
            .filter((a) => a.playState === "running")
            .map((a) => `animation on ${(a.effect as KeyframeEffect).target?.className}`),
          ...[...document.querySelectorAll("*")]
            .filter((el) => getComputedStyle(el).transitionDuration.split(",").some((d) => parseFloat(d) > 0.00001))
            .map((el) => `transition on ${el.tagName.toLowerCase()}.${[...el.classList].join(".")}`),
        ]);
      await expect.poll(moving, { timeout: 2000 }).toEqual([]);
    });
  }

  test("hover lifts stay put", async ({ page }) => {
    const lifted = (selector: string) =>
      page.locator(selector).first().evaluate((el) => {
        const style = getComputedStyle(el);
        return [style.transform, style.translate].filter((value) => value && value !== "none");
      });
    await page.goto("/");
    await page.locator(".door").first().hover();
    expect(await lifted(".door")).toEqual([]);
    await page.goto("/life/top-concertvids");
    await page.locator("a.vid").first().hover();
    expect(await lifted("a.vid")).toEqual([]);
    await page.locator(".more").first().hover();
    expect(await lifted(".more")).toEqual([]);
  });
});

test.describe("without JS", () => {
  test.use({ javaScriptEnabled: false });

  test("the tag selector shows the default list, with chips as links", async ({ page }) => {
    await page.goto("/");
    const chips = page.locator(".tg-chip");
    expect(await chips.count()).toBeGreaterThan(0);
    for (const chip of await chips.all()) expect(await chip.evaluate((el) => el.tagName)).toBe("A");
    await expect(page.locator(".tg-list:visible")).toHaveCount(1);
    expect(await page.locator(".tg-list:visible li").count()).toBeGreaterThan(0);
  });

  test("video cards link to YouTube", async ({ page }) => {
    await page.goto("/meditations/on-new-zealand-music");
    for (const card of await page.locator("a.vid").all()) {
      await expect(card).toHaveAttribute("href", /^https:\/\/www\.youtube\.com\/watch\?v=/);
    }
  });

  test("code is readable and the copy buttons don't show", async ({ page }) => {
    await page.goto("/code/silverstripe-app-platform");
    await expect(page.locator("pre code").first()).toBeVisible();
    await expect(page.locator("button.copy").first()).toBeHidden();
  });
});

// Voice control users say what they see ("click music 2"), so each chip's
// accessible name must contain its visible text.
for (const [javaScriptEnabled, role] of [
  [true, "button"],
  [false, "link"],
] as const) {
  test.describe(`chip names, JS ${javaScriptEnabled ? "on" : "off"}`, () => {
    test.use({ javaScriptEnabled });

    test("tag chips are named by their visible text", async ({ page }) => {
      await page.goto("/");
      const chips = await page.locator(".tg-chip").all();
      expect(chips.length).toBeGreaterThan(0);
      for (const chip of chips) {
        const visible = (await chip.innerText()).replace(/\s+/g, " ").trim();
        await expect(page.getByRole(role, { name: visible })).toHaveCount(1);
      }
    });
  });
}
