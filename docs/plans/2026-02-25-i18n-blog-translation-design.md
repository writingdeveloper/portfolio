# Bilingual Blog Translation System Design

**Date:** 2026-02-25
**Status:** Approved

## Problem

Blog posts are written in Korean but have no 1:1 matching English translations. The goal is to enable bilingual content management where Korean posts can be translated to English using Claude Code MAX (no API cost), with proper SEO support for both languages.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Content structure | Directory-based separation (`ko/`, `en/`) | Google-recommended subdirectory pattern, slug = translation key |
| Slug strategy | Same slug across languages | File-system level 1:1 matching, minimal complexity |
| Translation workflow | Claude Code MAX + `npm run untranslated` helper | Zero API cost, quality review before commit, fits existing workflow |
| Translation scope | Posts + projects + about + UI messages | Full coverage, though projects/about/messages are mostly done already |
| Keystatic CMS | Two collections (`posts-ko`, `posts-en`) | Clear separation in CMS UI, shared schema |

## Architecture

### Content Structure

```
content/posts/
  ko/
    introducing-keystatic-cms.mdx
    studying-english-with-chatgpt.mdx
    thoughts-about-giving-back.mdx
  en/
    introducing-keystatic-cms.mdx      # same slug = translation pair
    studying-english-with-chatgpt.mdx
    thoughts-about-giving-back.mdx
```

### Keystatic Configuration

Two collections with shared schema. The `language` field is removed since directory determines language.

```typescript
const postSchema = {
  title: fields.slug({ name: { label: 'Title' } }),
  excerpt: fields.text({ label: 'Excerpt', multiline: true }),
  publishedAt: fields.date({ label: 'Published Date' }),
  author: fields.text({ defaultValue: '...' }),
  category: fields.text({ label: 'Category' }),
  tags: fields.array(fields.text({ label: 'Tag' })),
  coverImage: fields.text({ label: 'Cover Image URL' }),
  content: fields.mdx({ label: 'Content' }),
}

collections: {
  'posts-ko': collection({
    label: '포스트 (한국어)',
    path: 'content/posts/ko/*',
    schema: postSchema,
  }),
  'posts-en': collection({
    label: 'Posts (English)',
    path: 'content/posts/en/*',
    schema: postSchema,
  }),
}
```

### MDX Loading Functions

```typescript
// src/lib/mdx.ts
function getAllPosts(locale: 'ko' | 'en'): Post[]
  // reads content/posts/{locale}/*.mdx

function getPost(slug: string, locale: 'ko' | 'en'): Post
  // reads content/posts/{locale}/{slug}.mdx

function getTranslationSlug(slug: string, currentLocale: string): string | null
  // checks if content/posts/{targetLocale}/{slug}.mdx exists
```

### SEO: hreflang Tags

Generated in `generateMetadata()` for each blog post page:

```html
<link rel="alternate" hreflang="ko" href="https://domain/blog/slug" />
<link rel="alternate" hreflang="en" href="https://domain/en/blog/slug" />
<link rel="alternate" hreflang="x-default" href="https://domain/blog/slug" />
```

English hreflang is only included when translation exists.

### SEO: Sitemap

Each post entry includes `alternates.languages` with both ko and en URLs (when translation exists).

### Translation Workflow

1. Run `npm run untranslated` to see which posts lack English versions
2. Ask Claude Code: "Translate untranslated posts to English"
3. Claude Code reads `ko/` files, translates, saves to `en/` with same filename
4. Review with `git diff`, then commit

Translation preserves: frontmatter structure, MDX syntax, code blocks, image paths, links. Tags are translated to English. Author field stays unchanged.

### Language Switch UI

Blog post pages show "Read in English" / "한국어로 읽기" link when translation exists. Hidden when no translation is available.

## Files to Change

| File | Change |
|------|--------|
| `keystatic.config.ts` | Single collection -> `posts-ko` + `posts-en`, remove `language` field |
| `src/lib/mdx.ts` | `getAllPosts(locale)`, `getPost(slug, locale)`, add `getTranslationSlug()` |
| `src/app/[locale]/blog/page.tsx` | Locale-based post list filtering |
| `src/app/[locale]/blog/[slug]/page.tsx` | hreflang metadata, translation link UI |
| `src/app/sitemap.ts` | Add alternates language links |
| `src/app/feed.xml/route.ts` | Locale-based feed |
| `scripts/untranslated.ts` | New: helper script to find untranslated posts |
| `package.json` | Add `"untranslated"` script |
| `content/posts/` | Move 3 existing files into `ko/` subdirectory |

## Not Changed

- `messages/ko.json`, `messages/en.json` — already complete
- `content/projects.ts`, `content/about.ts` — already bilingual structure
- `src/i18n/` config — no changes needed
- `[locale]` routing pattern — unchanged
