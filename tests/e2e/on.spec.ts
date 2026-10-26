// On listing and On posts (handbill theme), spec 6.4.
import { expect, test, type Page } from "@playwright/test";
import { expectInertTexture, expectOnlyThemeCss, expectTabOrder, expectTopBarGeometry } from "./helpers/chrome";

const listing = "/meditations";
const moment = "/meditations/on-being-in-the-moment-vs-past-and-future";
const classy = "/meditations/on-being-classy";
const happiness = "/meditations/on-happiness";
const nzMusic = "/meditations/on-new-zealand-music";
const onFonts = /Holtwood One SC|Alfa Slab One|Rye|Oswald/;

// OnLayout clips overflow, so scrollWidth can't catch it: check that every
// element in the bill (bar the corner fleurons) stays inside its inner rule.
const expectInsideBill = async (page: Page) => {
  const outside = await page.evaluate(() => {
    const bill = document.querySelector(".bill")!;
    const box = bill.getBoundingClientRect();
    const [left, right] = [box.left + bill.clientLeft, box.right - bill.clientLeft];
    return [...bill.querySelectorAll("*")]
      .filter((el) => !el.closest(".corner"))
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.left < left - 0.5 || r.right > right + 0.5);
      })
      .map((el) => `${el.tagName.toLowerCase()}.${el.className}`);
  });
  expect(outside).toEqual([]);
};

// Words in `selector` that wrap across two lines.
const splitWords = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => {
    const split: string[] = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      for (const match of node.textContent!.matchAll(/\S+/g)) {
        const range = document.createRange();
        range.setStart(node, match.index!);
        range.setEnd(node, match.index! + match[0].length);
        const tops = new Set([...range.getClientRects()].map((r) => Math.round(r.top)));
        if (tops.size > 1) split.push(match[0]);
      }
    }
    return split;
  });

test("On listing heading, stats and headliner", async ({ page }) => {
  await page.goto(listing);
  await expect(page).toHaveTitle("Pseudo Philosophy Meditations — sasky.nz");
  await expect(page.locator("h1")).toHaveText("Pseudo Philosophy Meditations");
  await expect(page.locator(".stats")).toContainText("4 meditations");
  await expect(page.locator(".stats")).toContainText("since June 2026");
  const headliner = page.locator('section[aria-labelledby="headliner"]');
  await expect(headliner.locator(".now-showing")).toHaveText("!Now Showing · Meditation the Fourth!");
  await expect(page.locator("#headliner a")).toHaveAttribute("href", moment);
  await expect(headliner.locator(".excerpt")).toHaveText(/^You do not realise at first/);
  await expect(headliner.locator(".byline")).toContainText("18th October 2026");
  await expect(headliner.locator("a.on-ink")).toHaveAttribute("href", moment);
});

test("Also Appearing lists the rest, newest first, with computed numerals", async ({ page }) => {
  await page.goto(listing);
  const rows = page.locator('section[aria-labelledby="also"] li');
  await expect(rows.locator(".prog-title")).toHaveText(["On Happiness", "On Being Classy", "On New Zealand Music"]);
  await expect(rows.locator(".prog-num")).toHaveText(["III.", "II.", "I."]);
  await expect(rows.locator("time")).toHaveText(["22nd Sept. 2026", "11th Sept. 2026", "20th June 2026"]);
  const classyLine = rows.nth(1).locator(".prog-line");
  await expect(classyLine).toHaveText("Top Ten Tips for Staying Classy");
  await expect(classyLine).not.toHaveClass(/prog-line-long/);
  expect(await classyLine.evaluate((el) => getComputedStyle(el).textTransform)).toBe("uppercase");
  const nzLine = rows.nth(2).locator(".prog-line");
  await expect(nzLine).toHaveClass(/prog-line-long/);
  await expect(nzLine).toHaveText(/songs\.$/);
  expect(await nzLine.evaluate((el) => getComputedStyle(el).textTransform)).toBe("none");
});

test("On listing chrome", async ({ page, request }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(listing);
  await expectTopBarGeometry(page, 24);
  await expect(page.locator('.site-nav-link[href="/meditations"]')).toHaveAttribute("aria-current", "page");
  expect(await page.locator(".site-mark").evaluate((el) => getComputedStyle(el).margin)).toBe("0px 1px");
  await expectTabOrder(page);
  await expectInertTexture(page);
  await expectOnlyThemeCss(page, request, "on", onFonts);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(listing);
  await expectTopBarGeometry(page, 16);
});

