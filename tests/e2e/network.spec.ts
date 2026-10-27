// Network budget (spec 8.3): no third-party requests before interaction,
// only the page's own theme fonts, and a hero image no bigger than it needs.
import { expect, test } from "@playwright/test";

// Astro's Fonts API names each family "<name>-<hash>", plus local "fallback" faces.
const faces = (...names: string[]) => new RegExp(`^(${names.join("|")})(-[0-9a-f]+)?( fallback: .+)?$`);
const HP = faces("Fraunces", "Source Sans 3", "JetBrains Mono");
const ON = faces("Holtwood One SC", "Oswald", "Rye", "Alfa Slab One");
const PAGES: [string, RegExp][] = [
  ["/", faces("Fraunces", "Source Sans 3", "JetBrains Mono", "Holtwood One SC", "Oswald")],
  ["/code", faces("JetBrains Mono")],
  ["/code/hide-n-seek-game", faces("JetBrains Mono")],
  ["/life", HP],
  ["/life/top-concertvids", HP],
  ["/meditations", ON],
  ["/meditations/on-happiness", ON],
  ["/tags/music", HP],
  ["/no-such-page", HP],
];

for (const [path, families] of PAGES) {
  test(`network: ${path}`, async ({ page, baseURL }) => {
    const offsite: string[] = [];
    const failed: string[] = [];
    page.on("request", (request) => {
      if (!request.url().startsWith(baseURL!) && !request.url().startsWith("data:")) offsite.push(request.url());
    });
    // Anything the browser asks for on its own (such as /favicon.ico) must exist.
    page.on("response", (response) => {
      if (response.status() >= 400 && response.url() !== new URL(path, baseURL).href) failed.push(response.url());
    });
    await page.goto(path, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    expect(offsite).toEqual([]);
    expect(failed).toEqual([]);
    const loaded = await page.evaluate(() =>
      [...document.fonts].filter((face) => face.status === "loaded").map((face) => face.family.replace(/["']/g, "")),
    );
    expect(loaded.length).toBeGreaterThan(0);
    for (const family of loaded) expect(family).toMatch(families);
  });
}

for (const { width, height, dpr } of [
  { width: 390, height: 844, dpr: 2 },
  { width: 390, height: 844, dpr: 1 },
  { width: 1280, height: 900, dpr: 1 },
  { width: 1280, height: 900, dpr: 2 },
]) {
  test(`hero is no bigger than needed at ${width} × ${dpr}x`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr });
    const page = await context.newPage();
    await page.goto("/");
    const img = page.locator(".hero img");
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && !!el.currentSrc)).toBe(true);
    const { candidates, chosen, rendered } = await img.evaluate((el: HTMLImageElement) => ({
      candidates: el.srcset.split(",").map((part) => {
        const [url, w] = part.trim().split(/\s+/);
        return { path: new URL(url, location.href).pathname, w: parseInt(w) };
      }),
      chosen: new URL(el.currentSrc).pathname,
      rendered: el.getBoundingClientRect().width,
    }));
    const widths = candidates.map(({ w }) => w).sort((a, b) => a - b);
    const needed = widths.find((w) => w >= rendered * dpr) ?? widths.at(-1)!;
    const picked = candidates.find(({ path }) => path === chosen)!.w;
    expect(picked, `picked ${picked}w for ${Math.round(rendered)}px × ${dpr}`).toBeLessThanOrEqual(needed);
    await context.close();
  });
}

// Fraunces from Fontsource came as its "full" variable font (every axis, 121
// and 150 KB); the design asks only for opsz and wght.
test("no font file is over 100 KB", async ({ page, baseURL }) => {
  const sizes: [string, number][] = [];
  page.on("response", async (response) => {
    // Later pages reuse cached fonts (304, no body), so count only fresh ones.
    if (response.request().resourceType() === "font" && response.status() === 200) {
      sizes.push([response.url(), (await response.body()).length]);
    }
  });
  for (const path of ["/", "/life/top-concertvids", "/code/silverstripe-app-platform", "/meditations/on-being-classy"]) {
    await page.goto(new URL(path, baseURL).href, { waitUntil: "networkidle" });
  }
  expect(sizes.length).toBeGreaterThan(0);
  expect(sizes.filter(([, bytes]) => bytes > 100_000)).toEqual([]);
});

// Fonts a page needs above the fold must arrive before it paints. On On posts,
// Oswald (not preloaded) swapped in after the first paint, and the subtitle
// lost a line: CLS 0.10.
for (const [path] of PAGES) {
  test(`no layout shift while fonts load: ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 823 });
    await page.addInitScript(() => {
      (window as any).cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) if (!entry.hadRecentInput) (window as any).cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => (window as any).cls)).toBeLessThan(0.05);
  });
}
