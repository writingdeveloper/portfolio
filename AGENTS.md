# Portfolio execution guide

Read README.md and docs/operations/evidence-workflow.md. Preserve existing uncommitted changes.

- Tasks: live Plane Portfolio (FOLIO), workspace soursea; project ID 1bc2719a-4d8b-4182-ac54-743acfe8d639. Read live work before implementation. Separate implementation, automated QA, visual review and deployment.
- Public evidence: content/evidence.json. Check the Git version before trusting a source README. Collection writes only ignored review candidates and never publishes measurements automatically.
- Résumé originals: notebook hangar/data. Public files are versioned snapshots; do not mix unrelated personal records into this repository.
- Core checks: npm run type-check; npm run lint; npm run format:check; npm test; npm run evidence:check; npm run untranslated; npm run build.
- Browser checks: start production preview, then npm run qa:portfolio and both locales of qa:navigation. Preserve .qa/portfolio/report.json and screenshots. Do not remove console assertions to manufacture PASS.
- Never delete Git lock files without establishing ownership. No force push, visibility change or deployment as an incidental maintenance action.
- Current design/research decisions live under docs/research and docs/reviews. Their written dates and limitations matter.
