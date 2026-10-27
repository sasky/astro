// Shared checks for the redesigned top bar and textures.
import { expect, type APIRequestContext, type Page } from "@playwright/test";

export async function expectTopBarGeometry(page: Page, gutter: number) {
  const bar = await page.locator("header.site-bar").boundingBox();
  expect(bar!.height).toBeGreaterThanOrEqual(66);
  const row = page.locator(".site-bar-row");
  const rowBox = await row.boundingBox();
  const viewport = page.viewportSize()!;
  expect(rowBox!.width).toBeLessThanOrEqual(1120);
  expect(Math.abs(rowBox!.x - (viewport.width - rowBox!.width) / 2)).toBeLessThanOrEqual(1);
  expect(await row.evaluate((el) => getComputedStyle(el).paddingLeft)).toBe(`${gutter}px`);
  for (const link of await page.locator(".site-nav-link").all()) {
    expect((await link.boundingBox())!.height).toBe(44);
  }
  return bar!.height;
}

export async function expectTabOrder(page: Page) {
  await page.keyboard.press("Tab");
  const skip = page.locator(".skip-link");
  await expect(skip).toBeFocused();
  const box = await skip.boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  await page.keyboard.press("Tab");
  await expect(page.locator(".site-wordmark")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator(".site-nav-link").first()).toBeFocused();
}

export async function expectInertTexture(page: Page) {
  const texture = page.locator(".texture");
  await expect(texture).toHaveAttribute("aria-hidden", "true");
  expect(await texture.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
}

/** The page's CSS targets only `theme`, and every @font-face family matches `families`. */
export async function expectOnlyThemeCss(page: Page, request: APIRequestContext, theme: string, families: RegExp) {
  const hrefs = await page
    .locator('link[rel="stylesheet"]')
    .evaluateAll((links) => links.map((link) => (link as HTMLLinkElement).href));
  const sheets = await Promise.all(hrefs.map(async (href) => (await request.get(href)).text()));
  const inline = await page.locator("style").allTextContents();
  const css = [...sheets, ...inline].join("\n");

  expect(css).toMatch(new RegExp(`data-theme=["']?${theme}`));
  for (const other of ["hp", "code", "on"].filter((t) => t !== theme)) {
    expect(css).not.toMatch(new RegExp(`data-theme=["']?${other}\\b`));
  }

  const found = [...css.matchAll(/@font-face\s*{[^}]*font-family:\s*["']?([^;"']+)/g)].map(([, family]) => family);
  expect(found.length).toBeGreaterThan(0);
  for (const family of found) expect(family).toMatch(families);
}
