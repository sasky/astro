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
// Handles both build formats: `/x` → `x`, `x.html` or `x/index.html`; `/x/`
// only → `x/index.html`. A malformed %-escape resolves to nothing.
export function resolveInDist(distDir, urlPath) {
  let path;
  try {
    path = posix.normalize(decodeURIComponent(urlPath.split(/[?#]/)[0]));
  } catch {
    return null;
  }
  const clean = path.replace(/^\/+|\/+$/g, "");
  const candidates =
    clean === ""
      ? ["index.html"]
      : path.endsWith("/")
        ? [`${clean}/index.html`]
        : [clean, `${clean}.html`, `${clean}/index.html`];
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

// Page URLs are lowercase kebab-case (same rule as src/lib/slug.ts). Asset
// paths, whose last segment has a file extension, are exempt.
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isCleanPageUrl(url) {
  const segments = url.split(/[?#]/)[0].split("/").filter(Boolean);
  if (segments.at(-1)?.includes(".")) return true;
  return segments.every((segment) => SLUG.test(segment));
}

/** Page links with capitals, underscores or other characters outside lowercase kebab-case. */
export async function findMessyLinks(distDir) {
  return (await findLinks(distDir)).filter(({ url }) => !isCleanPageUrl(url));
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
  const messy = links.filter(({ url }) => !isCleanPageUrl(url));
  for (const { page, url } of broken) console.log(`${page} → ${url}`);
  for (const { page, url } of messy) console.log(`${page} → ${url} (not lowercase kebab-case)`);
  console.log(`${links.length} links checked, ${broken.length} broken, ${messy.length} not lowercase kebab-case`);
  if (broken.length || messy.length) process.exit(1);
}
