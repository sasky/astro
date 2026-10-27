// Checks the Netlify redirects in public/_redirects.
//   node scripts/check-redirects.mjs --dist [dir]   every target is built, no old path is
//   node scripts/check-redirects.mjs --url <base>   a running server answers each rule correctly
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolveInDist } from "./check-links.mjs";

/** @typedef {{ from: string; to: string; status: number }} Rule */

/** @param {string} text @returns {Rule[]} */
export function parseRedirects(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const [from, to, status] = line.split(/\s+/);
      return { from, to, status: Number(status) };
    });
}

/** Errors for rules whose target isn't built, or whose old path still is (Netlify would serve it instead). */
/** @param {string} distDir @param {Rule[]} rules @returns {string[]} */
export function checkDist(distDir, rules) {
  const errors = [];
  for (const { from, to } of rules) {
    if (!resolveInDist(distDir, to.split("#")[0] || "/")) errors.push(`${from}: target ${to} is not in ${distDir}`);
    if (resolveInDist(distDir, from)) errors.push(`${from}: old path is still built, so the redirect never fires`);
  }
  return errors;
}

async function checkPath(base, path, { to, status }) {
  const res = await fetch(new URL(path, base), { redirect: "manual" });
  if (res.status !== status) return `${path}: expected ${status}, got ${res.status}`;
  const location = new URL(res.headers.get("location") ?? "", base);
  const expected = new URL(to, base);
  if (location.pathname + location.hash !== expected.pathname + expected.hash) {
    return `${path}: redirects to ${location.pathname}${location.hash}, expected ${to}`;
  }
  location.hash = "";
  const landed = await fetch(location);
  if (landed.status !== 200) return `${path}: ${location.pathname} returns ${landed.status}`;
  return null;
}

/** Checks each rule with and without a trailing slash; upper-case variants only produce notes. */
/** @param {string} base @param {Rule[]} rules @returns {Promise<{ errors: string[]; notes: string[] }>} */
export async function checkUrl(base, rules) {
  const errors = [];
  const notes = [];
  for (const rule of rules) {
    for (const path of [rule.from, `${rule.from}/`]) {
      const error = await checkPath(base, path, rule);
      if (error) errors.push(error);
    }
    const note = await checkPath(base, rule.from.toUpperCase(), rule);
    if (note) notes.push(note);
  }
  return { errors, notes };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [mode, target] = process.argv.slice(2);
  const rules = parseRedirects(readFileSync("public/_redirects", "utf8"));
  let errors;
  let notes = [];
  if (mode === "--dist") {
    errors = checkDist(target ?? "dist", rules);
  } else if (mode === "--url" && target) {
    ({ errors, notes } = await checkUrl(target, rules));
  } else {
    console.error("Usage: check-redirects.mjs --dist [dir] | --url <base>");
    process.exit(2);
  }
  for (const note of notes) console.log(`note: ${note}`);
  for (const error of errors) console.log(error);
  console.log(`${rules.length} rules, ${errors.length} errors`);
  if (errors.length) process.exit(1);
}
