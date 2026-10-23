# Security review — dated dev-only exception for GHSA-vfj7-8cjw-p6xm (2026-10-22 PT)

Status: **approved exception**. Approver: repository owner (`writingdeveloper`), in the 2026-10-22 PT working session, choosing option A of the three presented (dated dev-only exception / keep CI red until upstream fixes / remove the Next.js ESLint rules). Expires **2026-12-31** inclusive (UTC). From 2027-01-01 the full audit fails again unless the entry is removed or renewed through a new review.

This is the separately reviewed, time-bounded policy that the [2026-10-13 Keystatic isolation review](2026-10-13-keystatic-chokidar-runtime-isolation.md) required before PR #33 could merge.

## Identity

- Advisory: [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) / CVE-2026-93687, high (CVSS 7.5, CWE-674), published 2026-09-18, last updated 2026-10-02.
- Affected: `braces` <= 3.0.3. No patched release exists: 3.0.3 is the latest published version on 2026-10-22.
- Impact: deeply nested brace patterns under the length limit exhaust the call stack and terminate the Node.js process with an uncaught `RangeError`. Denial of service only; no code execution or data exposure is described.
- Installed copy: `node_modules/braces` 3.0.3, marked `dev: true` in package-lock.json.
- Only path: `eslint-config-next` 16.4.2 → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces`. No current `eslint-config-next` release avoids it; npm's only suggested fix is a semver-major downgrade to 14.2.35.

## Why the risk is acceptable for a bounded period

- `braces` is not in the production dependency graph. The 2026-10-13 Keystatic watcher override removed the runtime copy, and `npm audit --omit=dev --audit-level=high` reports 0 vulnerabilities. That CI step is unchanged and takes no exceptions.
- The copy runs only inside ESLint: local development and the CI lint step. Its inputs are this repository's lint configuration and file globs, not request data. `next build` on Next.js 16 does not run ESLint, so the Vercel build does not load it either.
- Exploiting it requires committing a crafted glob to the repository, and the result is a crashed lint run.
- Keeping CI red is worse: every pull request stays blocked while production remains on Next.js 16.3.3, which is affected by the 2026-10-22 critical Next.js advisories that PR #33 fixes.

## Enforcement

`.github/audit-exceptions.json` records the advisory, package, approver, approval date, expiry and this review. CI's **Audit dependencies** step runs `npm run audit:deps` (`scripts/audit-deps.ts`, logic in `src/lib/audit-gate.ts`, tests in `src/lib/__tests__/audit-gate.test.ts`), which applies the `--audit-level=high` threshold to the full report and fails when:

- any high or critical advisory is not listed;
- a listed advisory has an installed copy that is not `dev: true` (including `devOptional` or a copy missing from the lockfile);
- the listed package differs from the advisory's package;
- the exception has expired, is malformed, or runs longer than 90 days from its approval date;
- `npm audit` returns no report (for example, the registry is unreachable).

Every run prints each excepted advisory as a GitHub Actions warning annotation, and flags an entry that no longer matches any advisory so it can be removed. The 2026-10-13 regression test separately keeps every installed `braces` copy dev-only.

## Verification on 2026-10-22 PT

- `npm run audit:deps`: 0 blocking, 1 excepted (`node_modules/braces`).
- Negative runs, each exit 1: an expired entry (`expired`), an empty exception list (`no-exception`), and an unreachable registry (`audit-error`).
- 21 unit tests cover expiry (inclusive), dev-only checks, per-advisory matching, the severity threshold, stale entries, malformed entries and audit errors.
- GitHub CI evidence is recorded on PR #33 and in Plane FOLIO-45.

## Removal and renewal

- Remove the entry when a fixed `braces` is published or the ESLint chain drops it. The gate warns when the entry no longer matches.
- Renewal needs a new review in `docs/reviews`, a new approval date and an expiry no more than 90 days later.

## Limitations

- The exception accepts a developer-tool denial-of-service risk for a bounded period. It does not make `braces` safe.
- Two moderate `@vitest/mocker` advisories (GHSA-qxg6-89mg-rqv8, GHSA-xp26-3454-mjgp) sit below the threshold and are not covered here. They need a separate `vitest` update.

Plane source of truth: FOLIO-45.
