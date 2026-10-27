# Phase 1: Tooling and Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the repo type checking, unit tests, a built-site link checker and Playwright, and capture screenshots of the current site before anything changes.

**Architecture:** Dev tooling only; no runtime dependency or page changes. The link checker is a Node script with a pure, exported core so Vitest can test it against a fixture `dist`. Playwright serves the built site with `astro preview` and has two projects: `e2e` (empty for now) and `baseline` (the one-off screenshots).

**Tech Stack:** Astro 7.3.4, `@astrojs/check` 0.9, TypeScript 6, Vitest 5, Playwright 1.64, Node 24.21.

**Spec:** [`docs/redesign-plan.md`](../../redesign-plan.md), Phase 1 (tasks 1.1–1.3). Tracked in [`docs/redesign-roadmap.md`](../../redesign-roadmap.md).

## Global Constraints

- Node `>=24.21.0` (from `package.json` `engines`).
- Add **devDependencies only**: `@astrojs/check@^0.9.12`, `typescript@^6.0.3`, `vitest@^5.0.5`, `@playwright/test@^1.64.1`. TypeScript stays on 6 because `@astrojs/check@0.9.12` peers on `^5.0.0 || ^6.0.0`.
- Don't change how any page looks or behaves. The only edits allowed under `src/` are type fixes in Task 1.
- Work on branch `redesign/phase-1-tooling`, cut from `feature/redesign`, in the main checkout (not a worktree), so `qa/baseline/` stays where Phase 8 expects it.
- Commit as `sasky` / `cam@sasky.nz`; end commit messages with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

**Deviations from the redesign plan (task 1.1), on purpose:**
- `@axe-core/playwright` moves to Phase 8, the first task that uses it.
- The `check:redirects` script entry moves to task 2.5, alongside the script it runs.
- The baseline is 14 routes, not 9 (the build emits 14 pages, including 4 tag pages). It's gitignored and not attached to the PR. It can be regenerated from `main` at any time, because `main` doesn't change until Phase 9.

## Review Focus

1. A `srcset` with several candidates and descriptors (`a.webp 1x, b.webp 2x`) must check every URL, not just the first. Pinned in Task 3's `srcset` test.
2. Links in both output formats must resolve. Today's build is `about/index.html`; Phase 2 switches to `format: 'file'` (`code.html`). `/about` and `/code` both have to pass. Pinned in Task 3's `resolves both formats` test.
3. `?query` and `#hash` suffixes, and percent-encoded paths (`/a%20b.png`), resolve to the file on disk. Pinned in Task 3.
4. Protocol-relative (`//cdn…`), absolute, relative (`hidenseek`), `#anchor`, `mailto:` and empty (`src=""`) values must be skipped, not reported. The current build has `src=""` and `src="hidenseek"`. Pinned in Task 3's `skips` test.
5. Lazy-loaded images below the fold come out blank in full-page screenshots. The baseline scrolls to the bottom and waits for images before capturing (Task 4, Step 3).

---

### Task 1: Type checking

**Files:**
- Modify: `package.json` (devDependencies, `check` script), `package-lock.json`
- Modify (only if `astro check` reports errors): files under `src/`, types only

**Interfaces:**
- Produces: `npm run check` → `astro check`, exit 0.

- [ ] **Step 1: Branch**

```bash
git switch feature/redesign && git switch -c redesign/phase-1-tooling
```

- [ ] **Step 2: Install**

Run: `npm i -D @astrojs/check@^0.9.12 typescript@^6.0.3`
Expected: both appear under `devDependencies`; `npm ls typescript` shows 6.x.

- [ ] **Step 3: Add `"check": "astro check"` to `scripts`, then run `npm run check`**

Expected: it runs to completion. Note the error count in the PR body.

- [ ] **Step 4: Get to zero errors**

Fix each error with a type-only change, such as an annotation, a `Props` interface or a narrowed `as`. No behaviour changes. Where a fix would mean rewriting legacy code that Phase 9 deletes anyway (for example `import.meta.glob(...) as any[]` pages), add `// @ts-expect-error legacy: removed in Phase 9` on that line instead. Warnings and hints are fine.

