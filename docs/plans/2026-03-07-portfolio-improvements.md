# Portfolio 20 Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement 20 improvements covering SEO, accessibility, UX features, code quality, and developer experience for the portfolio blog.

**Architecture:** Incremental improvements to an existing Next.js 16 App Router + next-intl + Keystatic CMS + Tailwind CSS portfolio. Each task is independent and can be committed separately. No new dependencies except fuse.js (search) and giscus (comments).

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, next-intl, Keystatic CMS, Shiki

---

## Group A: Quick Fixes (Tasks 1-6)

### Task 1: Add OG images to all pages

**Files:**
- Modify: `src/app/[locale]/page.tsx:25-37` (home generateMetadata)
- Modify: `src/app/[locale]/blog/page.tsx:22-30` (blog generateMetadata)
- Modify: `src/app/[locale]/about/page.tsx:20-28` (about generateMetadata)
- Modify: `src/app/[locale]/projects/page.tsx:20-28` (projects generateMetadata)

**Step 1: Add images to home page metadata**

In `src/app/[locale]/page.tsx`, update the openGraph object (lines 28-32):

```typescript
openGraph: {
  url: pageUrl,
  title: `${t('hero.name')} - ${t('hero.role')}`,
  description: t('hero.description'),
  images: [{ url: `${SITE_URL}/api/og?title=${encodeURIComponent(t('hero.name'))}&description=${encodeURIComponent(t('hero.role'))}`, width: 1200, height: 630, alt: t('hero.name') }],
},
```

Also add import for `DEFAULT_OG_IMAGE` if not already imported. Note: `SITE_URL` and `SITE_NAME` are already imported.

**Step 2: Add images to blog listing page metadata**

In `src/app/[locale]/blog/page.tsx`, update line 25:

```typescript
openGraph: {
  url: pageUrl,
  title: t('title'),
  description: t('description'),
  images: [{ url: `${SITE_URL}/api/og?title=${encodeURIComponent(t('title'))}&description=${encodeURIComponent(t('description'))}`, width: 1200, height: 630, alt: t('title') }],
},
```

Add `SITE_URL` import (already imported).

**Step 3: Add images to about page metadata**

In `src/app/[locale]/about/page.tsx`, update line 23:

```typescript
openGraph: {
  url: pageUrl,
  title: t('title'),
  description: t('description'),
  images: [{ url: `${SITE_URL}/api/og?title=${encodeURIComponent(t('title'))}&description=${encodeURIComponent(t('description'))}`, width: 1200, height: 630, alt: t('title') }],
},
```

**Step 4: Add images to projects page metadata**

In `src/app/[locale]/projects/page.tsx`, update line 23:

```typescript
openGraph: {
  url: pageUrl,
  title: t('title'),
  description: t('description'),
  images: [{ url: `${SITE_URL}/api/og?title=${encodeURIComponent(t('title'))}&description=${encodeURIComponent(t('description'))}`, width: 1200, height: 630, alt: t('title') }],
},
```

**Step 5: Build and verify**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 6: Commit**

```bash
git add src/app/\[locale\]/page.tsx src/app/\[locale\]/blog/page.tsx src/app/\[locale\]/about/page.tsx src/app/\[locale\]/projects/page.tsx
git commit -m "feat: add OG images to all pages"
```

---

### Task 2: Fix hardcoded colors

**Files:**
- Modify: `src/app/[locale]/error.tsx:29`
- Modify: `src/app/[locale]/layout.tsx:91`
- Modify: `src/app/[locale]/about/page.tsx:107`
- Modify: `src/app/keystatic/layout.tsx:12-26`
- Modify: `src/app/globals.css` (add warning variables)

**Step 1: Add warning CSS variables**

In `src/app/globals.css`, add to `.dark` block (after line 35):

```css
--warning-bg: #fef3c7;
--warning-text: #92400e;
--warning-border: #fcd34d;
--btn-primary-bg: #3b82f6;
--btn-primary-bg-hover: #2563eb;
--btn-primary-text: #ffffff;
--timeline-dot: #3b82f6;
```

Add to `.light` block (after line 71):

```css
--warning-bg: #fef3c7;
--warning-text: #92400e;
--warning-border: #fcd34d;
--btn-primary-bg: #3b82f6;
--btn-primary-bg-hover: #2563eb;
--btn-primary-text: #ffffff;
--timeline-dot: #3b82f6;
```

