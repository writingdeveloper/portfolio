# Portfolio Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Address 11 identified gaps in the portfolio site: bug fixes, syntax highlighting, dynamic OG images, category filters, TOC, About page, analytics, i18n fixes, and cleanup.

**Architecture:** All changes are in the existing Next.js 16 App Router + MDX + next-intl codebase. No new frameworks or dependencies except `@vercel/analytics` and `@vercel/speed-insights`. Shiki is already installed but unwired.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS 4, shiki, next-intl, Framer Motion, @vercel/analytics

---

## Task 1: Fix .gitignore duplicate and delete dead code

**Files:**
- Modify: `.gitignore`
- Delete: `src/components/portable-text/CodeBlock.tsx`

**Step 1: Fix .gitignore — remove duplicate `.vercel` at end of file**

The file currently has `.vercel` on line 37 and again on line 43. Remove the duplicate on line 43 and the blank line before it.

Replace lines 39-43:
```
# typescript
*.tsbuildinfo
next-env.d.ts

.vercel
```

With:
```
# typescript
*.tsbuildinfo
next-env.d.ts
```

**Step 2: Delete orphaned CodeBlock**

```bash
rm src/components/portable-text/CodeBlock.tsx
rmdir src/components/portable-text
```

**Step 3: Commit**

```bash
git add .gitignore
git add src/components/portable-text/CodeBlock.tsx
git commit -m "chore: remove duplicate .gitignore entry and orphaned CodeBlock component"
```

---

## Task 2: Fix theme flash bug

**Files:**
- Modify: `src/app/[locale]/layout.tsx`

**Step 1: Add inline theme initialization script to `<head>`**

In `src/app/[locale]/layout.tsx`, add a `<script>` inside `<head>` before `<body>` to read `localStorage` and apply the theme class before React hydrates. The script must be synchronous (no `defer`/`async`) to block rendering until theme is applied.

Change the `<html>` and `<body>` section from:

```tsx
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-gray-950 text-gray-100 min-h-screen`}>
```

To:

```tsx
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-gray-950 text-gray-100 min-h-screen`}>
```

**Step 2: Verify** — Run `npm run dev`, toggle to light mode, refresh the page. Should NOT flash dark then light.

**Step 3: Commit**

```bash
git add src/app/[locale]/layout.tsx
git commit -m "fix: eliminate theme flash on page load with blocking script"
```

---

## Task 3: Translate not-found.tsx and error.tsx

**Files:**
- Modify: `messages/ko.json`
- Modify: `messages/en.json`
- Modify: `src/app/[locale]/not-found.tsx`
- Modify: `src/app/[locale]/error.tsx`

**Step 1: Add i18n keys to both locale files**

Add to `messages/ko.json` inside the `"error"` key (new top-level key):

```json
"error": {
  "notFound": "페이지를 찾을 수 없습니다",
  "notFoundDescription": "요청하신 페이지가 존재하지 않습니다.",
  "somethingWentWrong": "문제가 발생했습니다",
  "tryAgain": "다시 시도"
}
```

Add to `messages/en.json`:

```json
"error": {
  "notFound": "Page Not Found",
  "notFoundDescription": "The page you're looking for doesn't exist.",
  "somethingWentWrong": "Something went wrong",
  "tryAgain": "Try again"
}
```

**Step 2: Rewrite not-found.tsx**

```tsx
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function NotFound() {
  const t = useTranslations('error')
  const tc = useTranslations('common')

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-400">{t('notFoundDescription')}</p>
      <Link
        href="/"
        className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
      >
        {tc('backToHome')}
      </Link>
    </div>
  )
}
```

**Step 3: Rewrite error.tsx — replace hardcoded strings**

```tsx
'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('error')
  const tc = useTranslations('common')

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-4xl font-bold">500</h1>
      <p className="text-gray-400">{t('somethingWentWrong')}</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {t('tryAgain')}
        </button>
        <Link
          href="/"
          className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {tc('backToHome')}
        </Link>
      </div>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add messages/ko.json messages/en.json src/app/[locale]/not-found.tsx src/app/[locale]/error.tsx
git commit -m "fix: translate not-found and error pages with i18n keys"
```

