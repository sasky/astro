import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { findBrokenLinks, resolveInDist } from "../../scripts/check-links.mjs";

const dist = new URL("../fixtures/dist-links/", import.meta.url).pathname;

test("reports exactly the broken root-relative links", async () => {
  expect(await findBrokenLinks(dist)).toEqual([
    { page: "index.html", url: "/missing" },
    { page: "index.html", url: "/img/z.webp" },
  ]);
});

test("resolves both formats", () => {
  expect(resolveInDist(dist, "/about")).toMatch(/about\/index\.html$/);
  expect(resolveInDist(dist, "/about/")).toMatch(/about\/index\.html$/);
  expect(resolveInDist(dist, "/code")).toMatch(/code\.html$/);
  expect(resolveInDist(dist, "/")).toMatch(/index\.html$/);
});

test("strips query, hash and decodes", () => {
  expect(resolveInDist(dist, "/code?x=1#top")).toMatch(/code\.html$/);
  expect(resolveInDist(dist, "/img/a%20b.png")).toMatch(/a b\.png$/);
});

test("missing path resolves to null", () => {
  expect(resolveInDist(dist, "/nope")).toBeNull();
});

test("matches case exactly, as Netlify does", () => {
  expect(resolveInDist(dist, "/About")).toBeNull();
  expect(resolveInDist(dist, "/CODE")).toBeNull();
});

test("fails when dist has no HTML", () => {
  const empty = mkdtempSync(join(tmpdir(), "dist-empty-"));
  const run = spawnSync(process.execPath, ["scripts/check-links.mjs", empty], { encoding: "utf8" });
  expect(run.status).toBe(2);
});