**Step 2: Fix error.tsx**

Line 29, replace:
```
bg-blue-500 text-white rounded-lg hover:bg-blue-600
```
with:
```
bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] rounded-lg hover:bg-[var(--btn-primary-bg-hover)]
```

**Step 3: Fix layout.tsx skip-to-content**

Line 91 in `src/app/[locale]/layout.tsx`, replace:
```
focus:bg-blue-500 focus:text-white
```
with:
```
focus:bg-[var(--btn-primary-bg)] focus:text-[var(--btn-primary-text)]
```

**Step 4: Fix about page timeline dot**

Line 107 in `src/app/[locale]/about/page.tsx`, replace:
```
bg-blue-500
```
with:
```
bg-[var(--timeline-dot)]
```

**Step 5: Fix keystatic layout**

In `src/app/keystatic/layout.tsx`, replace inline styles (lines 12-26) with CSS variables:

```tsx
<div style={{
  padding: '10px 16px',
  backgroundColor: 'var(--warning-bg, #fef3c7)',
  color: 'var(--warning-text, #92400e)',
  fontSize: '14px',
  borderBottom: '1px solid var(--warning-border, #fcd34d)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}}>
```

Note: Keystatic layout has its own `<html>` so CSS variables may not be available. Keep fallback values.

**Step 6: Build and commit**

```bash
npm run build
git add src/app/globals.css src/app/\[locale\]/error.tsx src/app/\[locale\]/layout.tsx src/app/\[locale\]/about/page.tsx src/app/keystatic/layout.tsx
git commit -m "fix: replace hardcoded colors with CSS variables"
```

---

### Task 3: Add focus indicators

**Files:**
- Modify: `src/app/globals.css` (add global focus-visible styles)

**Step 1: Add global focus-visible styles**

Add at the end of `src/app/globals.css`:

```css
/* ===== Focus Indicators ===== */
:focus-visible {
  outline: 2px solid var(--accent-text);
  outline-offset: 2px;
  border-radius: 4px;
}

button:focus-visible,
a:focus-visible,
[role="button"]:focus-visible {
  outline: 2px solid var(--accent-text);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This handles both Task 3 (focus indicators) and Task 16 (prefers-reduced-motion).

**Step 2: Build and commit**

```bash
npm run build
git add src/app/globals.css
git commit -m "feat: add global focus indicators and prefers-reduced-motion support"
```

---

### Task 4: Add root error boundary

**Files:**
- Create: `src/app/error.tsx`

**Step 1: Create root error boundary**

```tsx
'use client'

