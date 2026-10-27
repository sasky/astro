// YouTube cards: nothing loads from YouTube until a click (spec 5.15).
import { expect, test } from "@playwright/test";

const post = "/life/top-concertvids";
const youtube = /youtube\.com|ytimg\.com|youtube-nocookie\.com|googlevideo/;

test.beforeEach(async ({ page }) => {
  await page.route(/youtube-nocookie\.com/, (route) => route.abort());
});

test("no YouTube requests before a click", async ({ page }) => {
  const urls: string[] = [];
  page.on("request", (request) => urls.push(request.url()));
  await page.goto(post, { waitUntil: "networkidle" });
  expect(urls.filter((url) => youtube.test(url))).toEqual([]);
});

test("clicking a card swaps in the nocookie player", async ({ page }) => {
  await page.goto(post);
  const figure = page.locator("figure.video").first();
  await figure.locator("a.vid").click();
  const iframe = figure.locator("iframe");
  await expect(iframe).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/u7T64Qo3bdU?autoplay=1");
  await expect(iframe).toHaveAttribute("title", "Lorde, Royals, live 2013");
  await expect(iframe).toBeFocused();
  await expect(figure.locator("a.vid")).toHaveCount(0);
});

// The card must let modified clicks through to the browser. Headless Chromium
// doesn't reliably report a new tab or window to another origin as a page, so
// the check is that nothing prevented the click's default action.
for (const modifier of ["ControlOrMeta", "Shift"] as const) {
  test(`${modifier}-click is left to the browser`, async ({ page, context }) => {
    await context.route(/youtube\.com/, (route) => route.fulfill({ body: "<title>YouTube</title>" }));
    await page.addInitScript(() =>
      window.addEventListener("click", (event) => ((window as any).prevented = event.defaultPrevented)),
    );
    await page.goto(post);
    const cards = await page.locator("a.vid").count();
    await page.locator("a.vid").first().click({ modifiers: [modifier] });
    expect(await page.evaluate(() => (window as any).prevented)).toBe(false);
    await expect(page.locator("a.vid")).toHaveCount(cards);
    await expect(page.locator("figure.video iframe")).toHaveCount(0);
  });
}

test("a plain click is handled by the card", async ({ page }) => {
  await page.route(/youtube/, (route) => route.abort());
  await page.addInitScript(() =>
    window.addEventListener("click", (event) => ((window as any).prevented = event.defaultPrevented)),
  );
  await page.goto(post);
  await page.locator("a.vid").first().click();
  expect(await page.evaluate(() => (window as any).prevented)).toBe(true);
});

test.describe("without JS", () => {
  test.use({ javaScriptEnabled: false });

  test("the card is a YouTube link", async ({ page }) => {
    await page.goto(post);
    await expect(page.locator("a.vid").first()).toHaveAttribute("href", "https://www.youtube.com/watch?v=u7T64Qo3bdU");
  });
});

test("NZ Music cards have titles", async ({ page }) => {
  await page.goto("/life/best-new-zealand-music");
  const labels = await page.locator("a.vid").evaluateAll((cards) => cards.map((card) => card.getAttribute("aria-label")));
  expect(labels.length).toBeGreaterThan(0);
  for (const label of labels) {
    expect(label).toMatch(/^Play video: /);
    expect(label!.length).toBeGreaterThan(12);
  }
});
