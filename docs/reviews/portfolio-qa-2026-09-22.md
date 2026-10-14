# Portfolio implementation and QA record — 2026-09-22 (Pacific Time)

## Result

Implementation and local automated verification completed. **Not committed, pushed or deployed.** GitHub CI was configured and its YAML parsed; no remote CI run was claimed. Human visual approval and physical-device acceptance remain pending.

Working branch: `fix/positioning-alignment-2026-09`.
Local production-preview source fingerprint: `6d5c4a9c88c92bdc30f58d50a0bf410f6d498d3c028b78df5f3f6e7feeb1fe8c`.
Browser report recorded at `2026-09-23T05:53:35.646Z` (September 22 in Los Angeles).

## Verified changes

- Shared AI-first skill grouping for standard pages and the 3D SkillsSection.
- Corrected résumé CTA background token and mobile project-card badge wrapping.
- Home links to résumé/hire, Studio and every selected project's case study, including private studios.
- Local/preview telemetry no longer requests Vercel-only analytics endpoints or sends production analytics.
- Reviewed evidence manifest pins source commit, normalized text SHA-256, date, numeric measurements and limitations.
- Read-only evidence collection produces ignored review candidates; it never rewrites public content.
- Hire exposes source-linked evidence and the English résumé PDF snapshot date (2026-09-14).
- Persisted browser QA and CI artifact retention replace temporary QA scripts.

## Corrected evidence claims

DevDeck's 1,257 passing tests belonged to historical 1.37.7 validation. The published evidence panel now references the dated 1.37.8 maintenance-candidate record: 1,289 passed, one skip. This is not a newly run DevDeck suite, proof of public release or physical-network acceptance.

citefirst's working README contained 56-question results, but these changes were uncommitted. The collector caught the mismatch against the pinned Git source. Published figures remain the committed 46-question record: recall@5 0.978, MRR@10 0.834. The 56-question figures (0.982 / 0.785) appear only in the private candidate report. Citation-ID validity is not answer correctness.

## Checks

| Check | Result |
| --- | --- |
| TypeScript, ESLint, Prettier | Pass |
| Unit/regression suite | 23 files; 223 passed |
| Evidence and résumé-byte checks | Pass; 2 pinned sources verified |
| Evidence candidates | 1 uncommitted-worktree difference; no automatic publication |
| Bilingual posts | 11/11 pairs |
| Production build | 138/138 generation tasks complete |
| Chromium EN/KO × 1440/390px × dark/light | All 8 combinations pass |
| Console/page/network assertions | Pass for matrix routes; no unexpected errors |
| Résumé CTA contrast | Dark 15.28:1; light 5.47:1 |
| New article and Creator OS routes | HTTP 200 in both languages |
| Served PDF integrity | 3/3 application/pdf responses with expected SHA-256 |
| EN and KO navigation suites | Both pass |
| npm audit | 0 known reported vulnerabilities at check time |
| git diff --check | Pass |

Machine report and eight full-page captures are under `.qa/portfolio/`. Earlier failed origin checks are retained separately. Capturing screenshots and checking geometry/contrast do not amount to human visual acceptance.

## Preview origin finding

The Windows Next.js 16.3.3 preview needed consistent `localhost` binding and request origin. An explicit 127.0.0.1 bind produced an unprefixed-locale rewrite loop. An older preview also existed on port 3100, so isolated final verification used `localhost:3190` and a newly started candidate process. Do not treat the earlier mixed-origin result as a production defect or passing candidate evidence.

## Plane read-back

- FOLIO-33: Done — selection review complete; defer public MingleStage promotion until its own release gates pass.
- FOLIO-34: QA — implementation and automated QA evidence; not public deployment.
- FOLIO-35: Todo, target 2026-12-22 — first review recorded; next review queued, no automation scheduled.
- FOLIO-36: Todo — newly separated public deployment and live résumé/evidence QA.

The QA column's display-order change was not applied. Existing statuses remain in use.

## Remaining release work

Read-only public check: `/en/hire` returned 200 without the new evidence section; `/resume/Sihyeong-Lee-Resume.pdf` returned 404. Review/commit/push/deployment and same-release public URL verification are therefore still needed under FOLIO-36.

The authoritative résumé originals in notebook/hangar were not edited. Their numeric wording needs a separate editorial refresh before regenerating public PDFs. No customer adoption, revenue, production deployment or human approval was invented.
