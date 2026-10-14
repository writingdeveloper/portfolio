# WritingDeveloper — production-to-source refresh audit (2026-10-13 PT)

**Scope:** public `https://writingdeveloper.blog`, 4080 MAIN portfolio source and companion projects, Notebook project evidence, GitHub PRs/CI, Soursea FOLIO Plane board.

**Important status:** This document records observations and candidate code changes. **It does not approve or assert a Vercel production deployment**. Current live site serves the earlier release, while the updates live in draft PR #34 stacked on draft security PR #33.

## Priority answer

**Release verified work before adding more projects.** The most expensive present defect is the broken résumé. Second is the unapproved dependency-security update. Third is stale/ambiguous project claims. Shipping ten more experimental projects would not fix the basic ability of a recruiter or customer to verify the work and contact its author.

## 1. Public availability, links and navigation

- Public `/`, `/en`, `/hire`, `/en/hire`, `/projects`, `/en/projects`, Studio, Blog, robots, sitemap and machine-readable pages returned HTTP 200 at review.
- All **three public résumé PDFs returned HTTP 404**:
  - `/resume/Sihyeong-Lee-Resume.pdf`
  - `/resume/Sihyeong-Lee-Resume-DevEx.pdf`
  - `/resume/Sihyeong-Lee-Resume-FDE.pdf`
- The full discovery sweep evaluated **64 raw targets**: 57 HTTP 200, six 404 and one timeout. Three 404s belonged to private GitHub repositories whose source URLs are deliberately not shown as public links. Do **not** call those three customer-visible broken links.
- Permanent `npm run audit:public-links` now filters the public surface: **56 targets, 52 reachable, 3 internal PDF 404, 0 external HTTP errors, 1 inconclusive**. The inconclusive domain is `https://kindling.writingdeveloper.blog`, which timed out on both a Python 11-second read and independent 22-second GET/15-second HEAD. This does **not** establish a permanent shutdown. Recheck origin/DNS/health and stop advertising availability if it remains unreachable.
- Audit report is stored in ignored `.qa/portfolio/public-link-audit-latest.json`. Run `npm run audit:public-links -- --all-projects` for both-locale detail routes as well. It is read-only; internal HTTP 400+ produces a failing exit so it cannot be casually described as green. Externally blocked requests are separately reported as warnings.
- The live sitemap's XML contains 220 `loc` values, **including image URLs and alternate links**. Do not interpret that as 220 unique indexable pages or SEO reach.

## 2. GitHub/release state

