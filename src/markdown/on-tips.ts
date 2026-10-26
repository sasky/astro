// Sätteri hast plugin for On posts (spec 6.4): a "## N. Tip" heading becomes
// <h2 class="tip"><span class="num">{Roman N}.</span> Tip</h2>. The DOM stays
// flat; .prose-on in on.css lays the tips out. Code and Life posts, and On
// headings without a leading number, pass through untouched.
import type { HastPluginDefinition } from "satteri";
import { toRoman } from "../lib/format";

const TIP = /^(\d+)\.\s+/;

export const onTips: HastPluginDefinition = {
  name: "on-tips",
  element: {
    filter: ["h2"],
    visit(node, ctx) {
      if (ctx.data.astro?.frontmatter?.section !== "on") return;
      const [first, ...rest] = node.children;
      const match = first?.type === "text" ? first.value.match(TIP) : null;
      if (!first || first.type !== "text" || !match) return;
      const className = node.properties.className;
      return {
        ...node,
        properties: { ...node.properties, className: [...(Array.isArray(className) ? className : []), "tip"] },
        children: [
          {
            type: "element",
            tagName: "span",
            properties: { className: ["num"] },
            children: [{ type: "text", value: `${toRoman(Number(match[1]))}.` }],
          },
          { type: "text", value: ` ${first.value.slice(match[0].length)}` },
          ...rest,
        ],
      };
    },
  },
};
