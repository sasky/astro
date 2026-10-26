import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, expect, test } from "vitest";
import Ornament from "../../src/components/mdx/Ornament.astro";
import Bill from "../../src/components/on/Bill.astro";
import DoubleRule from "../../src/components/on/DoubleRule.astro";
import Eye from "../../src/components/on/Eye.astro";
import FurtherMeditations from "../../src/components/on/FurtherMeditations.astro";
import NowShowing from "../../src/components/on/NowShowing.astro";
import OnPostHeader from "../../src/components/on/OnPostHeader.astro";
import OnFooter from "../../src/components/site/OnFooter.astro";
import type { PostEntry } from "../../src/lib/get-posts";

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

const rootTag = (html: string) => html.trim().match(/^<([a-z]+)[^>]*>/)?.[0] ?? "";

test("Bill frames its slot with four hidden fleurons", async () => {
  const html = await container.renderToString(Bill, { slots: { default: "<p>inside</p>" } });
  expect(html).toContain("<p>inside</p>");
  expect(html.match(/<svg[^>]*class="[^"]*fleuron[^"]*"[^>]*aria-hidden="true"/g)).toHaveLength(4);
  expect(html).not.toContain("<article");
  expect(await container.renderToString(Bill, { props: { as: "article" } })).toContain("<article");
});

test("DoubleRule orders its bars", async () => {
  const bars = (html: string) => [...html.matchAll(/class="[^"]*\b(thick|thin)\b/g)].map(([, bar]) => bar);
  expect(bars(await container.renderToString(DoubleRule, { props: { order: "thick-thin" } }))).toEqual([
    "thick",
    "thin",
  ]);
  expect(bars(await container.renderToString(DoubleRule, { props: { order: "thin-thick" } }))).toEqual([
    "thin",
    "thick",
  ]);
});

test("NowShowing shows its text between two hidden manicules", async () => {
  const html = await container.renderToString(NowShowing, { props: { text: "!Meditation the Second!" } });
  expect(html).toContain("!Meditation the Second!");
  expect(html.match(/class="[^"]*manicule[^"]*"[^>]*aria-hidden="true"/g)).toHaveLength(2);
  expect(rootTag(html)).not.toContain("top-rule");
  const ruled = await container.renderToString(NowShowing, { props: { text: "x", topRule: true } });
  expect(rootTag(ruled)).toContain("top-rule");
});

test("Eye and Ornament are decorative", async () => {
  for (const component of [Eye, Ornament]) {
    expect(rootTag(await container.renderToString(component))).toContain('aria-hidden="true"');
  }
});

test("OnFooter inside has only the colophon; after has both", async () => {
  const inside = await container.renderToString(OnFooter, { props: { placement: "inside" } });
  expect(inside).toContain("Printed upon the World Wide Web");
  expect(inside).not.toContain("Correspondence");
  const after = await container.renderToString(OnFooter, { props: { placement: "after" } });
  expect(after).toContain("Printed upon the World Wide Web");
  expect(after).toContain("Correspondence welcomed by way of");
});

const meditation = (id: string, title: string, date: string) =>
  ({
    id,
    body: "",
    data: { title, description: title, pubDate: new Date(date), section: "on", tags: [] },
  }) as unknown as PostEntry;

const nzMusic = meditation("on-new-zealand-music", "On New Zealand Music", "2026-06-20");
const happiness = meditation("on-happiness", "On Happiness", "2026-09-22");

test("OnPostHeader numbers, links and dates the post", async () => {
  const props = {
    number: 2,
    title: "On Being Classy",
    description: "Top Ten Tips for Staying Classy",
    pubDate: new Date("2026-09-11"),
  };
  const html = await container.renderToString(OnPostHeader, { props });
  expect(html).toContain("!Meditation the Second!");
  expect(html).toMatch(/aria-label="Breadcrumb"[\s\S]*href="\/meditations"/);
  expect(html).toMatch(/<h1[^>]*>\s*On Being Classy\s*<\/h1>/);
  expect(html).toMatch(/datetime="2026-09-11"[^>]*>\s*11th September 2026\s*</);
  expect(html).not.toContain("subtitle-long");
  const long = await container.renderToString(OnPostHeader, { props: { ...props, description: "x".repeat(61) } });
  expect(long).toContain("subtitle-long");
});

test("FurtherMeditations shows earlier then later", async () => {
  const html = await container.renderToString(FurtherMeditations, {
    props: { older: { post: nzMusic, number: 1 }, newer: { post: happiness, number: 3 } },
  });
  expect(html).toContain('id="further"');
  expect(html.indexOf("Earlier · Meditation the First")).toBeGreaterThan(-1);
  expect(html.indexOf("Earlier · Meditation the First")).toBeLessThan(html.indexOf("Later · Meditation the Third"));
  expect(html).toMatch(/datetime="2026-06-20"[^>]*>\s*20th June 2026\s*</);
});

test("FurtherMeditations with one neighbour has one card and the programme link", async () => {
  const html = await container.renderToString(FurtherMeditations, {
    props: { newer: { post: happiness, number: 3 } },
  });
  expect(html.match(/class="[^"]*\bfurther\b[^"]*"/g)).toHaveLength(1);
  expect(html).not.toContain("Earlier");
  expect(html).toMatch(/href="\/meditations"[^>]*>[\s\S]*The Full Programme of Meditations/);
});
