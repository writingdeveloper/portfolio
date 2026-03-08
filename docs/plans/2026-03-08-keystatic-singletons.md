# Keystatic Singletons for Projects & About

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert hardcoded TypeScript data files (`content/projects.ts`, `content/about.ts`) to JSON files managed by Keystatic singletons, enabling CMS editing via `/keystatic` web UI.

**Architecture:** Follow the existing `categories.json` + Keystatic singleton pattern. Convert TS → JSON, add singleton schemas to `keystatic.config.ts`, update imports in consuming pages. Types move to a shared file.

**Tech Stack:** Keystatic (already installed), Next.js, TypeScript, JSON

---

### Task 1: Create shared content types

**Files:**
- Create: `src/types/content.ts`

**Step 1: Create type definitions file**

```typescript
export interface Project {
  name: string
  slug: string
  descriptionKo: string
  descriptionEn: string
  techStack: string[]
  status: 'active' | 'building' | 'launched' | 'archived'
  website: string
  github: string
  featured: boolean
}

export interface Skill {
  name: string
  category: 'frontend' | 'backend' | 'tools'
}

export interface TimelineItem {
  date: string
  titleKo: string
  titleEn: string
  descriptionKo: string
  descriptionEn: string
  type: 'work' | 'education' | 'project'
}

export const skillCategories = {
  frontend: { ko: '프론트엔드', en: 'Frontend' },
  backend: { ko: '백엔드', en: 'Backend' },
  tools: { ko: '도구', en: 'Tools' },
} as const
```

**Step 2: Commit**

```bash
git add src/types/content.ts
git commit -m "feat: add shared content type definitions"
```

---

### Task 2: Convert projects.ts to projects.json

**Files:**
- Create: `content/projects.json`
- Delete: `content/projects.ts`

**Step 1: Create projects.json**

Convert the existing data from `content/projects.ts`. Flatten `description: Record<string, string>` to `descriptionKo`/`descriptionEn` and `links: { website?, github? }` to flat `website`/`github` fields.

```json
{
  "projects": [
    {
      "name": "Soursea",
      "slug": "soursea",
      "descriptionKo": "AI 기반 이커머스 소싱 어시스턴트. Alibaba/1688에서 제품을 분석하고 수익성을 계산합니다.",
      "descriptionEn": "AI-powered e-commerce sourcing assistant. Analyzes products from Alibaba/1688 and calculates profitability.",
      "techStack": ["Next.js", "NestJS", "Electron", "TypeScript", "Supabase", "Stripe"],
      "status": "active",
      "website": "https://soursea.com",
      "github": "",
      "featured": true
    }
  ]
}
```

**Step 2: Delete old TS file**

```bash
rm content/projects.ts
```

**Step 3: Commit**

```bash
git add content/projects.json
git rm content/projects.ts
git commit -m "feat: convert projects data from TypeScript to JSON"
```

---

### Task 3: Convert about.ts to about.json

**Files:**
- Create: `content/about.json`
- Delete: `content/about.ts`

**Step 1: Create about.json**

Flatten `title: Record<string, string>` to `titleKo`/`titleEn`, same for `description`.

```json
{
  "skills": [
    { "name": "React", "category": "frontend" },
    { "name": "Next.js", "category": "frontend" },
    { "name": "TypeScript", "category": "frontend" },
    { "name": "Tailwind CSS", "category": "frontend" },
    { "name": "Electron", "category": "frontend" },
    { "name": "NestJS", "category": "backend" },
    { "name": "Node.js", "category": "backend" },
    { "name": "Supabase", "category": "backend" },
    { "name": "PostgreSQL", "category": "backend" },
    { "name": "Git", "category": "tools" },
    { "name": "Docker", "category": "tools" },
    { "name": "Vercel", "category": "tools" },
    { "name": "Stripe", "category": "tools" }
  ],
  "timeline": [
    {
      "date": "2024 - Present",
      "titleKo": "Soursea 개발",
      "titleEn": "Building Soursea",
      "descriptionKo": "AI 기반 이커머스 소싱 어시스턴트 개발 및 운영",
      "descriptionEn": "Developing and operating an AI-powered e-commerce sourcing assistant",
      "type": "project"
    }
  ]
}
```

**Step 2: Delete old TS file**

```bash
rm content/about.ts
```

**Step 3: Commit**

```bash
git add content/about.json
git rm content/about.ts
git commit -m "feat: convert about data from TypeScript to JSON"
```

---

### Task 4: Add Keystatic singletons

**Files:**
- Modify: `keystatic.config.ts`

**Step 1: Add projects and about singletons**

Add to the `singletons` object in `keystatic.config.ts`, alongside the existing `categories` singleton:

