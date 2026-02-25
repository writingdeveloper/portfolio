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
