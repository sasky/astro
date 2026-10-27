import { existsSync } from "node:fs";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import BaseLayout from "../../src/layouts/BaseLayout.astro";

const render = async (props: Record<string, unknown>) => {
  const container = await AstroContainer.create({ astroConfig: { site: "https://sasky.nz" } });
  return container.renderToString(BaseLayout, {
    props: { theme: "code", title: "T", description: "D", ...props },
    request: new Request("https://sasky.nz/code/hide-n-seek-game.html"),
    slots: { default: "<p>body</p>" },
  });
};

test("sets the theme, title and canonical URL without .html", async () => {
  const html = await render({});
  expect(html).toContain('data-theme="code"');
  expect(html).toContain("<title>T</title>");
  expect(html).toContain('<link rel="canonical" href="https://sasky.nz/code/hide-n-seek-game">');
  expect(html).toContain('<meta property="og:url" content="https://sasky.nz/code/hide-n-seek-game">');
  expect(html).toContain("<p>body</p>");
  expect(html).not.toMatch(/ClientRouter|astro-view-transitions/);
});

test("noindex pages get a robots tag and no canonical", async () => {
  const html = await render({ noindex: true });
  expect(html).toContain('<meta name="robots" content="noindex">');
  expect(html).not.toContain('rel="canonical"');
});

test("links an icon that exists, so browsers don't request a missing /favicon.ico", async () => {
  const html = await render({});
  const href = html.match(/<link rel="icon" href="([^"]+)" type="image\/svg\+xml">/)?.[1];
  expect(href).toBe("/favicon.svg");
  expect(existsSync(`public${href}`)).toBe(true);
});
