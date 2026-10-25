// Temporary: checks the three theme layouts on demo pages. Deleted with
// src/pages/sandbox before the Phase 3 PR.
import { expect, test } from "@playwright/test";
import { expectInertTexture, expectTabOrder, expectTopBarGeometry } from "./helpers/chrome";

const themes = ["hp", "code", "on"];

test("top bar geometry matches across themes at 1280", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const heights = [];
  for (const theme of themes) {
    await page.goto(`/sandbox/${theme}`);
    heights.push(await expectTopBarGeometry(page, 24));
  }
  expect(new Set(heights).size).toBe(1);
});

for (const theme of themes) {
  test(`${theme}: 16px gutters at 390`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/sandbox/${theme}`);
    await expectTopBarGeometry(page, 16);
  });

  test(`${theme}: tab order and inert texture`, async ({ page }) => {
    await page.goto(`/sandbox/${theme}`);
    await expectTabOrder(page);
    await expectInertTexture(page);
  });
}

test("code cursor blinks, but not under reduced motion", async ({ page }) => {
  await page.goto("/sandbox/code");
  const animation = () => page.locator(".site-mark").evaluate((el) => getComputedStyle(el).animationName);
  expect(await animation()).not.toBe("none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await animation()).toBe("none");
});
