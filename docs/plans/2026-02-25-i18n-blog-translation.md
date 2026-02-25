# Bilingual Blog Translation System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable 1:1 bilingual (ko/en) blog content with directory-based separation, SEO hreflang support, and a Claude Code MAX translation workflow.

**Architecture:** Move blog posts from `content/posts/*.mdx` into `content/posts/{locale}/*.mdx`. Split Keystatic into two collections sharing one schema. Update `mdx.ts` to accept a `locale` parameter. Add hreflang alternates and a translation-link UI. Add a helper script to list untranslated posts.

**Tech Stack:** Next.js 16 (App Router), Keystatic CMS, next-intl, gray-matter, TypeScript

---

### Task 1: Migrate existing posts into `content/posts/ko/`

**Files:**
- Move: `content/posts/introducing-keystatic-cms.mdx` → `content/posts/ko/introducing-keystatic-cms.mdx`
- Move: `content/posts/studying-english-with-chatgpt.mdx` → `content/posts/ko/studying-english-with-chatgpt.mdx`
- Move: `content/posts/thoughts-about-giving-back.mdx` → `content/posts/ko/thoughts-about-giving-back.mdx`
- Create: `content/posts/en/` (empty directory with `.gitkeep`)

**Step 1: Create directories and move files**

```bash
mkdir -p content/posts/ko content/posts/en
git mv content/posts/introducing-keystatic-cms.mdx content/posts/ko/
git mv content/posts/studying-english-with-chatgpt.mdx content/posts/ko/
git mv content/posts/thoughts-about-giving-back.mdx content/posts/ko/
touch content/posts/en/.gitkeep
```

**Step 2: Remove `language` field from frontmatter**

In each of the 3 moved MDX files, remove the `language: "ko"` line from the YAML frontmatter. The directory now determines the language.

Example — `content/posts/ko/introducing-keystatic-cms.mdx` frontmatter becomes:

```yaml
---
title: "Keystatic CMS 도입기"
excerpt: "블로그에 Keystatic CMS를 도입하여 웹 기반 에디터로 글을 작성할 수 있게 된 과정을 공유합니다."
publishedAt: "2026-02-23"
author: "이시형"
category: "Development"
tags: ["keystatic", "cms", "nextjs"]
coverImage: ""
---
```

**Step 3: Commit**

```bash
git add content/posts/
git commit -m "refactor: move blog posts into content/posts/ko/ for bilingual support"
```

---

### Task 2: Update Keystatic config — split into two collections

**Files:**
- Modify: `keystatic.config.ts` (entire file)

**Step 1: Rewrite keystatic.config.ts**

Replace the full file with:

```typescript
import { config, fields, collection } from '@keystatic/core'

const postSchema = {
  title: fields.slug({ name: { label: 'Title' } }),
  excerpt: fields.text({ label: 'Excerpt', multiline: true }),
  publishedAt: fields.date({ label: 'Published Date' }),
  author: fields.text({ label: 'Author', defaultValue: '이시형' }),
  category: fields.text({ label: 'Category' }),
  tags: fields.array(fields.text({ label: 'Tag' }), {
    label: 'Tags',
    itemLabel: (props) => props.value,
  }),
  coverImage: fields.text({ label: 'Cover Image URL' }),
  content: fields.mdx({ label: 'Content' }),
}

export default config({
  storage: process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
    ? { kind: 'github', repo: 'writingdeveloper/portfolio' }
    : { kind: 'local' },
  collections: {
    'posts-ko': collection({
      label: '포스트 (한국어)',
      slugField: 'title',
      path: 'content/posts/ko/*',
      format: { contentField: 'content' },
      schema: postSchema,
    }),
    'posts-en': collection({
      label: 'Posts (English)',
      slugField: 'title',
      path: 'content/posts/en/*',
      format: { contentField: 'content' },
      schema: postSchema,
    }),
  },
})
```

**Step 2: Verify Keystatic loads**

