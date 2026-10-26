import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, expect, test } from "vitest";
import Ornament from "../../src/components/mdx/Ornament.astro";
import Bill from "../../src/components/on/Bill.astro";
import DoubleRule from "../../src/components/on/DoubleRule.astro";
import Eye from "../../src/components/on/Eye.astro";
import NowShowing from "../../src/components/on/NowShowing.astro";
import OnFooter from "../../src/components/site/OnFooter.astro";

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
