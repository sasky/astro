// One RSS item per post (spec 5.12): filed under its section's label, then its tags.
import { SECTIONS } from "../data/sections";
import { postUrl, type Post } from "./posts";

export interface FeedPost extends Post {
  data: Post["data"] & { description: string };
}

export function feedItem(post: FeedPost) {
  const { title, description, pubDate, section, tags } = post.data;
  return { title, description, pubDate, link: postUrl(post), categories: [SECTIONS[section].label, ...tags] };
}