Run: `npm run dev` and visit `http://localhost:3000/keystatic`
Expected: Two collections visible — "포스트 (한국어)" and "Posts (English)"

**Step 3: Commit**

```bash
git add keystatic.config.ts
git commit -m "feat: split Keystatic into posts-ko and posts-en collections"
```

---

### Task 3: Update `src/lib/mdx.ts` — locale-aware loading

**Files:**
- Modify: `src/lib/mdx.ts` (lines 1-129)

**Step 1: Rewrite mdx.ts**

Replace the full file with:

```typescript
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const contentDirectory = path.join(process.cwd(), 'content', 'posts')

export interface PostMeta {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  author: string
  category: string
  tags: string[]
  language: string
  coverImage: string
  readingTime: string
  readingTimeMinutes: number
  hasTranslation: boolean
}

export interface Post extends PostMeta {
  content: string
}

function getLocaleDirectory(locale: string): string {
  return path.join(contentDirectory, locale)
}

export function getAllPosts(locale: string = 'ko'): PostMeta[] {
  const dir = getLocaleDirectory(locale)
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))

  const posts = files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, '')
      return getPostMeta(slug, locale)
    })
    .filter((post): post is PostMeta => post !== null)

  return posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function getPostMeta(slug: string, locale: string = 'ko'): PostMeta | null {
  const filePath = path.join(getLocaleDirectory(locale), `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)
    const stats = readingTime(content)

    return {
      slug,
      title: data.title || '',
      excerpt: data.excerpt || '',
      publishedAt: data.publishedAt || '',
      author: data.author || '',
      category: data.category || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      language: locale,
      coverImage: data.coverImage || '',
      readingTime: stats.text,
      readingTimeMinutes: Math.ceil(stats.minutes),
      hasTranslation: hasTranslation(slug, locale),
    }
  } catch {
    return null
  }
}

