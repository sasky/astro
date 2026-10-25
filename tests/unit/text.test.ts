import { expect, test } from "vitest";
import { excerpt, firstSentence, readingTime } from "../../src/lib/text";

const words = (n: number) => Array(n).fill("word").join(" ");

test("readingTime rounds up at 220 wpm, min 1", () => {
  expect(readingTime(words(220))).toBe(1);
  expect(readingTime(words(221))).toBe(2);
  expect(readingTime("")).toBe(1);
});

test("readingTime ignores imports, JSX and code fences", () => {
  const body = `import x from "y";\n\n<YouTube id="abc" />\n\n\`\`\`bash\n${words(500)}\n\`\`\`\n\n${words(10)}`;
  expect(readingTime(body)).toBe(1);
});

test("excerpt returns the first prose paragraph, plain text", () => {
  const body =
    'import { Picture } from "astro:assets";\n\n## Heading\n\n<Picture src={x} />\n\nFirst *real* paragraph with a [link](https://x.y).\nSecond line.\n\nSecond paragraph.';
  expect(excerpt(body)).toBe("First real paragraph with a link. Second line.");
});

test("firstSentence", () => {
  expect(firstSentence("One. Two.")).toBe("One.");
  expect(firstSentence("What? Yes.")).toBe("What?");
  expect(firstSentence("No stop")).toBe("No stop");
});

test("firstSentence ends at a full stop inside closing quotes", () => {
  expect(
    firstSentence('Pharrell, to my ears, does not sound particularly happy singing his song "Happy." It has me musing.'),
  ).toBe('Pharrell, to my ears, does not sound particularly happy singing his song "Happy."');
});
