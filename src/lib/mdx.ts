import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import categoriesData from '../../content/categories.json'

const contentDirectory = path.join(process.cwd(), 'content', 'posts')

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

function getLocaleDirectory(locale: string): string {
  return path.join(contentDirectory, locale)
}

function resolvePostPath(slug: string, locale: string): string | null {
  const dir = getLocaleDirectory(locale)
  // Directory format: slug/index.mdx (Keystatic with images)
  const dirPath = path.join(dir, slug, 'index.mdx')
  if (fs.existsSync(dirPath)) return dirPath
  // Flat format: slug.mdx
  const flatPath = path.join(dir, `${slug}.mdx`)
  if (fs.existsSync(flatPath)) return flatPath
  return null
}

export function getAllPosts(locale: string = 'ko'): PostMeta[] {
  const dir = getLocaleDirectory(locale)
  if (!fs.existsSync(dir)) return []

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const slugs: string[] = []

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.mdx')) {
      slugs.push(entry.name.replace(/\.mdx$/, ''))
    } else if (entry.isDirectory()) {
      const indexPath = path.join(dir, entry.name, 'index.mdx')
      if (fs.existsSync(indexPath)) {
        slugs.push(entry.name)
      }
    }
  }

  const posts = slugs
    .map((slug) => getPostMeta(slug, locale))
    .filter((post): post is PostMeta => post !== null)

  return posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function getPostMeta(slug: string, locale: string = 'ko'): PostMeta | null {
  const filePath = resolvePostPath(slug, locale)
  if (!filePath) return null

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
      faqs: Array.isArray(data.faqs) ? data.faqs : [],
    }
  } catch {
    return null
  }
}

export function getPost(slug: string, locale: string = 'ko'): Post | null {
  const filePath = resolvePostPath(slug, locale)
  if (!filePath) return null

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { content } = matter(fileContent)
    const meta = getPostMeta(slug, locale)
    if (!meta) return null

    // Rewrite relative image paths to API route
    const rewrittenContent = content.replace(
      /!\[([^\]]*)\]\((?!https?:\/\/|\/)([\w\-. ]+\.(png|jpg|jpeg|gif|webp|svg|avif))\)/gi,
      (_, alt, filename) =>
        `![${alt}](/api/content-image/${locale}/${slug}/${encodeURIComponent(filename)})`
    )

    return {
      ...meta,
      content: rewrittenContent,
    }
  } catch {
    return null
  }
}

export function getAllSlugs(locale: string = 'ko'): string[] {
  const dir = getLocaleDirectory(locale)
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const slugs: string[] = []
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.mdx')) {
      slugs.push(entry.name.replace(/\.mdx$/, ''))
    } else if (entry.isDirectory()) {
      if (fs.existsSync(path.join(dir, entry.name, 'index.mdx'))) {
        slugs.push(entry.name)
      }
    }
  }
  return slugs
}

export interface CategoryItem {
  value: string
  label: string
}

export function getCategories(_locale: string = 'ko'): CategoryItem[] {
  return categoriesData.categories
}

export function hasTranslation(slug: string, currentLocale: string): boolean {
  const targetLocale = currentLocale === 'ko' ? 'en' : 'ko'
  return resolvePostPath(slug, targetLocale) !== null
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
    headings.push({
      id,
      text,
      level: match[1].length,
    })
  }

  return headings
}

export function getCategoryLabel(value: string): string {
  const found = categoriesData.categories.find((c) => c.value === value)
  return found?.label || value
}

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
