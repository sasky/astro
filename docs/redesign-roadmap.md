# sasky.nz redesign: roadmap

The tracker for the redesign. The detail lives in [`redesign-plan.md`](redesign-plan.md) (the "plan"); this file lists the phases and tasks, what's done, and how each phase gets run.

- **Branches:** each phase is built on `redesign/phase-N-<name>` and merged by PR into `feature/redesign`. Phase 9 opens the PR from `feature/redesign` into `main`.
- **Account:** `~/Sasky/` repos use the `sasky` GitHub account (cam@sasky.nz). Check `gh auth status` and `git config user.email` before pushing.
- **Every PR runs:** `npm run build`, `npm run check`, `npm test` and `npm run check:links` (from Phase 1 on).

## How each phase runs

Each phase starts with the superpowers sessions it needs, in this order:

1. **Brainstorm** (`superpowers:brainstorming`), only when the phase still has open design choices. The output is a short spec in `docs/superpowers/specs/`, and Cam signs it off.
2. **Plan** (`superpowers:writing-plans`), always. It turns the phase's tasks in the plan into a step-by-step plan in `docs/superpowers/plans/YYYY-MM-DD-phase-N-<name>.md`. Cam reviews it and picks how it's executed.
3. **Implement** on the phase branch, test first where there's logic to test:
   - **Native** (`superpowers:executing-plans`) for small phases.
   - **Subagent-driven** (`superpowers:subagent-driven-development`) where a mistake would cost more, with a review after each task.
4. **Finish:** `superpowers:verification-before-completion`, then `superpowers:requesting-code-review`, then `superpowers:finishing-a-development-branch` to open the PR into `feature/redesign`.
5. **Update this file:** tick the tasks and add the PR link.

| Phase | Brainstorm? | Suggested execution | Why |
|---|---|---|---|
| 1. Tooling and baseline | No | Native | Config only, nothing to decide. |
| 2. Collections, routes, redirects | No | Subagent-driven | URLs and redirects are settled, but a mistake breaks live links. |
| 3. Foundations | Light | Subagent-driven | Layout props and how theme CSS is scoped get reused by every later phase. |
| 4. HP pages | Yes | Subagent-driven | Hero composition and the tag selector's no-JS behaviour. |
| 5. Code pages | Light | Subagent-driven | Code-block caption bar, Pico-8 panel (G4), image grid (G3). |
| 6. On pages | Yes | Subagent-driven | `onTips` plugin, prose for posts without tips (G1), On video cards (G2). |
| 7. Tags, RSS, SEO | No | Native | Specified in full in the plan. |
| 8. QA | No | Native | Checklist-driven. |
| 9. Cleanup and launch | No | Native | Deletions, docs and the PR into `main`. |

## Phases and tasks

Sizes: **S** is under 2 hours, **M** is half a day, **L** is a day or more. Task numbers match the plan.

### Phase 1: Tooling and baseline

PR: _none yet_

- [x] 1.1 Dev tooling: `astro check`, Vitest, Playwright and axe, link checker (S)
- [x] 1.2 Baseline screenshots of every current route at 1280 and 390 (S)
- [x] 1.3 Housekeeping (S)
  - [x] Commit `design-handoff/`; delete the zip and duplicate prompt
  - [x] Add `qa/` to `.gitignore`

### Phase 2: Content collections, routes and redirects (old look, new URLs)

PR: _none yet_

- [ ] 2.1 Pure helpers (`format`, `text`, `posts`) with tests first (M)
- [ ] 2.2 Move the posts into the `posts` collection (M)
- [ ] 2.3 `/code`, `/life` and `/meditations` routes in the old look (M)
- [ ] 2.4 Routing config: no trailing slash, `format: 'file'` (S)
- [ ] 2.5 `_redirects` and the redirect check script; verify on a deploy preview (S)

### Phase 3: Foundations

PR: _none yet_

- [ ] 3.1 Fonts through the Astro Fonts API (S)
- [ ] 3.2 Base styles and theme tokens (M)
- [ ] 3.3 Layouts and shared chrome: top bar, skip link, footers (M)
- [ ] 3.4 404 page (S)

### Phase 4: HP pages (Home and Life)

PR: _none yet_

- [ ] 4.1 YouTube component (S)
- [ ] 4.2 Home: hero, about, section doors, browse by tag (L)
- [ ] 4.3 Life listing (M)
- [ ] 4.4 Life post and concert post edits (M)

### Phase 5: Code pages

PR: _none yet_

- [ ] 5.1 Shiki theme and code blocks (M)
- [ ] 5.2 Code listing (S)
- [ ] 5.3 Code post, with TOC and Pico-8 panel (L)

### Phase 6: On pages

PR: _none yet_

- [ ] 6.1 On primitives: bills, rules, manicules, fleurons (M)
- [ ] 6.2 `onTips` Sätteri plugin (S)
- [ ] 6.3 On listing and post (L)

### Phase 7: Tags, RSS and SEO

PR: _none yet_

- [ ] 7.1 Tag pages (M)
- [ ] 7.2 RSS categories (S)
- [ ] 7.3 Meta and titles (S)

### Phase 8: QA

PR: _none yet_

- [ ] 8.1 Visual comparison against the designs at 1280 and 390 (M)
- [ ] 8.2 Accessibility (M)
- [ ] 8.3 Performance (S)

### Phase 9: Cleanup and launch

PR: _none yet_

- [ ] 9.1 Remove the old code (S)
- [ ] 9.2 Docs (S)
- [ ] 9.3 Launch checklist and the PR into `main` (S)
