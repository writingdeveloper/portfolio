# Homelab / Infra Skill Category Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `infra` skill category (Tailscale, Caddy, Oracle Cloud, Infisical, Uptime Kuma, Ollama) as a peer of `frontend`/`backend`/`tools` on the About page and the `/play` 3D scene, plus one `timeline` entry narrating the home-GPU + cloud-VM self-hosted setup that already backs the `ai-4080-ops` and `studios` projects.

**Architecture:** `content/about.json` is the single data source for both the standard `/about` page (`src/app/[locale]/about/page.tsx`, plain JSX list) and the immersive `/play` 3D scene (`src/app/[locale]/play/sections/SkillsSection.tsx`, react-three-fiber). Both components currently hardcode the 3-category set (`frontend`/`backend`/`tools`) in a `grouped`/`groupedSkills` object literal, so a 4th category must be added in both places plus the shared type (`src/types/content.ts`) and the Keystatic admin schema (`keystatic.config.ts`). The 3D scene also hardcodes category x-position math assuming exactly 3 categories; that math is extracted into a small pure, unit-tested helper (`src/lib/skills-layout.ts`) so it stays centered for any category count.

**Tech Stack:** Next.js App Router, TypeScript, react-three-fiber (`/play` scene), Keystatic CMS, Vitest.

## Global Constraints

- No invented tooling: only Tailscale, Caddy, Oracle Cloud, Infisical, Uptime Kuma, Ollama are confirmed and may appear as skill names. Do not add Proxmox, NAS, or any hypervisor.
- No raw IPs, no the Oracle VM's public IP, no the literal DuckDNS subdomain string in any content (`content/about.json` values, i18n copy, etc.).
- Keep `Docker` in the existing `tools` category — do not move or duplicate it into `infra`.
- `messages/ko.json` / `messages/en.json` are **not** touched — category labels live in `skillCategories` in `src/types/content.ts`.
- No new `timeline.type` enum value — the new timeline entry reuses `type: 'project'`.
- No `href`/link field on timeline items — out of scope for this plan.

---

### Task 1: Add `infra` category to the Keystatic schema and shared types

**Files:**
- Modify: `keystatic.config.ts:175-183`
- Modify: `src/types/content.ts:46-49` and `:68-72`

**Interfaces:**
- Produces: `Skill.category` union now includes `'infra'`; `skillCategories.infra` = `{ ko: '인프라', en: 'Infra' }`. Later tasks (2, 3, 4) rely on both.

- [ ] **Step 1: Add the `infra` option to the Keystatic `category` select**

In `keystatic.config.ts`, inside `about.schema.skills`'s `category: fields.select({...})`, add a fourth option:

```ts
            category: fields.select({
              label: '카테고리',
              options: [
                { value: 'frontend', label: '프론트엔드' },
                { value: 'backend', label: '백엔드' },
                { value: 'tools', label: '도구' },
                { value: 'infra', label: '인프라' },
              ],
              defaultValue: 'frontend',
            }),
```

- [ ] **Step 2: Widen the `Skill.category` union and add the `infra` label**

In `src/types/content.ts`, change:

```ts
export interface Skill {
  name: string
  category: 'frontend' | 'backend' | 'tools'
}
```

to:

```ts
export interface Skill {
  name: string
  category: 'frontend' | 'backend' | 'tools' | 'infra'
}
```

And change:

```ts
export const skillCategories = {
  frontend: { ko: '프론트엔드', en: 'Frontend' },
  backend: { ko: '백엔드', en: 'Backend' },
  tools: { ko: '도구', en: 'Tools' },
} as const
```

to:

```ts
export const skillCategories = {
  frontend: { ko: '프론트엔드', en: 'Frontend' },
  backend: { ko: '백엔드', en: 'Backend' },
  tools: { ko: '도구', en: 'Tools' },
  infra: { ko: '인프라', en: 'Infra' },
} as const
```

- [ ] **Step 3: Type-check**

Run: `npm run type-check`
Expected: passes with no errors (widening a union and adding a schema option is backward-compatible; no existing call site narrows the `Skill.category` type in a way that would reject `'infra'`).

- [ ] **Step 4: Commit**

```bash
git add keystatic.config.ts src/types/content.ts
git commit -m "feat(about): add infra skill category to schema and types"
```

---

### Task 2: Render the `infra` skill group on the `/about` page

**Files:**
- Modify: `src/app/[locale]/about/page.tsx:65-69`

**Interfaces:**
- Consumes: `Skill.category` (Task 1), `skillCategories.infra` (Task 1).
- Produces: nothing new consumed by later tasks — this is a leaf rendering change.

- [ ] **Step 1: Add the `infra` key to `groupedSkills`**

In `src/app/[locale]/about/page.tsx`, change:

```ts
  const groupedSkills = {
    frontend: skills.filter((s) => s.category === 'frontend'),
    backend: skills.filter((s) => s.category === 'backend'),
    tools: skills.filter((s) => s.category === 'tools'),
  }
```