export function getPost(slug: string, locale: string = 'ko'): Post | null {
  const filePath = path.join(getLocaleDirectory(locale), `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { content } = matter(fileContent)
    const meta = getPostMeta(slug, locale)
    if (!meta) return null

    return {
      ...meta,
      content,
    }
  } catch {
    return null
  }
}

export function getAllSlugs(locale: string = 'ko'): string[] {
  const dir = getLocaleDirectory(locale)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
}

export function getCategories(locale: string = 'ko'): string[] {
  const posts = getAllPosts(locale)
  const categories = new Set(posts.map((p) => p.category).filter(Boolean))
  return Array.from(categories).sort()
}

export function hasTranslation(slug: string, currentLocale: string): boolean {
  const targetLocale = currentLocale === 'ko' ? 'en' : 'ko'
  const targetPath = path.join(getLocaleDirectory(targetLocale), `${slug}.mdx`)
  return fs.existsSync(targetPath)
}

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

**Step 2: Commit**

```bash
git add src/lib/mdx.ts
git commit -m "feat: make mdx.ts locale-aware with hasTranslation helper"
```

---

### Task 4: Update blog list page — pass locale to getAllPosts

**Files:**
- Modify: `src/app/[locale]/blog/page.tsx` (lines 42-46)

**Step 1: Update BlogPage to pass locale**

In `src/app/[locale]/blog/page.tsx`, change lines 42-46 from:

```typescript
  const allPosts = getAllPosts()
  const categories = getCategories()
  const posts = category
    ? allPosts.filter((p) => p.category === category)
    : allPosts
```

to:

```typescript
  const allPosts = getAllPosts(locale)
  const categories = getCategories(locale)
  const posts = category
    ? allPosts.filter((p) => p.category === category)
    : allPosts
```

**Step 2: Commit**

```bash
git add src/app/[locale]/blog/page.tsx
git commit -m "feat: filter blog list by current locale"
```

---

### Task 5: Update blog post page — locale-aware loading + hreflang + translation link

**Files:**
- Modify: `src/app/[locale]/blog/[slug]/page.tsx` (lines 1-135)

**Step 1: Update generateStaticParams**

Change `generateStaticParams` (line 13-15) from:

```typescript
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}
```

to:

```typescript
export function generateStaticParams() {
  const koSlugs = getAllSlugs('ko').map((slug) => ({ slug }))
  const enSlugs = getAllSlugs('en').map((slug) => ({ slug }))
  return [...koSlugs, ...enSlugs]
}
```

**Step 2: Update generateMetadata — pass locale to getPost, conditional hreflang**

Change `generateMetadata` (lines 17-56). Replace the function body:

```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const post = getPost(slug, locale)
  if (!post) return {}

  const url = locale === 'ko' ? `${SITE_URL}/blog/${slug}` : `${SITE_URL}/${locale}/blog/${slug}`
  const ogImage = post.coverImage || `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(post.excerpt || '')}`

  const languages: Record<string, string> = {
    ko: `${SITE_URL}/blog/${slug}`,
    'x-default': `${SITE_URL}/blog/${slug}`,
  }
  if (post.hasTranslation || locale === 'en') {
    languages.en = `${SITE_URL}/en/blog/${slug}`
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      url,
      siteName: SITE_NAME,
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages,
    },
  }
}
```

**Step 3: Update BlogPostPage — pass locale, add translation link**

Replace the `BlogPostPage` component:

```typescript
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const post = getPost(slug, locale)
  if (!post) notFound()

  const headings = extractHeadings(post.content)
  const postUrl = locale === 'ko' ? `${SITE_URL}/blog/${slug}` : `${SITE_URL}/${locale}/blog/${slug}`

  const jsonLd = generateArticleJsonLd({
    title: post.title,
    description: post.excerpt,
    url: postUrl,
    publishedAt: post.publishedAt,
    authorName: post.author,
  })

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
            {post.hasTranslation && (
              <a
                href={locale === 'ko' ? `/en/blog/${slug}` : `/blog/${slug}`}
                className="inline-block mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {locale === 'ko' ? 'Read in English →' : '한국어로 읽기 →'}
              </a>
            )}
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
}
```

**Step 4: Commit**

```bash
git add src/app/[locale]/blog/[slug]/page.tsx
git commit -m "feat: locale-aware blog post page with hreflang and translation link"
```

---

### Task 6: Update home page — pass locale to getAllPosts

**Files:**
- Modify: `src/app/[locale]/page.tsx` (line 21)

**Step 1: Pass locale**

Change line 21 from:

```typescript
  const posts = getAllPosts().slice(0, 3)
```

to:

```typescript
  const posts = getAllPosts(locale).slice(0, 3)
```

**Step 2: Commit**

```bash
git add src/app/[locale]/page.tsx
git commit -m "feat: show locale-specific posts on home page"
```

---

### Task 7: Update sitemap — locale-aware with conditional alternates

**Files:**
- Modify: `src/app/sitemap.ts` (lines 1-40)

**Step 1: Rewrite sitemap.ts**

```typescript
import type { MetadataRoute } from 'next'
import { getAllPosts, hasTranslation } from '@/lib/mdx'
import { SITE_URL } from '@/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const koPosts = getAllPosts('ko')
  const enPosts = getAllPosts('en')

  const staticPages = ['', '/blog', '/projects', '/about']
  const staticUrls = staticPages.flatMap((page) => [
    {
      url: `${SITE_URL}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' || page === '/blog' ? 'daily' as const : 'monthly' as const,
      priority: page === '' ? 1 : page === '/blog' ? 0.9 : page === '/projects' ? 0.7 : 0.5,
      alternates: {
        languages: {
          ko: `${SITE_URL}${page}`,
          en: `${SITE_URL}/en${page}`,
        },
      },
    },
  ])

  const koPostUrls = koPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    ...(hasTranslation(post.slug, 'ko') && {
      alternates: {
        languages: {
          ko: `${SITE_URL}/blog/${post.slug}`,
          en: `${SITE_URL}/en/blog/${post.slug}`,
        },
      },
    }),
  }))

  const enPostUrls = enPosts.map((post) => ({
    url: `${SITE_URL}/en/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    ...(hasTranslation(post.slug, 'en') && {
      alternates: {
        languages: {
          ko: `${SITE_URL}/blog/${post.slug}`,
          en: `${SITE_URL}/en/blog/${post.slug}`,
        },
      },
    }),
  }))

  return [...staticUrls, ...koPostUrls, ...enPostUrls]
}
```

**Step 2: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat: locale-aware sitemap with hreflang alternates"
```

