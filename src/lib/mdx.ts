import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const postsDirectory = path.join(process.cwd(), 'content', 'posts')

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
}

export interface Post extends PostMeta {
  content: string
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDirectory)) return []

  const files = fs.readdirSync(postsDirectory).filter((f) => f.endsWith('.mdx'))

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, '')
    return getPostMeta(slug)
  }).filter((post): post is PostMeta => post !== null)

  return posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function getPostMeta(slug: string): PostMeta | null {
  const filePath = path.join(postsDirectory, `${slug}.mdx`)
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
      language: data.language || 'ko',
      coverImage: data.coverImage || '',
      readingTime: stats.text,
      readingTimeMinutes: Math.ceil(stats.minutes),
    }
  } catch {
    return null
  }
}

export function getPost(slug: string): Post | null {
  const filePath = path.join(postsDirectory, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { content } = matter(fileContent)
    const meta = getPostMeta(slug)
    if (!meta) return null

    return {
      ...meta,
      content,
    }
  } catch {
    return null
  }
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) return []
  return fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
}

export function getCategories(): string[] {
  const posts = getAllPosts()
  const categories = new Set(posts.map((p) => p.category).filter(Boolean))
  return Array.from(categories).sort()
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
