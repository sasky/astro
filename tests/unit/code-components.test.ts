import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, expect, test } from "vitest";
import CodeBlock from "../../src/components/code/CodeBlock.astro";
import CodeListEntry from "../../src/components/code/CodeListEntry.astro";
import CodePostHeader from "../../src/components/code/CodePostHeader.astro";
import CodePrevNext from "../../src/components/code/CodePrevNext.astro";
import Toc from "../../src/components/code/Toc.astro";
import Prompt from "../../src/components/code/Prompt.astro";
import type { PostEntry } from "../../src/lib/get-posts";

let container: AstroContainer;

/** The text a reader sees: tags dropped, no-break spaces as spaces. */
const visible = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&nbsp;|\u00a0/g, " ").replace(/\s+/g, " ");

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
  const html = await container.renderToString(Prompt, { props: { path: "~/code", cmd: "cat README.md" } });
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
  expect(visible(html)).toContain("# Using Digital Ocean&#39;s App platform");
  expect(html).toMatch(/href="\/tags\/silverstripe"[^>]*>\s*(<span[^>]*>)?\s*\[silverstripe\]/);
});

test("Prompt leaves a path outside ~ as text", async () => {
  expect(await container.renderToString(Prompt, { props: { path: "/etc", cmd: "ls -lt" } })).not.toContain("<a");
});

const hideNSeek = {
  ...silverstripe,
  id: "hide-n-seek-game",
  data: {
    ...silverstripe.data,
    title: "Hide n Seek",
    description: "Building a game for my girls",
    pubDate: new Date("2024-01-29"),
    tags: ["pico8"],
  },
} as unknown as PostEntry;

test("Toc lists h2 and h3 with prefixes", async () => {
  const html = await container.renderToString(Toc, {
    props: {
      headings: [
        { depth: 1, slug: "title", text: "Title" },
        { depth: 2, slug: "setup-steps", text: "Setup steps" },
        { depth: 3, slug: "step-1", text: "Step 1: install" },
        { depth: 4, slug: "deep", text: "Deep" },
      ],
    },
  });
  expect(html).toContain('aria-label="On this page"');
  expect(html).toMatch(/\$ grep (&#39;|')\^#(&#39;|') post\.md/);
  const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map(([, id]) => id);
  expect(anchors).toEqual(["setup-steps", "step-1"]);
  expect(html).toMatch(/aria-hidden="true"[^>]*>##\s*</);
  expect(html).toMatch(/aria-hidden="true"[^>]*>###\s*</);
  expect(visible(html.match(/<a[^>]*href="\/code"[^>]*>[\s\S]*?<\/a>/)![0]).trim()).toBe("← cd ~/code");
});

test("Toc renders nothing without headings", async () => {
  const html = await container.renderToString(Toc, { props: { headings: [{ depth: 4, slug: "x", text: "X" }] } });
  expect(html.trim()).toBe("");
});

test("CodePrevNext older and newest", async () => {
  const html = await container.renderToString(CodePrevNext, { props: { older: hideNSeek } });
  expect(visible(html)).toContain("← older in ~/code · 29 January 2024");
  expect(html).toContain("Hide n Seek");
  expect(visible(html)).toContain("# Building a game for my girls");
  expect(html).toContain("All Code posts");
  expect(visible(html)).toContain("# newest post, nothing newer yet");
  expect(html.indexOf('href="/code/hide-n-seek-game"')).toBeLessThan(html.indexOf('href="/code"'));
});

test("CodePrevNext newer only", async () => {
  const html = await container.renderToString(CodePrevNext, { props: { newer: silverstripe } });
  expect(html.match(/<a\b/g)).toHaveLength(1);
  expect(visible(html)).toContain("newer in ~/code · 1 April 2024 →");
  expect(html).toContain('href="/code/silverstripe-app-platform"');
});

test("CodePostHeader", async () => {
  const { title, description, pubDate, tags } = silverstripe.data;
  const html = await container.renderToString(CodePostHeader, {
    props: { slug: silverstripe.id, title, description, pubDate, minutes: 6, tags },
  });
  expect(html).toContain('aria-label="Breadcrumb"');
  expect(html).toContain("cat silverstripe-app-platform.md");
  expect(html).toMatch(/<h1[^>]*>[\s\S]*Cheap and easy Silverstripe hosting\s*<\/h1>/);
  expect(visible(html)).toContain("&gt; Using Digital Ocean&#39;s App platform");
  expect(html).toMatch(/datetime="2024-04-01"[^>]*>\s*1 April 2024\s*</);
  expect(html).toContain("6 min read");
  expect(html).toContain("[silverstripe]");
});

test("CodePrevNext renders nothing when the post has no neighbours", async () => {
  expect((await container.renderToString(CodePrevNext, { props: {} })).trim()).toBe("");
});

test("CodeBlock's copy button starts hidden and is described by its caption", async () => {
  const render = () => container.renderToString(CodeBlock, { props: { "data-title": "composer.json" }, slots: { default: "<code>x</code>" } });
  const [first, second] = [await render(), await render()];
  const id = first.match(/<span[^>]*class="code-title"[^>]*id="([^"]+)"/)?.[1] ?? first.match(/id="([^"]+)"[^>]*class="code-title"/)?.[1];
  expect(id).toBeTruthy();
  expect(first).toMatch(new RegExp(`<button[^>]*aria-describedby="${id}"`));
  expect(first).toMatch(/<button[^>]*\bhidden\b/);
  expect(second).not.toContain(`id="${id}"`);
});

const quiet = (html: string, cls: string, prefix: string) =>
  new RegExp(`class="${cls}"[^>]*>\\s*<span[^>]*aria-hidden="true"[^>]*>${prefix}`).test(html);

test("decorative prefixes in Code descriptions are hidden from screen readers", async () => {
  expect(quiet(await container.renderToString(CodeListEntry, { props: { post: silverstripe } }), "entry-desc", "#")).toBe(true);
  const cards = await container.renderToString(CodePrevNext, { props: { older: hideNSeek, newer: silverstripe } });
  expect(cards.match(/class="card-d"[^>]*>\s*<span[^>]*aria-hidden="true"[^>]*>#/g)).toHaveLength(2);
  const { title, description, pubDate, tags } = silverstripe.data;
  const header = await container.renderToString(CodePostHeader, {
    props: { slug: silverstripe.id, title, description, pubDate, minutes: 6, tags },
  });
  expect(quiet(header, "desc", "&gt;")).toBe(true);
});

test("the copy button's description is the caption without its ── prefix", async () => {
  const html = await container.renderToString(CodeBlock, { props: { "data-title": "composer.json" }, slots: { default: "<code>x</code>" } });
  expect(quiet(html, "code-title", "──")).toBe(true);
});
