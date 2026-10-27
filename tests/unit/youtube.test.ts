import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, expect, test } from "vitest";
import YouTube from "../../src/components/mdx/YouTube.astro";

let container: AstroContainer;
const lorde = { id: "u7T64Qo3bdU", title: "Lorde, Royals, live 2013" };

beforeAll(async () => {
  container = await AstroContainer.create();
});

test("links to YouTube with an accessible name", async () => {
  const html = await container.renderToString(YouTube, { props: lorde });
  expect(html).toContain('href="https://www.youtube.com/watch?v=u7T64Qo3bdU"');
  expect(html).toContain('aria-label="Play video: Lorde, Royals, live 2013"');
});

test("makes no requests to YouTube before a click", async () => {
  const html = await container.renderToString(YouTube, { props: lorde });
  expect(html).not.toContain("<iframe");
  expect(html).not.toContain("<img");
  expect(html).not.toContain("ytimg");
  expect(html).not.toContain("youtube-nocookie");
});

test("caption is optional", async () => {
  expect(await container.renderToString(YouTube, { props: lorde })).not.toContain("<figcaption");
  const html = await container.renderToString(YouTube, {
    props: { ...lorde, caption: "Lorde — Royals, live 2013" },
  });
  expect(html).toMatch(/<figcaption[^>]*>\s*Lorde — Royals, live 2013\s*<\/figcaption>/);
});

test("label names the act from the caption, or says Video", async () => {
  const label = (html: string) => html.match(/class="vid-label"[^>]*>([^<]*)</)?.[1].trim();
  expect(label(await container.renderToString(YouTube, { props: lorde }))).toBe("Video · YouTube");
  const html = await container.renderToString(YouTube, { props: { ...lorde, caption: "Lorde — Royals, live 2013" } });
  expect(label(html)).toBe("Lorde · YouTube");
});
