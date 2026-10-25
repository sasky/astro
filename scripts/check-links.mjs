// Checks every root-relative href/src/srcset in a built site resolves to a
// file in dist. Usage: node scripts/check-links.mjs dist
import { statSync } from "node:fs";
import { glob, readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ATTR = /\s(href|src|srcset)="([^"]*)"/g;

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

// Returns the file a root-relative URL path serves from distDir, or null.
// Handles both build formats: `/x` → `x`, `x.html` or `x/index.html`.
export function resolveInDist(distDir, urlPath) {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]).replace(/\/+$/, "");
  const base = join(distDir, clean);
  const candidates = clean === "" ? [join(distDir, "index.html")] : [base, `${base}.html`, join(base, "index.html")];
  return candidates.find(isFile) ?? null;
}

function urlsIn(html) {
  const urls = [];
  for (const [, attr, value] of html.matchAll(ATTR)) {
    const values = attr === "srcset" ? value.split(",").map((c) => c.trim().split(/\s+/)[0]) : [value];
    urls.push(...values);
  }
  return urls.filter((url) => url.startsWith("/") && !url.startsWith("//"));
}

// Returns every root-relative URL in distDir's HTML, in page then document order.
export async function findLinks(distDir) {
  const files = (await Array.fromAsync(glob("**/*.html", { cwd: distDir }))).sort();
  const links = [];
  for (const page of files) {
    const html = await readFile(join(distDir, page), "utf8");
    for (const url of urlsIn(html)) links.push({ page, url });
  }
  return links;
}

export async function findBrokenLinks(distDir) {
  return (await findLinks(distDir)).filter(({ url }) => !resolveInDist(distDir, url));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const distDir = process.argv[2] ?? "dist";
  const links = await findLinks(distDir);
  const broken = links.filter(({ url }) => !resolveInDist(distDir, url));
  for (const { page, url } of broken) console.log(`${page} → ${url}`);
  console.log(`${links.length} links checked, ${broken.length} broken`);
  if (broken.length) process.exit(1);
}
