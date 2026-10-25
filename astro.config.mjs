import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://sasky.nz",
  // Pages build as code.html etc., which Netlify serves at /code.
  trailingSlash: "never",
  build: { format: "file" },
  integrations: [
    mdx({
      syntaxHighlight: "shiki",
      shikiConfig: { theme: "dracula" },
    }),
  ],
});
