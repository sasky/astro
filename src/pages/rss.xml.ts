import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE } from "../data/site";
import { feedItem } from "../lib/feed";
import { getPosts } from "../lib/get-posts";

export async function GET(context: APIContext) {
  const posts = await getPosts();
  const self = new URL("rss.xml", context.site).href;
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site!,
    items: posts.map(feedItem),
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: `<language>en-nz</language><atom:link href="${self}" rel="self" type="application/rss+xml"/>`,
    // Item links match the site's no-trailing-slash URLs.
    trailingSlash: false,
  });
}
