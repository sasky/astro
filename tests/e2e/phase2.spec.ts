import { expect, test } from "@playwright/test";

test("Hide n Seek loads its cart when started", async ({ page }) => {
  await page.goto("/code/hide-n-seek-game");
  const cart = page.waitForResponse((r) => r.url().endsWith("/pico8/hidenseek.js") && r.ok());
  await page.locator("#p8_container").click();
  await cart;
  await expect(page.locator("#canvas")).toBeAttached();
});
