# Resume PDF availability hotfix — source and editorial gate (2026-10-13 PT)

**Branch**: `fix/resume-public-404-20261013`, created from public `origin/main` without altering either ongoing portfolio PR #33 / #34 or the original dirty MAIN portfolio working tree. No package version or security-gate changes.

## Public issue

As checked 2026-10-13 and again 2026-10-13 evening, all three expected public résumé filenames returned HTTP 404. Public GitHub main did not ship these files *or any Hire-page PDF download buttons*. The complete next-version branch had already prepared three dated and byte-verified PDF candidates, but their inclusion in an unmerged, security-blocked PR does not make them publicly accessible.

This independent hotfix restores the expected static paths in `public/resume/`, adds three clearly labeled and keyboard-accessible EN/KO PDF download buttons to the Hire header, and adds a **non-optional** CI step verifying each static file exists, begins with `%PDF-`, matches its recorded SHA-256, is plausibly sized and is referenced from Hire.

The PDFs are copied byte-for-byte from the evidence-validated candidate. They were generated Sep 22, 2026, are **two pages each**, unencrypted, and were rendered and examined. Their visible contents do not include a home address, SSN, date of birth, EIN or unrelated private account identifiers. They do contain a personal contact email and career details intended for public résumé distribution.

| File | Bytes | SHA-256 |
|---|---:|---|
| Sihyeong-Lee-Resume.pdf | 87672 | ab4933e15c7516cf455d0547daf4ba4b766c8d1d06a4fddfd8b4ab50a28b6b64 |
| Sihyeong-Lee-Resume-DevEx.pdf | 84927 | 9850dc45ed639d0e0998876ea2983bd3ee092c6f88ff45d3a62a9f30f3c4449f |
| Sihyeong-Lee-Resume-FDE.pdf | 88049 | 406ab1da5b66058b831530ad3b99d46a4299586207a586665e7aba5db9919350 |

## Public-content editorial approval still needed before merge

These are factual claims, not automatically established by `npm test`:
- Founder's legal employer/title/date (Soursea LLC: Nov 2025–present).
- CTO company/date timeline (Bitnara/ITEMBOX: Jun 2024–Oct 2025; GEOMEC: Feb 2021–May 2024), team size, service/module/endpoints counts and billing claims.
- DevDeck published-ci test count is a **historical 1,257** in the PDF. Reconcile with current public release vs unreleased 1.37.8 candidate rather than presenting an old number as today's passing CI count.
- Role-specific positioning, citizenship/work authorization phrasing, availability, LinkedIn/email and project release status.
- Pdf text URLs are ordinary printed strings; PDF-level clickable annotations were not present in the inspected sources. Do not falsely claim the PDF itself provides working embedded clickable links.

The owner or authorized editor must approve the **exact 3 PDF contents** before a public production merge. This PR is a draft review candidate and does not constitute approval. If a correction is requested, regenerate the exact affected PDF, update SHA-256 in `scripts/check-resume-assets.mjs`, rerender and repeat release QA.

## Acceptance / rollback

1. `npm ci`, `node scripts/check-resume-assets.mjs`, type/lint/format/unit/translation/build must pass without relaxing `npm audit`.
2. GitHub Linux CI and Vercel preview: inspect EN/KO Hire first viewport and three PDF routes. Confirm public preview HTTP 200 `application/pdf`, page count and **byte-identical SHA-256** to reviewed source.
3. Record exact public-content approval. Confirm security gate for current production baseline separately (this PR changes no dependencies).
4. Merge through normal GitHub review, verify all three public URLs and both Hire CTA links in live production, check source deployment hash. If the deployment creates regression, revert the narrow commit/deployment without changing other production services.
5. Keep FOLIO-51 and FOLIO-36 open until live evidence exists. This doc is a source handoff, not a successful deployment claim.