---

## Task 4: Wire up Shiki syntax highlighting

**Files:**
- Create: `src/lib/shiki.ts`
- Modify: `src/components/mdx/MdxComponents.tsx`

**Step 1: Create shiki helper** (`src/lib/shiki.ts`)

```typescript
import { createHighlighter } from 'shiki'

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark'],
      langs: ['typescript', 'javascript', 'python', 'rust', 'html', 'css', 'bash', 'json', 'sql', 'go', 'tsx', 'jsx', 'markdown', 'yaml', 'toml', 'diff'],
    })
  }
  return highlighterPromise
}

export async function highlightCode(code: string, lang: string): Promise<string> {
  const highlighter = await getHighlighter()
  const loadedLangs = highlighter.getLoadedLanguages()
  const language = loadedLangs.includes(lang as any) ? lang : 'text'
  return highlighter.codeToHtml(code, {
    lang: language,
    theme: 'github-dark',
  })
}
```

**Step 2: Update MdxComponents to use shiki**

Replace the entire `src/components/mdx/MdxComponents.tsx` with:

```tsx
/* eslint-disable @next/next/no-img-element */
import type { ComponentPropsWithoutRef } from 'react'
import { highlightCode } from '@/lib/shiki'
import { CopyButton } from './CopyButton'

function generateSlug(children: React.ReactNode): string {
  const text = typeof children === 'string' ? children : ''
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    return extractText((node as any).props.children)
  }
  return ''
}

async function CodeBlock(props: ComponentPropsWithoutRef<'pre'>) {
  const codeChild = props.children as any
  const className = codeChild?.props?.className || ''
  const lang = className.replace(/language-/, '') || 'text'
  const code = extractText(codeChild?.props?.children).replace(/\n$/, '')

  const html = await highlightCode(code, lang)

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-gray-800 relative group">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 text-xs text-gray-400">
        <span>{lang !== 'text' ? lang : ''}</span>
        <CopyButton code={code} />
      </div>
      <div
        className="[&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:bg-gray-900 [&_pre]:text-sm [&_pre]:m-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export const mdxComponents = {
  h1: (props: ComponentPropsWithoutRef<'h1'>) => (
    <h2 id={generateSlug(props.children)} className="text-2xl sm:text-3xl font-bold mt-10 mb-4 scroll-mt-20" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<'h2'>) => (
    <h2 id={generateSlug(props.children)} className="text-xl sm:text-2xl font-bold mt-10 mb-4 scroll-mt-20" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<'h3'>) => (
    <h3 id={generateSlug(props.children)} className="text-lg sm:text-xl font-semibold mt-8 mb-3 scroll-mt-20" {...props} />
  ),
  h4: (props: ComponentPropsWithoutRef<'h4'>) => (
    <h4 className="text-base sm:text-lg font-semibold mt-6 mb-2" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<'p'>) => <p className="my-4 leading-relaxed" {...props} />,
  a: (props: ComponentPropsWithoutRef<'a'>) => {
    const isExternal = props.href?.startsWith('http')
    return (
      <a
        className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      />
    )
  },
  ul: (props: ComponentPropsWithoutRef<'ul'>) => <ul className="list-disc pl-6 my-4 space-y-1" {...props} />,
  ol: (props: ComponentPropsWithoutRef<'ol'>) => <ol className="list-decimal pl-6 my-4 space-y-1" {...props} />,
  li: (props: ComponentPropsWithoutRef<'li'>) => <li className="leading-relaxed" {...props} />,
  blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 my-6" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<'code'>) => {
    if (props.className) {
      return <code {...props} />
    }
    return <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm" {...props} />
  },
  pre: CodeBlock,
  img: (props: ComponentPropsWithoutRef<'img'>) => (
    <figure className="my-8">
      <img className="rounded-lg w-full h-auto" loading="lazy" alt="" {...props} />
    </figure>
  ),
  strong: (props: ComponentPropsWithoutRef<'strong'>) => <strong className="font-semibold text-gray-100" {...props} />,
  hr: () => <hr className="my-8 border-gray-800" />,
}
```

