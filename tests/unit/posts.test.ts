import { expect, test } from "vitest";
import type { Section } from "../../src/data/sections";
import {
  buildTagIndex,
  countLabel,
  neighbours,
  postUrl,
  sectionStats,
  sectionsOf,
  seriesNumber,
  sortNewest,
  type Post,
} from "../../src/lib/posts";

const make = (id: string, section: Section, date: string, tags: string[] = []): Post => ({
  id,
  data: { title: id, pubDate: new Date(date), section, tags },
});

const nz = make("nz", "on", "2026-06-20");
const classy = make("classy", "on", "2026-09-11");
const happiness = make("happiness", "on", "2026-09-22");
const moment = make("moment", "on", "2026-10-18");

test("sortNewest returns a new array, newest first", () => {
  const input = [nz, moment, classy];
  expect(sortNewest(input)).toEqual([moment, classy, nz]);
  expect(input).toEqual([nz, moment, classy]);
});

test("sortNewest breaks date ties by id", () => {
  const b = make("b", "code", "2024-01-29");
  const a = make("a", "code", "2024-01-29");
  expect(sortNewest([b, a])).toEqual([a, b]);
});

test("neighbours in the middle", () => {
  expect(neighbours([nz, classy, happiness], "classy")).toEqual({ older: nz, newer: happiness });
});

test("neighbours at the ends leave the open side undefined", () => {
  const list = [nz, classy, happiness];
  expect(neighbours(list, "nz")).toEqual({ older: undefined, newer: classy });
  expect(neighbours(list, "happiness")).toEqual({ older: classy, newer: undefined });
});

test("neighbours of a lone post are both undefined", () => {
  expect(neighbours([nz], "nz")).toEqual({});
});

test("seriesNumber counts from the oldest", () => {
  const list = [moment, nz, happiness, classy];
  expect([nz, classy, happiness, moment].map((p) => seriesNumber(list, p.id))).toEqual([1, 2, 3, 4]);
  expect(() => seriesNumber(list, "nope")).toThrow(Error);
});

test("sectionStats", () => {
  const stats = sectionStats([classy, moment, nz, happiness]);
  expect(stats.count).toBe(4);
  expect(stats.since).toEqual(new Date("2026-06-20"));
  expect(stats.latest).toBe(moment);
});

test("sectionStats of an empty section", () => {
  expect(sectionStats([])).toEqual({ count: 0 });
});

test("buildTagIndex skips untagged posts, posts newest first", () => {
  const p1 = make("p1", "code", "2024-01-01", ["a", "b"]);
  const p2 = make("p2", "code", "2025-01-01", ["a"]);
  const p3 = make("p3", "life", "2025-06-01");
  expect(buildTagIndex([p1, p2, p3])).toEqual([
    { tag: "a", count: 2, posts: [p2, p1] },
    { tag: "b", count: 1, posts: [p1] },
  ]);
});

test("buildTagIndex sorts equal counts by tag name", () => {
  const p = make("p", "code", "2024-01-01", ["zebra", "apple"]);
  expect(buildTagIndex([p]).map((t) => t.tag)).toEqual(["apple", "zebra"]);
});

test("postUrl uses the section path", () => {
  expect(postUrl(make("on-happiness", "on", "2026-09-22"))).toBe("/meditations/on-happiness");
  expect(postUrl(make("hide-n-seek-game", "code", "2024-01-29"))).toBe("/code/hide-n-seek-game");
  expect(postUrl(make("top-concertvids", "life", "2024-05-17"))).toBe("/life/top-concertvids");
});

test("countLabel uses the section's unit", () => {
  expect(countLabel("on", 4)).toBe("4 meditations");
  expect(countLabel("life", 1)).toBe("1 post");
  expect(countLabel("code", 2)).toBe("2 posts");
});

test("sectionsOf lists each section once, in section order", () => {
  expect(sectionsOf([make("a", "on", "2026-01-01"), make("b", "code", "2026-01-02"), make("c", "on", "2026-01-03")])).toEqual([
    "code",
    "on",
  ]);
  expect(sectionsOf([])).toEqual([]);
});