---

### Task 8: Update RSS feed — locale-aware

**Files:**
- Modify: `src/app/feed.xml/route.ts` (lines 1-41)

**Step 1: Rewrite feed route**

```typescript
import { getAllPosts } from '@/lib/mdx'
import { SITE_URL } from '@/lib/constants'

export async function GET() {
  const koPosts = getAllPosts('ko')
  const enPosts = getAllPosts('en')
  const allPosts = [...koPosts, ...enPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  const items = allPosts
    .map((post) => {
      const link = post.language === 'ko'
        ? `${SITE_URL}/blog/${post.slug}`
        : `${SITE_URL}/en/blog/${post.slug}`
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      ${post.category ? `<category>${post.category}</category>` : ''}
      <dc:language>${post.language}</dc:language>
    </item>`
    })
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>WritingDeveloper</title>
    <link>${SITE_URL}</link>
    <description>Dev stories, tech tutorials, and startup journey</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
```

**Step 2: Commit**

```bash
git add src/app/feed.xml/route.ts
git commit -m "feat: include both ko and en posts in RSS feed"
```

---

### Task 9: Create untranslated posts helper script

**Files:**
- Create: `scripts/untranslated.ts`
- Modify: `package.json` (add script)

**Step 1: Create the script**

Create `scripts/untranslated.ts`:

```typescript
import fs from 'fs'
import path from 'path'

const postsDir = path.join(process.cwd(), 'content', 'posts')
const koDir = path.join(postsDir, 'ko')
const enDir = path.join(postsDir, 'en')

function getMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))
}

const koFiles = getMdxFiles(koDir)
const enFiles = new Set(getMdxFiles(enDir))

const untranslated = koFiles.filter((f) => !enFiles.has(f))
const translated = koFiles.filter((f) => enFiles.has(f))

console.log(`\n📝 미번역 포스트 (${untranslated.length}/${koFiles.length}):`)
if (untranslated.length === 0) {
  console.log('  모든 포스트가 번역되었습니다!')
} else {
  untranslated.forEach((f) => console.log(`  - ${f.replace('.mdx', '')}`))
}

console.log(`\n✅ 번역 완료 (${translated.length}/${koFiles.length}):`)
if (translated.length === 0) {
  console.log('  아직 번역된 포스트가 없습니다.')
} else {
  translated.forEach((f) => console.log(`  - ${f.replace('.mdx', '')}`))
}

console.log()
```

**Step 2: Add npm script to package.json**

In `package.json`, add to the `"scripts"` section:

```json
"untranslated": "npx tsx scripts/untranslated.ts"
```

**Step 3: Test the script**

Run: `npm run untranslated`
Expected output:
```
📝 미번역 포스트 (3/3):
  - introducing-keystatic-cms
  - studying-english-with-chatgpt
  - thoughts-about-giving-back

✅ 번역 완료 (0/3):
  아직 번역된 포스트가 없습니다.
```

**Step 4: Commit**

```bash
git add scripts/untranslated.ts package.json
git commit -m "feat: add npm run untranslated helper script"
```

---

### Task 10: Verify full build

**Step 1: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 2: Run dev and manually verify**

Run: `npm run dev`

Verify:
- `http://localhost:3000/blog` — shows Korean posts
- `http://localhost:3000/en/blog` — shows English posts (empty for now)
- `http://localhost:3000/keystatic` — shows two collections
- `http://localhost:3000/sitemap.xml` — shows alternates for posts

**Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address build issues from bilingual migration"
```
