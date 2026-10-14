# DevDeck incident reconstruction — UI convergence after a remote rename

Reviewed: 2026-10-12 (America/Los_Angeles)
DevDeck source: [baseline `b781754`](https://github.com/writingdeveloper/devdeck/commit/b7817547dd2100751ce46229a83810319affe82b) → [fix `fa88648`](https://github.com/writingdeveloper/devdeck/commit/fa8864833b98e7d81f140e598b1f56d4d2b60c39).
Publication: **1.37.8 candidate / source and CI verified, NOT a public release**.

## User-visible defect and the actual evidence

A remote DevDeck viewer renamed a running terminal. The host process's live runtime metadata showed that rename but the host's visible header and sidebar retained the old name. The original acceptance check inspected host metadata only and therefore missed the user-visible failure. After adding a real three-Electron-app harness, the historical baseline's first UI convergence assertion **timed out**.

Source: `devdeck/docs/session-sync-review-2026-09-08.md` at `fa88648`. The historical local `devdeck/qa/shots/session-sync-before/results.json` contains an empty passed list and one `TimeoutError: page.waitForFunction: Timeout 8000ms exceeded`. This historical reproduction was documented in September; **it was not rerun on the baseline on 2026-10-12**.

Root cause: `syncAdoptedLabel` in host renderer excluded `LOCAL_MACHINE_ID` label announcements, leaving host-visible state disconnected from the runtime update. Cached titles could be mistaken for authority; unversioned fire-and-forget writes, weak session identity and stale async responses introduced additional consistency risks.

Candidate changes: session identity scope (machine + project + provider + conversation, plus terminal incarnation); a host-owned title transaction validating authorization and expected revision, persisting to disk before runtime event/ACK; caller-visible version conflicts preserving drafts; stale-pull invalidation and read-only viewer reattachment; legacy method refusal.

This is a specific software incident, not a broad claim that an AI coding agent wrote or fixed the bug unaided.

## Verified now, 2026-10-12

All commands ran on **MAIN / SIHYEONG-MAIN**, with the source checkout at exact `fa8864833b98e7d81f140e598b1f56d4d2b60c39` and **no dirty changes**.

- `npm test -- src/main/sessionLabels.test.ts src/shared/sessionConsistency.test.ts`: **20/20 passed**. The storage-failure test intentionally exercises an EISDIR write error and asserts no false runtime/peer commit; the expected error is a controlled test fixture, not a failed test.
- `npm run qa:session-sync`: built the Electron app and passed **8/8** host + two-viewer real loopback TLS user journeys. These include UI+disk convergence, no remount, stale edit conflict, disk failure/retry, permission removal, offline/reconnect, restart/cache clear and repeated rename cycles.
- `devdeck/qa/shots/session-sync/results.json`: 8 pass strings, `errors: []`. Its locally recorded SHA-256 at this run was `c105102941be924c13d7d64b894ec1584c617b8140bed679782d85a281388414`.
- Source [same-fix-commit Linux/macOS/Windows CI](https://github.com/writingdeveloper/devdeck/actions/runs/34319241204) was green. The Windows failure-and-recovery job includes the real host + two viewers exercise. That GitHub action belongs to `fa88648`, not any more recent/default-branch commit.

### Real screenshot provenance and privacy

- Original baseline fixture: `devdeck/qa/shots/session-sync-before/Build-workstation-failure.png`, SHA-256 `7b94611de24c39498ee834eb96becd5d7f93472dfc6146a4e56d3ce9b48ee5ca`.
- Original current passing fixture: `devdeck/qa/shots/session-sync/Build-workstation.png`, SHA-256 `cda5daae66e9a390199430a88469b0c98da69720003c11fd93105a0a4621f6e2`.
- Public derivative assets: `public/images/projects/devdeck-sync-qa-before.webp` and `...after.webp`. Each **composites two real crops of the same corresponding screenshot**: host title and sidebar. The terminal area containing a local user/profile path was excluded. Crops are labeled as QA fixtures, not production installations. The before and after images were captured on different dates.

## Disclaimers and release gates

This is **one Windows machine with three isolated Electron processes**, temporary profiles, fixture repository and harmless CLI; it is not two physical computers with changing VPN/wifi/sleep. It does not validate months of field use, live paid-agent workloads, installer/updater approval, or user acceptance. Notes remain on separate last-write-wins semantics. DevDeck 1.37.8 still has an unreleased PR; do not call it publicly shipped.

The WritingDeveloper site embeds this **incident case study** inside the existing DevDeck project detail, adds bilingual source/CI links, and navigates directly from Home and Hire. Separate FOLIO-45/36 security/release gates prevent publishing the broader portfolio update to Vercel production; green local site tests are not release authorization.

## Site QA contract

`content/failure-cases.json` holds the dated incident, exact source commit SHA, bounded result counts and limitations, plus six immutable GitHub source links. `src/lib/__tests__/devdeck-failure-case.test.ts` enforces dates, links, fixture image paths and that private paths aren't linked. `npm run qa:portfolio` additionally checks actual EN/KO DevDeck pages, the two loaded QA crops, source links, test counts and visible scope caveats.
