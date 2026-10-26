import { getRssString } from "@astrojs/rss";
import { expect, test } from "vitest";
import { feedItem } from "../../src/lib/feed";

const post = (id: string, section: "code" | "life" | "on", tags: string[]) => ({
  id,
  data: { title: `Title ${id}`, description: `About ${id}`, pubDate: new Date("2026-06-20"), section, tags },
});

test("feedItem links the post and files it under its section and tags", () => {
  const nzMusic = post("on-new-zealand-music", "on", ["music"]);
  expect(feedItem(nzMusic)).toEqual({
    title: "Title on-new-zealand-music",
    description: "About on-new-zealand-music",
    pubDate: nzMusic.data.pubDate,
    link: "/meditations/on-new-zealand-music",
    categories: ["On", "music"],
  });
  expect(feedItem(post("hide-n-seek-game", "code", ["pico8", "learning", "family"])).categories).toEqual([
    "Code",
    "pico8",
    "learning",
    "family",
  ]);
});

test("an untagged post is filed under its section only", () => {
  expect(feedItem(post("on-being-classy", "on", [])).categories).toEqual(["On"]);
});

test("the feed escapes &, < and quotes in titles and descriptions", async () => {
  const awkward = post("q-and-a", "code", ["learning"]);
  awkward.data.title = `Fish & chips <for> "two" isn't it`;
  awkward.data.description = "a < b && c > d";
  const xml = await getRssString({ title: "t", description: "d", site: "https://sasky.nz", items: [feedItem(awkward)] });
  const item = xml.slice(xml.indexOf("<item>"), xml.indexOf("</item>"));
  const texts = [...item.matchAll(/>([^<]*)</g)].map(([, text]) => text);
  for (const text of texts) expect(text).not.toMatch(/&(?!(amp|lt|gt|quot|apos);)|</);
  expect(item).toContain("Fish &amp; chips &lt;for&gt;");
});
