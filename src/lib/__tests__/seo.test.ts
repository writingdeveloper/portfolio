import { describe, it, expect } from 'vitest'
import {
  safeJsonLd,
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  generateFaqJsonLd,
} from '../seo'

describe('safeJsonLd', () => {
  it('serializes a plain object to JSON', () => {
    const result = safeJsonLd({ hello: 'world' })
    expect(result).toBe('{"hello":"world"}')
  })

  it('escapes < to \\u003c to prevent </script> injection', () => {
    const payload = { body: '</script><script>alert(1)</script>' }
    const serialized = safeJsonLd(payload)
    // The closing </script> tag must be broken so the browser HTML parser
    // cannot terminate the enclosing <script type="application/ld+json"> tag.
    expect(serialized).not.toContain('</script>')
    expect(serialized).toContain('\\u003c')
  })

  it('escapes a bare < in a field', () => {
    expect(safeJsonLd({ a: '1 < 2' })).toBe('{"a":"1 \\u003c 2"}')
  })

  it('handles nested objects', () => {
    const nested = { outer: { inner: '<evil>' } }
    const result = safeJsonLd(nested)
    expect(result).not.toContain('<')
    expect(JSON.parse(result)).toEqual(nested)
  })
})

describe('generateArticleJsonLd', () => {
  it('produces a valid Article schema', () => {
    const result = generateArticleJsonLd({
      title: 'Test Post',
      description: 'An example',
      url: 'https://example.com/blog/test',
      publishedAt: '2026-01-01',
      authorName: 'Alice',
    })
    expect(result['@type']).toBe('Article')
    expect(result.headline).toBe('Test Post')
    expect(result.author).toEqual({ '@type': 'Person', name: 'Alice' })
    expect(result.dateModified).toBe('2026-01-01')
  })

  it('includes image when provided', () => {
    const result = generateArticleJsonLd({
      title: 'T',
      description: 'D',
      url: 'u',
      imageUrl: 'https://img',
      publishedAt: '2026-01-01',
      authorName: 'A',
    })
    expect(result).toHaveProperty('image', 'https://img')
  })

  it('omits image when undefined', () => {
    const result = generateArticleJsonLd({
      title: 'T',
      description: 'D',
      url: 'u',
      publishedAt: '2026-01-01',
      authorName: 'A',
    })
    expect(result).not.toHaveProperty('image')
  })

  it('uses dateModified when provided', () => {
    const result = generateArticleJsonLd({
      title: 'T',
      description: 'D',
      url: 'u',
      publishedAt: '2026-01-01',
      dateModified: '2026-06-01',
      authorName: 'A',
    })
    expect(result.dateModified).toBe('2026-06-01')
  })
})

describe('generateBreadcrumbJsonLd', () => {
  it('assigns positions starting at 1', () => {
    const result = generateBreadcrumbJsonLd([
      { name: 'Home', url: 'https://example.com' },
      { name: 'Blog', url: 'https://example.com/blog' },
      { name: 'Post', url: 'https://example.com/blog/post' },
    ])
    expect(result.itemListElement).toHaveLength(3)
    expect(result.itemListElement[0].position).toBe(1)
    expect(result.itemListElement[2].position).toBe(3)
    expect(result.itemListElement[2].name).toBe('Post')
  })
})

describe('generateFaqJsonLd', () => {
  it('wraps each FAQ as Question/Answer', () => {
    const result = generateFaqJsonLd([
      { question: 'Why?', answer: 'Because.' },
    ])
    expect(result['@type']).toBe('FAQPage')
    expect(result.mainEntity[0]['@type']).toBe('Question')
    expect(result.mainEntity[0].acceptedAnswer.text).toBe('Because.')
  })
})
