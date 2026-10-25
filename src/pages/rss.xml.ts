import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPosts } from "../lib/get-posts";
import { postUrl } from "../lib/posts";

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: "Sasky.nz",
    description: "Cameron's website",
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postUrl(post),
    })),
    customData: "<language>en-nz</language>",
  });
}
