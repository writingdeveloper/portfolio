# Portfolio Hardening & QA Implementation Plan

> **For Codex:** Execute task-by-task with TDD. Do not weaken the nonce CSP merely to improve status codes or caching.

**Goal:** Fix the production bugs found in the 2026-08-27 audit, align CMS/content schemas, improve accessibility/performance, clean public-repo operational residue, and re-verify locally, in CI, on Vercel, and in the production browser.

**Architecture:** Keep the existing Next.js 16 App Router + next-intl + nonce CSP architecture. Normalize content at loader boundaries, make the CSP minimally more capable for Troika workers, repair keyboard semantics at the component level, keep Keystatic schema in lockstep with JSON content, and treat larger caching/CSP changes as measured experiments rather than security regressions.

**Tech Stack:** Next.js 16.3.x, React 19, TypeScript, Vitest, Playwright/Chrome, Keystatic, Three/R3F/Drei, Vercel.

---

### Task 1: Normalize MDX dates at the content boundary

**Files:**
- Modify: `src/lib/mdx.ts`
- Test: `src/lib/__tests__/mdx.test.ts`
- Test: `src/lib/__tests__/post-project-links.test.ts`

1. Add failing tests proving every KO/EN `publishedAt` is a canonical `YYYY-MM-DD` string and a Date-valued frontmatter field normalizes correctly.
2. Add a small date normalization helper and use it for `publishedAt` and optional `updatedAt`.
3. Re-run focused tests and verify the related-post ordering contract remains stable.
4. Commit.

### Task 2: Allow the Play text worker without weakening script CSP

**Files:**
- Modify: `src/proxy.ts`
- Test: security/proxy test file (create if needed)

1. Add a failing policy test for `worker-src 'self' blob:` and for no `blob:`/`unsafe-inline` expansion in `script-src`.
2. Add the worker directive only.
3. Re-run focused tests.
4. Commit.

### Task 3: Repair accessibility regressions

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/LanguageToggle.tsx`
- Modify: `src/components/projects/ProjectCard.tsx`
- Modify: `src/app/[locale]/play/PlayClient.tsx`
- Modify: `src/app/globals.css`
- Tests: layout/source/contrast regression tests

1. Add regression tests for focus restoration, accessible-name composition, a main landmark in immersive Play, and WCAG-AA token contrast.
2. Restore focus to the mobile menu trigger on Escape.
3. Include visible locale text in the language button's accessible name; let the Play badge expose its actual visible label.
4. Give the interactive Play overlay a main landmark while preserving the no-WebGL semantic fallback.
5. Raise meaningful muted/dim tokens to >=4.5:1 against the backgrounds where they are used.
6. Run unit tests, then production browser keyboard QA and Lighthouse accessibility.
7. Commit.

### Task 4: Bring Keystatic schemas up to the real content model

**Files:**
- Modify: `keystatic.config.ts`
- Test: add schema drift test

1. Add a failing drift test based on real `projects.json`/`graveyard.json` fields.
2. Add project fields: `playStore`, screenshot/image + bilingual alt, `updatedAt`, `succeeds`, bilingual `caseStudy` object.
3. Add tombstone `supersededBy`.
4. Verify the config loads and the production OAuth gate remains unchanged.
5. Commit.

### Task 5: Apply measured performance improvements

**Files:**
- Inspect/modify: `src/app/[locale]/layout.tsx`
- Inspect/modify: `src/components/analytics/GoogleAnalytics.tsx`
- Inspect/modify: `src/components/analytics/GoogleAdSense.tsx`
- Possibly add: `src/app/[locale]/blog/layout.tsx`
- Inspect/modify font setup only when an experiment demonstrates benefit.

1. Capture local production resource/Lighthouse baseline after functional fixes.
2. Keep GA site-wide if analytics coverage is useful, but move non-critical third-party loading later where tracking semantics remain correct.
3. Scope AdSense to content surfaces rather than portfolio/hire/play surfaces if browser QA confirms account/site review and blog ads still load.
4. Test font-family/preload changes experimentally; merge only if network/Lighthouse improves without visible font/layout regression.
5. Commit only measured improvements.

### Task 6: Evaluate strict-CSP static caching / soft-404 alternatives

**Files:** experimental only unless proven safe.

1. Verify current Next 16.3.x SRI/static-CSP capabilities using installed package/current official guidance.
2. Build a throwaway experiment without weakening `script-src`.
3. If static pages hydrate under strict CSP, retain the architecture and verify true 404 + caching. If not, revert the experiment and document the blocker.
4. Separately test whether proxy pre-validation can return a styled/real 404 for unknown project/blog slugs without weakening CSP. Keep only if robust and maintainable.

### Task 7: Public-repo hygiene and canonical links

**Files:**
- Modify: `.gitignore`
- Remove from tracking: `.claude/settings.local.json`
- Modify comments/docs with unnecessary operational account identifiers
- Modify: `content/projects.json` (Argus canonical URL)

1. Remove only operational/local residue; keep intentional public contact information.
2. Update Argus to its canonical domain.
3. Re-run secret-like pattern scan and external-link checks.
4. Commit.

### Task 8: Dependency maintenance in isolated, reversible steps

1. Run `npm outdated` and query stable versions.
2. Apply safe patch/minor updates first; run full verification.
3. Evaluate ESLint/Keystatic/TypeScript majors separately. Keep only migrations supported by the current Next/tooling ecosystem and passing all QA; revert incompatible upgrades rather than papering over them.
4. Check whether the R3F/Three combination removes the upstream `THREE.Clock` warning.
5. Commit successful maintenance separately.

### Task 9: Full verification, merge, deploy, production QA

1. `npm run type-check`
2. `npm run lint`
3. `npm run format:check`
4. `npm test`
5. `npm run untranslated`
6. `npm run verify:hero -- public/images/posts/*.webp`
7. `npm audit --audit-level=high`
8. `npm run build`
9. Start the production build locally and run desktop/mobile browser QA, keyboard QA, internal-link crawl, CSP console/error capture, metadata/date checks, image/overflow checks.
10. Run Lighthouse on home/projects/article/play and compare accessibility/performance to the audit baseline.
11. Fast-forward merge to `main`, push, wait for GitHub Actions + Vercel success.
12. Re-run production endpoint/browser/metadata/CSP QA and confirm `main == origin/main`, clean tree.
