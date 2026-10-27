// Code listing and Code posts (terminal theme), spec 6.3.
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { expectInertTexture, expectOnlyThemeCss, expectTabOrder, expectTopBarGeometry } from "./helpers/chrome";

test("Code listing heading, stats and entries", async ({ page }) => {
  await page.goto("/code");
  await expect(page).toHaveTitle("Code — sasky.nz");
  await expect(page.locator("h1")).toHaveText("# Code");
  await expect(page.locator("h1")).toHaveAccessibleName("Code");
  await expect(page.locator("h2#all")).toHaveText("# every code post, newest first");
  await expect(page.locator(".stats")).toContainText("total 2 posts");
  await expect(page.locator(".stats")).toContainText("since January 2024");
  await expect(page.locator("main article h3")).toHaveText([
    "> Cheap and easy Silverstripe hosting",
    "> Hide n Seek",
  ]);
  for (const text of await page.locator("main p").allTextContents()) expect(text).not.toContain("[");
});

test("Code listing chrome", async ({ page, request }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/code");
  await expectTopBarGeometry(page, 24);
  await expect(page.locator('.site-nav-link[href="/code"]')).toHaveAttribute("aria-current", "page");
  await expectTabOrder(page);
  await expectInertTexture(page);
  await expectOnlyThemeCss(page, request, "code", /JetBrains Mono/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/code");
  await expectTopBarGeometry(page, 16);
});

test("reduced motion stops both cursors", async ({ page }) => {
  await page.goto("/code");
  expect(await page.locator(".prompt-cursor").evaluate((el) => getComputedStyle(el).animationName)).not.toBe("none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/code");
  for (const selector of [".site-mark", ".prompt-cursor"]) {
    expect(await page.locator(selector).evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  }
});

test("Code listing has no horizontal overflow at 390", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/code");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("Code pages turn off font ligatures", async ({ page }) => {
  await page.goto("/code");
  expect(await page.locator(".entry-perms").first().evaluate((el) => getComputedStyle(el).fontVariantLigatures)).toBe(
    "none",
  );
});

const silverstripe = "/code/silverstripe-app-platform";
const hideNSeek = "/code/hide-n-seek-game";

test("Code post header and TOC", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(silverstripe);
  await expect(page).toHaveTitle("Cheap and easy Silverstripe hosting — Code — sasky.nz");
  const crumbs = page.locator('nav[aria-label="Breadcrumb"] a');
  expect(await crumbs.evaluateAll((links) => links.map((a) => a.getAttribute("href")))).toEqual(["/", "/code"]);
  const tocTargets = await page
    .locator('aside[aria-label="On this page"] .toc-nav .toc-link')
    .evaluateAll((links) => links.map((a) => a.getAttribute("href")));
  const headingIds = await page
    .locator(".prose-code :is(h2, h3)")
    .evaluateAll((headings) => headings.map((h) => `#${h.id}`));
  expect(tocTargets).toHaveLength(5);
  expect(tocTargets).toEqual(headingIds);
  await expect(page.locator('.site-nav-link[href="/code"]')).toHaveAttribute("aria-current", "true");
});

test("More in Code follows G7", async ({ page }) => {
  await page.goto(silverstripe);
  const newest = page.locator('nav[aria-label="More in Code"] a');
  expect(await newest.evaluateAll((links) => links.map((a) => a.getAttribute("href")))).toEqual([
    hideNSeek,
    "/code",
  ]);
  await page.goto(hideNSeek);
  const oldest = page.locator('nav[aria-label="More in Code"] a');
  expect(await oldest.evaluateAll((links) => links.map((a) => a.getAttribute("href")))).toEqual([silverstripe]);
});