to:

```ts
  const groupedSkills = {
    frontend: skills.filter((s) => s.category === 'frontend'),
    backend: skills.filter((s) => s.category === 'backend'),
    tools: skills.filter((s) => s.category === 'tools'),
    infra: skills.filter((s) => s.category === 'infra'),
  }
```

No other change is needed in this file: the render loop already does
`(Object.keys(groupedSkills) as Array<keyof typeof groupedSkills>).map(...)`,
which picks up the new key automatically, and reads the label from
`skillCategories[category][locale]` (already updated in Task 1).

- [ ] **Step 2: Type-check**

Run: `npm run type-check`
Expected: passes with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\[locale\]/about/page.tsx
git commit -m "feat(about): render infra skill group on the about page"
```

---

### Task 3: Extract a centered category-position helper and wire it into the `/play` scene

**Files:**
- Create: `src/lib/skills-layout.ts`
- Test: `src/lib/__tests__/skills-layout.test.ts`
- Modify: `src/app/[locale]/play/sections/SkillsSection.tsx`

**Interfaces:**
- Consumes: `Skill.category` (Task 1), `skillCategories` (Task 1).
- Produces: `categoryX(index: number, total: number, spacing?: number): number` — exported from `src/lib/skills-layout.ts`, consumed by `SkillsSection.tsx` in this same task (no other task depends on it).

- [ ] **Step 1: Write the failing test for `categoryX`**

Create `src/lib/__tests__/skills-layout.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { categoryX } from '../skills-layout'