Run: `npm run check && npm run build`
Expected: `0 errors`; the build still reports `14 page(s) built`.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src
git commit -m "Add astro check and TypeScript 6"
```

---

### Task 2: Vitest

**Files:**
- Modify: `package.json` (`test` script), `package-lock.json`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: `npm test` → `vitest run`. Unit tests live in `tests/unit/**/*.test.ts`. Later phases rely on `astro:content`-free modules being importable from there.

- [ ] **Step 1: Install** — `npm i -D vitest@^5.0.5`

- [ ] **Step 2: Create `vitest.config.ts`**

Use `getViteConfig` from `astro/config`, so later tests share Astro's Vite setup, with `test: { include: ['tests/unit/**/*.test.ts'], passWithNoTests: true }`. If `getViteConfig` throws under Astro 7, fall back to `defineConfig` from `vitest/config` and note it in the PR.

- [ ] **Step 3: Add `"test": "vitest run"` and run it**

Run: `npm test`
Expected: exit 0 with "No test files found".

- [ ] **Step 4: Commit** — `git commit -m "Add Vitest"` (package files + `vitest.config.ts`).

---

### Task 3: Built-site link checker

**Files:**
- Create: `scripts/check-links.mjs`
- Create: `tests/unit/check-links.test.ts`
- Create: `tests/fixtures/dist-links/` (tiny fixture site, below)
- Modify: `package.json` (`check:links` script)

**Interfaces:**
- Consumes: `npm test` (Task 2).
- Produces: `findBrokenLinks(distDir: string): Promise<{ page: string; url: string }[]>`, exported from `scripts/check-links.mjs`. `page` is relative to `distDir`. Running the file directly (`node scripts/check-links.mjs dist`) prints each broken link as `page → url` and exits 1, or prints `N links checked, 0 broken` and exits 0. Task 2.5's redirect script reuses its "does this path exist in dist" logic, so export `resolveInDist(distDir: string, urlPath: string): string | null` too (the file it found, or null).

**Rules:**
- Scan every `dist/**/*.html` for `href`, `src` and `srcset` attribute values.
- Check only root-relative values (they start with `/` but not `//`).
- Strip `?…` and `#…`, then `decodeURIComponent`.
- A path resolves if one of these exists: the exact file, `<path>.html`, or `<path>/index.html` (`/` → `index.html`).

- [ ] **Step 1: Build the fixture**

`tests/fixtures/dist-links/` contains:
- `index.html`
- `about/index.html` (directory format)
- `code.html` (file format)
- `img/a b.png`
- `img/x.webp`
- `img/y.webp`

`index.html` links to `/about`, `/about/`, `/code`, `/code?x=1#top`, `/img/a%20b.png`, `<img srcset="/img/x.webp 1x, /img/y.webp 2x">`, plus the skipped kinds: `//cdn.example.com/a.js`, `https://sasky.nz/x`, `hidenseek`, `#top`, `mailto:a@b.c`, `src=""`. It also has two broken links, in this order: `<a href="/missing">`, then `<img srcset="/img/y.webp 1x, /img/z.webp 3x">`.

- [ ] **Step 2: Write the failing tests**

```ts
import { findBrokenLinks, resolveInDist } from '../../scripts/check-links.mjs'
const dist = new URL('../fixtures/dist-links/', import.meta.url).pathname

test('reports exactly the broken root-relative links', async () => {
  expect(await findBrokenLinks(dist)).toEqual([
    { page: 'index.html', url: '/missing' },
    { page: 'index.html', url: '/img/z.webp' },
  ])
})
test('resolves both formats', () => {
  expect(resolveInDist(dist, '/about')).toMatch(/about\/index\.html$/)
  expect(resolveInDist(dist, '/about/')).toMatch(/about\/index\.html$/)
  expect(resolveInDist(dist, '/code')).toMatch(/code\.html$/)
  expect(resolveInDist(dist, '/')).toMatch(/index\.html$/)
})
test('strips query, hash and decodes', () => {
  expect(resolveInDist(dist, '/code?x=1#top')).toMatch(/code\.html$/)
  expect(resolveInDist(dist, '/img/a%20b.png')).toMatch(/a b\.png$/)
})
test('missing path resolves to null', () => {
  expect(resolveInDist(dist, '/nope')).toBeNull()
})
```

The `skips` behaviour is covered by the first test: none of the skipped kinds may appear in its result.

- [ ] **Step 3: Run the tests** — `npm test`. Expected: FAIL, because the module isn't found.

- [ ] **Step 4: Implement `scripts/check-links.mjs`**

