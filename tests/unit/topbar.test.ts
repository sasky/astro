import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import Texture from "../../src/components/site/Texture.astro";
import TopBar from "../../src/components/site/TopBar.astro";

const renderAt = async (path: string) => {
  const container = await AstroContainer.create();
  return container.renderToString(TopBar, { request: new Request(`https://sasky.nz${path}`) });
};

// Each nav link as [href, text, aria-current or null].
const navLinks = (html: string) =>
  [...html.matchAll(/<a([^>]*class="[^"]*site-nav-link[^"]*"[^>]*)>([^<]*)<\/a>/g)].map(([, attrs, text]) => [
    attrs.match(/href="([^"]*)"/)?.[1],
    text.trim(),
    attrs.match(/aria-current="([^"]*)"/)?.[1] ?? null,
  ]);

test("a section listing is the current page", async () => {
  const html = await renderAt("/meditations.html");
  expect(navLinks(html)).toEqual([
    ["/code", "Code", null],
    ["/life", "Life", null],
    ["/meditations", "Meditations", "page"],
  ]);
  expect(html.match(/aria-current/g)).toHaveLength(1);
});

test("a post marks its section as current", async () => {
  const html = await renderAt("/meditations/on-happiness.html");
  expect(navLinks(html)[2]).toEqual(["/meditations", "Meditations", "true"]);
});

test("Home marks the wordmark, not a section", async () => {
  const html = await renderAt("/index.html");
  expect(html).toMatch(/<a[^>]*class="[^"]*site-wordmark[^"]*"[^>]*aria-current="page"|<a[^>]*aria-current="page"[^>]*class="[^"]*site-wordmark/);
  expect(navLinks(html).every(([, , current]) => current === null)).toBe(true);
});

test("a tag page marks nothing", async () => {
  const html = await renderAt("/tags/music.html");
  expect(html).not.toContain("aria-current");
  expect(navLinks(html).map(([href]) => href)).toEqual(["/code", "/life", "/meditations"]);
});

test("Texture is hidden from assistive tech", async () => {
  const container = await AstroContainer.create();
  expect(await container.renderToString(Texture)).toContain('aria-hidden="true"');
});