describe('categoryX', () => {
  it('centers 3 categories on x=0 with default spacing', () => {
    expect(categoryX(0, 3)).toBe(-5)
    expect(categoryX(1, 3)).toBe(0)
    expect(categoryX(2, 3)).toBe(5)
  })

  it('centers 4 categories symmetrically around x=0', () => {
    expect(categoryX(0, 4)).toBe(-7.5)
    expect(categoryX(1, 4)).toBe(-2.5)
    expect(categoryX(2, 4)).toBe(2.5)
    expect(categoryX(3, 4)).toBe(7.5)
  })

  it('places a single category at x=0', () => {
    expect(categoryX(0, 1)).toBe(0)
  })

  it('respects a custom spacing argument', () => {
    expect(categoryX(0, 2, 10)).toBe(-5)
    expect(categoryX(1, 2, 10)).toBe(5)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/__tests__/skills-layout.test.ts`
Expected: FAIL — `Cannot find module '../skills-layout'` (the module doesn't exist yet).

- [ ] **Step 3: Implement `categoryX`**

Create `src/lib/skills-layout.ts`:

```ts
/**
 * X position for the Nth of `total` category clusters in the /play 3D
 * skills scene, evenly spaced and centered on x=0.
 */
export function categoryX(index: number, total: number, spacing = 5): number {
  return (index - (total - 1) / 2) * spacing
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/__tests__/skills-layout.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Wire `categoryX` and the `infra` group into `SkillsSection.tsx`**

In `src/app/[locale]/play/sections/SkillsSection.tsx`, change the import block:

```ts
import type { Skill } from '@/types/content'
import { skillCategories } from '@/types/content'
import { GlowOrb } from '../components/GlowOrb'
import { SectionLabel } from '../components/SectionLabel'
import { SectionDivider } from '../components/SectionDivider'
import { SECTION_SPACING } from '../scene/CameraRig'
```

to:

```ts
import type { Skill } from '@/types/content'
import { skillCategories } from '@/types/content'
import { GlowOrb } from '../components/GlowOrb'
import { SectionLabel } from '../components/SectionLabel'
import { SectionDivider } from '../components/SectionDivider'
import { SECTION_SPACING } from '../scene/CameraRig'
import { categoryX } from '@/lib/skills-layout'
```

Change `CATEGORY_COLORS`:

```ts
const CATEGORY_COLORS: Record<string, string> = {
  frontend: '#7b6f99',
  backend: '#8b7355',
  tools: '#6b6891',
}
```

to:

```ts
const CATEGORY_COLORS: Record<string, string> = {
  frontend: '#7b6f99',
  backend: '#8b7355',
  tools: '#6b6891',
  infra: '#5f8b7a',
}
```

Change the `grouped` object inside `SkillsSection`:

```ts
  const grouped = {
    frontend: skills.filter((s) => s.category === 'frontend'),
    backend: skills.filter((s) => s.category === 'backend'),
    tools: skills.filter((s) => s.category === 'tools'),
  }
```

to:

```ts
  const grouped = {
    frontend: skills.filter((s) => s.category === 'frontend'),
    backend: skills.filter((s) => s.category === 'backend'),
    tools: skills.filter((s) => s.category === 'tools'),
    infra: skills.filter((s) => s.category === 'infra'),
  }
```

Finally, replace the hardcoded `catX` line inside the `Object.entries(grouped).map(...)` render loop:

```ts
      {Object.entries(grouped).map(([category, items], catIdx) => {
        const catX = (catIdx - 1) * 5
```

with:

```ts
      {Object.entries(grouped).map(([category, items], catIdx) => {
        const catX = categoryX(catIdx, Object.keys(grouped).length)
```

- [ ] **Step 6: Type-check and run the full test suite**

Run: `npm run type-check && npx vitest run`
Expected: type-check passes; all test files pass including the new `skills-layout.test.ts`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/skills-layout.ts src/lib/__tests__/skills-layout.test.ts "src/app/[locale]/play/sections/SkillsSection.tsx"
git commit -m "feat(play): generalize skills category layout and add infra cluster"
```

---

### Task 4: Add the real `infra` skills and timeline entry, then full verification

**Files:**
- Modify: `content/about.json`

**Interfaces:**
- Consumes: `Skill` and `TimelineItem` shapes (Task 1) — this task only adds data, no code.

- [ ] **Step 1: Add the 6 confirmed infra skills**

In `content/about.json`, the `skills` array currently ends with:

```json
    {
      "name": "Turborepo",
      "category": "tools"
    }
  ],
```

Change it to:

```json
    {
      "name": "Turborepo",
      "category": "tools"
    },
    {
      "name": "Tailscale",
      "category": "infra"
    },
    {
      "name": "Caddy",
      "category": "infra"
    },
    {
      "name": "Oracle Cloud",
      "category": "infra"
    },
    {
      "name": "Infisical",
      "category": "infra"
    },
    {
      "name": "Uptime Kuma",
      "category": "infra"
    },
    {
      "name": "Ollama",
      "category": "infra"
    }
  ],
```

- [ ] **Step 2: Add the timeline entry**

In `content/about.json`, the `timeline` array currently starts with:

```json
  "timeline": [
    {
      "date": "2026",
      "titleKo": "오픈소스·시빅테크로 확장",
```

Insert a new first entry so it reads:

```json
  "timeline": [
    {
      "date": "2025 - Present",
      "titleKo": "홈서버·셀프호스팅 인프라 구축·운영",
      "titleEn": "Building & running self-hosted infrastructure",
      "descriptionKo": "집 GPU 워크스테이션(RTX 4080)과 Oracle Cloud VM을 Tailscale 사설망으로 묶어 self-host 인프라를 구축. Caddy·DuckDNS로 필요한 서비스만 공개 노출하고, Infisical(시크릿)·Plane(프로젝트 관리)을 직접 운영하며 PowerShell 상태점검 스크립트와 Uptime Kuma로 모니터링. 이 인프라 위에서 studios·ai-4080-ops 같은 생성 파이프라인이 돌아감.",
      "descriptionEn": "Tied a home GPU workstation (RTX 4080) and an Oracle Cloud VM together over a Tailscale mesh to run self-hosted infrastructure. Caddy and DuckDNS expose only what needs to be public; Infisical (secrets) and Plane (project management) run self-hosted, monitored via PowerShell health-check scripts and Uptime Kuma. The generative pipelines in studios and ai-4080-ops run on top of this.",
      "type": "project"
    },
    {
      "date": "2026",
      "titleKo": "오픈소스·시빅테크로 확장",
```

(Leave every entry after this one exactly as-is — this is a pure insertion before the existing first entry.)

- [ ] **Step 3: Validate the JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('content/about.json', 'utf8')); console.log('valid')"`
Expected: prints `valid` (catches trailing-comma/syntax mistakes from the manual edit).

- [ ] **Step 4: Full verification sweep**

Run: `npm run lint && npm run type-check && npx vitest run && npm run build`
Expected: all four succeed with no errors.

- [ ] **Step 5: Manual QA**

Run: `npm run dev`, then in a browser:
- Visit `/about` — confirm an "인프라" group appears with all 6 skill chips (Tailscale, Caddy, Oracle Cloud, Infisical, Uptime Kuma, Ollama), and the new timeline entry appears first with its Korean copy.
- Visit `/en/about` — confirm the group label reads "Infra" and the timeline entry shows the English copy.
- Visit `/play` (and `/en/play`), navigate to the skills section — confirm 4 evenly-spaced, centered category clusters (not lopsided toward one side).
- Visit `/keystatic`, open the About singleton — confirm "인프라" is selectable as a skill category and the page saves without error.

- [ ] **Step 6: Commit**

```bash
git add content/about.json
git commit -m "content(about): add infra skills and homelab timeline entry"
```

---

## Out of scope (tracked in the design spec, not this plan)

- The bilingual blog deep-dive post — written separately via the `polish-writing` skill (needs an author interview for narrative, not a coding task).
- A dedicated `/homelab` route, a `timeline` `href` field, and a new `timeline.type` value — all explicitly rejected in `docs/superpowers/specs/2026-07-13-homelab-infra-portfolio-design.md`.
