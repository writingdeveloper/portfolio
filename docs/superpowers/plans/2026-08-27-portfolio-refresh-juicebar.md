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

- [x] Add failing tests for truthful total/public/Play counts, selected-work uniqueness, five exact selected slugs, and locale-aware case-study extraction.
- [x] Run `npm test -- src/lib/__tests__/projects.test.ts`; confirm failure is caused by missing interfaces.
- [x] Implement minimal helpers/constants/types.
- [x] Re-run focused tests; confirm pass.
- [x] Commit.

### Task 2: JuiceBar and selected evidence

**Files:** `content/projects.json`, `public/images/projects/*`, `src/lib/__tests__/projects.test.ts`

**Produces:** exactly one new ledger row (`juicebar`) plus real screenshots/evidence for selected work where available.

- [x] Add a failing integrity test expecting project count 42, `juicebar`, public GitHub/screenshot/case-study fields, and no unexpected new slug.
- [x] Run the focused test; confirm it fails on missing JuiceBar.
- [x] Copy real local screenshots only; add bilingual JuiceBar data and selected-work evidence from repository documentation.
- [x] Add trustworthy `updatedAt` values only where local Git dates resolve confidently.
- [x] Re-run focused tests and commit.

### Task 3: Homepage, project IA, and hire alignment

**Files:** `src/app/[locale]/LedgerHome.tsx`, `src/app/[locale]/projects/page.tsx`, `src/lib/projects.ts`, `messages/ko.json`, `messages/en.json`

**Consumes:** `getPortfolioStats`, `SELECTED_WORK`, `HIRE_CASE_STUDIES`.

- [x] Add failing tests for `HIRE_CASE_STUDIES = ['citefirst','studios','soursea']` and selected/full-ledger partitioning.
- [x] Run focused tests; confirm failure.
- [x] Make homepage stats truthful (`BUILDS`, public/live destinations, Play, Featured), derive hero count, and add `/hire` to primary nav.
- [x] Render `/projects` as Selected Work first, then all remaining projects as Full Ledger without deleting entries.
- [x] Update bilingual labels, run focused tests + typecheck, and commit.

### Task 4: Evidence sections on project details

**Files:** `src/app/[locale]/projects/[slug]/page.tsx`, `src/lib/projects.ts`, `messages/ko.json`, `messages/en.json`, focused tests.

- [x] Add a failing test proving four case-study sections are returned in Problem/Decision/Evidence/Result order and absent for ordinary projects.
- [x] Run focused test; confirm failure.
- [x] Implement a locale-aware helper and render the four sections only when `caseStudy` exists.
- [x] Run focused tests + typecheck and commit.

### Task 5: Newsletter honesty and JuiceBar build note

**Files:** `src/app/[locale]/blog/page.tsx`, `src/components/blog/Newsletter.tsx`, `content/posts/{ko,en}/building-juicebar/index.mdx`

**Produces:** no fake email capture and a bilingual post linked with `project: juicebar`.

- [x] Remove the newsletter import/render path; delete the component if unused.
- [x] Add Korean and English JuiceBar build notes using only repository-documented facts and existing MDX conventions.
- [x] Run `npm run untranslated` plus MDX/post-link tests; resolve schema errors without inventing facts.
- [x] Confirm `grep -R "Newsletter" src/app` returns no public route usage and commit.

### Task 6: Format/build warning root causes

**Files:** `.prettierrc`, `src/app/api/og/route.tsx`, `src/app/api/content-image/[...path]/route.ts`, `src/lib/content-image-path.ts` if needed, `src/lib/__tests__/content-image-path.test.ts`.

- [x] Reproduce Windows `format:check` failure and the Edge Runtime / dynamic filesystem tracing build warnings.
- [x] Test the CRLF hypothesis on a representative file. It was falsified: genuine Prettier differences remained. Normalize the checked source once and configure `endOfLine: auto`; verify a synthetic CRLF copy also passes.
- [x] Preserve the content-path contract and tests; use the existing `outputFileTracingIncludes` plus a Turbopack trace-ignore on the already validated runtime path.
- [x] Switch OG route from deprecated Edge runtime to supported Node runtime.
- [x] Run format check, focused content-image tests, and build; verify both targeted warning classes are absent. Next 16.3.0 exposed an unrelated framework invariant; verify it disappears on the in-range 16.3.3 patch.

### Task 7: CI, safe dependency refresh, README

**Files:** `.github/workflows/ci.yml`, `package-lock.json`/package metadata within declared ranges, `README.md`.

- [x] Add `format:check` and `untranslated` CI steps and remove stale hard-coded test-count commentary.
- [x] Run `npm update` without force/major migrations; run `npm audit` and keep zero vulnerabilities.
- [x] Refresh README for Builder's Ledger, projects/graveyard/blog/hire/studio/play, Keystatic, SEO/LLM endpoints, analytics, and full verification commands.
- [x] Run typecheck, lint, tests, hero verification, untranslated, format check, audit, and build; commit.

### Task 8: Final scope and regression audit

**Files:** review all changed files.

- [x] Compare `content/projects.json` slugs with `main`; prove `juicebar` is the only addition.
- [x] Run `git diff --check` and inspect the branch diff for secrets, generated junk, unrelated additions, or fabricated evidence.
- [x] Re-run the complete verification suite from the final branch state.
- [x] Record evidence and prepare branch integration.


## Final QA evidence

- Scope audit: project ledger changed from 41 to 42 entries; `juicebar` is the only added slug and no slug was removed.
- Automated QA: type-check, ESLint, Prettier, 180/180 Vitest tests, 10/10 bilingual post parity, 8/8 hero verification, `npm audit` with 0 vulnerabilities, and Next.js production build all pass.
- Build output: 134/134 static generation completed on Next.js 16.3.3, with no deprecated Edge Runtime warning, dynamic filesystem whole-project tracing warning, or `workStore` invariant.
- Browser user QA: 20 Korean/English desktop/mobile page checks at 1440px and 390px, plus 131 discovered same-origin links. Zero horizontal overflow, broken images, application `pageerror`s, or internal non-vendor HTTP errors.
- QA-driven fix: the first browser pass showed the homepage Selected Work cards were still text-only. Featured cards now render all five real project screenshots and the second pass reports 5/5 images.
- Local-only note: Vercel Analytics/Speed Insights endpoints return 404 under plain `next start` outside Vercel; these vendor endpoints were excluded from internal-app HTTP failure criteria because they exist in the Vercel runtime, not the local Next server.
