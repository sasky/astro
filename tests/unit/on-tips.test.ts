import "@astrojs/markdown-satteri";
import { markdownToHtml, mdxToJs, type Data } from "satteri";
import { expect, test } from "vitest";
import { onTips } from "../../src/markdown/on-tips";

const data = (section?: string): Data => ({
  astro: {
    frontmatter: section ? { section } : {},
    headings: [],
    localImagePaths: new Set(),
    remoteImagePaths: new Set(),
  },
});

const html = async (md: string, section?: string) =>
  (await markdownToHtml(md, { hastPlugins: [onTips], data: data(section) })).html;

test("numbers On tips in Roman numerals", async () => {
  const out = await html("## 1. Never run\n\n## 10. Get into it", "on");
  expect(out).toContain('<h2 class="tip"><span class="num">I.</span> Never run</h2>');
  expect(out).toContain('<h2 class="tip"><span class="num">X.</span> Get into it</h2>');
});

test("keeps inline children after the number", async () => {
  const { code } = await mdxToJs("## 5. Have jokes <small>(one clean)</small>", {
    hastPlugins: [onTips],
    data: data("on"),
    jsxImportSource: "astro",
  });
  expect(code).toContain('"num"');
  expect(code).toContain('"V."');
  expect(code).toContain("_components.small");
});

test("leaves On headings without a number alone", async () => {
  const out = await html("## Hypnotised by awe\n\n## 10.5 things", "on");
  expect(out).not.toContain("tip");
  expect(out).not.toContain("num");
});

test("is a no-op outside On", async () => {
  for (const section of ["code", "life", undefined]) {
    expect(await html("## 1. Never run", section)).toContain("<h2>1. Never run</h2>");
  }
});

test("leaves h3 alone", async () => {
  expect(await html("### 1. Step", "on")).not.toContain("num");
});

test("a tip numbered 0 stays a plain heading", async () => {
  const out = await html("## 0. Foo", "on");
  expect(out).not.toContain("tip");
  expect(out).not.toContain("num");
});

test("wraps a plain On heading's content in one span, so inline markup stays together", async () => {
  expect(await html("## The *real* point", "on")).toContain('<h2><span class="h-text">The <em>real</em> point</span></h2>');
  expect(await html("## The *real* point", "code")).toContain("<h2>The <em>real</em> point</h2>");
});
