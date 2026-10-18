# Portfolio MingleStage featured-card dependency security follow-up

2026-10-18 PDT. Candidate: writingdeveloper/portfolio PR #38, branch codex/minglestage-portfolio-launch-20261017.

## Why
MingleStage Early Access case study and genuine optimized 3D venue screenshot are implemented but not public on writingdeveloper.blog. The unrelated existing portfolio build ran every functional step successfully; its pre-existing high/critical npm audit alerts blocked PR #38. Do not represent this as a product runtime issue on minglestage.app.

## Remediation implemented in this isolated PR worktree
- Upgrade Next.js and eslint-config-next to 16.4.2 (previous lock was 16.3.3, inside the critical advisory range).
- Upgrade sharp to 0.35.5 and source-map-js to >=1.2.2.
- Restrict transitive brace-expansion versions under minimatch 3, 9, and 10 to patched minimums without forcing incompatible major versions.
- Fresh npm install updated lockfile, with subsequent npm ci dry-run matching the lockfile.

## Local independent checks on patched worktree
- npm run type-check PASS; npm run lint PASS; npm run format:check PASS; npm test 198/198 PASS.
- Next 16.4.2 production build PASS, all 138 static routes/paths generated. This validates app compilation, NOT exposure safety.
- npm audit --audit-level=high **STILL REPORTS 7 HIGH AND 0 CRITICAL** (previous lock: 10 high and 1 critical). The remaining high findings are @keystatic/next -> chokidar 3 -> braces 3.0.3 and eslint-config-next -> fast-glob -> micromatch -> braces 3.0.3. Installed upstream braces 3.0.3 remains flagged by npm audit, with no safe direct published patch available in the observed dependency range.
- This is a real improvement in a review candidate, NOT zero security findings and NOT a production deployment.

## Follow-up decisions
1. Continue PR #38 security review with the existing Keystatic boundary/retention review on PR #33. A compatibility breaking @keystatic/next downgrade from npm audit fix --force is not acceptable without migration and production QA.
2. Never rewrite or disable the full npm audit gate to make CI pass. A deliberate, documented security-risk exception would be a separate owner decision; no exception is granted by this report.
3. Keep MingleStage marketing's already-published public GitHub profile link and MingleStage landing/guide live while the portfolio PR waits.
4. Do not close PRs #32, #33, #35, #39 or overwrite parallel session worktrees. New integration should reconcile those PRs only after vulnerability and build compatibility review.
