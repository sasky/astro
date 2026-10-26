// Plain-text helpers over raw MDX post bodies.

const FENCE = /^```[\s\S]*?^```/gm;
const JSX = /<[^>]*>/g;
const IMPORT_EXPORT = /^(import|export)\s.*$/gm;

/** Minutes to read at 220 wpm, rounded up, at least 1. Ignores imports, JSX and code. */
export function readingTime(body: string): number {
  const prose = body.replace(FENCE, "").replace(IMPORT_EXPORT, "").replace(JSX, "");
  const words = prose.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
  return Math.max(1, Math.ceil(words / 220));
}

function plainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|\*)(.+?)\1/g, "$2")
    .replace(/(^|\W)_(.+?)_(?=\W|$)/g, "$1$2")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

// Blocks that aren't prose: imports, headings, JSX, quotes, lists, MDX comments.
const NOT_PROSE = /^(import\s|export\s|#|<|>|[-*+]\s|\d+\.\s|\{\/\*)/;

/** The first prose paragraph as plain text, skipping imports, headings, JSX, quotes, lists and code. */
export function excerpt(body: string): string {
  const paragraphs = body.replace(FENCE, "").split(/\n\s*\n/);
  const prose = paragraphs.find((block) => {
    const start = block.trim();
    return start !== "" && !NOT_PROSE.test(start);
  });
  return prose ? plainText(prose) : "";
}

/** Up to and including the first `.`, `!` or `?` that ends a sentence, with any closing quote or bracket. */
export function firstSentence(s: string): string {
  const match = s.match(/^.*?[.!?]["'”’)\]]*(?=\s|$)/s);
  return (match ? match[0] : s).trim();
}

/** The On programme line (G6): the description's first sentence, and whether it's over 60 characters. */
export function programmeLine(description: string): { text: string; long: boolean } {
  const text = firstSentence(description);
  return { text, long: text.length > 60 };
}
