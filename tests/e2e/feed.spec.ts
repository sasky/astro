// The RSS feed (spec 5.12), parsed as XML in the browser.
import { expect, test } from "@playwright/test";

test("RSS feed is well-formed, self-linked and categorised", async ({ page, request }) => {
  const xml = await (await request.get("/rss.xml")).text();
  await page.goto("/");
  const feed = await page.evaluate((source) => {
    const doc = new DOMParser().parseFromString(source, "application/xml");
    const text = (el: Element | null | undefined) => el?.textContent ?? null;
    const channel = doc.querySelector("channel");
    const self = [...doc.getElementsByTagNameNS("http://www.w3.org/2005/Atom", "link")];
    return {
      error: text(doc.querySelector("parsererror")),
      title: text(channel?.querySelector(":scope > title")),
      language: text(channel?.querySelector(":scope > language")),
      self: self.map((link) => [link.getAttribute("rel"), link.getAttribute("href"), link.getAttribute("type")]),
      items: [...doc.querySelectorAll("item")].map((item) => ({
        link: text(item.querySelector("link")),
        categories: [...item.querySelectorAll("category")].map((category) => category.textContent),
      })),
    };
  }, xml);

  expect(feed.error).toBeNull();
  expect(feed.title).toBe("sasky.nz");
  expect(feed.language).toBe("en-nz");
  expect(feed.self).toEqual([["self", "https://sasky.nz/rss.xml", "application/rss+xml"]]);
  expect(feed.items).toHaveLength(7);
  expect(feed.items.map(({ link }) => link)).not.toContainEqual(expect.stringContaining("/about"));
  const categories = (path: string) => feed.items.find(({ link }) => link === `https://sasky.nz${path}`)?.categories;
  expect(categories("/life/best-new-zealand-music")).toEqual(["Life", "music"]);
  expect(categories("/code/hide-n-seek-game")).toEqual(["Code", "pico8", "learning", "family"]);
  expect(categories("/meditations/on-being-classy")).toEqual(["Meditations"]);
});
