// Sätteri hast plugin for On posts (spec 6.4): a "## N. Tip" heading (N ≥ 1)
// becomes <h2 class="tip"><span class="num">{Roman N}.</span> Tip</h2>. The
// DOM stays flat; .prose-on in on.css lays the tips out. Any other On h2 gets
// its content wrapped in <span class="h-text">, so inline markup stays one
// item in the heading's flex row (G1). Code and Life posts pass through.
import type { HastPluginDefinition } from "satteri";
import { toRoman } from "../lib/format";

const TIP = /^(\d+)\.\s+/;

export const onTips: HastPluginDefinition = {
  name: "on-tips",
  element: {
    filter: ["h2"],
    visit(node, ctx) {
      if (ctx.data.astro?.frontmatter?.section !== "on" || !node.children.length) return;
      const [first, ...rest] = node.children;
      const match = first.type === "text" ? first.value.match(TIP) : null;
      const n = match ? Number(match[1]) : 0;
      if (first.type !== "text" || !match || n < 1) {
        return {
          ...node,
          children: [{ type: "element", tagName: "span", properties: { className: ["h-text"] }, children: node.children }],
        };
      }
      const className = node.properties.className;
      return {
        ...node,
        properties: { ...node.properties, className: [...(Array.isArray(className) ? className : []), "tip"] },
        children: [
          {
            type: "element",
            tagName: "span",
            properties: { className: ["num"] },
            children: [{ type: "text", value: `${toRoman(n)}.` }],
          },
          { type: "text", value: ` ${first.value.slice(match[0].length)}` },
          ...rest,
        ],
      };
    },
  },
};
