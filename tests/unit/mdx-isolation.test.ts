import { readFileSync, readdirSync } from "node:fs";
import { expect, test } from "vitest";

// Shared MDX components are theme-neutral: colours come from tokens, with
// fallbacks only inside var(). Code-only parts live in src/components/code/.
test("shared MDX components hard-code no colours outside var() fallbacks", () => {
  const dir = "src/components/mdx";
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".astro"))) {
    const css = readFileSync(`${dir}/${file}`, "utf8").replace(/var\([^()]*(\([^()]*\)[^()]*)*\)/g, "");
    expect(css.match(/#[0-9a-f]{6}\b/gi) ?? [], file).toEqual([]);
  }
});
