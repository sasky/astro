import { readdirSync } from "node:fs";
import { expect, test } from "vitest";
import { isSlug } from "../../src/lib/slug";

test("isSlug accepts lowercase kebab-case only", () => {
  expect(["hide-n-seek-game", "pico8", "on-being-classy", "a1-b2"].every(isSlug)).toBe(true);
  expect(["Hide-n-seek", "top_ten_tips", "double--dash", "-lead", "trail-", "", "a b"].some(isSlug)).toBe(false);
});

test("every post filename is a lowercase kebab-case slug", () => {
  const ids = readdirSync("src/content/posts").map((file) => file.replace(/\.mdx$/, ""));
  expect(ids.filter((id) => !isSlug(id))).toEqual([]);
});