import { useEffect } from 'react'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Root Error]', error)
  }, [error])

  return (
    <html lang="ko">
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0, backgroundColor: '#030712', color: '#f3f4f6' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>500</h1>
          <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>Something went wrong</p>
          <button
            onClick={reset}
            type="button"
            style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
```

Note: Root error must include `<html>` and `<body>` and cannot use CSS variables or i18n (those may have failed).

**Step 2: Build and commit**

```bash
npm run build
git add src/app/error.tsx
git commit -m "feat: add root error boundary"
```

---

### Task 5: Create .env.example

**Files:**
- Create: `.env.example`

**Step 1: Create file**

```
# Keystatic CMS - GitHub mode (leave empty for local mode)
NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=
```

**Step 2: Commit**

```bash
git add .env.example
git commit -m "chore: add .env.example"
```

---

### Task 6: Add Prettier config

**Files:**
- Create: `.prettierrc`
- Modify: `package.json:5-11` (add format script)

**Step 1: Create .prettierrc**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 120,
  "tabWidth": 2
}
```

**Step 2: Add format script to package.json**

Add to scripts:
```json
"format": "prettier --write \"src/**/*.{ts,tsx}\"",
"format:check": "prettier --check \"src/**/*.{ts,tsx}\"",
"type-check": "tsc --noEmit",
"lint:fix": "eslint --fix"
```

**Step 3: Install prettier**

Run: `npm install -D prettier`

**Step 4: Commit**

```bash
git add .prettierrc package.json package-lock.json
git commit -m "chore: add Prettier config and format/type-check scripts"
```

---

## Group B: Loading & Navigation (Tasks 7-8)

### Task 7: Add loading skeletons

**Files:**
- Create: `src/app/[locale]/loading.tsx`
- Create: `src/app/[locale]/blog/loading.tsx`
- Create: `src/app/[locale]/blog/[slug]/loading.tsx`

**Step 1: Create locale-level loading**

`src/app/[locale]/loading.tsx`:
```tsx
export default function Loading() {
  return (
    <div className="animate-pulse space-y-8 pt-12">
      <div className="space-y-4">
        <div className="h-4 w-32 bg-[var(--bg-elevated)] rounded" />
        <div className="h-10 w-64 bg-[var(--bg-elevated)] rounded" />
        <div className="h-6 w-48 bg-[var(--bg-elevated)] rounded" />
        <div className="h-4 w-96 bg-[var(--bg-elevated)] rounded" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border-default)] p-5 space-y-3">
            <div className="h-3 w-16 bg-[var(--bg-elevated)] rounded" />
            <div className="h-5 w-full bg-[var(--bg-elevated)] rounded" />
            <div className="h-4 w-3/4 bg-[var(--bg-elevated)] rounded" />
            <div className="h-3 w-24 bg-[var(--bg-elevated)] rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Create blog listing loading**

`src/app/[locale]/blog/loading.tsx`:
```tsx
export default function BlogLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-12 space-y-3">
        <div className="h-8 w-32 bg-[var(--bg-elevated)] rounded" />
        <div className="h-4 w-64 bg-[var(--bg-elevated)] rounded" />
      </div>
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-[var(--bg-elevated)] rounded-full" />
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border-default)] p-5 space-y-3">
            <div className="h-3 w-16 bg-[var(--bg-elevated)] rounded" />
            <div className="h-5 w-full bg-[var(--bg-elevated)] rounded" />
            <div className="h-4 w-3/4 bg-[var(--bg-elevated)] rounded" />
            <div className="h-3 w-24 bg-[var(--bg-elevated)] rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 3: Create blog post loading**

`src/app/[locale]/blog/[slug]/loading.tsx`:
```tsx
export default function PostLoading() {
  return (
    <div className="animate-pulse max-w-5xl mx-auto">
      <div className="space-y-4 mb-10">
        <div className="h-3 w-20 bg-[var(--bg-elevated)] rounded" />
        <div className="h-10 w-3/4 bg-[var(--bg-elevated)] rounded" />
        <div className="h-4 w-48 bg-[var(--bg-elevated)] rounded" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-4 bg-[var(--bg-elevated)] rounded" style={{ width: `${75 + Math.random() * 25}%` }} />
        ))}
      </div>
    </div>
  )
}
```

**Step 4: Build and commit**

```bash
npm run build
git add src/app/\[locale\]/loading.tsx src/app/\[locale\]/blog/loading.tsx src/app/\[locale\]/blog/\[slug\]/loading.tsx
git commit -m "feat: add loading skeletons for all pages"
```

---

### Task 8: Mobile menu focus trap

**Files:**
- Modify: `src/components/layout/Header.tsx`

**Step 1: Add focus trap to mobile menu**

In `src/components/layout/Header.tsx`, add a ref and focus trap effect:

After line 22, add:
```typescript
const menuRef = useRef<HTMLDivElement>(null)
```

Add import for `useRef` (line 3).

Add new effect after line 38:
```typescript
useEffect(() => {
  if (!mobileOpen || !menuRef.current) return
  const focusable = menuRef.current.querySelectorAll<HTMLElement>('a, button')
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  function handleTab(e: KeyboardEvent) {
    if (e.key !== 'Tab') return
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
  first.focus()
  document.addEventListener('keydown', handleTab)
  return () => document.removeEventListener('keydown', handleTab)
}, [mobileOpen])
```

Add `ref={menuRef}` to the `<div className="px-4 py-4...">` (line 83).

**Step 2: Build and commit**

```bash
npm run build
git add src/components/layout/Header.tsx
git commit -m "feat: add focus trap to mobile menu"
```

---

## Group C: Blog Features (Tasks 9-14)

### Task 9: Tag filtering

**Files:**
- Modify: `src/app/[locale]/blog/page.tsx`
- Modify: `src/lib/mdx.ts` (add getAllTags function)
- Modify: `messages/ko.json` (add tag filter labels)
- Modify: `messages/en.json`

