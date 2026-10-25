// The redesigned chrome, checked on the 404 page: the one real page in a new
// theme until Phases 4–6. Code and On get the same checks with their pages.
import { expect, test } from "@playwright/test";
import { expectInertTexture, expectTabOrder, expectTopBarGeometry } from "./helpers/chrome";

const missing = "/no-such-page";

test("an unknown URL gets the 404 page with a 404 status", async ({ page }) => {
  const response = await page.goto(missing);
  expect(response!.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("This page has wandered off");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
});

test("404 top bar geometry at 1280 and 390", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(missing);
  await expectTopBarGeometry(page, 24);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(missing);
  await expectTopBarGeometry(page, 16);
});

test("404 tab order and inert texture", async ({ page }) => {
  await page.goto(missing);
  await expectTabOrder(page);
  await expectInertTexture(page);
});

test("404 loads only HP theme styles and fonts", async ({ page, request }) => {
  await page.goto(missing);
  const hrefs = await page.locator('link[rel="stylesheet"]').evaluateAll((links) =>
    links.map((link) => (link as HTMLLinkElement).href),
  );
  const sheets = await Promise.all(hrefs.map(async (href) => (await request.get(href)).text()));
  const inline = await page.locator("style").allTextContents();
  const css = [...sheets, ...inline].join("\n");

  expect(css).toMatch(/data-theme=["']?hp/);
  expect(css).not.toMatch(/data-theme=["']?(code|on)\b/);

  const families = [...css.matchAll(/@font-face\s*{[^}]*font-family:\s*["']?([^;"']+)/g)].map(([, family]) => family);
  expect(families.length).toBeGreaterThan(0);
  for (const family of families) expect(family).toMatch(/Fraunces|Source Sans 3|JetBrains Mono/);
});

test("sticky elements stick inside the layout", async ({ page }) => {
  await page.goto(missing);
  await page.evaluate(() => {
    const main = document.querySelector("main")!;
    const sticky = Object.assign(document.createElement("div"), { id: "sticky-probe", textContent: "probe" });
    sticky.style.cssText = "position: sticky; top: 24px";
    const spacer = document.createElement("div");
    spacer.style.height = "3000px";
    main.append(sticky, spacer);
    window.scrollTo(0, 1500);
  });
  const top = await page.locator("#sticky-probe").evaluate((el) => el.getBoundingClientRect().top);
  expect(Math.abs(top - 24)).toBeLessThanOrEqual(1);
});

test("HP preloads at most two font files", async ({ page }) => {
  await page.goto(missing);
  expect(await page.locator('link[rel="preload"][as="font"]').count()).toBeLessThanOrEqual(2);
});

test("the skip link stays readable on hover", async ({ page }) => {
  await page.goto(missing);
  await page.keyboard.press("Tab");
  const skip = page.locator(".skip-link");
  await skip.hover();
  const [color, background] = await skip.evaluate((el) => {
    const style = getComputedStyle(el);
    return [style.color, style.backgroundColor];
  });
  expect(color).not.toBe(background);
});
