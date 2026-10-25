import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, expect, test } from "vitest";
import HpPrevNext from "../../src/components/hp/HpPrevNext.astro";
import ListingBand from "../../src/components/hp/ListingBand.astro";
import PostHeader from "../../src/components/hp/PostHeader.astro";
import PostRow from "../../src/components/hp/PostRow.astro";
import type { PostEntry } from "../../src/lib/get-posts";

let container: AstroContainer;

// 1200 words is 6 minutes at 220 wpm.
const concert = {
  id: "top-concertvids",
  body: "word ".repeat(1200),
  data: {
    title: "Concert vids",
    description: "Briefly glimpsing into the collective one-ness",
    pubDate: new Date("2024-05-17"),
    section: "life",
    tags: ["music"],
  },
} as unknown as PostEntry;

const withData = (post: PostEntry, data: Partial<PostEntry["data"]>) =>
  ({ ...post, data: { ...post.data, ...data } }) as PostEntry;

beforeAll(async () => {
  container = await AstroContainer.create();
});

test("PostRow shows date, reading time, title link, description and tags", async () => {
  const html = await container.renderToString(PostRow, { props: { post: concert } });
  expect(html).toContain('datetime="2024-05-17"');
  expect(html).toContain("17 May 2024");
  expect(html).toContain("6 min read");
  expect(html).toContain('href="/life/top-concertvids"');
  expect(html).toContain("Briefly glimpsing into the collective one-ness");
  expect(html).toContain('href="/tags/music"');
});

test("PostRow hides the tag row for an untagged post", async () => {
  const html = await container.renderToString(PostRow, { props: { post: withData(concert, { tags: [] }) } });
  expect(html).not.toContain("tag-links");
});

test("PostRow adds the section chip on request", async () => {
  expect(await container.renderToString(PostRow, { props: { post: concert } })).not.toContain("chip-life");
  const html = await container.renderToString(PostRow, { props: { post: concert, chip: true } });
  expect(html).toMatch(/class="[^"]*chip-life[^"]*"[^>]*>\s*Life\s*</);
});

const band = { headingId: "life-h", label: "1 post · since May 2024", title: "Life", lede: "Music, family" };

test("ListingBand renders label, heading and lede", async () => {
  const html = await container.renderToString(ListingBand, { props: band });
  expect(html).toContain("1 post · since May 2024");
  expect(html).toMatch(/<h1[^>]*id="life-h"[^>]*>\s*Life\s*<\/h1>/);
  expect(html).toContain("Music, family");
});

test("ListingBand omits an empty intro", async () => {
  expect(await container.renderToString(ListingBand, { props: band })).not.toContain('class="intro');
  const html = await container.renderToString(ListingBand, { props: { ...band, intro: "Everything but code" } });
  expect(html).toContain("Everything but code");
});

test("ListingBand without wash", async () => {
  expect(await container.renderToString(ListingBand, { props: band })).toContain("wash");
  expect(await container.renderToString(ListingBand, { props: { ...band, wash: false } })).not.toContain("wash");
});

test("HpPrevNext without an older post shows only All Life posts", async () => {
  const html = await container.renderToString(HpPrevNext, { props: { section: "life" } });
  expect(html.match(/<a\b/g)).toHaveLength(1);
  expect(html).toContain('href="/life"');
  expect(html).toContain("All Life posts");
  expect(html).toContain("Life →");
  expect(html).not.toContain("Older in Life");
});

test("HpPrevNext with an older post links it first", async () => {
  const html = await container.renderToString(HpPrevNext, { props: { section: "life", older: concert } });
  expect(html).toContain("← Older in Life");
  expect(html).toContain("Concert vids");
  expect(html.indexOf('href="/life/top-concertvids"')).toBeGreaterThan(-1);
  expect(html.indexOf('href="/life/top-concertvids"')).toBeLessThan(html.indexOf('href="/life"'));
});

test("PostHeader breadcrumb and meta", async () => {
  const { title, description, pubDate } = concert.data;
  const html = await container.renderToString(PostHeader, {
    props: { section: "life", title, description, pubDate, minutes: 6 },
  });
  const nav = html.match(/<nav[^>]*aria-label="Breadcrumb"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
  expect(nav).toMatch(/href="\/"[^>]*>\s*sasky\.nz\s*</);
  expect(nav).toMatch(/href="\/life"[^>]*>\s*Life\s*</);
  expect(html).toMatch(/<h1[^>]*>\s*Concert vids\s*<\/h1>/);
  expect(html).toContain('datetime="2024-05-17"');
  expect(html).toContain("6 min read");
});
