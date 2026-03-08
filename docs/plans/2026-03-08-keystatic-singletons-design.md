# Keystatic Singletons for Projects & About

**Date**: 2026-03-08
**Status**: Approved

## Problem

Projects and About page data are hardcoded in TypeScript files (`content/projects.ts`, `content/about.ts`). This requires code changes for simple content edits.

## Solution

Convert TS files to JSON and register as Keystatic singletons — the same pattern already used by `content/categories.json`.

## Data Structures

### content/projects.json

```json
{
  "projects": [
    {
      "name": "string",
      "slug": "string",
      "descriptionKo": "string",
      "descriptionEn": "string",
      "techStack": ["string"],
      "status": "active | building | launched | archived",
      "website": "string (optional)",
      "github": "string (optional)",
      "featured": "boolean"
    }
  ]
}
```

### content/about.json

```json
{
  "skills": [
    { "name": "string", "category": "frontend | backend | tools" }
  ],
  "timeline": [
    {
      "date": "string",
      "titleKo": "string",
      "titleEn": "string",
      "descriptionKo": "string",
      "descriptionEn": "string",
      "type": "work | education | project"
    }
  ]
}
```

## Changes Required

1. **Data files**: `content/projects.ts` → `content/projects.json`, `content/about.ts` → `content/about.json`
2. **Keystatic config**: Add `projects` and `about` singletons to `keystatic.config.ts`
3. **Page components**: Update imports in `projects/page.tsx`, `about/page.tsx`, `ProjectCard.tsx`
4. **Types**: Move interfaces to consuming components or shared types file
5. **Delete**: Remove old `.ts` data files

## Non-Goals

- No new UI components
- No schema migration tooling
- No i18n structure changes beyond flattening Record<string, string> to explicit ko/en fields
