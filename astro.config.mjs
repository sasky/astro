import { defineConfig, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import { satteri } from "@astrojs/markdown-satteri";
import { onTips } from "./src/markdown/on-tips";
import { metaToData } from "./src/shiki/meta-to-data";
import terminal from "./src/shiki/sasky-terminal.json" with { type: "json" };

const subsets = ["latin", "latin-ext"];
const common = { provider: fontProviders.fontsource(), subsets, formats: ["woff2"], display: "swap" };

// https://astro.build/config
export default defineConfig({
  site: "https://sasky.nz",
  // Pages build as code.html etc., which Netlify serves at /code.
  trailingSlash: "never",
  build: { format: "file" },
  // Self-hosted fonts. Each theme layout renders <Font> for its own families only.
  fonts: [
    {
      ...common,
      name: "Fraunces",
      cssVariable: "--font-fraunces",
      weights: ["100 900"],
      styles: ["normal", "italic"],
      fallbacks: ["Georgia", "serif"],
    },
    {
      ...common,
      name: "Source Sans 3",
      cssVariable: "--font-source-sans",
      weights: [400, 600, 700],
      styles: ["normal", "italic"],
      fallbacks: ["system-ui", "sans-serif"],
    },
    {
      ...common,
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains",
      weights: [400, 500, 700, 800],
      styles: ["normal", "italic"],
      fallbacks: ["Menlo", "monospace"],
    },
    { ...common, name: "Holtwood One SC", cssVariable: "--font-holtwood", weights: [400], fallbacks: ["serif"] },
    { ...common, name: "Alfa Slab One", cssVariable: "--font-alfa", weights: [400], fallbacks: ["serif"] },
    { ...common, name: "Rye", cssVariable: "--font-rye", weights: [400], fallbacks: ["serif"] },
    {
      ...common,
      name: "Oswald",
      cssVariable: "--font-oswald",
      weights: ["400 700"],
      fallbacks: ["sans-serif"],
    },
  ],
  // Code highlighting (spec 5.14) and the On tip numerals (spec 6.4); MDX
  // inherits both.
  markdown: {
    processor: satteri({ hastPlugins: [onTips] }),
    shikiConfig: { theme: terminal, transformers: [metaToData] },
  },
  integrations: [mdx()],
});