**Step 1: Add getAllTags to mdx.ts**

Add at end of `src/lib/mdx.ts`:

```typescript
export function getAllTags(locale: string = 'ko'): string[] {
  const posts = getAllPosts(locale)
  const tagSet = new Set<string>()
  for (const post of posts) {
    for (const tag of post.tags) {
      tagSet.add(tag)
    }
  }
  return Array.from(tagSet).sort()
}
```

**Step 2: Update blog page to support tag filtering**

In `src/app/[locale]/blog/page.tsx`:

Update searchParams type (line 38):
```typescript
searchParams: Promise<{ category?: string; tag?: string }>
```

Update destructuring (line 41):
```typescript
const { category, tag } = await searchParams
```

After line 49 (after category filtering), add tag filtering:
```typescript
const filteredPosts = tag
  ? posts.filter((p) => p.tags.includes(tag))
  : posts
```

Update getAllTags import and pass to component:
```typescript
const allTags = getAllTags(locale)
```

Pass `filteredPosts`, `allTags`, `tag` to `BlogContent`.

In BlogContent, render tag pills after category filter:
```tsx
{activeTag && (
  <div className="flex items-center gap-2 mb-6">
    <span className="text-sm text-[var(--text-secondary)]">{t('filterByTag')}:</span>
    <span className="text-sm px-2.5 py-1 rounded-full bg-[var(--accent-bg-active)] text-[var(--accent-text)]">
      #{activeTag}
    </span>
    <a href={`/blog${activeCategory ? `?category=${activeCategory}` : ''}`} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-emphasis)]">
      &times; {t('clearFilter')}
    </a>
  </div>
)}
```

**Step 3: Make post tags clickable**

In `src/app/[locale]/blog/[slug]/page.tsx`, update tags section (lines 159-164):

Change `<span>` to `<a>`:
```tsx
<a
  key={tag}
  href={`/blog?tag=${encodeURIComponent(tag)}`}
  className="text-xs px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-hover)] transition-colors"
>
  #{tag}
</a>
```

**Step 4: Add i18n keys**

In `messages/ko.json` under "blog":
```json
"filterByTag": "태그 필터",
"clearFilter": "필터 해제"
```

In `messages/en.json` under "blog":
```json
"filterByTag": "Filtered by tag",
"clearFilter": "Clear filter"
```

**Step 5: Build and commit**

```bash
npm run build
git add src/lib/mdx.ts src/app/\[locale\]/blog/page.tsx src/app/\[locale\]/blog/\[slug\]/page.tsx messages/ko.json messages/en.json
git commit -m "feat: add tag-based filtering for blog posts"
```

---

### Task 10: Related posts

**Files:**
- Create: `src/components/blog/RelatedPosts.tsx`
- Modify: `src/lib/mdx.ts` (add getRelatedPosts)
- Modify: `src/app/[locale]/blog/[slug]/page.tsx`
- Modify: `messages/ko.json`
- Modify: `messages/en.json`

**Step 1: Add getRelatedPosts to mdx.ts**

```typescript
export function getRelatedPosts(slug: string, locale: string, limit: number = 3): PostMeta[] {
  const current = getPostMeta(slug, locale)
  if (!current) return []

  const allPosts = getAllPosts(locale).filter((p) => p.slug !== slug)

  const scored = allPosts.map((post) => {
    let score = 0
    if (post.category === current.category) score += 2
    for (const tag of post.tags) {
      if (current.tags.includes(tag)) score += 1
    }
    return { post, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.post)
}
```

**Step 2: Create RelatedPosts component**

```tsx
import { Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import type { PostMeta } from '@/lib/mdx'

interface RelatedPostsProps {
  posts: PostMeta[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  const t = useTranslations('blog')
  const locale = useLocale()

  if (posts.length === 0) return null

  return (
    <section className="mt-12 pt-8 border-t border-[var(--border-default)]">
      <h2 className="text-lg font-bold mb-4">{t('relatedPosts')}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <div className="p-4 rounded-lg border border-[var(--border-default)] hover:border-[var(--border-hover)] transition-colors">
              <h3 className="font-medium text-sm mb-1 line-clamp-2">{post.title}</h3>
              <p className="text-xs text-[var(--text-muted)]">
                {new Date(post.publishedAt).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
```

