// Shiki transformer for Markdown and MDX code fences.
// - Copies `title="…"` from the fence meta onto the <pre> as data-title, so
//   the Code post's CodeBlock can caption it (the language is already on
//   data-language).
// - Drops the newline text nodes Shiki puts between .line spans, so lines can
//   be display: block without double spacing (risk R7). Copying joins the
//   lines with "\n" instead (src/scripts/copy-code.ts).
import type { ShikiTransformer } from "shiki";

export const metaToData: ShikiTransformer = {
  name: "sasky:meta-to-data",
  pre(node) {
    const title = this.options.meta?.__raw?.match(/title="([^"]*)"/)?.[1];
    if (title) node.properties["data-title"] = title;
  },
  code(node) {
    node.children = node.children.filter((child) => !(child.type === "text" && child.value.trim() === ""));
  },
};
