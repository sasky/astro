# Phase 9: Cleanup and Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the old site's code, document the new one, and prepare the launch: a PR from `feature/redesign` into `main` whose Netlify deploy preview passes the launch checks.

**Architecture:** No new features. Task 1 deletes; Task 2 writes docs; Task 3 opens this phase's PR into `feature/redesign` and, once Cam merges it, the launch PR into `main`, then checks its deploy preview. Merging into `main` (going live) is Cam's call.

**Tech Stack:** Astro 7.3.4, Netlify (deploy previews on PRs into `main`), Vitest, Playwright, Lighthouse.

**Spec:** [`docs/redesign-plan.md`](../../redesign-plan.md) tasks 9.1–9.3; roadmap "Carried forward → Phase 9" (preview redirects and Lighthouse, legacy folders, line numbers).

## Calls made in place of a brainstorm

1. **What goes (9.1):**
   - `src/components/{Header,Hamburger,Footer,Social}.astro` and `src/components/legacy/`;
   - `src/layouts/legacy/`;
   - `src/styles/{global,theme,components,fonts}.css`, `src/styles/components/`, `src/styles/pages/` and `src/styles/fonts/` (Hack and IBM Plex files, demo HTML);
   - `src/scripts/utils.js`;
   - the five unreferenced `src/images/Screenshot 2024-03-02 …png`;
   - `open-props`.

   `astro-embed-youtube` was already removed in Phase 4.
2. **What stays:**
   - `tests/visual/baseline.spec.ts`, still a useful before/after screenshot tool;
   - `qa/` (gitignored);
   - the untracked `design/` folder, which is Cam's call.
3. **Line numbers:** if Chrome exposes the CSS counter text to the accessibility tree, the `::before` gets alt text `/ ""` (`content: counter(line) / ""`), so screen readers skip it. This keeps the 2.42:1 decorative ruling honest.
4. **README:** it is rewritten for the new site:
   - what it is, and the three sections;
   - the content model (frontmatter fields);
   - adding a post;
   - themes and where their files live;
   - the scripts (build, check, test, e2e, links, redirects, `qa:*`);
   - the redirect check on Netlify's emulator;
   - deploys.
5. **`todo.md`:** I remove only the items the redesign completed, and keep the ideas. Completed items:
   - favicon;
   - footer;
   - prev/next links;
   - Pico-8 on large monitors;
   - the about page folded into Home;
   - the "ui rethink" line;
   - "remove unneeded css".
6. **The launch PR** goes from `feature/redesign` into `main`, opened after Cam merges this phase's PR. Its body carries the launch checklist (9.3) with the preview results filled in, and the post-merge steps for Cam:
   - re-run `check:redirects` against https://sasky.nz;
   - Search Console.

## Global Constraints

- **No post copy changes.**
- **Every PR runs** `npm run build`, `npm run check`, `npm test`, `npm run check:links`, `npm run check:redirects -- --dist` and `npm run test:e2e`.
- **Verify (9.1):** `rg "open-props|global.css|astro-embed|astro:schema" src` returns nothing.

## Review Focus

1. **Nothing still imports a deleted file.** Test: build, `astro check`, the full suite.
2. **No page's CSS or fonts change** when the old files go. Test: `expectOnlyThemeCss` across the e2e suite, plus the `baseline` screenshots before and after (byte-identical).
3. **The deploy preview serves what the local build serves:**
   - redirects;
   - links;
   - the feed;
   - fonts (the build fetches them from Google and Fontsource on Netlify too).

   Test: Task 3, against the preview URL.

---

### Task 1: Remove the old code (9.1)

- [ ] **Step 1:** Take `npm run baseline` screenshots (into `qa/baseline/`) as the "before" set.
- [ ] **Step 2:** Delete the files in call 1. Run `npm uninstall open-props`.
- [ ] **Step 3:** Run `rg "open-props|global.css|astro-embed|astro:schema|legacy/" src`. Expected: nothing.
- [ ] **Step 4:** Run the build, check (0 errors, 0 hints), unit, links, redirects and e2e. Retake the baseline and compare it byte for byte with the "before" set. Expected: identical.
- [ ] **Step 5:** Line numbers (call 3): a CDP test that the accessibility tree of a Code block has no line-number text. Write it, see it fail if Chrome exposes the counters, fix it, see it pass.
- [ ] **Step 6:** Commit `chore: remove the old site's code`.

### Task 2: Docs (9.2)

- [ ] **Step 1:** Rewrite `README.md` (call 4). Check every script name and path it mentions against `package.json` and the tree.
- [ ] **Step 2:** Prune `todo.md` (call 5).
- [ ] **Step 3:** Update the roadmap (status, ticks, "Next: launch") and commit `docs: README for the redesign; Phase 9 roadmap`.

### Task 3: Launch checklist (9.3)

- [ ] **Step 1:** Final review, then push and open this phase's PR into `feature/redesign`.
- [ ] **Step 2 (after Cam merges):** open the PR from `feature/redesign` into `main`. Wait for Netlify's deploy preview.
- [ ] **Step 3:** Against the preview URL:
  - `npm run check:redirects -- --url <preview>`: 10 rules, 0 errors;
  - `npm run qa:lighthouse <preview>`: performance ≥ 95 on all four pages;
  - fetch `/rss.xml` and parse it;
  - spot-check a page per theme, and that its fonts load.
- [ ] **Step 4:** Put the results in the launch PR body, with the post-merge steps. Cam merges it.
