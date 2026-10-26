// Home (HP theme), spec 6.2.
import { expect, test } from "@playwright/test";
import { about } from "../../src/data/home";
import { expectInertTexture, expectOnlyThemeCss, expectTabOrder, expectTopBarGeometry } from "./helpers/chrome";

test("Home hero", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("sasky.nz — Home");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Hello, welcome to my little corner of the internet");
  await expect(page.locator("h1 em")).toHaveText("little corner");
  await expect(page.locator(".hero .lede")).toHaveText("Hello, I’m Cameron. International man of leisure");
});

test("About lists every hobby and statement", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#about")).toBeAttached();
  await expect(page.locator("#about .hobbies li")).toHaveCount(about.hobbies.length);
  await expect(page.locator("#about .statements li")).toHaveCount(4);
});

test("hero portrait has a srcset and stays within the needed width", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const img = page.locator(".hero img");
  const srcset = (await img.getAttribute("srcset")) ?? "";
  for (const width of ["480w", "760w", "1000w", "1527w"]) expect(srcset).toContain(width);
  await expect(img).toHaveAttribute("loading", "eager");
  await expect(img).toHaveAttribute("fetchpriority", "high");
  await expect(img).toHaveAttribute("alt", "");
  expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeLessThanOrEqual(1527);
});

test("Home loads only HP styles plus the door fonts", async ({ page, request }) => {
  await page.goto("/");
  await expectOnlyThemeCss(page, request, "hp", /Fraunces|Source Sans 3|JetBrains Mono|Holtwood One SC|Oswald/);
  expect(await page.locator('link[rel="preload"][as="font"]').count()).toBeLessThanOrEqual(2);
});

test("Home top bar", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expectTopBarGeometry(page, 24);
  await expect(page.locator(".site-wordmark")).toHaveAttribute("aria-current", "page");
  await expectTabOrder(page);
  await expectInertTexture(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expectTopBarGeometry(page, 16);
});

test("Home has no horizontal overflow at 390", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("390 layout stacks the hero", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".hero-label-float")).toBeHidden();
  await expect(page.locator(".hero-label-inline")).toBeVisible();
});

test("doors show computed counts and latest posts", async ({ page }) => {
  await page.goto("/meditations");
  const newestOn = (await page.locator("main li a").first().textContent())!.trim();
  await page.goto("/");
  const doors = page.locator("a.door");
  await expect(doors).toHaveCount(3);
  expect(await doors.evaluateAll((els) => els.map((el) => el.getAttribute("href")))).toEqual([
    "/code",
    "/life",
    "/meditations",
  ]);
  await expect(page.locator("a.door .door-count")).toHaveText(["2 posts", "1 post", "4 meditations"]);
  await expect(doors.nth(2).locator(".door-latest-title")).toHaveText(newestOn);
  for (const [i, prefix] of ["Code: ", "Life: ", "On: "].entries()) {
    await expect(doors.nth(i)).toHaveAccessibleName(new RegExp(`^${prefix}.*Enter`));
  }
});

test("door previews are hidden from assistive tech", async ({ page }) => {
  await page.goto("/");
  const previews = page.locator(".door-preview");
  await expect(previews).toHaveCount(3);
  for (const preview of await previews.all()) await expect(preview).toHaveAttribute("aria-hidden", "true");
});

test("reduced motion: no blink, no lift", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  expect(await page.locator(".cursor").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  const door = page.locator("a.door").first();
  await door.hover();
  expect(await door.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
});

test("picking a tag updates pressed state, list and summary", async ({ page }) => {
  await page.goto("/");
  const chips = page.locator(".tg-chip");
  await expect(chips.first()).toHaveJSProperty("tagName", "BUTTON");
  const second = chips.nth(1);
  const tag = (await second.getAttribute("data-tag"))!;
  await second.click();
  await expect(page.locator('.tg-chip[aria-pressed="true"]')).toHaveCount(1);
  await expect(second).toHaveAttribute("aria-pressed", "true");
  const visible = page.locator("ul.tg-list:visible");
  await expect(visible).toHaveCount(1);
  await expect(visible).toHaveAttribute("data-tag-list", tag);
  await expect(page.locator(".tg-summary")).toHaveText((await visible.getAttribute("data-summary"))!);

  await chips.first().focus();
  await page.keyboard.press("Enter");
  await expect(chips.first()).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("ul.tg-list:visible")).toHaveAttribute(
    "data-tag-list",
    (await chips.first().getAttribute("data-tag"))!,
  );
});

test.describe("without JS", () => {
  test.use({ javaScriptEnabled: false });

  test("default list visible, chips link to tag pages", async ({ page }) => {
    await page.goto("/");
    const chips = page.locator(".tg-chip");
    for (const chip of await chips.all()) {
      expect(await chip.evaluate((el) => el.tagName)).toBe("A");
      expect(await chip.getAttribute("href")).toMatch(/^\/tags\/[a-z0-9-]+$/);
    }
    const visible = page.locator("ul.tg-list:visible");
    await expect(visible).toHaveCount(1);
    await expect(visible).toHaveAttribute("data-tag-list", (await chips.first().getAttribute("data-tag"))!);
    const response = await page.goto((await chips.nth(1).getAttribute("href"))!);
    expect(response!.status()).toBe(200);
  });
});

test("no duplicate ids on Home", async ({ page }) => {
  await page.goto("/");
  const ids = await page.locator("[id]").evaluateAll((els) => els.map((el) => el.id));
  expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
});

test("#tags anchor exists", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#tags")).toBeAttached();
});
