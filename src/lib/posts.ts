// Pure helpers over posts. They take plain arrays (no astro:content import),
// so they run in Vitest; src/lib/get-posts.ts wraps the collection.
import { SECTION_ORDER, SECTIONS, type Section } from "../data/sections";
import { plural } from "./format";

export type { Section };

export interface Post {
  id: string;
  body?: string;
  data: { title: string; pubDate: Date; section: Section; tags: string[] };
}

/** A new array, newest first; posts on the same date sort by id. */
export function sortNewest<P extends Post>(posts: P[]): P[] {
  return [...posts].sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime() || a.id.localeCompare(b.id),
  );
}

/** The posts either side of `id` in date order. */
export function neighbours<P extends Post>(posts: P[], id: string): { older?: P; newer?: P } {
  const oldestFirst = sortNewest(posts).reverse();
  const i = oldestFirst.findIndex((post) => post.id === id);
  if (i === -1) return {};
  const result: { older?: P; newer?: P } = {};
  if (i > 0) result.older = oldestFirst[i - 1];
  if (i < oldestFirst.length - 1) result.newer = oldestFirst[i + 1];
  return result;
}

/** 1-based position of `id`, counting from the oldest post. */
export function seriesNumber<P extends Post>(posts: P[], id: string): number {
  const i = sortNewest(posts).reverse().findIndex((post) => post.id === id);
  if (i === -1) throw new Error(`seriesNumber: no post "${id}"`);
  return i + 1;
}

export function sectionStats<P extends Post>(posts: P[]): { count: number; since?: Date; latest?: P } {
  if (!posts.length) return { count: 0 };
  const sorted = sortNewest(posts);
  return { count: posts.length, since: sorted[sorted.length - 1].data.pubDate, latest: sorted[0] };
}

/** Tags by post count, then name; each tag's posts newest first. Untagged posts are skipped. */
export function buildTagIndex<P extends Post>(posts: P[]): { tag: string; count: number; posts: P[] }[] {
  const byTag = new Map<string, P[]>();
  for (const post of sortNewest(posts)) {
    for (const tag of post.data.tags) byTag.set(tag, [...(byTag.get(tag) ?? []), post]);
  }
  return [...byTag]
    .map(([tag, tagged]) => ({ tag, count: tagged.length, posts: tagged }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** The sections these posts are in, once each, in section order. */
export function sectionsOf<P extends Post>(posts: P[]): Section[] {
  return SECTION_ORDER.filter((section) => posts.some((post) => post.data.section === section));
}

export function postUrl(post: Post): string {
  return `/${SECTIONS[post.data.section].path}/${post.id}`;
}

/** "2 posts", "1 post", "4 meditations": a count in the section's own unit. */
export function countLabel(section: Section, count: number): string {
  return plural(count, SECTIONS[section].unit);
}