**Step 3: Add to blog post page**

Import and use in `src/app/[locale]/blog/[slug]/page.tsx`:

```typescript
import { getRelatedPosts } from '@/lib/mdx'
import { RelatedPosts } from '@/components/blog/RelatedPosts'
```

After ShareButtons (line 172), add:
```tsx
<RelatedPosts posts={getRelatedPosts(slug, locale)} />
```

**Step 4: Add i18n keys**

ko.json: `"relatedPosts": "관련 글"`
en.json: `"relatedPosts": "Related Posts"`

**Step 5: Build and commit**

```bash
npm run build
git add src/lib/mdx.ts src/components/blog/RelatedPosts.tsx src/app/\[locale\]/blog/\[slug\]/page.tsx messages/ko.json messages/en.json
git commit -m "feat: add related posts recommendations"
```

---

### Task 11: Reading progress bar

**Files:**
- Create: `src/components/blog/ReadingProgress.tsx`
- Modify: `src/app/[locale]/blog/[slug]/page.tsx`

**Step 1: Create ReadingProgress component**

```tsx
'use client'

import { useState, useEffect } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 h-0.5 bg-[var(--accent-text)] z-[60] transition-[width] duration-150"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  )
}
```

**Step 2: Add to blog post page**

Import at top of `src/app/[locale]/blog/[slug]/page.tsx`:
```typescript
import { ReadingProgress } from '@/components/blog/ReadingProgress'
```

Add right after `<PageTransition>` (line 108):
```tsx
<ReadingProgress />
```

**Step 3: Build and commit**

```bash
npm run build
git add src/components/blog/ReadingProgress.tsx src/app/\[locale\]/blog/\[slug\]/page.tsx
git commit -m "feat: add reading progress bar for blog posts"
```

---

### Task 12: Blog search

**Files:**
- Create: `src/components/blog/SearchBar.tsx`
- Modify: `src/app/[locale]/blog/page.tsx`
- Modify: `messages/ko.json`
- Modify: `messages/en.json`

**Step 1: Install fuse.js**

Run: `npm install fuse.js`

**Step 2: Create SearchBar component**

```tsx
'use client'

import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { PostMeta } from '@/lib/mdx'

interface SearchBarProps {
  posts: PostMeta[]
}

export function SearchBar({ posts }: SearchBarProps) {
  const t = useTranslations('blog')
  const [query, setQuery] = useState('')

  const fuse = useMemo(
    () => new Fuse(posts, { keys: ['title', 'excerpt', 'tags'], threshold: 0.3 }),
    [posts]
  )

  const results = query.length >= 2 ? fuse.search(query).map((r) => r.item) : []

  return (
    <div className="relative mb-6">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-text)] focus:outline-none transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-emphasis)]"
            aria-label="Clear search"
            type="button"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {query.length >= 2 && (
        <div className="absolute z-10 top-full mt-2 w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {results.length > 0 ? (
            results.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors border-b border-[var(--border-default)] last:border-b-0"
              >
                <p className="text-sm font-medium">{post.title}</p>
                <p className="text-xs text-[var(--text-muted)] line-clamp-1">{post.excerpt}</p>
              </Link>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-[var(--text-muted)]">{t('noSearchResults')}</p>
          )}
        </div>
      )}
    </div>
  )
}
```

**Step 3: Add to blog page**

In `src/app/[locale]/blog/page.tsx`, import SearchBar and add before CategoryFilter:

```tsx
import { SearchBar } from '@/components/blog/SearchBar'
```

Pass `allPosts` to BlogContent and render:
```tsx
<SearchBar posts={allPosts} />
```

Note: `allPosts` (unfiltered) should be passed separately from `posts` (filtered).

**Step 4: Add i18n keys**

ko.json blog:
```json
"searchPlaceholder": "글 검색...",
"noSearchResults": "검색 결과가 없습니다."
```

en.json blog:
```json
"searchPlaceholder": "Search posts...",
"noSearchResults": "No results found."
```

**Step 5: Build and commit**

```bash
npm run build
git add src/components/blog/SearchBar.tsx src/app/\[locale\]/blog/page.tsx messages/ko.json messages/en.json package.json package-lock.json
git commit -m "feat: add blog search with Fuse.js"
```

