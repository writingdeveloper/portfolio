import { describe, it, expect } from 'vitest'
import { extractHeadings, getAllPosts, getPost, getAllSlugs, getCategories, getCategoryLabel } from '../mdx'

describe('getAllPosts', () => {
  it('returns posts sorted by publishedAt descending', () => {
    const posts = getAllPosts('ko')
    expect(Array.isArray(posts)).toBe(true)
    for (let i = 1; i < posts.length; i++) {
      expect(
        new Date(posts[i - 1].publishedAt).getTime()
      ).toBeGreaterThanOrEqual(new Date(posts[i].publishedAt).getTime())
    }
  })

  it('cross-locale hasTranslation flag is populated', () => {
    const ko = getAllPosts('ko')
    const en = getAllPosts('en')
    // Every post has a boolean (not undefined) — proves the loader ran the
    // second pass that sets hasTranslation from the other locale map.
    for (const p of ko) expect(typeof p.hasTranslation).toBe('boolean')
    for (const p of en) expect(typeof p.hasTranslation).toBe('boolean')
  })
})

describe('getPost', () => {
  it('rewrites relative image paths to the content-image API route', () => {
    const posts = getAllPosts('ko')
    if (posts.length === 0) return // skip if no posts in content/
    const post = getPost(posts[0].slug, 'ko')
    expect(post).not.toBeNull()
    if (post) {
      // Any markdown image ref must no longer be a bare relative filename.
      // It should be either http(s)://, /, or specifically /api/content-image/.
      const matches = Array.from(post.content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g))
      for (const [, url] of matches) {
        expect(url.startsWith('http') || url.startsWith('/')).toBe(true)
      }
    }
  })

  it('rejects invalid slugs (path traversal attempt)', () => {
    expect(getPost('../../etc/passwd', 'ko')).toBeNull()
    expect(getPost('../secret', 'ko')).toBeNull()
    expect(getPost('foo/bar', 'ko')).toBeNull()
  })

  it('returns null for unknown slugs', () => {
    expect(getPost('this-slug-definitely-does-not-exist-xyz123', 'ko')).toBeNull()
  })
})

describe('getAllSlugs', () => {
  it('returns an array of strings', () => {
    const slugs = getAllSlugs('ko')
    expect(Array.isArray(slugs)).toBe(true)
    for (const s of slugs) expect(typeof s).toBe('string')
  })

  it('is consistent with getAllPosts count', () => {
    expect(getAllSlugs('ko').length).toBe(getAllPosts('ko').length)
  })
})

describe('getCategories', () => {
  it('returns category items with value and label', () => {
    const koCategories = getCategories('ko')
    const enCategories = getCategories('en')
    expect(koCategories.length).toBeGreaterThan(0)
    expect(enCategories.length).toBe(koCategories.length)
    for (const c of koCategories) {
      expect(c).toHaveProperty('value')
      expect(c).toHaveProperty('label')
    }
  })
})

describe('getCategoryLabel', () => {
  it('returns the value back for unknown category', () => {
    expect(getCategoryLabel('nonexistent-category', 'ko')).toBe('nonexistent-category')
  })
})

describe('extractHeadings', () => {
  it('extracts h2 and h3 headings', () => {
    const content = '## Hello\n### World\n## Another'
    const headings = extractHeadings(content)
    expect(headings).toHaveLength(3)
    expect(headings[0]).toEqual({ id: 'hello', text: 'Hello', level: 2 })
    expect(headings[1]).toEqual({ id: 'world', text: 'World', level: 3 })
    expect(headings[2]).toEqual({ id: 'another', text: 'Another', level: 2 })
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

  it('handles Korean text', () => {
    const content = '## 안녕하세요'
    const headings = extractHeadings(content)
    expect(headings[0].id).toBe('안녕하세요')
    expect(headings[0].text).toBe('안녕하세요')
  })
})
