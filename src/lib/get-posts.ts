// The only module that reads the posts collection. Helpers in ./posts stay
// free of astro:content so they can be unit tested.
import { getCollection, type CollectionEntry } from "astro:content";
import type { Section } from "../data/sections";
import { sortNewest } from "./posts";

export type PostEntry = CollectionEntry<"posts">;

/** Posts newest first, optionally for one section. Drafts are left out of production builds. */
export async function getPosts(section?: Section): Promise<PostEntry[]> {
  const posts = await getCollection(
    "posts",
    (post) => (!section || post.data.section === section) && !(import.meta.env.PROD && post.data.draft),
  );
  return sortNewest(posts);
}
