# Portfolio Improvements: 12-Item Enhancement Sprint

**Date:** 2026-02-23
**Status:** Approved

## Overview

Address all identified gaps in the portfolio site after the Sanity-to-MDX migration. 12 items grouped into 4 execution groups.

## Group A: Bug Fixes & Cleanup

### 1. Theme Flash Bug Fix
- Add inline `<script>` in `<head>` before React hydration to read `localStorage('theme')` and apply `dark`/`light` class immediately
- Prevents FOUC on page load for users who previously selected light mode

### 2. not-found.tsx / error.tsx i18n
- Replace hardcoded English strings with `useTranslations` calls
- Add i18n keys: `error.notFound`, `error.notFoundDescription`, `error.somethingWentWrong`, `error.tryAgain`

### 3. Dead Code Cleanup
- Delete `src/components/portable-text/CodeBlock.tsx` (orphaned Sanity-era component, never imported)
- Remove empty `portable-text/` directory

### 4. .gitignore Duplicate Fix
- Remove duplicate `.vercel` entry

## Group B: Code Quality

### 5. Shiki Syntax Highlighting
- Wire up `shiki` (already installed, ^3.22.0) to MDX code blocks
- Use `codeToHtml()` server-side in a custom MDX `pre` component
- Theme: `github-dark`
- Add copy button to code blocks

### 6. Dynamic OG Images
- Extend `/api/og` to accept `?title=...&description=...` query params
- Update blog post metadata to use `/api/og?title={post.title}` as OG image
- Fallback: current generic image when no params provided

## Group C: Feature Additions

### 7. Blog Category Filter (URL Query Params)
- `/blog?category=dev` server-side filtering via `searchParams`
- Category badges become `<Link>` components
- "All" button links to `/blog`

### 8. Blog Table of Contents
- Parse MDX headings (## and ###) server-side
- Desktop: sticky sidebar TOC
- Mobile: collapsible TOC at top of article
- Current section highlight via IntersectionObserver

### 9. About Page (Skills + Timeline)
- Skills section: tech stack icon grid (Frontend, Backend, Tools categories)
- Timeline section: career/education timeline with left-line + cards
- Data in `content/about.ts` (static, bilingual)
- Extend i18n keys for both languages

### 10. Vercel Analytics
- Install `@vercel/analytics`
- Add `<Analytics />` to root layout

## Group D: Low Priority

### 11. README Update
- Replace default create-next-app README with project-specific documentation

### 12. Project Detail Pages
- Skipped for now (only 1 project exists). Implement when more projects are added.

## Tech Decisions

- **Syntax highlighting**: shiki server-side (already installed, no bundle size impact)
- **Category filter**: URL query params (SEO-friendly, shareable, SSR)
- **About page**: Skills grid + timeline (as per original design doc)
- **Analytics**: Vercel Analytics (simplest integration for Vercel deployment)
- **TOC**: Server-parsed headings + client-side IntersectionObserver for active section
