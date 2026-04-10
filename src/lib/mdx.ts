import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import categoriesData from '../../content/categories.json'

const contentDirectory = path.join(process.cwd(), 'content', 'posts')
const SLUG_REGEX = /^[a-zA-Z0-9가-힣_-]+$/

export interface FaqItem {
  question: string
  answer: string
}

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
  faqs: FaqItem[]
}

export interface Post extends PostMeta {
  content: string
}

interface CachedPost {
  meta: PostMeta
  content: string
}

type PostMap = Map<string, CachedPost>

// Module-level cache. Persists across requests during build/ISR lifetime
// — a single blog page render used to trigger 3-4 filesystem scans; now it
// fans out to one scan per locale, then hits the map for every subsequent call.
const postCache = new Map<string, PostMap>()

function getLocaleDirectory(locale: string): string {
  return path.join(contentDirectory, locale)
}

function resolvePostPath(slug: string, locale: string): string | null {
  if (!SLUG_REGEX.test(slug)) return null

  const dir = getLocaleDirectory(locale)
  const dirPath = path.join(dir, slug, 'index.mdx')
  if (fs.existsSync(dirPath)) return dirPath
  const flatPath = path.join(dir, `${slug}.mdx`)
  if (fs.existsSync(flatPath)) return flatPath
  return null
}

function loadLocaleMap(locale: string): PostMap {
  const map: PostMap = new Map()
  const dir = getLocaleDirectory(locale)
  if (!fs.existsSync(dir)) return map

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    let slug: string | null = null
    if (entry.isFile() && entry.name.endsWith('.mdx')) {
      slug = entry.name.replace(/\.mdx$/, '')
    } else if (entry.isDirectory()) {
      if (fs.existsSync(path.join(dir, entry.name, 'index.mdx'))) {
        slug = entry.name
      }
    }
    if (!slug || !SLUG_REGEX.test(slug)) continue

    const filePath = resolvePostPath(slug, locale)
    if (!filePath) continue

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(fileContent)
      const stats = readingTime(content)

      map.set(slug, {
        meta: {
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
          hasTranslation: false, // populated after cross-locale pass
          faqs: Array.isArray(data.faqs) ? data.faqs : [],
        },
        content,
      })
    } catch {
      // skip corrupt / unreadable files
    }
  }
  return map
}

function getOrLoadPosts(locale: string): PostMap {
  const cached = postCache.get(locale)
  if (cached) return cached

  // Load both locales in one pass so hasTranslation is accurate without
  // triggering a second filesystem walk per request.
  const koMap = loadLocaleMap('ko')
  const enMap = loadLocaleMap('en')

  for (const post of koMap.values()) {
    post.meta.hasTranslation = enMap.has(post.meta.slug)
  }
  for (const post of enMap.values()) {
    post.meta.hasTranslation = koMap.has(post.meta.slug)
  }

  postCache.set('ko', koMap)
  postCache.set('en', enMap)

  return postCache.get(locale) ?? new Map()
}

export function getAllPosts(locale: string = 'ko'): PostMeta[] {
  const map = getOrLoadPosts(locale)
  return Array.from(map.values())
    .map((p) => p.meta)
    .sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
}

export function getPostMeta(slug: string, locale: string = 'ko'): PostMeta | null {
  return getOrLoadPosts(locale).get(slug)?.meta ?? null
}

export function getPost(slug: string, locale: string = 'ko'): Post | null {
  const cached = getOrLoadPosts(locale).get(slug)
  if (!cached) return null

  // Rewrite relative image paths to the content-image API route
  const rewrittenContent = cached.content.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/|\/)([\w\-. ]+\.(png|jpg|jpeg|gif|webp|avif))\)/gi,
    (_, alt, filename) =>
      `![${alt}](/api/content-image/${locale}/${slug}/${encodeURIComponent(filename)})`
  )

  return {
    ...cached.meta,
    content: rewrittenContent,
  }
}

export function getAllSlugs(locale: string = 'ko'): string[] {
  return Array.from(getOrLoadPosts(locale).keys())
}

export interface CategoryItem {
  value: string
  label: string
}

interface CategoryData {
  value: string
  label: string
  labelKo?: string
}

export function getCategories(locale: string = 'ko'): CategoryItem[] {
  return (categoriesData.categories as CategoryData[]).map((c) => ({
    value: c.value,
    label: locale === 'ko' ? c.labelKo || c.label : c.label,
  }))
}

export function hasTranslation(slug: string, currentLocale: string): boolean {
  const targetLocale = currentLocale === 'ko' ? 'en' : 'ko'
  return getOrLoadPosts(targetLocale).has(slug)
}

export interface TocItem {
  id: string
  text: string
  level: number
}

export function extractHeadings(content: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  const headings: TocItem[] = []
  const slugCounts = new Map<string, number>()
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[2].trim()
    const baseId = text
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    const count = slugCounts.get(baseId) || 0
    slugCounts.set(baseId, count + 1)
    const id = count === 0 ? baseId : `${baseId}-${count}`
    headings.push({ id, text, level: match[1].length })
  }

  return headings
}

export function getCategoryLabel(value: string, locale: string = 'en'): string {
  const found = (categoriesData.categories as CategoryData[]).find(
    (c) => c.value === value
  )
  if (!found) return value
  return locale === 'ko' ? found.labelKo || found.label : found.label
}

export function getRelatedPosts(
  slug: string,
  locale: string,
  limit: number = 3
): PostMeta[] {
  const map = getOrLoadPosts(locale)
  const current = map.get(slug)?.meta
  if (!current) return []

  const scored: { post: PostMeta; score: number }[] = []
  for (const cached of map.values()) {
    if (cached.meta.slug === slug) continue
    let score = 0
    if (cached.meta.category === current.category) score += 2
    for (const tag of cached.meta.tags) {
      if (current.tags.includes(tag)) score += 1
    }
    if (score > 0) scored.push({ post: cached.meta, score })
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.post)
}
