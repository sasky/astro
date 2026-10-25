import { expect, test } from "vitest";
import { pagePath, sectionForPath } from "../../src/lib/paths";

const url = (path: string) => new URL(`https://sasky.nz${path}`);

test.each([
  ["/index.html", "/"],
  ["/", "/"],
  ["/code.html", "/code"],
  ["/code/hide-n-seek-game.html", "/code/hide-n-seek-game"],
  ["/code", "/code"],
  ["/code/", "/code"],
  ["/404.html", "/404"],
])("pagePath(%s) is %s", (path, expected) => {
  expect(pagePath(url(path))).toBe(expected);
});

test("sectionForPath finds listings and posts", () => {
  expect(sectionForPath("/meditations")).toEqual({ section: "on", isListing: true });
  expect(sectionForPath("/meditations/on-happiness")).toEqual({ section: "on", isListing: false });
  expect(sectionForPath("/life")).toEqual({ section: "life", isListing: true });
});

test.each(["/", "/codex", "/tags/music", "/404"])("sectionForPath(%s) is undefined", (path) => {
  expect(sectionForPath(path)).toBeUndefined();
});
