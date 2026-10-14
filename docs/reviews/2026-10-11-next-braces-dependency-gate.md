# Remaining dependency security gate — 2026-10-11 (America/Los_Angeles)

## Status and scope

The latest compatible maintenance candidate is GitHub draft [PR #33](https://github.com/writingdeveloper/portfolio/pull/33), Next.js **16.4.0** plus synchronized lockfile, `sharp@0.35.5`, `source-map-js@1.2.2`, and `brace-expansion@2.1.7`. GitHub Actions Linux passed `npm ci`, typecheck, lint, format, unit, bilingual parity, hero verification, and build. The only red step is the unchanged strict dependency audit.

## Outstanding advisory

[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) concerns malicious/deeply nested brace glob patterns that could exhaust the JS stack. `npm view braces version` reported **3.0.3** on 2026-10-11; no officially patched version was available. `npm audit --omit=dev --audit-level=high` reported 3 High entries from this dependency group; full `npm audit --audit-level=high` reported 7 High. Grouped alerts are **not necessarily seven independently reachable exploit paths**.

The dependency paths observed in the patched lockfile are:

- `@keystatic/next@5.0.5 → chokidar@3.6.0 → braces@3.0.3` (CMS/tooling, installed via production package).
- `eslint-config-next@16.4.0 → @next/eslint-plugin-next → fast-glob@3.3.1 → micromatch@4.0.8 → braces@3.0.3` (lint/build tooling).

The website uses local file-backed content with a configured Keystatic admin UI. Production access guards exist for `/keystatic` and `/api/keystatic` in local storage mode; **this is a route-level observation, not proof that every vulnerable call path is unreachable**. No arbitrary user-submitted glob pattern was identified in portfolio request handlers during this source review; full security threat modeling remains outstanding.

## Disallowed shortcuts

- Do **not** use `npm audit fix --force` for this dependency: npm offered `@keystatic/next@0.0.6`, a breaking and incompatible downgrade.
- Do **not** claim `npm audit` passed; it did not.
- Do **not** globally disable audits, blindly omit production dependencies, or publish a fabricated patched version.

## Remaining path to release

1. Review advisory against actual input sources and affected internal call sites, including Keystatic import/runtime paths; record threat model and exposure.
2. Seek upstream maintained release or carefully reviewed compatibility-preserving patch/vendor route. Re-run all unit, integration, browser, and clean-CI checks afterward.
3. If no compatible fix becomes available and an earlier release is still required, seek an **explicit, time-limited security risk decision** with reason, scope, mitigation, owner, and expiry. A blanket request for general maintenance is not such acceptance.
4. PR #33 and its stacked portfolio refresh remain draft until gate resolution. Vercel production deployment and public résumé verification are separate FOLIO-36 acceptance.

Plane: FOLIO-45 (dependency gate), FOLIO-36 (actual release).
