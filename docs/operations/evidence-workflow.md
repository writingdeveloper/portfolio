# Evidence workflow

Plane Portfolio (FOLIO) is the execution source of truth. Source code and decision/evidence documents live here; local files are not a second task-status database.

## Public facts versus collection

- `content/evidence.json`: reviewed source snapshots with version/date/scope, pinned commit and SHA-256.
- `npm run evidence:check`: checks publication metadata, display/measurement consistency, résumé manifest and exact PDF bytes. Offline/CI safe.
- `npm run evidence:collect`: reads only allowlisted DevDeck/citefirst documents, verifies pinned blobs, reports later committed and uncommitted worktree candidates into ignored `.qa/evidence-candidates.json`. **Public content is never modified.**
- `npm run evidence:verify`: verifies pinned source bytes and parsed measurements against local repositories. Set `PORTFOLIO_SOURCE_ROOT` to their parent when they are not siblings.
- `npm run evidence:check -- --require-current-review`: also fails after the review deadline. Elapsed time does not change a historical measurement.

The collector does not run providers, source-repository tests, Git pushes or deployment. Its parsers fail on unknown upstream formats. Before accepting a candidate, inspect raw runs, version, sample denominator, skipped cases and method, then edit the public manifest in a reviewed change. A source check is not human visual approval.

## Verification and release

1. Run type/lint/unit/format/evidence checks and build production assets.
2. Start production preview: `npm start -- -p 3100 -H localhost`.
3. Run `npm run qa:portfolio` and both locales of `qa:navigation`. `QA_BASE_URL` selects another preview; no live account is needed.
4. Preserve `.qa/portfolio/report.json` and screenshots. Its source fingerprint includes uncommitted source files.
5. Report automated QA, image review, production deployment and physical-device testing separately. A captured image is not human approval. A passing source build is not public deployment.

Vercel analytics endpoints load only on a Vercel production deployment at the canonical public host. Third-party telemetry stays off on local/Tailnet previews. A public self-host may opt in with `PORTFOLIO_ENABLE_TELEMETRY=1`; this does not load Vercel-only endpoints.

Public résumé PDFs remain a byte-verified **2026-09-14 document snapshot**. Their historical DevDeck numeric wording should be refreshed through the notebook-first hangar workflow. A portfolio collector must not silently rewrite authoritative job-search documents.

### Local origin constraint

On the checked Next.js 16.3.3 Windows build, a server explicitly bound to 127.0.0.1 rewrote Korean paths through a localhost origin and entered a self-redirect loop. An initial localhost probe reached an older preview on that port, so that result was not accepted as candidate evidence. On a fresh, isolated port, **both binding and requests set to localhost** returned 200 for EN/KO routes. Browser scripts, CI startup and probes therefore consistently use localhost, which remains loopback-only. This is a local preview configuration finding; the review does not claim a production redirect defect.
