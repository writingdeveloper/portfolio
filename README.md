# WritingDeveloper Portfolio

Source for [writingdeveloper.blog](https://writingdeveloper.blog), a bilingual Builder's Ledger for shipped products, work in progress, technical writing, and the systems behind them.

## What is here

- **Builder's Ledger** — selected work, the full project record, live/Play Store counts, and the project graveyard.
- **Projects** — bilingual project pages with screenshots, public links, lineage, related build notes, and evidence-oriented case studies for selected work.
- **Blog** — Korean and English MDX posts with search, categories, tags, RSS, comments, related posts, and structured data.
- **Hire** — full-time and project-work positioning backed by counts and selected evidence from the ledger.
- **Studio** — a public walkthrough of the local RTX 4080 generation pipeline and its approve/reject records.
- **Play** — an optional Three.js/R3F exploration surface with a semantic fallback.
- **Graveyard** — projects that were stopped or superseded, with what replaced them where applicable.
- **Machine-readable surfaces** — sitemap, RSS, `llms.txt`, `llms-full.txt`, JSON-LD, OG images, robots, and manifest routes.
- **Keystatic** — local content editing for the file-backed MDX/content model.

## Stack

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS 4
- next-intl (Korean + English)
- MDX + Keystatic
- Three.js / React Three Fiber
- Shiki
- Vitest + Playwright
- Vercel Analytics / Speed Insights / GA4
- Vercel deployment + GitHub Actions CI

## Local development

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>.

## Verification

The same core gates used by CI can be run locally:

```bash
npm run type-check
npm run lint
npm run format:check
npm test
npm run untranslated
npm run verify:hero -- public/images/posts/*.webp
npm audit --audit-level=high
npm run build
```

`npm run format` applies the repository's Prettier rules to TypeScript/TSX source. The formatter accepts either LF or CRLF line endings so the check behaves the same on Windows and Linux.

## Content model

```text
content/
  projects.json       project ledger and selected-work evidence
  graveyard.json      stopped/superseded projects
  about.json          skills and timeline
  posts/
    ko/                Korean MDX posts
    en/                English MDX posts
messages/              next-intl UI copy
public/images/         project screenshots and blog media
```

A post can declare `project: <slug>` in frontmatter. That relationship is used to connect build notes back to project pages without duplicating links in component code.

## Application structure

```text
src/
  app/                 App Router pages and machine-readable routes
  components/          shared UI, blog, project, analytics, and layout pieces
  i18n/                locale routing/navigation
  lib/                 content loading, SEO, analytics, lineage, project rules
  types/               content model types
scripts/               content/media verification and capture utilities
```

The project ledger is intentionally broader than "shipped" work. UI counts distinguish total builds from public destinations and store listings rather than presenting every row as a release.
