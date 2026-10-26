// Arrows (← →) aren't in the web fonts' latin subsets, so they come from a
// fallback. The boards' fallback is the system face (system-ui, ui-monospace);
// Astro's size-matched fallback faces (Arial, Courier New) draw thin arrows.
import { expect, test } from "@playwright/test";

for (const [path, selector] of [
  ["/", ".door-enter .arrow"],
  ["/life/top-concertvids", ".more-k .arrow"],
  ["/code/silverstripe-app-platform", ".toc-back .arrow"],
  ["/code/silverstripe-app-platform", ".card-k .arrow"],
] as const) {
  test(`arrows use the system face: ${path} ${selector}`, async ({ page }) => {
    await page.goto(path);
    const arrows = page.locator(selector);
    await expect(arrows.first()).toBeAttached();
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
    const { nodeIds } = await cdp.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector });
    expect(nodeIds.length).toBeGreaterThan(0);
    for (const nodeId of nodeIds) {
      const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
      expect(fonts.map(({ familyName }) => familyName)).not.toContain("Arial");
      expect(fonts.map(({ familyName }) => familyName)).not.toContain("Courier New");
    }
  });
}
