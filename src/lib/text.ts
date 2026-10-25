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
    .replace(/\s+/g, " ")
    .trim();
}

/** The first prose paragraph as plain text, skipping imports, headings, JSX and code. */
export function excerpt(body: string): string {
  const paragraphs = body.replace(FENCE, "").split(/\n\s*\n/);
  const prose = paragraphs.find((block) => {
    const start = block.trim();
    return start !== "" && !/^(import\s|export\s|#|<)/.test(start);
  });
  return prose ? plainText(prose) : "";
}

/** Up to and including the first `.`, `!` or `?` that ends a sentence. */
export function firstSentence(s: string): string {
  const match = s.match(/^.*?[.!?](?=\s|$)/s);
  return (match ? match[0] : s).trim();
}