- GitHub public `main` continues to serve the older production source. A direct HTTP `Server: Vercel` response establishes Vercel as the public serving layer, not Notebook as the website origin.
- [PR #33](https://github.com/writingdeveloper/portfolio/pull/33) upgrades Next.js and repairs a lockfile; [PR #34](https://github.com/writingdeveloper/portfolio/pull/34) stacks 4080 evidence, localized UX, DevDeck failure case and now the October project corrections on it. Both are **draft, unmerged**.
- Latest observed `npm audit --omit=dev --audit-level=high` remains nonzero, **three High entries**, due to unpatched `braces` inherited via `@keystatic/next → chokidar`. The latest compatible `braces@3.0.3` was **not** an upstream fix. `npm audit fix --force` would downgrade Keystatic incompatibly. Do not globally disable the audit or call those risks accepted without explicit scope, owner and expiry.
- An independent Dependabot [PR #35](https://github.com/writingdeveloper/portfolio/pull/35) was created for `brace-expansion@1.1.21`; its GitHub CI failed in `npm ci`. That is **not** the same `braces` problem and cannot silently unblock #33.
- On the source preview in prior sessions, TypeScript, lint, format, unit tests, images, actual Playwright EN/KO mobile/desktop/light/dark and all three local résumé file hashes have passed. Each new source commit needs its own final CI read-back before release.
- **FOLIO-45** owns security decisions; **FOLIO-36** owns editorial PDF acceptance, merge, Vercel production, rollback and real public link/hash/CTA smoke QA. Neither is Done.

## 3. Content accuracy — what was updated in draft PR #34

| Item | Prior issue | Verified evidence as of this audit | Candidate action |
|---|---|---|---|
| **BRAIN//VAT** | `updatedAt=2026-09-23` and no NPC experiment | Local git `8542136` / `d28291e`, BVAT-37 2026-10-13 public production Chrome desktop/mobile PASS, Node 200/200, deterministic rule guard. Live `/npc` 200 | Date set to Oct 13; descriptions/evidence updated to distinguish a rule-based single NPC from any learned model, LLM or multiplayer engine. Added optimized public-production Chrome screenshot and demo panel |
| **Creator OS product** | Ledger said OAuth unfinished, obscuring restricted public pilot | Notebook `creator-learning-os/docs/qa/2026-10-06-public-activation.md` records real allowed-test-user Google identity + separate YouTube consent, AOP/TLS trust boundary; Oct 8 bounded deterministic report, email and recovery check. `https://creator.writingdeveloper.blog/demo` returns 200 anonymously | Clarified Testing-only external pilot, free public no-login demo, not general paid sign-up nor model-powered generation; date Oct 8 |
| **Creator OS engineering** | Two separate entries looked like two products | Same product, different engineering/release case, with operator gated public pilot | Named `Creator OS — Release Engineering`, explains shared product lineage; not two SaaS companies |
| **Soursea** | Local personal sourcing tool could be mistaken for company product | `soursea-site/docs/FACTS.md` explicitly excludes the personal Electron sourcing tool from Soursea LLC customer catalog | Renamed `Soursea — Personal Sourcing Workspace` and labeled private/noncommercial product |
| **Studio** | Highly technical listing has no updatedAt and no four-field case study; strong model-count wording relies on older tests | Notebook `studios` monorepo README, latest `studios-wt-orbit` worktree and QA backlog document ongoing changes, including test isolation lessons; not yet canonical merged proof | **Do not claim new experimental branch models or results are released.** Stage a dated architecture/QA case study only after checking canonical main, ComfyUI runtime, current 5 modalities and redacted screenshots |
| **MingleStage** | Entirely absent from 48-entry catalogue despite Soursea LLC early access | Live home and `/app/` HTTP 200; company fact ledger calls it Early Access. Prior FOLIO-33 decision expressly deferred a launched case study pending stable anonymous/guest room and media/cross-client proof | Keep **FOLIO-33 gate**; if passes, add `building / early access` with synthetic screenshots, not `launched` or user/revenue metrics |
| **STRATA / RailForge / Music-MV Studio** | Many current uncommitted or research-only efforts | MAIN git `project-strata` 2026-10-06, `railforge` 2026-09-29; Notebook music-mv README. Runtime/vertical slice and H3 binding remain acceptance gates | Keep `building/private`. Update after real accepted gameplay/workflow demonstration, not based on file counts |
| **Other recent code** | Personal OpenMontage/Wan meme, Roblox avatar and private media experiments | MAIN local commits and experiments exist | Do not indiscriminately promote. Publish only with permission, licensing/privacy review and a reproducible technical claim |

## 4. Editorial and information architecture

- There are **48 entries**, of which **36 have no verified `updatedAt`**. This is an evidence gap, not license to fabricate dates. Date only when a dated immutable source or production acceptance exists.
- Retain **five curated selected-work items** to communicate different skills, rather than placing 48 equally above the fold. Strongest evidence-led hooks: DevDeck user-visible state repair; citefirst retrieval denominator and caveat; BRAIN//VAT interactive public verification; Creator OS release gate; Studio after fresh artifact QA.
- If introducing a new post, choose one carefully documented real failure or release decision rather than another AI-framework roundup. Current candidate includes September 22's bilingual agent-ownership blog post; public last highlighted post had been August 27.
- Audit the first-screen Hire conversion path after the final deployment. The public site currently breaks the résumé, which overwhelms improvements to aesthetics and metadata.
- Cross-link `soursea.io` and the individual portfolio with explicit **personal vs LLC** distinction. Do not describe the personal sourcing desktop as a live Soursea product.
- Do not claim model-generated work is a customer outcome. Label deterministic rules and simulated NPCs correctly; distinguish skipped tests, historical QA, local preview and production.
- Public text remains bilingual; invalid localized page links, dead images, 404 PDF CTAs and accessibility regressions should be caught by Playwright.

## 5. Proposed follow-up order and Plane mapping

1. **P0 · FOLIO-45**: resolve/upstream-patch the actual `braces` transitive vulnerability, prove clean Linux/Windows CI. A time-limited explicit security-risk decision is a separate authorization, not assumed.
2. **P0 · FOLIO-36**: owner reviews résumé snapshots and claims; merge #33/#34 through their required gates, deploy to Vercel, verify public HTTP 200/application/pdf/SHA for all three PDF versions plus contact CTA/mobile/EN-KO/rollback.
3. **P1 · FOLIO-51 (new)**: retain repeatable public-link health checks, investigate Kindling origin timeouts and after-release public résumé health. Do not conflate private GitHub 404s with public broken links.
4. **P1 · FOLIO-46**: source-backed project curation, including Oct 13 BRAIN//VAT NPC and Creator OS restricted pilot; next Studio current canonical verification and proof-led case study.
5. **P1 · FOLIO-33**: evaluate MingleStage as a *labelled early-access* case only once real anonymous/guest, media and mobile/cross-client gates pass. Historical pilot notes are not unconditional launch proof.
6. **P2 · FOLIO-48**: capture same-host Lighthouse and performance budgets after preview/production alignment; make projects catalogue lighter and assess proof-card scroll depth. Prior 509 KB public-vs-485 KB local decoded HTML is a noncontrolled comparison, not a field LCP win.
7. **P2 · FOLIO-35/49**: revisit specific target job/contract descriptions and portfolio's real conversion evidence in December. Do not publish vague AI productivity percentages.

No unrelated projects were restarted, the 4080 original WIP checkout remains preserved, and Notebook worktrees were inspected read-only. A source preview build is not live production, and production was not modified by this audit.
## 2026-10-13 same-day verification addendum

### Automated candidate QA

- Next.js 16.4.0 candidate: TypeScript, ESLint, Prettier, 244/244 unit tests across 26 files, evidence checks, all versioned résumé PDF bytes, and 11/11 bilingual posts PASS. Production build PASS with 148/148 static-generation tasks.
- Production-mode preview on localhost: Chromium EN/KO x 1440/390px x dark/light 8/8 PASS, DevDeck historical failure case both locales, BRAIN//VAT NPC screenshot/live link plus its explicit no-trained-policy disclaimer, Creator OS Testing-only restriction and its anonymous public demo in both locales, all 3 local PDFs with correct SHA-256 and MIME.
- The new per-locale NPC/Creator browser probe initially shared a page between locales and produced a stale-language assertion. A fresh Chromium context per locale resolved that QA harness issue without weakening the assertions. Both separately loaded pages contained the correct training limitation.
- Public-link audit against local preview: 56 reachable / 0 broken / 0 uncertain. This is not a claim that public production résumé PDFs are fixed. Production and preview JSON reports are retained separately under ignored .qa/portfolio/.

### Intermittent Kindling response

- Early audit attempts timed out (11-second Python/Node, 22-second GET and 15-second HEAD), but a later independent check of the same external domain returned HTTP 200 in 5.7 seconds. This is intermittent accessibility from the review host, not proof of permanent shutdown. Recheck from a second network before altering the published link.

### Release guard

- The unresolved production braces advisory remains unapproved. Changes are confined to the candidate draft PR, not public production. The current external pilot is Testing-only and the BRAIN//VAT NPC is deterministic, not trained or LLM-driven.