```typescript
projects: singleton({
  label: '프로젝트 관리',
  path: 'content/projects',
  format: 'json',
  schema: {
    projects: fields.array(
      fields.object({
        name: fields.text({ label: '프로젝트명' }),
        slug: fields.text({ label: 'URL 슬러그' }),
        descriptionKo: fields.text({ label: '설명 (한국어)', multiline: true }),
        descriptionEn: fields.text({ label: '설명 (English)', multiline: true }),
        techStack: fields.array(fields.text({ label: '기술' }), {
          label: '기술 스택',
          itemLabel: (props) => props.value,
        }),
        status: fields.select({
          label: '상태',
          options: [
            { value: 'active', label: '활성' },
            { value: 'building', label: '개발중' },
            { value: 'launched', label: '출시' },
            { value: 'archived', label: '보관' },
          ],
          defaultValue: 'active',
        }),
        website: fields.text({ label: '웹사이트 URL' }),
        github: fields.text({ label: 'GitHub URL' }),
        featured: fields.checkbox({ label: '메인 페이지 노출' }),
      }),
      {
        label: '프로젝트 목록',
        itemLabel: (props) => props.fields.name.value,
      }
    ),
  },
}),
about: singleton({
  label: '소개 페이지',
  path: 'content/about',
  format: 'json',
  schema: {
    skills: fields.array(
      fields.object({
        name: fields.text({ label: '기술명' }),
        category: fields.select({
          label: '카테고리',
          options: [
            { value: 'frontend', label: '프론트엔드' },
            { value: 'backend', label: '백엔드' },
            { value: 'tools', label: '도구' },
          ],
          defaultValue: 'frontend',
        }),
      }),
      {
        label: '기술 스택',
        itemLabel: (props) => props.fields.name.value,
      }
    ),
    timeline: fields.array(
      fields.object({
        date: fields.text({ label: '기간' }),
        titleKo: fields.text({ label: '제목 (한국어)' }),
        titleEn: fields.text({ label: '제목 (English)' }),
        descriptionKo: fields.text({ label: '설명 (한국어)', multiline: true }),
        descriptionEn: fields.text({ label: '설명 (English)', multiline: true }),
        type: fields.select({
          label: '유형',
          options: [
            { value: 'work', label: '경력' },
            { value: 'education', label: '교육' },
            { value: 'project', label: '프로젝트' },
          ],
          defaultValue: 'project',
        }),
      }),
      {
        label: '타임라인',
        itemLabel: (props) => props.fields.titleKo.value,
      }
    ),
  },
}),
```

**Step 2: Commit**

```bash
git add keystatic.config.ts
git commit -m "feat: add projects and about Keystatic singletons"
```

---

### Task 5: Update page imports and types

**Files:**
- Modify: `src/app/[locale]/page.tsx` (home page)
- Modify: `src/app/[locale]/projects/page.tsx`
- Modify: `src/app/[locale]/about/page.tsx`
- Modify: `src/components/projects/ProjectCard.tsx`

**Step 1: Update ProjectCard.tsx**

Change import from `content/projects` to `src/types/content`, and update the description access pattern:

```typescript
// Old:
import type { Project } from '../../../content/projects'
// ...
{typeof project.description === 'string' ? project.description : project.description[locale] || project.description['ko']}
// ...
{project.links.website && ...}
{project.links.github && ...}

// New:
import type { Project } from '@/types/content'
// ...
{locale === 'en' ? (project.descriptionEn || project.descriptionKo) : project.descriptionKo}
// ...
{project.website && ...}  // flat field, no .links
{project.github && ...}
```

**Step 2: Update home page (src/app/[locale]/page.tsx)**

```typescript
// Old:
import { projects } from '../../../content/projects'
import type { Project } from '../../../content/projects'

// New:
import projectsData from '../../../content/projects.json'
import type { Project } from '@/types/content'

// In HomePage function, change:
const featuredProjects = projects.filter((p) => p.featured)
// To:
const featuredProjects = (projectsData.projects as Project[]).filter((p) => p.featured)
```

**Step 3: Update projects page (src/app/[locale]/projects/page.tsx)**

```typescript
// Old:
import { projects } from '../../../../content/projects'

// New:
import projectsData from '../../../../content/projects.json'
import type { Project } from '@/types/content'

// In JSX, change:
{projects.map((project) => (
// To:
{(projectsData.projects as Project[]).map((project) => (
```

**Step 4: Update about page (src/app/[locale]/about/page.tsx)**

```typescript
// Old:
import { skills, timeline, skillCategories } from '../../../../content/about'
import type { Skill, TimelineItem } from '../../../../content/about'

// New:
import aboutData from '../../../../content/about.json'
import type { Skill, TimelineItem } from '@/types/content'
import { skillCategories } from '@/types/content'

// In AboutContent, change:
const groupedSkills = {
  frontend: skills.filter((s) => s.category === 'frontend'),
  ...
}
// To:
const skills = aboutData.skills as Skill[]
const timelineItems = aboutData.timeline as TimelineItem[]
const groupedSkills = {
  frontend: skills.filter((s) => s.category === 'frontend'),
  ...
}

// In timeline JSX, change `timeline.map` to `timelineItems.map`
```

**Step 5: Commit**

```bash
git add src/types/content.ts src/app/[locale]/page.tsx src/app/[locale]/projects/page.tsx src/app/[locale]/about/page.tsx src/components/projects/ProjectCard.tsx
git commit -m "feat: update imports to use JSON data and shared types"
```

---

### Task 6: Build verification and final test

**Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors

**Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors

**Step 3: Run dev server and verify pages**

```bash
npm run dev
```

Verify manually or via curl:
- `http://localhost:3000` — featured projects render
- `http://localhost:3000/projects` — all projects render
- `http://localhost:3000/about` — skills + timeline render
- `http://localhost:3000/en/projects` — English descriptions render
- `http://localhost:3000/en/about` — English titles/descriptions render
- `http://localhost:3000/keystatic` — projects and about singletons appear in CMS sidebar

**Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address build issues from singleton migration"
```
