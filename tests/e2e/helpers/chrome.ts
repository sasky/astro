// Shared checks for the redesigned top bar and textures.
import { expect, type Page } from "@playwright/test";

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
