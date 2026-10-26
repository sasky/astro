import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, expect, test } from "vitest";
import CodeListEntry from "../../src/components/code/CodeListEntry.astro";
import Prompt from "../../src/components/code/Prompt.astro";
import type { PostEntry } from "../../src/lib/get-posts";

let container: AstroContainer;

// 1320 words is 6 minutes at 220 wpm.
const silverstripe = {
  id: "silverstripe-app-platform",
  body: "word ".repeat(1320),
  data: {
    title: "Cheap and easy Silverstripe hosting",
    description: "Using Digital Ocean's App platform",
    pubDate: new Date("2024-04-01"),
    section: "code",
    tags: ["silverstripe", "learning"],
  },
} as unknown as PostEntry;

beforeAll(async () => {
  container = await AstroContainer.create();
});

test("Prompt links ~ home", async () => {
  const html = await container.renderToString(Prompt, { props: { path: "~/code", cmd: "cat README.md", link: true } });
  expect(html).toMatch(/href="\/"[^>]*>\s*~\s*</);
  expect(html).toContain("/code");
  expect(html).toContain("$");
  expect(html).toContain("cat README.md");
});

test("Prompt breadcrumb", async () => {
  const html = await container.renderToString(Prompt, {
    props: { path: "~/code", cmd: "cat x.md", crumbs: true },
  });
  const nav = html.match(/<nav[^>]*aria-label="Breadcrumb"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
  expect(nav).toMatch(/href="\/"[^>]*>\s*~\s*</);
  expect(nav).toMatch(/href="\/code"[^>]*>\s*code\s*</);
});

test("Prompt cursor is decorative", async () => {
  expect(await container.renderToString(Prompt, { props: { path: "~/code" } })).not.toContain("prompt-cursor");
  const html = await container.renderToString(Prompt, { props: { path: "~/code", cursor: true } });
  expect(html).toMatch(/class="prompt-cursor"[^>]*aria-hidden="true"|aria-hidden="true"[^>]*class="prompt-cursor"/);
});

test("CodeListEntry", async () => {
  const html = await container.renderToString(CodeListEntry, { props: { post: silverstripe } });
  expect(html).toMatch(/datetime="2024-04-01"[^>]*>\s*2024-04-01\s*</);
  expect(html).toContain("-rw-r--r--");
  expect(html).toContain('href="/code/silverstripe-app-platform"');
  expect(html).toContain("Cheap and easy Silverstripe hosting");
  expect(html).toContain("# Using Digital Ocean&#39;s App platform");
  expect(html).toMatch(/href="\/tags\/silverstripe"[^>]*>\s*(<span[^>]*>)?\s*\[silverstripe\]/);
});

test("Prompt without link leaves ~ as text", async () => {
  expect(await container.renderToString(Prompt, { props: { path: "~/code", cmd: "ls -lt" } })).not.toContain("<a");
});
