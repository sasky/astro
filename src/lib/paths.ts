// Page paths without the build's .html: with build.format "file",
// Astro.url.pathname is /index.html, /code.html, /code/hide-n-seek-game.html.
import { SECTIONS, SECTION_ORDER, type Section } from "../data/sections";

/** The clean URL path of a page: "/", "/code", "/code/hide-n-seek-game". */
export function pagePath(url: URL): string {
  const path = url.pathname
    .replace(/\.html$/, "")
    .replace(/\/index$/, "")
    .replace(/\/+$/, "");
  return path || "/";
}

/** The section a path belongs to, and whether it's that section's listing. */
export function sectionForPath(path: string): { section: Section; isListing: boolean } | undefined {
  for (const section of SECTION_ORDER) {
    const base = `/${SECTIONS[section].path}`;
    if (path === base) return { section, isListing: true };
    if (path.startsWith(`${base}/`)) return { section, isListing: false };
  }
  return undefined;
}
