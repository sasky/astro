import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { fileURLToPath } from "node:url";
import { findBrokenLinks, findMessyLinks, resolveInDist } from "../../scripts/check-links.mjs";

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

test("trailing slash only matches a directory index", () => {
  expect(resolveInDist(dist, "/code/")).toBeNull();
  expect(resolveInDist(dist, "/about/")).toMatch(/about\/index\.html$/);
});

test("malformed percent-encoding is unresolvable, not a crash", () => {
  expect(resolveInDist(dist, "/100%")).toBeNull();
});

test("findMessyLinks reports page links that aren't lowercase kebab-case", async () => {
  const caseDist = fileURLToPath(new URL("../fixtures/dist-case/", import.meta.url));
  expect(await findMessyLinks(caseDist)).toEqual([{ page: "index.html", url: "/Code/Bad_Page" }]);
});