**Step 3: Create CopyButton client component** (`src/components/mdx/CopyButton.tsx`)

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, Copy } from 'lucide-react'

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for non-secure contexts
    }
  }

  return (
    <button onClick={handleCopy} className="flex items-center gap-1 hover:text-white transition-colors">
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
```

**Step 4: Verify** — Run `npm run dev`, navigate to a blog post with code blocks. Code should be syntax-highlighted with github-dark theme.

**Step 5: Commit**

```bash
git add src/lib/shiki.ts src/components/mdx/MdxComponents.tsx src/components/mdx/CopyButton.tsx
git commit -m "feat: wire up Shiki syntax highlighting for MDX code blocks"
```

---

## Task 5: Dynamic OG images

**Files:**
- Modify: `src/app/api/og/route.tsx`
- Modify: `src/app/[locale]/blog/[slug]/page.tsx`

**Step 1: Update OG route to accept query params**

Replace `src/app/api/og/route.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')
  const description = searchParams.get('description')

  // If no params, return generic image
  if (!title) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0f',
          }}
        >
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, color: '#ffffff', letterSpacing: '-1px' }}>
            WritingDeveloper
          </div>
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 400, color: '#888888', marginTop: 20 }}>
            Dev Stories &amp; Tech Tutorials
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }

  // Dynamic image with title and description
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          backgroundColor: '#0a0a0f',
          padding: '60px 80px',
        }}
      >
        <div style={{ display: 'flex', fontSize: 52, fontWeight: 700, color: '#ffffff', lineHeight: 1.2, marginBottom: 16 }}>
          {title.length > 60 ? title.slice(0, 57) + '...' : title}
        </div>
        {description && (
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 400, color: '#9ca3af', lineHeight: 1.4, marginBottom: 40 }}>
            {description.length > 120 ? description.slice(0, 117) + '...' : description}
          </div>
        )}
        <div style={{ display: 'flex', fontSize: 20, fontWeight: 600, color: '#3b82f6' }}>
          writingdeveloper.blog
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
```

**Step 2: Update blog post metadata to use dynamic OG**

In `src/app/[locale]/blog/[slug]/page.tsx`, change the OG image line inside `generateMetadata`:

Replace:
```tsx
  const ogImage = post.coverImage || DEFAULT_OG_IMAGE
```

With:
```tsx
  const ogImage = post.coverImage || `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(post.excerpt || '')}`
```

**Step 3: Commit**

```bash
git add src/app/api/og/route.tsx src/app/[locale]/blog/[slug]/page.tsx
git commit -m "feat: add dynamic OG images with per-post title and description"
```

---

## Task 6: Blog category filter with URL query params

**Files:**
- Modify: `src/app/[locale]/blog/page.tsx`
- Create: `src/components/blog/CategoryFilter.tsx`

**Step 1: Create CategoryFilter client component**

```tsx
// src/components/blog/CategoryFilter.tsx
'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

interface CategoryFilterProps {
  categories: string[]
  activeCategory: string | null
}

export function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  const t = useTranslations('blog')

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <Link
        href="/blog"
        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
          !activeCategory
            ? 'bg-blue-500/20 text-blue-400'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
      >
        {t('allCategories')}
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat}
          href={`/blog?category=${encodeURIComponent(cat)}`}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            activeCategory === cat
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {cat}
        </Link>
      ))}
    </div>
  )
}
```

**Step 2: Rewrite blog page to use searchParams**

Replace `src/app/[locale]/blog/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getAllPosts, getCategories } from '@/lib/mdx'
import { SITE_URL } from '@/lib/constants'
import type { PostMeta } from '@/lib/mdx'
import { PostCard } from '@/components/blog/PostCard'
import { CategoryFilter } from '@/components/blog/CategoryFilter'
import { PageTransition } from '@/components/ui/PageTransition'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  const localePath = locale === 'ko' ? '' : `/${locale}`
  const pageUrl = `${SITE_URL}${localePath}/blog`
  return {
    title: t('title'),
    description: t('description'),
    openGraph: { url: pageUrl },
    alternates: {
      canonical: pageUrl,
      languages: { ko: `${SITE_URL}/blog`, en: `${SITE_URL}/en/blog`, 'x-default': `${SITE_URL}/blog` },
    },
  }
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const { locale } = await params
  const { category } = await searchParams
  setRequestLocale(locale)

  const allPosts = getAllPosts()
  const categories = getCategories()
  const posts = category
    ? allPosts.filter((p) => p.category === category)
    : allPosts

  return <BlogContent posts={posts} categories={categories} activeCategory={category || null} />
}

