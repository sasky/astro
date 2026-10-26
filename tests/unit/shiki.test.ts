import { codeToHtml, type ThemeRegistration } from "shiki";
import { expect, test } from "vitest";
import { metaToData } from "../../src/shiki/meta-to-data";
import terminal from "../../src/shiki/sasky-terminal.json";

const highlight = (code: string, lang: string, raw?: string) =>
  codeToHtml(code, {
    lang,
    theme: terminal as ThemeRegistration,
    transformers: [metaToData],
    meta: raw ? { __raw: raw } : undefined,
  });

const colourOf = (html: string, text: string) =>
  html.match(new RegExp(`<span style="([^"]*)">${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</span>`))?.[1].toLowerCase();

test("title from the fence meta lands on the pre", async () => {
  expect(await highlight("A=1", "dotenv", 'title=".env · database"')).toMatch(/<pre[^>]*data-title=".env · database"/);
});

test("no title, no data-title", async () => {
  expect(await highlight("A=1", "dotenv")).not.toContain("data-title");
});

test("lines are not separated by newline text nodes", async () => {
  const html = await highlight("echo one\necho two\necho three", "bash");
  expect(html).toMatch(/<\/span><span class="line">/);
  expect(html).not.toMatch(/<\/span>\n<span class="line">/);
});

test("theme colours", async () => {
  const env = await highlight("SS_ENV=live", "dotenv");
  expect(colourOf(env, "SS_ENV")).toContain("#8cc8ff");
  expect(colourOf(env, "live")).toContain("#a6e3a1");
  const php = await highlight("<?php\n// app/_config.php", "php");
  const comment = colourOf(php, "// app/_config.php") ?? colourOf(php, "app/_config.php");
  expect(comment).toContain("#5f7a6a");
  expect(comment).toContain("font-style:italic");
});

test("theme background", async () => {
  expect((await highlight("A=1", "dotenv")).toLowerCase()).toMatch(/<pre[^>]*background-color:#070a09/);
});