---

### Task 13: Blog pagination

**Files:**
- Modify: `src/app/[locale]/blog/page.tsx`
- Create: `src/components/blog/Pagination.tsx`
- Modify: `messages/ko.json`
- Modify: `messages/en.json`

**Step 1: Create Pagination component**

```tsx
'use client'

import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  queryString?: string
}

export function Pagination({ currentPage, totalPages, basePath, queryString = '' }: PaginationProps) {
  const t = useTranslations('blog')

  if (totalPages <= 1) return null

  const separator = queryString ? '&' : '?'

  function pageUrl(page: number) {
    if (page === 1) return `${basePath}${queryString}`
    return `${basePath}${queryString}${separator}page=${page}`
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-12" aria-label={t('pagination')}>
      {currentPage > 1 && (
        <a
          href={pageUrl(currentPage - 1)}
          className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors"
          aria-label={t('previousPage')}
        >
          <ChevronLeft size={18} />
        </a>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <a
          key={page}
          href={pageUrl(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors ${
            page === currentPage
              ? 'bg-[var(--accent-bg-active)] text-[var(--accent-text)]'
              : 'hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
          }`}
        >
          {page}
        </a>
      ))}
      {currentPage < totalPages && (
        <a
          href={pageUrl(currentPage + 1)}
          className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors"
          aria-label={t('nextPage')}
        >
          <ChevronRight size={18} />
        </a>
      )}
    </nav>
  )
}
```

**Step 2: Add pagination to blog page**

In `src/app/[locale]/blog/page.tsx`:

Add `page` to searchParams: `searchParams: Promise<{ category?: string; tag?: string; page?: string }>`

Calculate pagination:
```typescript
const POSTS_PER_PAGE = 9
const { category, tag, page: pageStr } = await searchParams
const currentPage = Math.max(1, parseInt(pageStr || '1', 10) || 1)
// ... after filtering ...
const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
const paginatedPosts = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE)
```

Pass pagination props to BlogContent and render `<Pagination />` after the post grid.

**Step 3: Add i18n keys**

ko.json blog:
```json
"pagination": "페이지 네비게이션",
"previousPage": "이전 페이지",
"nextPage": "다음 페이지"
```

en.json blog:
```json
"pagination": "Page navigation",
"previousPage": "Previous page",
"nextPage": "Next page"
```

**Step 4: Build and commit**

```bash
npm run build
git add src/components/blog/Pagination.tsx src/app/\[locale\]/blog/page.tsx messages/ko.json messages/en.json
git commit -m "feat: add blog pagination"
```

---

### Task 14: Giscus comments

**Files:**
- Create: `src/components/blog/Comments.tsx`
- Modify: `src/app/[locale]/blog/[slug]/page.tsx`
- Modify: `messages/ko.json`
- Modify: `messages/en.json`

**Step 1: Create Comments component**

Note: The user must configure Giscus at https://giscus.app/ to get their repo/category settings. Use placeholder values.

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'

export function Comments() {
  const locale = useLocale()
  const t = useTranslations('blog')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || ref.current.querySelector('.giscus')) return

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', 'writingdeveloper/portfolio')
    script.setAttribute('data-repo-id', '') // TODO: fill after giscus setup
    script.setAttribute('data-category', 'Comments')
    script.setAttribute('data-category-id', '') // TODO: fill after giscus setup
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-theme', 'dark_dimmed')
    script.setAttribute('data-lang', locale === 'ko' ? 'ko' : 'en')
    script.setAttribute('crossorigin', 'anonymous')
    script.async = true

    ref.current.appendChild(script)
  }, [locale])

  return (
    <section className="mt-12 pt-8 border-t border-[var(--border-default)]">
      <h2 className="text-lg font-bold mb-4">{t('comments')}</h2>
      <div ref={ref} />
    </section>
  )
}
```

**Step 2: Add to blog post page**

In `src/app/[locale]/blog/[slug]/page.tsx`, import and add after RelatedPosts:

```tsx
import { Comments } from '@/components/blog/Comments'
```
```tsx
<Comments />
```

**Step 3: Add i18n keys**

ko.json blog: `"comments": "댓글"`
en.json blog: `"comments": "Comments"`