Use Node built-ins only (`fs/promises` `glob`, `path`); no new dependencies. Pull attributes out with a regex over `\s(href|src|srcset)="([^"]*)"`. For `srcset`, split the value on commas and take the first whitespace-separated token of each candidate. Run the CLI only when `import.meta.url === pathToFileURL(process.argv[1]).href`.

- [ ] **Step 5: Run the tests** — `npm test`. Expected: 4 passed.

- [ ] **Step 6: Check the real site**

Add `"check:links": "node scripts/check-links.mjs dist"`, then run `npm run build && npm run check:links`.
Expected: `N links checked, 0 broken`. If it finds real broken links on the current site, list them in the PR and don't fix them here; Phase 2 replaces those pages.

- [ ] **Step 7: Commit** — `git commit -m "Add built-site link checker"`.

---

### Task 4: Playwright and the baseline screenshots

**Files:**
- Modify: `package.json` (`test:e2e` and `baseline` scripts), `package-lock.json`, `.gitignore`
- Create: `playwright.config.ts`, `tests/visual/baseline.spec.ts`

**Interfaces:**
- Consumes: `npm run build` output in `dist/`.
- Produces: `npm run test:e2e` → `playwright test --project=e2e --pass-with-no-tests`; the `e2e` project's `testDir` is `tests/e2e`, which later phases fill. `npm run baseline` → `playwright test --project=baseline`, which writes `qa/baseline/<name>-<width>.png`.

- [ ] **Step 1: Install**

Run: `npm i -D @playwright/test@^1.64.1 && npx playwright install chromium`

- [ ] **Step 2: Create `playwright.config.ts`**

- `webServer`: `{ command: 'npm run preview -- --port 4322', url: 'http://localhost:4322', reuseExistingServer: true }`.
- `use.baseURL` is the same URL.
- Two Chromium projects: `e2e` (`testDir: 'tests/e2e'`) and `baseline` (`testDir: 'tests/visual'`).

- [ ] **Step 3: Write `tests/visual/baseline.spec.ts`**

- **Routes** come from `dist/**/*.html` when the test is collected: `index.html` → `/`, `x/index.html` → `/x`, `x.html` → `/x`. Discovering them, rather than hard-coding a list, keeps the spec working after Phase 2's URL changes.
- **One test per route and width**, at 1280×900 and 390×844:
  1. `goto`.
  2. `await page.evaluate(() => document.fonts.ready)`.
  3. Scroll to the bottom in viewport steps, so lazy images load.
  4. Wait until every `img` has `complete` true.
  5. `screenshot({ fullPage: true, animations: 'disabled', path })`.
- **File names:** `/` is `home`; otherwise the path without its leading slash, with `/` turned into `__`. For example `qa/baseline/tags__life-390.png`.

- [ ] **Step 4: Ignore the outputs**

Append `qa/`, `test-results/` and `playwright-report/` to `.gitignore`. This is task 1.3's last item.

- [ ] **Step 5: Run the baseline**

Run: `npm run build && npm run baseline && ls qa/baseline | wc -l`
Expected: 28 passed, and `28` files. Open `home-1280.png` and `hide-n-seek-game-390.png` to check that the images and fonts rendered.

- [ ] **Step 6: Check that the empty e2e suite passes** — `npm run test:e2e`. Expected: exit 0.

- [ ] **Step 7: Commit** — `git commit -m "Add Playwright and baseline screenshots"`.

---

### Task 5: Finish the phase

**Files:**
- Modify: `docs/redesign-roadmap.md`

- [ ] **Step 1: Full verification**

Run: `npm run build && npm run check && npm test && npm run check:links && npm run test:e2e`
Expected: every command exits 0.

- [ ] **Step 2: Update the roadmap**

Tick 1.1, 1.2 and 1.3, and add the PR link once the PR exists (Step 3). Commit with `git commit -m "Roadmap: Phase 1 done"`.

- [ ] **Step 3: Open the PR into `feature/redesign`**

- Run `gh auth switch --user sasky`.
- If `feature/redesign` isn't on the remote yet, run `git push -u origin feature/redesign`.
- Push the phase branch, then run `gh pr create --base feature/redesign`.
- **PR body:** the `astro check` error count before and after, any `@ts-expect-error` lines added, the link-checker result, and the three deviations listed above.