test("correspondence sits inside the bill, colophon after", async ({ page }) => {
  await page.goto(listing);
  await expect(page.locator(".bill .on-correspondence")).toBeVisible();
  const footer = page.locator("footer.on-footer");
  await expect(footer).toContainText("© MMXXVI Cameron Grant");
  await expect(footer).not.toContainText("Correspondence");
});

test("listing at 390: no sideways scroll, Eye inside the bill, rows stack", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(listing);
  await expectInsideBill(page);
  const eye = (await page.locator(".eye").boundingBox())!;
  const bill = (await page.locator(".bill").boundingBox())!;
  expect(eye.x).toBeGreaterThanOrEqual(bill.x);
  expect(eye.x + eye.width).toBeLessThanOrEqual(bill.x + bill.width);
  const row = page.locator('section[aria-labelledby="also"] li').first();
  const title = (await row.locator(".prog-title").boundingBox())!;
  const date = (await row.locator("time").boundingBox())!;
  expect(Math.abs(date.x - title.x)).toBeLessThanOrEqual(1);
  expect(date.y).toBeGreaterThan(title.y);
});

test("no console errors on the On listing", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(listing, { waitUntil: "networkidle" });
  expect(errors).toEqual([]);
});

test("Classy tips get Roman numerals", async ({ page }) => {
  await page.goto(classy);
  const tips = page.locator(".prose-on h2.tip");
  await expect(tips.locator(".num")).toHaveText(["I.", "II.", "III.", "IV.", "V.", "VI.", "VII.", "VIII.", "IX.", "X."]);
  const small = tips.nth(4).locator("small");
  await expect(small).toHaveText("(one clean, one dirty, and one long and dirty)");
  expect(await small.evaluate((el) => [getComputedStyle(el).fontWeight, getComputedStyle(el).textTransform])).toEqual([
    "500",
    "none",
  ]);
  const border = (i: number) => tips.nth(i).evaluate((el) => getComputedStyle(el).borderTop);
  expect(await border(0)).toMatch(/^3px solid/);
  expect(await border(1)).toMatch(/^2px dotted/);
  const between = await page.evaluate(() => {
    const ornament = document.querySelector(".prose-on .ornament")!;
    const [five, six] = [...document.querySelectorAll(".prose-on h2.tip")].slice(4, 6);
    return [
      five.compareDocumentPosition(ornament) & Node.DOCUMENT_POSITION_FOLLOWING,
      ornament.compareDocumentPosition(six) & Node.DOCUMENT_POSITION_FOLLOWING,
    ];
  });
  expect(between.every(Boolean)).toBe(true);
});

test("other On headings are untouched", async ({ page }) => {
  for (const path of [moment, nzMusic]) {
    await page.goto(path);
    await expect(page.locator(".prose-on h2.tip, .prose-on .num")).toHaveCount(0);
    const h2 = page.locator(".prose-on h2").first();
    expect(await h2.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Rye/);
  }
});

test("post header, numbering and title", async ({ page }) => {
  await page.goto(classy);
  await expect(page).toHaveTitle("On Being Classy — Pseudo Philosophy Meditations — sasky.nz");
  await expect(page.locator(".post-header .now-showing")).toHaveText("!Meditation the Second!");
  await expect(page.locator("h1")).toHaveText("On Being Classy");
  await expect(page.locator('nav[aria-label="Breadcrumb"] a')).toHaveAttribute("href", "/meditations");
  await expect(page.locator('.site-nav-link[href="/meditations"]')).toHaveAttribute("aria-current", "true");
});

test("Further Meditations follow G7", async ({ page }) => {
  const labels = (p: Page) => p.locator("nav[aria-labelledby=further] .fm-label");
  await page.goto(classy);
  await expect(labels(page)).toHaveText(["Earlier · Meditation the First", "Later · Meditation the Third"]);
  await expect(page.locator(".further").first()).toHaveAttribute("href", nzMusic);
  await page.goto(nzMusic);
  await expect(labels(page)).toHaveText(["Later · Meditation the Second"]);
  const card = (await page.locator(".further").boundingBox())!;
  const grid = (await page.locator(".fm-grid").boundingBox())!;
  expect(Math.abs(card.x + card.width / 2 - (grid.x + grid.width / 2))).toBeLessThanOrEqual(1);
  await page.goto(moment);
  await expect(labels(page)).toHaveText(["Earlier · Meditation the Third"]);
  await expect(page.locator(".fm-programme")).toHaveAttribute("href", "/meditations");
});

