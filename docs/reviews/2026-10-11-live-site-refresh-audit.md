# WritingDeveloper live-site and project refresh audit — 2026-10-11 PT

Status: **reviewed findings; implementation/release not approved by this document**. Existing uncommitted changes must be preserved. No claim that public deployment, visual acceptance, or Plane issue mutation has occurred.

## Sources inspected

- Live https://writingdeveloper.blog/ and public routes, HTTP response headers, GitHub repository / Actions.
- 4080 MAIN: `Documents/GitHub/portfolio`, selected adjacent repositories and their current README/Git states.
- Notebook (SIHYEONG-4080): selected creator-learning-os, studios, google-video-lab, music-mv-studio, soursea-site and hangar repositories.
- The existing Portfolio execution guide, 2026-09-22 source/evidence QA review and FOLIO workflow.

## Verified production facts

- Public response: HTTP 200; `Server: Vercel`, Next.js routing. **This does not establish Notebook as the HTTP serving host.**
- `/en`, `/ko`, both Hire pages, Studio, Projects, Blog, Play, sitemap, robots, llms.txt: HTTP 200.
- `/resume/Sihyeong-Lee-Resume.pdf`: **HTTP 404** on live at this review. The separate 4080 working tree has three dated PDF snapshots and a checksum manifest; this is a deployment/release discrepancy, not an automatically approved document publication.
- Observed response bodies without compression negotiation: `/en/projects` about 509 KB; `/en/play` about 273 KB; `/en` about 129 KB. These are **not** Lighthouse/Web Vitals measurements. Investigate streaming/server payload and client behavior before optimizing.
- Latest GitHub main observed: `689354e` (2026-09-27). Local MAIN working branch `fix/positioning-alignment-2026-09` has 36 modified/untracked paths; preserve it.
- Live indexed blog section exposes latest highlighted article dated 2026-08-27. The working tree contains an unpublished bilingual agent-engineering article; publication requires editorial and factual QA.

## Verified quality/CI findings