test("TOC hides under 900 and the post doesn't overflow at 390", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(silverstripe);
  await expect(page.locator('aside[aria-label="On this page"]')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("Code post loads only Code styles", async ({ page, request }) => {
  await page.goto(silverstripe);
  await expectOnlyThemeCss(page, request, "code", /JetBrains Mono/);
});

test("block captions match the design", async ({ page }) => {
  await page.goto(silverstripe);
  await expect(page.locator(".code-title")).toHaveText([
    "── bash",
    "── .env · database",
    "── .env · silverstripe",
    "── .env · mail",
    "── build command",
    "── app/_config.php",
  ]);
});

test("copy gives exactly the code", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(silverstripe);
  const mdx = readFileSync("src/content/posts/silverstripe-app-platform.mdx", "utf8");
  const php = mdx.match(/```php[^\n]*\n([\s\S]*?)\n```/)![1];
  const button = page.locator("figure.code-block").last().locator("button.copy");
  await button.click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(php);
  await expect(button).toHaveText("copied");
});

test("line numbers aren't copied or selectable", async ({ page }) => {
  await page.goto(silverstripe);
  const selected = await page.locator("figure.code-block").nth(1).locator(".line").first().evaluate((line) => {
    const range = document.createRange();
    range.selectNodeContents(line);
    const selection = getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    return selection.toString();
  });
  expect(selected).toBe("SS_DATABASE_CLASS=MySQLDatabase");
});

test("blank lines keep their height", async ({ page }) => {
  await page.goto(silverstripe);
  const heights = await page
    .locator("figure.code-block")
    .last()
    .locator(".line")
    .evaluateAll((lines) => lines.map((line) => line.getBoundingClientRect().height));
  expect(heights.length).toBeGreaterThan(5);
  for (const height of heights) expect(height).toBeGreaterThanOrEqual(20);
});

test("long lines scroll inside the block at 390", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(silverstripe);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const pre = page.locator("figure.code-block").nth(1).locator("pre");
  expect(await pre.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
});

test("mark and sign-off", async ({ page }) => {
  await page.goto(silverstripe);
  await expect(page.locator(".prose-code mark")).toHaveText("Down that path, there be dragons,");
  await expect(page.locator(".prose-code strong")).toHaveText("Cam out.");
});

test("TOC stays in view while reading", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(silverstripe);
  await page.locator("figure.code-block").nth(2).scrollIntoViewIfNeeded();
  const box = await page.locator(".toc").boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(Math.abs(box!.y - 24)).toBeLessThanOrEqual(1);
});

test("code uses the terminal font", async ({ page }) => {
  await page.goto(silverstripe);
  const family = await page.locator("figure.code-block .line").first().evaluate((el) => getComputedStyle(el).fontFamily);
  expect(family).toMatch(/JetBrains Mono/);
});

test("Pico-8 panel caption and placement", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(hideNSeek);
  const caption = page.locator(".pico8-panel figcaption");
  await expect(caption).toContainText("── hidenseek.p8");
  await expect(caption).toContainText("arrow keys + X");
  const order = await page.evaluate(() => {
    const header = document.querySelector(".post-header")!;
    const panel = document.querySelector(".pico8-panel")!;
    const grid = document.querySelector(".post-grid")!;
    return [
      header.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING,
      panel.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING,
    ];
  });
  expect(order.every(Boolean)).toBe(true);
  const panel = (await page.locator(".pico8-panel").boundingBox())!;
  const article = (await page.locator(".prose-code").boundingBox())!;
  expect(panel.width).toBeGreaterThan(article.width);
});

test("Pico-8 fits a 2560×1440 screen", async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.goto(hideNSeek);
  const cart = page.waitForResponse((r) => r.url().endsWith("/pico8/hidenseek.js") && r.ok());
  await page.locator("#p8_container").click();
  await cart;
  const canvas = page.locator("#canvas");
  await expect.poll(async () => (await canvas.boundingBox())?.height ?? 0).toBeGreaterThan(0);
  const box = (await canvas.boundingBox())!;
  expect(box.height).toBeLessThanOrEqual(800);
  expect(box.height).toBeLessThanOrEqual(1440);
});

test("Pico-8 at 390 fits the width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(hideNSeek);
  expect((await page.locator("#p8_frame").boundingBox())!.width).toBeLessThanOrEqual(350);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("comics two across, each frame hugging its image", async ({ page }) => {
  const tracks = async () =>
    (await page.locator(".image-collection").evaluate((el) => getComputedStyle(el).gridTemplateColumns)).split(" ")
      .length;
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(hideNSeek);
  expect(await tracks()).toBe(2);
  const articleRight = await page.locator(".prose-code").evaluate((el) => el.getBoundingClientRect().right);
  const frames = await page.locator(".image-collection > picture").evaluateAll((pictures) =>
    pictures.map((picture) => {
      const img = picture.querySelector("img")!;
      return { gap: picture.getBoundingClientRect().height - img.getBoundingClientRect().height, right: img.getBoundingClientRect().right };
    }),
  );
  expect(frames).toHaveLength(9);
  for (const { gap, right } of frames) {
    expect(right).toBeLessThanOrEqual(articleRight + 0.5);
    // 6px padding and a 1px dashed border, top and bottom.
    expect(gap).toBeCloseTo(14, 0);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(hideNSeek);
  expect(await tracks()).toBe(2);
});

test("no console errors on Code pages", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of ["/code", silverstripe, hideNSeek]) await page.goto(path, { waitUntil: "networkidle" });
  expect(errors).toEqual([]);
});

test("code blocks keep the prose rhythm above and below", async ({ page }) => {
  await page.goto(silverstripe);
  const gaps = await page.locator("figure.code-block").evaluateAll((figures) =>
    figures.map((figure) => {
      const box = figure.getBoundingClientRect();
      const before = figure.previousElementSibling!.getBoundingClientRect();
      return Math.round(box.top - before.bottom);
    }),
  );
  for (const gap of gaps) expect(gap).toBeGreaterThanOrEqual(22);
});

