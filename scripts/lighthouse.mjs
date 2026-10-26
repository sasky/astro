// Lighthouse (mobile) on Home and one post per theme (spec 8.3).
//   npm run build && npm run preview -- --port 4322 --ignore-lock   (in another shell)
//   npm run qa:lighthouse [base]
// Reports go to qa/lighthouse/ (gitignored). Exits 1 if a page misses the
// targets: performance >= 95 and CLS < 0.05.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { chromium } from "playwright-core";

const LIGHTHOUSE = "lighthouse@13.5.0";
const base = process.argv[2] ?? "http://localhost:4322";
const pages = {
  home: "/",
  code: "/code/silverstripe-app-platform",
  life: "/life/top-concertvids",
  on: "/meditations/on-being-classy",
};

mkdirSync("qa/lighthouse", { recursive: true });
const rows = [];
for (const [name, path] of Object.entries(pages)) {
  const out = `qa/lighthouse/${name}`;
  execFileSync(
    "npx",
    ["-y", LIGHTHOUSE, base + path, "--output=json", "--output=html", `--output-path=${out}`, "--chrome-flags=--headless=new", "--quiet"],
    { stdio: "inherit", env: { ...process.env, CHROME_PATH: chromium.executablePath() } },
  );
  const { categories, audits } = JSON.parse(readFileSync(`${out}.report.json`, "utf8"));
  rows.push({
    page: path,
    performance: Math.round(categories.performance.score * 100),
    accessibility: Math.round(categories.accessibility.score * 100),
    "best practices": Math.round(categories["best-practices"].score * 100),
    seo: Math.round(categories.seo.score * 100),
    CLS: Number(audits["cumulative-layout-shift"].numericValue.toFixed(3)),
    "LCP (s)": Number((audits["largest-contentful-paint"].numericValue / 1000).toFixed(2)),
    "TBT (ms)": Math.round(audits["total-blocking-time"].numericValue),
  });
}

console.table(rows);
const misses = rows.filter((row) => row.performance < 95 || row.CLS >= 0.05);
if (misses.length) {
  console.error(`Missed the targets (performance >= 95, CLS < 0.05): ${misses.map((row) => row.page).join(", ")}`);
  process.exit(1);
}
