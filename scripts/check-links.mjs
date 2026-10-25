// Checks every root-relative href/src/srcset in a built site resolves to a
// file in dist. Usage: node scripts/check-links.mjs dist
import { globSync } from "node:fs";
import { glob, readFile } from "node:fs/promises";
import { join, posix, relative } from "node:path";
import { pathToFileURL } from "node:url";

const ATTR = /\s(href|src|srcset)="([^"]*)"/g;

// Files in distDir as relative POSIX paths. Matching against this list rather
// than the file system keeps lookups case-exact (Netlify is, macOS isn't) and
// inside distDir.
const fileLists = new Map();
function filesIn(distDir) {
  if (!fileLists.has(distDir)) {
    const entries = globSync("**/*", { cwd: distDir, withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => relative(distDir, join(entry.parentPath, entry.name)).split("\\").join("/"));
    fileLists.set(distDir, new Set(files));
  }
  return fileLists.get(distDir);
}

// Returns the file a root-relative URL path serves from distDir, or null.
// Handles both build formats: `/x` → `x`, `x.html` or `x/index.html`.
export function resolveInDist(distDir, urlPath) {
  const clean = posix.normalize(decodeURIComponent(urlPath.split(/[?#]/)[0])).replace(/^\/+|\/+$/g, "");
  const candidates = clean === "" ? ["index.html"] : [clean, `${clean}.html`, `${clean}/index.html`];
  const found = candidates.find((candidate) => filesIn(distDir).has(candidate));
  return found ? join(distDir, found) : null;
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
  if (![...filesIn(distDir)].some((file) => file.endsWith(".html"))) {
    console.error(`No HTML found in ${distDir}. Run npm run build first.`);
    process.exit(2);
  }
  const links = await findLinks(distDir);
  const broken = links.filter(({ url }) => !resolveInDist(distDir, url));
  for (const { page, url } of broken) console.log(`${page} → ${url}`);
  console.log(`${links.length} links checked, ${broken.length} broken`);
  if (broken.length) process.exit(1);
}
