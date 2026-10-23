# Security review — Keystatic watcher dependency isolation (2026-10-13 PT)

Source: isolated 4080 MAIN worktree `portfolio-security-chokidar4-20261013` branched from security PR #33 / `bbd749b`. No production deployment or risk exception is approved.

## What changed

Keystatic's latest Next adapter (`@keystatic/next@5.0.5`) declares `chokidar@^3.5.3`, bringing `braces@3.0.3` into the **installed production dependency graph**. npm reports GHSA-vfj7-8cjw-p6xm (high, stack-exhaustion via deeply nested brace patterns), with no patched upstream braces release as of Oct 13.

An explicitly scoped npm override now resolves **only** `@keystatic/next → chokidar` to Chokidar **4.0.3**. Chokidar 4 does not depend on `braces`. Both package lock and independently run audits confirm `braces@3.0.3` exists *only* in development, pulled by `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch`.

This is a real reduction in production package exposure, **not a vulnerability exception or silent suppression**:
- `npm audit --omit=dev --audit-level=high`: **0 vulnerabilities / exit 0** after the override, previously three High from Keystatic/Chokidar.
- `npm audit --audit-level=high`: **FAIL, five High** in development tools because `braces@3.0.3` is still present for ESLint. No compatible official patched release or replacement was validated.
- GitHub CI now has two independent gates: **Audit production dependencies** and the existing unchanged **Audit dependencies**. The strict full-audit gate remains red until a real fix or separately and explicitly reviewed time-bounded policy.

## Compatibility observations

The override crosses a declared semver-major boundary (`^3.5.3` → 4.0.3). It is therefore treated as a reviewed compatibility experiment, **not** claimed to have Keystatic vendor support.

Source inspection of `@keystatic/next/dist/keystatic-next-api.js` finds its lazy `require('chokidar')` inside a **development-only** legacy reader-refresh watcher path. The legacy call is `watch(directories, {ignored: [/node_modules/]})`, not a glob pattern. The active Next App Router route uses `makeRouteHandler`, not this legacy Node/Pages adapter.

Observed tests on the isolated worktree with clean `npm ci`:
- npm lockfile assertions for Chokidar 4 and `braces.dev=true`, and production-disabled Keystatic guard: four added regression tests PASS.
- TypeScript, ESLint, Prettier, total **201/201 unit tests** and Next.js 16.4.0 optimized production build: PASS.
- The exact Keystatic-compatible watcher call with a temporary directory and a real new file: `ready` + `add` events PASS; the temporary directory was removed.
- Local **development-mode** `http://localhost:3199/keystatic`: HTTP 200, real dashboard loaded with 10 Korean + 10 English post entries and project/category controls, no JavaScript page errors.
- **Production-mode** `http://localhost:3198/keystatic`, `/api/keystatic/posts`, `/api/keystatic/reader-refresh/test`: all HTTP 404 with no GitHub storage configured. Home and English home HTTP 200, `/api/og?title=QA` HTTP 200 PNG.

Limitations: a full CMS create/edit/save workflow was **not** exercised (would mutate test content); no authenticated GitHub-storage OAuth mode was tested. These remain separate acceptances if the CMS is to be enabled in production. Do not infer that all independent `braces` uses are absent: it is still in developer tooling.

## Existing production baseline and release decisions

GitHub Dependabot `#82` flagged Next.js 16.3.3 Critical ImageResponse RCE; other default branch alerts `#84/#85/#86` concern `brace-expansion`. Draft security PR #33's Next.js 16.4.0 + transitive patches address those older vulnerable versions, but remain unmerged.

The public site currently uses `ImageResponse` and user-supplied title/description as **div text** under 120/200-character clamps, rather than directly supplying attacker-controlled SVG markup/attributes. The critical advisory specifies that SVG-controlled inputs are affected. This suggests a narrower exposure but is **not** proof of safety across all Next.js advisories or reasons to leave its version outdated.

Official references:
- https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
- https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j

## Remaining gates

1. Keep PR #33 draft until Linux CI and review results are recorded; keep the strict full dependency audit red.
2. Review any separately proposed temporary dev-only GHSA-vfj7-8cjw-p6xm exception with explicit identity, expiry, approver, mitigation and continuous visible audit. **This document is NOT that approval**.
3. If no exception is authorized, investigate a compatible lint dependency replacement or wait for upstream advisory/fix, without global audit bypasses, and do not merge.
4. After security PR passes/gets approved, rebase/merge its changes into staged portfolio PR #34; resolve overlapping three PDF files/CTAs with separate draft PR #37 through explicit editorial approval; verify live Vercel routes, PDF SHA, both locales, canary and rollback in FOLIO-36.

Plane source of truth: FOLIO-45 security / FOLIO-36 release / FOLIO-51 résumé availability.
