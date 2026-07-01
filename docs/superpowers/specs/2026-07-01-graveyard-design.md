# Project Graveyard (`/graveyard`) — Design Spec

**Date:** 2026-07-01
**Status:** Approved
**Author:** Si Hyeong Lee (with Claude Code)

## Motivation

The portfolio (`/projects`) shows only living work — every entry in
`content/projects.json` is `active`, `building`, or `launched`. None of the
author's failed or discontinued SaaS/side projects are represented.

Deep research (see conversation) found that the "failed product graveyard"
concept is already occupied by three patterns: (a) single big-vendor
discontinued-product lists (Killed by Google), (b) crowd-sourced failed-startup
learning DBs (SaaS Heaven, Failory), and (c) failure-into-opportunity catalogs
(Loot Drop). The **white space** is the *personal, single-owner memorial* — one
developer curating their **own** failed projects as an autobiographical exhibit.
That format is a portfolio section, not a standalone product. Building it inside
the existing portfolio hits the white space precisely and reuses existing
infrastructure (Keystatic, next-intl, OG, theming) instead of competing in a
crowded standalone-SaaS lane.

## Scope

A new `/graveyard` page in the existing portfolio that memorializes the author's
own dead projects as CSS "tombstone" cards with expandable post-mortems.

**In scope:** new Keystatic collection, data file, route, tombstone component,
i18n strings, nav link, SEO/OG, unit tests, 1–2 seed entries.

**Out of scope:** per-tombstone detail pages, 3D/Three.js graveyard, community
submissions, importing real failed-project data (author fills later via
Keystatic), reclassifying existing `projects.json` entries.

## Decisions (from brainstorming)

1. **Page structure:** separate `/graveyard` route (not merged into `/projects`).
2. **Content depth:** post-mortem narrative (cause of death + epitaph + retro).
3. **Data model:** new `graveyard` Keystatic singleton + `content/graveyard.json`
   (not a `status: 'dead'` extension of `projects`), because tombstones need
   dedicated fields the projects schema shouldn't carry.
4. **Visual:** CSS/Tailwind tombstone cards (no Three.js). Upgradeable later.
5. **Interaction:** single page, card grid, click to expand inline (accordion).
6. **Data:** build structure now, seed 1–2 samples, author fills the rest later.

## Architecture

Mirrors the existing `/projects` implementation exactly.

```
src/app/[locale]/graveyard/page.tsx        # server page, mirrors projects/page.tsx
src/components/graveyard/Tombstone.tsx      # client card w/ expand, mirrors ProjectCard.tsx
src/lib/graveyard.ts                        # pure copy/lifespan helper (unit-tested)
src/lib/__tests__/graveyard.test.ts         # unit tests
content/graveyard.json                      # data (beside projects.json)
keystatic.config.ts                         # + graveyard singleton
messages/ko.json, messages/en.json          # + graveyard namespace, + nav.graveyard
src/components/layout/Header.tsx             # + /graveyard nav link
src/types/content.ts                         # + Tombstone, CauseOfDeath
```

`/graveyard` is not matched by `IMMERSIVE_PATTERN`, so it renders the standard
app chrome (Header/main/Footer) automatically — no `layout-chrome-rules` change.

## Data model

```ts
export type CauseOfDeath =
  | 'no-pmf' | 'burnout' | 'outcompeted' | 'pivoted'
  | 'too-complex' | 'lost-interest' | 'funding' | 'other'

export interface Tombstone {
  name: string
  slug: string
  bornAt: string        // e.g. "2024"
  diedAt: string        // e.g. "2025"
  causeOfDeath: CauseOfDeath
  epitaphKo: string
  epitaphEn: string
  retroKo: string       // narrative: what it was / why it failed / lessons
  retroEn: string
  techStack: string[]
  website?: string      // remaining traces (optional)
  github?: string
  private?: boolean
}
```

`causeOfDeath` is a `select` so labels map through i18n and future
filtering/aggregation stays possible.

## Pure logic (testable)

`src/lib/graveyard.ts`:

```ts
tombstoneCopy(tomb: Tombstone, locale: string): {
  epitaph: string   // en falls back to ko when empty
  retro: string     // en falls back to ko when empty
  lifespan: string  // `${bornAt}–${diedAt}`, or just bornAt if equal
}
```

Unit tests cover: ko selection, en selection, en→ko fallback on empty, lifespan
formatting (range vs single year).

## UI

- **Tombstone.tsx** (`'use client'`): rounded tombstone-shaped card (arched top
  via CSS), "R.I.P" header, name, lifespan, epitaph. Click toggles an inline
  expansion (local `useState`) revealing the cause-of-death badge, retro
  narrative, and tech stack. Keyboard accessible (button semantics,
  `aria-expanded`), respects existing CSS variables and dark mode (WCAG AA).
- **page.tsx**: server component mirroring projects/page.tsx — reads
  `graveyard.json`, renders intro header + `grid gap-6 sm:grid-cols-2` of
  tombstones, wrapped in `PageTransition`. Subtle CSS fog/grass gradient behind
  the grid for graveyard atmosphere (no JS/3D).

## i18n

Content uses `~Ko/~En` inline fields (projects pattern). New `graveyard`
namespace in `messages/{ko,en}.json` for UI labels (title, description,
metaDescription, epitaph/cause/lessons labels, "rest in peace") and the
`cause.*` label map. `nav.graveyard` added (ko "묘지", en "Graveyard").

## SEO / OG

`generateMetadata` mirrors projects: title/description/canonical + `alternates.
languages`, and an OG image via the existing `/api/og?title=…&description=…`
route (graveyard theme through copy). Breadcrumb JSON-LD reused. One page-level
OG image (no per-tombstone pages).

## Testing / QA

- Unit: `graveyard.test.ts` for `tombstoneCopy`.
- Full local QA before deploy: `type-check`, `lint`, `test`, `build`.
- Manual: load `/graveyard` and `/en/graveyard`, expand a card, toggle theme,
  check nav link and mobile menu.

## Rollout

Feature branch `feat/graveyard` → local QA green → push (Vercel preview) →
confirm preview → merge to `main` for production (promotion confirmed with user).