- Existing 4080 worktree (before any new edits here): TypeScript, ESLint, Prettier, 224 Vitest tests, evidence manifest/checksums, translation parity, and `next build` all passed on 2026-10-11.
- Open GitHub PR [#32](https://github.com/writingdeveloper/portfolio/pull/32) attempted Next.js 16.3.8 but [GitHub CI run](https://github.com/writingdeveloper/portfolio/actions/runs/37216106114) failed in `npm ci` because `yaml@2.9.1` was missing from package-lock. **No code-test result can be inferred for that PR.**
- Dependency repair is isolated in `../portfolio-security-20261011`, branch `fix/next-security-lockfile-20261011` from GitHub main. Follow the clean-install, type/lint/test, production build and CVE/audit gates before any merge.

## Project evidence and public-content decisions

| Candidate | Source checked | 2026-10-11 interpretation | Public treatment |
| --- | --- | --- | --- |
| Creator Learning OS / Creator OS | Notebook creator-learning-os README, 2026-10-07 commit | Backup restore QA documented; customer OAuth and external launch gates remain | Existing entry: update only with source-backed milestones, not launch claims |
| Studio / Studio Gallery | Notebook studios 2026-10-11 commit, working state | Active five-modality production tooling; substantial uncommitted work | Refresh case study after representative screenshots, privacy and model-output approval |
| MingleStage / CrowdStage | MAIN README and staged release notes | Invitation-pilot, open-signup release gates outstanding | Honor prior FOLIO-33 deferral; do not promote as generally launched |
| RailForge | MAIN local research-first README, many uncommitted changes | Browser railway-game R&D | Draft engineering-log case study, label prototype/research |
| Project STRATA | MAIN Unreal spike README | Exploration-game technical spike, runtime/vertical-slice acceptance open | Blog engineering diary candidate, not shipped flagship |
| OpenMontage Reference Lab | MAIN 2026-10-11 latest commit | Video analysis, generation and face-flicker QA experiments | Private/prototype; do not publish personal media or third-party faces by default |
| Music/MV Studio, YuE2, VOCALOID MCP | Notebook and MAIN READMEs | Audio/music toolchains, work-in-progress licensing/output acceptance | Architecture/lessons only after license and attribution review |
| Google Video Lab | Notebook README, 2026-10-03 benchmark commit | Flow/Veo benchmark with private mirror | Research post candidate with redacted benchmark evidence |
| Soursea LLC site | Notebook soursea-site README, 2026-10-11 commit | Separate corporate website on Cloudflare Worker | Cross-link only where audience and brand are appropriate |

This is a candidate inventory, not a declaration of commercial readiness, users, revenue or successful publication.

## Proposed FOLIO execution mapping (not synced to live issues yet)

1. **P0 — FOLIO-36 continuation:** verify résumé content/approval and deploy reviewed changes; check public PDF MIME/SHA, all locale CTAs, rollback. Keep human review separate.
2. **P0 — new security task (check live FOLIO board for duplicate):** resolve PR #32 broken dependency lock, prove clean `npm ci` and CI, merge with dependency-review gate.
3. **P1 — FOLIO-34 continuation:** reconcile MAIN uncommitted feature/evidence work with GitHub main; review localized article and original résumé snapshots. No force push.
4. **P1 — new curation task:** classify recent projects into shipped/pilot/prototype/private, require dated source screenshot and claim-level evidence before publication.
5. **P1 — new UX task:** review Hire CTA and mobile conversion path; test real public endpoints and email links with browser.
6. **P2 — new performance/SEO task:** profile projects page payload, font preloads, image priority, structured data, crawlability; record baseline and after metrics, avoid speculative LCP claims.
7. **P2 — FOLIO-35:** preserve next 2026-12-22 AI positioning review; no automatic market claim.

## Release guardrails

Keep changes in isolated branches; do not force-push, expose secrets, auto-publish resumes, launch an invitation pilot as public, or overstate AI/quality metrics. Require immutable source evidence, automated QA, human visual review, physical-device review where applicable, production verification and rollback separately.

## Plane synchronization state

Existing workspace `soursea`, project `FOLIO` confirmed by prior registry / repo guide. The project registry was refreshed on the MAIN PC; **issue-level live read/write was not confirmed in this pass**. This report is a source-of-evidence handoff, not a substitute for writing/updating the Plane work items.

## Same-day security implementation addendum (2026-10-11 PT)

- Isolated from the 36 pre-existing local WIP paths: `C:\\Users\\SIHYEONG\\Documents\\GitHub\\portfolio-security-20261011`.
- Implemented Next.js 16.4.0 + synchronized npm lockfile. Resolved earlier GitHub Dependabot #32 failure due to missing `yaml` lock entry. Applied compatible transitive patches via `npm audit fix` **without** `--force`.
- GitHub branch `fix/next-security-lockfile-20261011`, commit `bbd749b` pushed.
- Opened **draft** PR [#33](https://github.com/writingdeveloper/portfolio/pull/33), not merged/deployed.
- Verified clean `npm ci` on original security candidate; final repaired lock `npm ci --dry-run` PASS; types, lint, formatting, 197 tests (21 files), i18n parity, production build and `git diff --check` all PASS. This branch starts from public GitHub main and therefore has fewer tests than 4080's uncommitted WIP 224-test branch.
- `npm audit --omit=dev --audit-level=high` still reports **3 high advisories** from `braces` dependency chains (`@keystatic/next` / `chokidar`, Next ESLint tooling). Complete audit reports 7 high. The suggested `npm audit fix --force` would break Keystatic compatibility, so it was intentionally not used.
- GitHub's security alert on default main requires separate review; this source task does not attest that vulnerabilities are eliminated.
- Pending: GitHub Linux CI on draft PR #33, security exception triage, preview browser QA, review and merge, actual Vercel deployment and live smoke test. Do not confuse successful local `next build` with production release.


## Linux GitHub CI read-back for draft PR #33

- [Run 38195978378](https://github.com/writingdeveloper/portfolio/actions/runs/38195978378): **FAIL overall**, but successful separately: checkout/setup, `npm ci`, type checking, lint, formatting, unit tests, translation parity, hero-image verification and production build.
- Sole failing step: **Audit dependencies**, due to the remaining `braces` advisory (7 High in full dependency audit). That security gate was **not bypassed**; PR remains draft and unmerged.
- This confirms the lockfile/clean-install problem from #32 is resolved in GitHub Linux CI, independently of local Windows checks.

## Live visual first-viewport review (public routes)

Captured actual Chromium screenshots at 2026-10-11 PT, saved under ignored `.qa/portfolio/live-20261011/`:

- `desktop.png`: `/en` at 1440×900.
- `mobile.png`: `/` at 390×844 (Korean).
- `hire-mobile.png`: `/en/hire` at 390×844.
- `projects-desktop.png`: `/en/projects` at 1440×900.

**Observations (review candidates, not measured conversion or accessibility failures):**

1. The brutalist/dark editorial visual identity is consistent, readable and distinctive. Preserve it instead of redesigning indiscriminately.
2. English desktop home first viewport is almost entirely the large typographic hero with major open space to the right; no clearly visible work/evidence/contact CTA above fold. Consider a concise featured proof or CTA with A/B and mobile review, without diluting the visual theme.
3. Korean mobile home exposes six tightly spaced textual nav targets across the top; English mobile Hire uses a hamburger/settings language header. Review route-consistent small-screen navigation and actual interactive target geometry against WCAG; screenshots alone do not establish failure.
4. English mobile Hire presents full-time positioning and explanatory text first. The résumé/contact action is not visible in the initial 390×844 viewport. Ensure at least one unambiguous, functional contact/resume CTA is reachable promptly and the public PDF path returns 200 with reviewed content before surfacing the link.
5. Projects desktop selected-work cards have very dense multi-paragraph copy and stacks of skill tags; Studio card lacks a visible screenshot compared to DevDeck. Propose concise 2–3-line outcomes plus scannable evidence/roles/status, with expandable case-study detail. Do **not** invent production scale, release status, or adoption.

No full-page/mobile interaction or physical-device acceptance is asserted by this static viewport review. Browser screenshots were taken from **public Vercel production**; local uncommitted visual changes were not used.

## Follow-up implementation — 2026-10-11 21:45 PT

This continued user-approved maintenance pass is staged, **not yet deployed**. Public site remains the earlier Vercel release.

### Live Plane (confirmed via authenticated REST)
- Read 44 pre-existing FOLIO work items, including FOLIO-34 QA, FOLIO-35 Todo and FOLIO-36 Todo.
- Created FOLIO-45 urgent/In Progress for the strict security audit and Next release, FOLIO-46 high/Todo for source-backed project curation, FOLIO-47 high/Todo for Hiring UX and FOLIO-48 medium/Todo for measured performance/SEO.
- Added source QA/release read-back comments to FOLIO-34 and FOLIO-36. Do not mark release Done before production evidence exists.

### Source integration
- Preserved the original `portfolio` checkout and all 36 modified/untracked paths. Created a separate `portfolio-reconcile-20261011` Git worktree, branch `feat/reconcile-evidence-20261011`.
- Snapshotted evidence/resume work from WIP and merged current public GitHub main `689354e`. Five content/test conflicts were manually reconciled, preserving the AI/agent engineering identity and the later paid-work-oriented Hire case studies, with remote-first and LA hybrid/on-site eligibility accurately stated.
- The project ledger now has 48 entries after adding **RailForge, Project STRATA, Music / MV Studio** as `building` / `private` research and development; bilingual evidence sections clearly decline a shipped/public claim. Existing selected-work and project release labels were left intact.
- Hero positions early résumé/portfolio/AI-pipeline links within the first viewport while retaining the editorial visual identity. The Hire first viewport has contact email and résumé options. Mobile home navigation targets are given a min-height. Project listing card copy and ProjectList JSON-LD use bounded, non-destructive excerpts; full technical details remain on linked case-study pages.
- Added browser acceptance for visible Hire contact button/anchor in each viewport; added tests for guarded summary behavior and private-prototype classification.
- Integrated security branch `fix/next-security-lockfile-20261011` (Next.js 16.4.0 + compatible transitive patches) into the candidate, so the final release candidate does not regress to the older vulnerable Next.js.

### Verification (progressively confirmed, do not conflate versions)
- **Before integrating Next.js 16.4.0**, the reconciled Next 16.3.3 branch passed 226 Vitest tests, TypeScript, ESLint, Prettier, evidence/PDF hashes, translations and production build. Chromium QA passed EN/KO × 1440/390 × dark/light, three versioned PDF byte hashes, and both locale navigation suites. Local candidate /en/projects/railforge, /project-strata and /music-mv-studio returned HTTP 200. Real first-viewport desktop and mobile screenshots were reviewed and CTA placement looked correct. All previews stayed loopback-only.
- The fresh Next 16.4.0 build, security audit, updated browser acceptance and production recheck are a **separate** final gate. The upstream `braces` high vulnerability is still unresolved; see `2026-10-11-next-braces-dependency-gate.md`.
## Final localhost candidate QA — 2026-10-11 21:51 PT

- The isolated candidate merged Next.js 16.4.0 and its compatible dependency patches from draft PR #33. Clean npm installation succeeded.
- Current source: TypeScript, ESLint, Prettier, 228 unit tests (23 suites), evidence/PDF checks and bilingual posts (11/11) PASS. Optimized build PASS (148 prerender tasks).
- Chromium review on Next.js 16.4.0: all eight EN/KO × 1440/390 × light/dark combinations PASS. All three résumé PDFs have valid MIME type and exact expected SHA-256. New prototype case-study links respond HTTP 200; no unexpected browser errors.
- Bounded project excerpts are rendered in catalogue cards and summary JSON-LD; full technical copy stays on detail pages.
- One read-only lab snapshot at `.qa/portfolio/performance-20261011.json`: /en/projects public decoded HTML 509,187 bytes; localhost candidate 484,503 bytes. Public compressed document transfer about 47 KB vs local about 66 KB because origins and compression differ. These are **different content versions and server environments**, not comparable Core Web Vitals, controlled A/B, or proof of deployed speed gains. The lab sampled TTFB/FCP/LCP; tested views had no horizontal overflow.
- STRICT dependency audit still fails on the unpatched braces advisory. PR #33 remains draft, and Vercel production has not been updated. Preserve release gate FOLIO-36.
