# Portfolio Refresh + JuiceBar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add JuiceBar as the only new project while making portfolio evidence, hire conversion, content honesty, and maintenance gates accurate.

**Architecture:** Keep `content/projects.json` as the ledger source of truth. Extend `Project` with optional evidence/freshness fields and derive selected work/statistics in `src/lib/projects.ts`; preserve current Ledger styling and bilingual routing.

**Tech Stack:** Next.js 16, React 19, TypeScript, next-intl, Vitest, Prettier, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-08-27-portfolio-refresh-juicebar-design.md`

## Global Constraints

- Add `juicebar` and no other new project slug.
- Preserve Korean/English parity and use only repository-backed claims/assets.
- Do not take major dependency migrations.
- Use TDD for behavior changes and root-cause debugging for failures/warnings.

---

### Task 1: Ledger metrics and selected-work model

**Files:** `src/lib/projects.ts`, `src/lib/__tests__/projects.test.ts`, `src/types/content.ts`

**Produces:** `getPortfolioStats(projects)`, `SELECTED_WORK`, optional `Project.caseStudy`, optional `Project.updatedAt`.

- [ ] Add failing tests for truthful total/public/Play counts, selected-work uniqueness, five exact selected slugs, and locale-aware case-study extraction.
- [ ] Run `npm test -- src/lib/__tests__/projects.test.ts`; confirm failure is caused by missing interfaces.
- [ ] Implement minimal helpers/constants/types.
- [ ] Re-run focused tests; confirm pass.
- [ ] Commit.

### Task 2: JuiceBar and selected evidence

**Files:** `content/projects.json`, `public/images/projects/*`, `src/lib/__tests__/projects.test.ts`

**Produces:** exactly one new ledger row (`juicebar`) plus real screenshots/evidence for selected work where available.

- [ ] Add a failing integrity test expecting project count 42, `juicebar`, public GitHub/screenshot/case-study fields, and no unexpected new slug.
- [ ] Run the focused test; confirm it fails on missing JuiceBar.
- [ ] Copy real local screenshots only; add bilingual JuiceBar data and selected-work evidence from repository documentation.
- [ ] Add trustworthy `updatedAt` values only where local Git dates resolve confidently.
- [ ] Re-run focused tests and commit.

### Task 3: Homepage, project IA, and hire alignment

**Files:** `src/app/[locale]/LedgerHome.tsx`, `src/app/[locale]/projects/page.tsx`, `src/lib/projects.ts`, `messages/ko.json`, `messages/en.json`

**Consumes:** `getPortfolioStats`, `SELECTED_WORK`, `HIRE_CASE_STUDIES`.

- [ ] Add failing tests for `HIRE_CASE_STUDIES = ['citefirst','studios','soursea']` and selected/full-ledger partitioning.
- [ ] Run focused tests; confirm failure.
- [ ] Make homepage stats truthful (`BUILDS`, public/live destinations, Play, Featured), derive hero count, and add `/hire` to primary nav.
- [ ] Render `/projects` as Selected Work first, then all remaining projects as Full Ledger without deleting entries.
- [ ] Update bilingual labels, run focused tests + typecheck, and commit.

### Task 4: Evidence sections on project details

**Files:** `src/app/[locale]/projects/[slug]/page.tsx`, `src/lib/projects.ts`, `messages/ko.json`, `messages/en.json`, focused tests.

- [ ] Add a failing test proving four case-study sections are returned in Problem/Decision/Evidence/Result order and absent for ordinary projects.
- [ ] Run focused test; confirm failure.
- [ ] Implement a locale-aware helper and render the four sections only when `caseStudy` exists.
- [ ] Run focused tests + typecheck and commit.

### Task 5: Newsletter honesty and JuiceBar build note

**Files:** `src/app/[locale]/blog/page.tsx`, `src/components/blog/Newsletter.tsx`, `content/posts/{ko,en}/building-juicebar/index.mdx`

**Produces:** no fake email capture and a bilingual post linked with `project: juicebar`.

- [ ] Remove the newsletter import/render path; delete the component if unused.
- [ ] Add Korean and English JuiceBar build notes using only repository-documented facts and existing MDX conventions.
- [ ] Run `npm run untranslated` plus MDX/post-link tests; resolve schema errors without inventing facts.
- [ ] Confirm `grep -R "Newsletter" src/app` returns no public route usage and commit.

### Task 6: Format/build warning root causes

**Files:** `.prettierrc`, `src/app/api/og/route.tsx`, `src/app/api/content-image/[...path]/route.ts`, `src/lib/content-image-path.ts` if needed, `src/lib/__tests__/content-image-path.test.ts`.

- [ ] Reproduce Windows `format:check` failure and the Edge Runtime / dynamic filesystem tracing build warnings.
- [ ] Verify CRLF is the format-check root cause on a representative file; configure platform-tolerant EOL checking without mass reformat.
- [ ] If content-path contract changes, write a failing regression test first; then statically scope filesystem access under `content/posts` while preserving traversal/MIME guards.
- [ ] Switch OG route from deprecated Edge runtime to supported Node runtime.
- [ ] Run format check, focused content-image tests, and build; verify both targeted warning classes are absent; commit.

### Task 7: CI, safe dependency refresh, README

**Files:** `.github/workflows/ci.yml`, `package-lock.json`/package metadata within declared ranges, `README.md`.

- [ ] Add `format:check` and `untranslated` CI steps and remove stale hard-coded test-count commentary.
- [ ] Run `npm update` without force/major migrations; run `npm audit` and keep zero vulnerabilities.
- [ ] Refresh README for Builder's Ledger, projects/graveyard/blog/hire/studio/play, Keystatic, SEO/LLM endpoints, analytics, and full verification commands.
- [ ] Run typecheck, lint, tests, hero verification, untranslated, format check, audit, and build; commit.

### Task 8: Final scope and regression audit

**Files:** review all changed files.

- [ ] Compare `content/projects.json` slugs with `main`; prove `juicebar` is the only addition.
- [ ] Run `git diff --check` and inspect the branch diff for secrets, generated junk, unrelated additions, or fabricated evidence.
- [ ] Re-run the complete verification suite from the final branch state.
- [ ] Record evidence and prepare branch integration.