test("prompt links are at least 44px tall", async ({ page }) => {
  for (const path of ["/code", silverstripe]) {
    await page.goto(path);
    for (const link of await page.locator(".prompt a").all()) {
      const box = (await link.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(24);
    }
  }
});

const phpBlock = () => readFileSync("src/content/posts/silverstripe-app-platform.mdx", "utf8").match(/```php[^\n]*\n([\s\S]*?)\n```/)![1];

const noClipboardApi = () => Object.defineProperty(Navigator.prototype, "clipboard", { get: () => undefined });
const refusingClipboard = () =>
  (Clipboard.prototype.writeText = () => Promise.reject(new DOMException("denied", "NotAllowedError")));

for (const [name, init] of [
  ["missing", noClipboardApi],
  ["refusing", refusingClipboard],
] as const) {
  test(`copy falls back to the copy command when the clipboard is ${name}`, async ({ page }) => {
    await page.addInitScript(init);
    await page.addInitScript(() =>
      window.addEventListener("copy", (event) => ((window as any).copied = event.clipboardData!.getData("text/plain"))),
    );
    await page.goto(silverstripe);
    const button = page.locator("figure.code-block").last().locator("button.copy");
    await button.click();
    await expect(button).toHaveText("copied");
    expect(await page.evaluate(() => (window as any).copied)).toBe(phpBlock());
  });
}

test("copy selects the code when no copy method works", async ({ page }) => {
  await page.addInitScript(noClipboardApi);
  await page.addInitScript(() => (document.execCommand = () => false));
  await page.goto(silverstripe);
  const block = page.locator("figure.code-block").last();
  await block.locator("button.copy").click();
  await expect(block.locator("button.copy")).toHaveText("selected");
  const covered = await block.locator("pre code").evaluate((code) => {
    const range = getSelection()!.getRangeAt(0);
    const all = document.createRange();
    all.selectNodeContents(code);
    return range.compareBoundaryPoints(Range.START_TO_START, all) === 0 && range.compareBoundaryPoints(Range.END_TO_END, all) === 0;
  });
  expect(covered).toBe(true);
});

test("a second copy restarts the 2s label", async ({ page }) => {
  // A clipboard that settles at once, so the fake clock decides the order.
  await page.addInitScript(() => (Clipboard.prototype.writeText = () => Promise.resolve()));
  await page.clock.install();
  await page.goto(silverstripe);
  const button = page.locator("figure.code-block").first().locator("button.copy");
  await button.click();
  await expect(button).toHaveText("copied");
  await page.clock.runFor(1500);
  await button.click();
  await page.clock.runFor(1000);
  await expect(button).toHaveText("copied");
  await page.clock.runFor(1100);
  await expect(button).toHaveText("copy");
});

test("copy buttons show with JS", async ({ page }) => {
  await page.goto(silverstripe);
  await expect(page.locator("button.copy").first()).toBeVisible();
});

test("the TOC fits a short window and scrolls inside", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 360 });
  await page.goto(silverstripe);
  await page.mouse.wheel(0, 1200);
  const toc = page.locator(".toc");
  await expect(async () => {
    const box = (await toc.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(360);
  }).toPass();
  expect(await toc.evaluate((el) => getComputedStyle(el).overflowY)).toBe("auto");
});

test("the TOC back link looks like the TOC links, as on the board", async ({ page }) => {
  await page.goto(silverstripe);
  const style = (selector: string) =>
    page.locator(selector).first().evaluate((el) => [getComputedStyle(el).color, getComputedStyle(el).textDecorationLine]);
  expect(await style(".toc-back")).toEqual(await style(".toc-nav .toc-link:not(.toc-h2)"));
  expect(await style(".toc-back")).toEqual(["rgb(159, 179, 165)", "none"]);
});

test("the Code footer keeps its 32px sides at 390, as on the board", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/code");
  expect(await page.locator(".code-footer-row").evaluate((el) => getComputedStyle(el).paddingLeft)).toBe("32px");
});

// The Pico-8 loader sizes #p8_container to fill its square frame shortly after
// load; the box must already be that size, or the page shifts (CLS 0.07 on phones).
test("the Pico-8 player reserves its square before the loader runs", async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 823 });
  await page.route("**/pico8/pico8Loader.js", (route) => route.abort());
  await page.goto("/code/hide-n-seek-game");
  const [frame, container] = await Promise.all(
    ["#p8_frame", "#p8_container"].map(async (selector) => (await page.locator(selector).boundingBox())!),
  );
  expect(Math.abs(container.width - frame.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(container.height - frame.height)).toBeLessThanOrEqual(2);
});