function BlogContent({ posts, categories, activeCategory }: { posts: PostMeta[]; categories: string[]; activeCategory: string | null }) {
  const t = useTranslations('blog')

  return (
    <PageTransition>
      <div>
        <header className="mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-gray-400">{t('description')}</p>
        </header>

        {categories.length > 0 && (
          <CategoryFilter categories={categories} activeCategory={activeCategory} />
        )}

        {posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-12">{t('noPosts')}</p>
        )}
      </div>
    </PageTransition>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/blog/CategoryFilter.tsx src/app/[locale]/blog/page.tsx
git commit -m "feat: add interactive blog category filter with URL query params"
```

---

## Task 7: Blog Table of Contents

**Files:**
- Create: `src/components/blog/TableOfContents.tsx`
- Modify: `src/app/[locale]/blog/[slug]/page.tsx`
- Modify: `src/lib/mdx.ts`

**Step 1: Add heading extraction to mdx.ts**

Add this function at the bottom of `src/lib/mdx.ts`:

```typescript
export interface TocItem {
  id: string
  text: string
  level: number
}

export function extractHeadings(content: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  const headings: TocItem[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    headings.push({
      id,
      text,
      level: match[1].length,
    })
  }

  return headings
}
```

**Step 2: Create TableOfContents component**

```tsx
// src/components/blog/TableOfContents.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import type { TocItem } from '@/lib/mdx'

interface TableOfContentsProps {
  headings: TocItem[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const t = useTranslations('common')
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px' }
    )

    for (const heading of headings) {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <>
      {/* Mobile: collapsible */}
      <div className="lg:hidden mb-8">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          {t('tableOfContents')}
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <nav className="mt-3 pl-1 border-l border-gray-800">
            <TocList headings={headings} activeId={activeId} onClick={() => setIsOpen(false)} />
          </nav>
        )}
      </div>

      {/* Desktop: sticky sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <p className="text-sm font-medium text-gray-400 mb-3">{t('tableOfContents')}</p>
          <nav className="pl-1 border-l border-gray-800">
            <TocList headings={headings} activeId={activeId} />
          </nav>
        </div>
      </aside>
    </>
  )
}

function TocList({ headings, activeId, onClick }: { headings: TocItem[]; activeId: string; onClick?: () => void }) {
  return (
    <ul className="space-y-2">
      {headings.map((heading) => (
        <li key={heading.id} style={{ paddingLeft: heading.level === 3 ? '1rem' : '0' }}>
          <a
            href={`#${heading.id}`}
            onClick={onClick}
            className={`text-sm block py-0.5 pl-3 border-l-2 transition-colors ${
              activeId === heading.id
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  )
}
```

**Step 3: Update blog post page to include TOC with 2-column layout**

In `src/app/[locale]/blog/[slug]/page.tsx`, add the import and modify the layout:

Add imports at top:
```tsx
import { TableOfContents } from '@/components/blog/TableOfContents'
import { extractHeadings } from '@/lib/mdx'
import type { TocItem } from '@/lib/mdx'
```

In the component, after `const post = getPost(slug)` and `if (!post) notFound()`, add:
```tsx
  const headings = extractHeadings(post.content)
```

Change the return JSX to wrap in a 2-column grid:

```tsx
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-[1fr_200px] lg:gap-8">
        <article>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <header className="mb-10">
            {post.category && (
              <span className="text-sm text-blue-400 font-medium mb-4 block">
                {post.category}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{post.author}</span>
              <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}</time>
              <span>{post.readingTime}</span>
            </div>
          </header>

          {/* Mobile TOC */}
          <div className="lg:hidden">
            <TableOfContents headings={headings} />
          </div>

          <div className="prose-content">
            <MDXRemote source={post.content} components={mdxComponents} />
          </div>

          {post.tags?.length > 0 && (
            <div className="mt-12 pt-6 border-t border-gray-800">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-300">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <ShareButtons
            url={postUrl}
            title={post.title}
          />
        </article>

        {/* Desktop TOC */}
        <TableOfContents headings={headings} />
      </div>
    </PageTransition>
  )
```

Note: Remove the old `<article className="max-w-3xl mx-auto">` wrapper — the grid handles max-width now.

**Step 4: Commit**

```bash
git add src/lib/mdx.ts src/components/blog/TableOfContents.tsx src/app/[locale]/blog/[slug]/page.tsx
git commit -m "feat: add Table of Contents with active section highlighting"
```

---

## Task 8: About page with skills and timeline

**Files:**
- Create: `content/about.ts`
- Modify: `src/app/[locale]/about/page.tsx`
- Modify: `messages/ko.json`
- Modify: `messages/en.json`

**Step 1: Create about data file**

```typescript
// content/about.ts
export interface Skill {
  name: string
  category: 'frontend' | 'backend' | 'tools'
}

export interface TimelineItem {
  date: string
  title: Record<string, string>
  description: Record<string, string>
  type: 'work' | 'education' | 'project'
}

export const skills: Skill[] = [
  // Frontend
  { name: 'React', category: 'frontend' },
  { name: 'Next.js', category: 'frontend' },
  { name: 'TypeScript', category: 'frontend' },
  { name: 'Tailwind CSS', category: 'frontend' },
  { name: 'Electron', category: 'frontend' },
  // Backend
  { name: 'NestJS', category: 'backend' },
  { name: 'Node.js', category: 'backend' },
  { name: 'Supabase', category: 'backend' },
  { name: 'PostgreSQL', category: 'backend' },
  // Tools
  { name: 'Git', category: 'tools' },
  { name: 'Docker', category: 'tools' },
  { name: 'Vercel', category: 'tools' },
  { name: 'Stripe', category: 'tools' },
]

export const timeline: TimelineItem[] = [
  {
    date: '2024 - Present',
    title: { ko: 'Soursea 개발', en: 'Building Soursea' },
    description: {
      ko: 'AI 기반 이커머스 소싱 어시스턴트 개발 및 운영',
      en: 'Developing and operating an AI-powered e-commerce sourcing assistant',
    },
    type: 'project',
  },
]

export const skillCategories = {
  frontend: { ko: '프론트엔드', en: 'Frontend' },
  backend: { ko: '백엔드', en: 'Backend' },
  tools: { ko: '도구', en: 'Tools' },
} as const
```

**Step 2: Add i18n keys for about page sections**

Add to `messages/ko.json` `about` section (replace existing):

```json
"about": {
  "title": "소개",
  "description": "개발자이자 창업가로서의 여정",
  "body": "개발자이자 창업가로서 기술로 문제를 해결하고 있습니다. Soursea를 비롯한 프로젝트들을 만들고 운영하고 있으며, 그 과정에서 배운 것들을 이 블로그를 통해 공유합니다.",
  "skills": "기술 스택",
  "timeline": "타임라인"
}
```

Add to `messages/en.json` `about` section:

```json
"about": {
  "title": "About",
  "description": "My journey as a developer and entrepreneur",
  "body": "As a developer and entrepreneur, I solve problems with technology. I build and run projects including Soursea, and share what I learn through this blog.",
  "skills": "Tech Stack",
  "timeline": "Timeline"
}
```

**Step 3: Rewrite about page**

```tsx
// src/app/[locale]/about/page.tsx
import { useTranslations, useLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { PageTransition } from '@/components/ui/PageTransition'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { SITE_URL } from '@/lib/constants'
import { skills, timeline, skillCategories } from '../../../content/about'
import type { Skill, TimelineItem } from '../../../content/about'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  const localePath = locale === 'ko' ? '' : `/${locale}`
  const pageUrl = `${SITE_URL}${localePath}/about`
  return {
    title: t('title'),
    description: t('description'),
    openGraph: { url: pageUrl },
    alternates: {
      canonical: pageUrl,
      languages: { ko: `${SITE_URL}/about`, en: `${SITE_URL}/en/about`, 'x-default': `${SITE_URL}/about` },
    },
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <AboutContent />
}

function AboutContent() {
  const t = useTranslations('about')
  const locale = useLocale()

  const groupedSkills = {
    frontend: skills.filter((s) => s.category === 'frontend'),
    backend: skills.filter((s) => s.category === 'backend'),
    tools: skills.filter((s) => s.category === 'tools'),
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-gray-400">{t('description')}</p>
        </header>

        <div className="prose-content text-gray-300 space-y-6 mb-16">
          <p>{t('body')}</p>
        </div>

        {/* Skills */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">{t('skills')}</h2>
          <div className="space-y-6">
            {(Object.keys(groupedSkills) as Array<keyof typeof groupedSkills>).map((category) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-gray-400 mb-3">
                  {skillCategories[category][locale as 'ko' | 'en']}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {groupedSkills[category].map((skill: Skill) => (
                    <span
                      key={skill.name}
                      className="px-3 py-1.5 rounded-lg bg-gray-800 text-sm text-gray-200 border border-gray-700"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-xl font-bold mb-6">{t('timeline')}</h2>
          <div className="relative pl-6 border-l border-gray-800 space-y-8">
            {timeline.map((item: TimelineItem, i: number) => (
              <div key={i} className="relative">
                <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-blue-500 border-2 border-gray-950" />
                <span className="text-xs text-gray-500 block mb-1">{item.date}</span>
                <h3 className="font-semibold text-gray-100">
                  {item.title[locale] || item.title['ko']}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {item.description[locale] || item.description['ko']}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageTransition>
  )
}
```

**Step 4: Commit**

```bash
git add content/about.ts src/app/[locale]/about/page.tsx messages/ko.json messages/en.json
git commit -m "feat: rebuild About page with skills grid and career timeline"
```

---

## Task 9: Add Vercel Analytics

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `src/app/[locale]/layout.tsx`

**Step 1: Install**

```bash
npm install @vercel/analytics @vercel/speed-insights
```

**Step 2: Add Analytics component to layout**

In `src/app/[locale]/layout.tsx`, add imports:

```tsx
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
```

Add `<Analytics />` and `<SpeedInsights />` inside `<body>`, after `</NextIntlClientProvider>`:

```tsx
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
```

**Step 3: Commit**

```bash
git add package.json package-lock.json src/app/[locale]/layout.tsx
git commit -m "feat: add Vercel Analytics and Speed Insights"
```

---

## Task 10: Update README

**Files:**
- Modify: `README.md`

**Step 1: Replace with project-specific README**

```markdown
# WritingDeveloper Portfolio

Personal developer blog and project showcase at [writingdeveloper.blog](https://writingdeveloper.blog).

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Content:** MDX (file-based)
- **i18n:** next-intl (Korean + English)
- **Syntax Highlighting:** Shiki
- **Animations:** Framer Motion
- **Deployment:** Vercel

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
content/          # MDX posts, project data, about data
messages/         # i18n translation files (ko.json, en.json)
src/
  app/            # Next.js App Router pages
  components/     # React components
  i18n/           # Internationalization config
  lib/            # Utilities (MDX parser, SEO, Shiki)
```
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: replace default README with project documentation"
```

---

## Task 11: Build verification

**Step 1: Run lint**

```bash
npm run lint
```

Fix any errors.

**Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds.

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "chore: fix lint errors and verify production build"
```

---

## Summary

| Task | Description | Group |
|------|-------------|-------|
| 1 | .gitignore fix + dead code cleanup | A |
| 2 | Theme flash bug fix | A |
| 3 | not-found/error i18n | A |
| 4 | Shiki syntax highlighting | B |
| 5 | Dynamic OG images | B |
| 6 | Blog category filter | C |
| 7 | Table of Contents | C |
| 8 | About page (skills + timeline) | C |
| 9 | Vercel Analytics | C |
| 10 | README update | D |
| 11 | Build verification | D |

**Total: 11 tasks**