**Step 4: Build and commit**

```bash
npm run build
git add src/components/blog/Comments.tsx src/app/\[locale\]/blog/\[slug\]/page.tsx messages/ko.json messages/en.json
git commit -m "feat: add Giscus comment system"
```

---

## Group D: Enhancement (Tasks 15-20)

### Task 15: Newsletter subscription

**Files:**
- Create: `src/components/blog/Newsletter.tsx`
- Modify: `src/app/[locale]/blog/page.tsx`
- Modify: `messages/ko.json`
- Modify: `messages/en.json`

**Step 1: Create Newsletter component**

This is a visual placeholder - actual email integration depends on the service chosen.

```tsx
'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function Newsletter() {
  const t = useTranslations('blog')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: integrate with email service (Beehiiv, Mailchimp, etc.)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 text-center">
        <p className="text-[var(--accent-text)] font-medium">{t('newsletterThanks')}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 mt-12">
      <div className="flex items-center gap-2 mb-2">
        <Mail size={18} className="text-[var(--accent-text)]" />
        <h3 className="font-semibold">{t('newsletterTitle')}</h3>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-4">{t('newsletterDescription')}</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('newsletterPlaceholder')}
          className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-text)] focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-sm font-medium hover:bg-[var(--btn-primary-bg-hover)] transition-colors"
        >
          {t('newsletterSubscribe')}
        </button>
      </form>
    </div>
  )
}
```

**Step 2: Add to blog listing page**

Import and place after post grid in `src/app/[locale]/blog/page.tsx`:
```tsx
<Newsletter />
```

**Step 3: Add i18n keys**

ko.json blog:
```json
"newsletterTitle": "뉴스레터 구독",
"newsletterDescription": "새로운 글이 올라올 때 알림을 받아보세요.",
"newsletterPlaceholder": "이메일 주소",
"newsletterSubscribe": "구독",
"newsletterThanks": "구독해주셔서 감사합니다!"
```

en.json blog:
```json
"newsletterTitle": "Subscribe to Newsletter",
"newsletterDescription": "Get notified when new posts are published.",
"newsletterPlaceholder": "Email address",
"newsletterSubscribe": "Subscribe",
"newsletterThanks": "Thanks for subscribing!"
```

**Step 4: Build and commit**

```bash
npm run build
git add src/components/blog/Newsletter.tsx src/app/\[locale\]/blog/page.tsx messages/ko.json messages/en.json
git commit -m "feat: add newsletter subscription component"
```

---

### Task 16: prefers-reduced-motion

Already handled in Task 3 (global CSS). No additional work needed.

---

### Task 17: PWA manifest

**Files:**
- Create: `src/app/manifest.ts`

**Step 1: Create manifest**

```typescript
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WritingDeveloper',
    short_name: 'WD',
    description: 'Dev stories, tech tutorials, and startup journey',
    start_url: '/',
    display: 'standalone',
    background_color: '#030712',
    theme_color: '#030712',
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    ],
  }
}
```

**Step 2: Build and commit**

```bash
npm run build
git add src/app/manifest.ts
git commit -m "feat: add PWA manifest"
```

---

### Task 18: Test infrastructure

**Files:**
- Modify: `package.json`

**Step 1: Install Vitest**

Run: `npm install -D vitest @testing-library/react @testing-library/jest-dom`

**Step 2: Add test scripts**

In `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 3: Create vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Step 4: Create sample test**

Create `src/lib/__tests__/mdx.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { extractHeadings } from '../mdx'

