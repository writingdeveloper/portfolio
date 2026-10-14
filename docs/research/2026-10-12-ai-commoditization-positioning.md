# AI adoption is not the differentiator — portfolio positioning review

Reviewed: 2026-10-12 (America/Los_Angeles)
Execution: Plane FOLIO-35/46/47, source branch `feat/reconcile-evidence-20261011`
Status: editorial and source-work review; not proof of public deployment, hiring outcomes, customer adoption, or independently measured business impact.

## Premise

Using a coding assistant, agent, MCP server, or model is no longer a distinguishing résumé headline. The harder questions a hiring manager or customer can evaluate are: what production or workflow problem was solved; what constraints were chosen; how correctness and failure paths were measured; who accepts release risk; and whether the stated outcome can be independently inspected.

### External context, with sampling limits

- Stack Overflow Developer Survey 2026, [AI overview](https://survey.stackoverflow.co/2026/ai): 73% of the survey's respondents were reported as daily AI users; coding assistants and agents were widely reported. The survey is self-selected, not a census of all engineers or an individual employment-market ranking.
- The survey's [trust question](https://survey.stackoverflow.co/2026/ai/data/ai-trust) (`n=14,304`) reports that **48.0%** trust AI when output is easy to verify, while **6.6%** trust it for many tasks *including important work decisions*. Do not paraphrase this as “everyone distrusts AI” or “93% distrust code.”
- Its [knowledge / attribution section](https://survey.stackoverflow.co/2026/knowledge) reports that 93% considered information sourcing at least somewhat important to confidence in AI-generated answers. Attribution is a survey finding, not measured effectiveness of this portfolio.
- The [2025 DORA State of AI-Assisted Software Development](https://dora.dev/research/2025/dora-report/) describes AI as an amplifier of an organization's existing strengths and weaknesses. It does not prove a specific developer's value.
- OpenAI's [Harness engineering](https://openai.com/index/harness-engineering/) (2026-02-11) describes a team in which human engineers shape intent, environments and feedback loops while agents write code. That is an example of a workflow model; it does not imply this site's author achieved its timing, scale or release metrics.

Editorial decision: **put proof and reasoning before tool names**. No percentage from these external surveys is necessary on the public site; publish concrete project evidence instead.

## Three portfolio stories with different evidence quality

| Case study | Engineering judgment to show | Verifiable record and its limit | What not to claim |
| --- | --- | --- | --- |
| DevDeck | Ownership of state across coding agents, restart/reconnect recovery and conflict handling | `content/evidence.json` pins candidate **1.37.8** review: 1,289 passed, 1 skipped. Source commit and hash are recorded; not an installed release or current live test. | “1,289 tests passed today”, deployed reliability over months, enterprise adoption |
| citefirst | Retrieval evaluation rather than general AI/RAG enthusiasm | A committed **46-question** PostgreSQL 17 manual evaluation: recall@5 **0.978**, MRR@10 **0.834**. Search quality, *not answer correctness*. | Confusing private uncommitted 56-question experiment or valid citation IDs with factual-answer accuracy |
| Creator OS | Separating implementation/build success from release readiness: backups, data boundaries, OAuth/policy/operator gates | Project case study and source review describe a private-staging release with explicit unsatisfied external gates. Numbers on other source trees require their own dated evidence approval. | Public commercial launch, external customers, revenue, universal production-readiness guarantee |

Studio / MingleStage / RailForge / STRATA / Music-MV show breadth of exploration. Label them as private, pilot, technical spike or development—not as business outcomes. A project count is an inventory count, not proof of quality or customer value.

## Copy and UX contract

1. Keep the distinctive `I build. I ship. I bury the dead.` identity. Under it, say how engineering output is accepted, not how many AI models are used.
2. Home: display two source-pinned evidence snapshots with dates, scope and limitations, plus direct project and immutable source links. The `PUBLIC LINKS` count should not imply commercial launch or active users.
3. Hire: lead with the customer's current workflow or problem, not “AI expert.” Show **problem definition → verification → release or deliberate stop**. Link each stage to an inspectable example and keep full-time vs paid project offers separate.
4. Ledger: public work, private experiments and active prototypes remain distinct. Descriptions and search metadata must not claim every build has a public URL. All case studies should contain problem, decision, evidence and result; missing evidence should remain explicitly unresolved.
5. Source honesty: a green source test is not a production release; skipped tests are not successes; a private staging screenshot is not public availability. Site credibility falls if any of these boundaries disappear.

## Acceptance tests

- EN/KO translation keys remain consistent; first-screen CTA, explicit evidence scope, real internal and Git commit links are tested in the existing browser matrix.
- New regression tests pin the three examples and guard against blanket public-release claims.
- Production build, type check, lint, unit, evidence checksum and browser tests must pass *on the final branch*.
- An unresolved dependency audit, privacy/authoritative résumé approval, and actual Vercel deployment remain **separate release gates**. PR #33 and PR #34 are draft until those are resolved and do not create an implied approval.

## Follow-up research / measurable improvements

Review target-job descriptions by actual employer/contract scope before declaring a globally optimal job title. Add a verifiable test artifact for one client-shaped workflow: a failure case, recovery proof, versioned test run, and concrete user-facing acceptance, rather than adding another model badge. Record a 2026-12-22 positioning review in FOLIO-35; do not claim it is an automatic reminder.