test("untagged post hides Filed under", async ({ page }) => {
  await page.goto(classy);
  await expect(page.getByText("Filed under")).toHaveCount(0);
  await page.goto(happiness);
  await expect(page.locator(".filed")).toContainText("Filed under");
  await expect(page.locator('.filed a[href="/tags/philosophy"]')).toHaveText("philosophy");
});

test("drop cap on the first paragraph", async ({ page }) => {
  await page.goto(happiness);
  const family = await page
    .locator(".prose-on > p")
    .first()
    .evaluate((el) => getComputedStyle(el, "::first-letter").fontFamily);
  expect(family).toMatch(/Holtwood/);
});

test("On video cards use On tokens and still play", async ({ page }) => {
  await page.goto(nzMusic);
  const card = page.locator(".vid").first();
  const [border, background] = await card.evaluate((el) => [
    getComputedStyle(el).borderTopColor,
    getComputedStyle(el).backgroundColor,
  ]);
  expect(border).toBe("rgb(35, 23, 14)");
  expect(background).not.toBe("rgb(18, 22, 61)");
  await card.click();
  await expect(page.locator(".video").first().locator('iframe[src*="youtube-nocookie.com"]')).toBeAttached();
});

test("post at 390", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of [classy, moment, happiness]) {
    await page.goto(path);
    await expectInsideBill(page);
  }
  await page.goto(classy);
  expect(parseFloat(await page.locator("h1").evaluate((el) => getComputedStyle(el).fontSize))).toBeLessThanOrEqual(46);
  expect(await page.locator(".num").first().evaluate((el) => getComputedStyle(el).position)).toBe("static");
  await page.goto(happiness);
  const [older, newer] = await page.locator(".further").all();
  expect((await newer.boundingBox())!.y).toBeGreaterThan((await older.boundingBox())!.y);
});

test("On post loads only On styles", async ({ page, request }) => {
  await page.goto(classy);
  await expectOnlyThemeCss(page, request, "on", onFonts);
});

test("no console errors on On posts", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of [moment, happiness, classy, nzMusic]) await page.goto(path, { waitUntil: "networkidle" });
  expect(errors).toEqual([]);
});

test("post titles never split a word", async ({ page }) => {
  for (const [width, path] of [
    [360, happiness],
    [375, happiness],
    [375, moment],
    [768, happiness],
    [1280, happiness],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    expect(await splitWords(page, "h1"), `${path} at ${width}`).toEqual([]);
  }
});

test("tip numerals stay inside the bill between breakpoints", async ({ page }) => {
  for (const width of [768, 820, 880, 901, 960]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(classy);
    await expectInsideBill(page);
  }
});

test("a one-line first paragraph keeps the drop cap to itself", async ({ page }) => {
  await page.goto(nzMusic);
  const [first, second] = await page.locator(".prose-on > p").evaluateAll((ps) =>
    ps.slice(0, 2).map((p) => {
      const range = document.createRange();
      range.selectNodeContents(p);
      return { bottom: p.getBoundingClientRect().bottom, left: range.getClientRects()[0].left };
    }),
  );
  const column = (await page.locator(".prose-on").boundingBox())!;
  expect(Math.abs(second.left - column.x)).toBeLessThanOrEqual(1);
  expect(second.left).toBeLessThan(first.left);
});

test("the programme list counts down like its numerals", async ({ page }) => {
  await page.goto(listing);
  const list = page.locator('section[aria-labelledby="also"] ol');
  await expect(list).toHaveAttribute("reversed", "");
  expect(await list.locator("li").count()).toBe(3);
});

test("programme titles never split a word at 320", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(listing);
  const titles = page.locator(".prog-title");
  await expect(titles).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    expect(await splitWords(page, `.prog-row:nth-child(${i + 1}) .prog-title`)).toEqual([]);
  }
});