describe('extractHeadings', () => {
  it('extracts h2 and h3 headings', () => {
    const content = '## Hello\n### World\n## Another'
    const headings = extractHeadings(content)
    expect(headings).toHaveLength(3)
    expect(headings[0]).toEqual({ id: 'hello', text: 'Hello', level: 2 })
    expect(headings[1]).toEqual({ id: 'world', text: 'World', level: 3 })
  })

  it('handles duplicate slugs', () => {
    const content = '## Hello\n## Hello'
    const headings = extractHeadings(content)
    expect(headings[0].id).toBe('hello')
    expect(headings[1].id).toBe('hello-1')
  })

  it('returns empty for no headings', () => {
    expect(extractHeadings('just text')).toEqual([])
  })
})
```

**Step 5: Run tests and commit**

```bash
npx vitest run
git add vitest.config.ts package.json package-lock.json src/lib/__tests__/mdx.test.ts
git commit -m "chore: add Vitest test infrastructure with sample test"
```

---

### Task 19: MDX image optimization

**Files:**
- Modify: `src/app/api/content-image/[...path]/route.ts`

**Step 1: Add Cache-Control and width query support**

Update the route to accept an optional `w` query param for responsive width hints, and ensure proper caching headers:

In `src/app/api/content-image/[...path]/route.ts`, update the GET function:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path

  if (segments.length !== 3) {
    return new NextResponse('Not found', { status: 404 })
  }

  const [locale, slug, filename] = segments

  if (
    locale.includes('..') ||
    slug.includes('..') ||
    filename.includes('..')
  ) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  let filePath = path.join(CONTENT_DIR, locale, slug, filename)
  if (!fs.existsSync(filePath)) {
    filePath = path.join(CONTENT_DIR, locale, slug, 'content', filename)
  }

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const ext = path.extname(filename).toLowerCase()
  const contentType = MIME_TYPES[ext]
  if (!contentType) {
    return new NextResponse('Unsupported file type', { status: 415 })
  }

  const fileBuffer = fs.readFileSync(filePath)

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': fileBuffer.length.toString(),
    },
  })
}
```

This is a minor improvement (adding Content-Length header). Full image optimization (resizing, format conversion) would require sharp or similar, which is unnecessary complexity for now.

**Step 2: Build and commit**

```bash
npm run build
git add src/app/api/content-image/\[...path\]/route.ts
git commit -m "fix: add Content-Length header to content-image API"
```

---

### Task 20: ESLint any review

**Files:**
- Modify: `eslint.config.mjs`
- Modify: `src/components/mdx/MdxComponents.tsx` (fix any usage)

**Step 1: Fix any usages in MdxComponents**

In `src/components/mdx/MdxComponents.tsx`:

Line 20, replace `(node as any).props.children` with proper typing:
```typescript
function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    return extractText((node as React.ReactElement).props.children)
  }
  return ''
}
```

Line 35, replace `const codeChild = props.children as any` with:
```typescript
const codeChild = props.children as React.ReactElement<{ className?: string; children?: React.ReactNode }>
```

Line 36, update accordingly:
```typescript
const className = codeChild?.props?.className || ''
```

**Step 2: Re-enable ESLint rule as warning**

In `eslint.config.mjs`, change line 18:
```javascript
"@typescript-eslint/no-explicit-any": "warn",
```

**Step 3: Run lint to check remaining issues**

Run: `npm run lint`
Fix any remaining `any` usages.

**Step 4: Build and commit**

```bash
npm run build
npm run lint
git add eslint.config.mjs src/components/mdx/MdxComponents.tsx
git commit -m "chore: reduce any usage and enable ESLint warning"
```

---

## Execution Order Summary

| Task | Description | Dependencies |
|------|-------------|-------------|
| 1 | OG images | None |
| 2 | Hardcoded colors | None |
| 3 | Focus indicators + reduced motion | None |
| 4 | Root error boundary | None |
| 5 | .env.example | None |
| 6 | Prettier config | None |
| 7 | Loading skeletons | None |
| 8 | Mobile menu focus trap | None |
| 9 | Tag filtering | None |
| 10 | Related posts | None |
| 11 | Reading progress bar | None |
| 12 | Blog search | None |
| 13 | Blog pagination | Task 9 (shared blog page changes) |
| 14 | Giscus comments | Task 10 (shared post page changes) |
| 15 | Newsletter | Task 12-13 (shared blog page changes) |
| 16 | prefers-reduced-motion | Done in Task 3 |
| 17 | PWA manifest | None |
| 18 | Test infrastructure | None |
| 19 | MDX image optimization | None |
| 20 | ESLint any review | None |

**Parallel groups (independent):**
- Group 1: Tasks 1, 2, 3, 4, 5, 6, 17, 18 (all independent quick fixes)
- Group 2: Tasks 7, 8, 11, 19, 20 (independent component/config changes)
- Group 3: Tasks 9, 10, 12 (blog features, share messages files)
- Group 4: Tasks 13, 14, 15 (depend on Group 3 for shared file changes)
