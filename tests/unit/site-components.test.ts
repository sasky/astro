import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, expect, test } from "vitest";
import CodeFooter from "../../src/components/site/CodeFooter.astro";
import HpFooter from "../../src/components/site/HpFooter.astro";
import OnFooter from "../../src/components/site/OnFooter.astro";
import SectionChip from "../../src/components/site/SectionChip.astro";
import TagLinks from "../../src/components/site/TagLinks.astro";
import { SOCIAL } from "../../src/data/social";
import { toRoman } from "../../src/lib/format";

let container: AstroContainer;
const year = new Date().getUTCFullYear();

beforeAll(async () => {
  container = await AstroContainer.create();
});

test("TagLinks renders nothing without tags", async () => {
  expect((await container.renderToString(TagLinks, { props: { tags: [], theme: "hp" } })).trim()).toBe("");
});

test("TagLinks in Code shows [tag] links to tag pages", async () => {
  const html = await container.renderToString(TagLinks, { props: { tags: ["pico8", "family"], theme: "code" } });
  expect(html).toMatch(/href="\/tags\/pico8"[^>]*>\s*(<span[^>]*>)?\s*\[pico8\]/);
  expect(html).toMatch(/href="\/tags\/family"[^>]*>\s*(<span[^>]*>)?\s*\[family\]/);
});

test("TagLinks in HP shows the plain tag", async () => {
  const html = await container.renderToString(TagLinks, { props: { tags: ["pico8"], theme: "hp" } });
  expect(html).toMatch(/href="\/tags\/pico8"/);
  expect(html).toMatch(/>\s*pico8\s*</);
  expect(html).not.toContain("[pico8]");
});

test("HpFooter shows the year and every social link", async () => {
  const html = await container.renderToString(HpFooter);
  expect(html).toContain(`© ${year} Cameron Grant`);
  for (const { href } of SOCIAL) expect(html).toContain(`href="${href}"`);
});

test("OnFooter dates in roman numerals", async () => {
  expect(await container.renderToString(OnFooter)).toContain(`© ${toRoman(year)}`);
});

test("CodeFooter shows the vim mode line", async () => {
  expect(await container.renderToString(CodeFooter)).toContain("-- NORMAL --");
});

test("SectionChip uses the section label", async () => {
  expect(await container.renderToString(SectionChip, { props: { section: "on" } })).toMatch(/>\s*On\s*</);
});

test("footer links open in the same tab", async () => {
  for (const footer of [HpFooter, CodeFooter, OnFooter]) {
    expect(await container.renderToString(footer)).not.toContain('target="_blank"');
  }
});

test("TagLinks marks only the current tag", async () => {
  const html = await container.renderToString(TagLinks, {
    props: { tags: ["music", "learning"], theme: "hp", current: "music" },
  });
  expect(html).toMatch(/href="\/tags\/music"[^>]*aria-current="page"/);
  expect(html).not.toMatch(/href="\/tags\/learning"[^>]*aria-current/);
  expect(await container.renderToString(TagLinks, { props: { tags: ["music"], theme: "hp" } })).not.toContain("aria-current");
});
