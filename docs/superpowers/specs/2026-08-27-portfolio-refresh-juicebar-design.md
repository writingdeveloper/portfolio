# Portfolio Refresh + JuiceBar Design

**Date:** 2026-08-27

## Goal

Refresh the portfolio around truthful evidence and hiring conversion while adding exactly one new project: **JuiceBar**. No other repository is added to `content/projects.json` in this change.

## Scope constraints

- Add JuiceBar and only JuiceBar as a new ledger project.
- Keep `ai-terrarium`, `cokacremote`, Learning Art, vtuber-lab, and every other unlisted repo out of the ledger for now.
- Do not turn the site into a new visual design system. Preserve the existing Builder's Ledger look and current i18n structure.
- Prefer evidence already present in local repositories over invented claims.
- Keep Korean and English surfaces in parity.

## 1. Ledger truth and homepage conversion

The homepage currently labels `projects.length` as `SHIPPED`, although the ledger contains projects with `building` status. Replace the misleading stat with a truthful vocabulary derived from project data: total builds, publicly open destinations, Play Store listings, and featured work. Add `/hire` to the immersive homepage navigation so the existing hire page is reachable from the primary landing surface.

The hero sentence must not hard-code a stale count such as "30+" when the ledger already derives counts elsewhere. Use the current total dynamically.

## 2. JuiceBar

Add JuiceBar as a public, active Windows desktop/tool project using facts from the local `JuiceBar` repository. Link its GitHub repository/release surface, use a real screenshot from that repository, and describe the engineering problem honestly: component-level sensor readings, modeled unmeasured draw, calibration, tariff modeling, and a tray UI that translates power into billing-cycle cost.

JuiceBar is selected work because it adds a systems/desktop engineering axis that is currently underrepresented.

## 3. Selected work and project information architecture

Reduce featured work to five complementary projects:

1. `soursea` — long-running product/business ownership
2. `citefirst` — RAG retrieval evaluation and citation verification
3. `juicebar` — Windows/system instrumentation and modeling
4. `devdeck` — developer tooling / agent orchestration
5. `unclog-la` — public-data modeling and interactive simulation

`/projects` should show these as **Selected Work**, then the remaining projects as a **Full Ledger** so first-time visitors are not asked to interpret 40+ equal-weight cards. The full ledger remains complete; nothing existing is deleted merely to improve presentation.

Use real screenshots for featured projects where local evidence exists. Do not generate fabricated product UI.

## 4. Evidence-oriented project detail pages

Extend the project model with an optional bilingual case-study object for selected work. Render four concise evidence sections on project detail pages when present:

- Problem
- Decision
- Evidence
- Result

Populate these only where the repository provides enough evidence. Existing projects without this object keep their current detail layout.

## 5. Hire page alignment

Change the three hire case studies to `citefirst`, `studios`, and `soursea`. Together they match the work the page actually offers: RAG/AI integration, MCP/generative pipelines, and end-to-end product ownership. Keep the derived public-product and Play Store counts.

## 6. Newsletter honesty

The current newsletter form accepts an email but stores nothing. Remove the non-functional email form from the public blog page rather than pretending a subscription occurred. Do not add a third-party newsletter service in this change.

## 7. Content freshness

Add an optional `updatedAt` field to project data/types for future freshness automation. Populate it for JuiceBar and for selected work where a trustworthy local Git commit date is available. Do not fabricate dates for repositories that cannot be resolved confidently.

Add a bilingual JuiceBar build note to the blog if it can be sourced entirely from the repository's existing technical documentation without inventing metrics. Link it to the JuiceBar project via existing project/post linkage.

## 8. Build, formatting, and CI health

- Fix the Windows `format:check` failure without mass-reformatting unrelated files. The root cause is CRLF checkout behavior (`core.autocrlf=true`) combined with Prettier's default LF expectation; make the check platform-tolerant.
- Add `format:check` and `untranslated` to CI after the format check is reliable.
- Update stale CI commentary that claims 119 tests.
- Remove Next.js 16.3's deprecated Edge Runtime warning from the OG route by using the supported Node runtime, verifying OG behavior still builds.
- Remove Turbopack's whole-project dynamic filesystem tracing warning from the content-image route without breaking its path-traversal and MIME guards.

## 9. Dependencies

Update dependencies only within the currently declared semver ranges (`npm update`). Do not take major-version migrations such as TypeScript 7, ESLint 10, Shiki 4, Keystatic 0.6, or Vercel Analytics 2 in this change. The acceptance gate is zero npm audit vulnerabilities plus the full test/build suite.

## 10. Documentation

Refresh `README.md` to reflect the current site: Builder's Ledger, projects, graveyard, bilingual blog, hire page, studio showcase, 3D play surface, Keystatic, SEO/LLM endpoints, analytics, and CI. Keep it concise and operational rather than turning it into marketing copy.

## Acceptance criteria

- Exactly one new project slug exists: `juicebar`.
- Homepage no longer calls all ledger entries shipped and links to `/hire`.
- `/projects` clearly separates five selected projects from the full ledger.
- Selected case studies render evidence sections where data exists.
- Hire page case studies align with RAG/MCP/product work.
- Blog page no longer shows a fake email capture form.
- `format:check`, `untranslated`, lint, typecheck, tests, hero verification, audit, and production build all pass.
- Production build no longer emits the Edge Runtime deprecation or whole-project dynamic filesystem tracing warnings targeted by this change.
- README describes the current product surface.
