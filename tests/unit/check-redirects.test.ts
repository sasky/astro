import { readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, expect, test } from "vitest";
import { checkDist, checkUrl, parseRedirects } from "../../scripts/check-redirects.mjs";

const fixture = fileURLToPath(new URL("../fixtures/dist-redirects/", import.meta.url));
const rule = (from: string, to: string) => ({ from, to, status: 301 });

test("parseRedirects skips comments and blank lines", () => {
  const text = "# Old URLs\n/a   /b   301\n\n/c  /#d  302\n";
  expect(parseRedirects(text)).toEqual([rule("/a", "/b"), { from: "/c", to: "/#d", status: 302 }]);
});

test("public/_redirects maps every old URL", () => {
  const rules = parseRedirects(readFileSync("public/_redirects", "utf8"));
  expect(rules).toHaveLength(11);
  expect(rules.every((r) => r.status === 301)).toBe(true);
  expect(rules).toContainEqual(rule("/top_ten_tips_on_class", "/meditations/on-being-classy"));
  expect(rules).toContainEqual(rule("/tags/life", "/life"));
  for (const { to } of rules) expect(to).toMatch(/^\/(code|life|meditations)(\/[a-z0-9-]+)?$|^\/#(about|tags)$/);
});

test("checkDist reports old paths still served and missing targets", () => {
  const errors = checkDist(fixture, [
    rule("/gone", "/new"),
    rule("/old", "/new"),
    rule("/x", "/missing"),
    rule("/a", "/#about"),
  ]);
  expect(errors).toHaveLength(2);
  expect(errors.some((e: string) => e.includes("/old"))).toBe(true);
  expect(errors.some((e: string) => e.includes("/missing"))).toBe(true);
});

let server: Server;
let base: string;

beforeAll(async () => {
  const routes: Record<string, [number, string?]> = {
    "/gone": [301, "/new"],
    "/gone/": [301, "/new"],
    "/new": [200],
    "/half": [301, "/wrong"],
  };
  server = createServer((req, res) => {
    const [status, location] = routes[req.url ?? ""] ?? [404];
    res.writeHead(status, location ? { Location: location } : {});
    res.end();
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
});

afterAll(() => server.close());

test("checkUrl flags a redirect to the wrong place, not a good one", async () => {
  const { errors } = await checkUrl(base, [rule("/gone", "/new"), rule("/half", "/new")]);
  expect(errors.some((e: string) => e.includes("/half"))).toBe(true);
  expect(errors.some((e: string) => e.includes("/gone"))).toBe(false);
});
