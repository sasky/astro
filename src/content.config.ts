import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const posts = defineCollection({
  loader: glob({ pattern: "*.mdx", base: "./src/content/posts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      metaDescription: z.string().optional(), // falls back to description
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      section: z.enum(["code", "life", "on"]),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false), // excluded from prod builds
      pico8: z.string().optional(), // cart name in public/pico8/
      image: z.object({ src: image(), alt: z.string() }).optional(),
      excerpt: z.string().optional(), // overrides computed On excerpt
    }),
});

export const collections = { posts };
