import { describe, it, expect } from 'vitest'
import {
  safeJsonLd,
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  generateFaqJsonLd,
  generateProjectListJsonLd,
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
  it('produces a valid BlogPosting schema', () => {
    const result = generateArticleJsonLd({
      title: 'Test Post',
      description: 'An example',
      url: 'https://example.com/blog/test',
      publishedAt: '2026-01-01',
      authorName: 'Alice',
    })
    expect(result['@type']).toBe('BlogPosting')
    expect(result.headline).toBe('Test Post')
    expect(result.author).toEqual({
      '@type': 'Person',
      name: 'Alice',
      url: 'https://writingdeveloper.blog/about',
    })
    expect(result.dateModified).toBe('2026-01-01')
  })

  it('includes inLanguage and keywords when locale and tags are given', () => {
    const result = generateArticleJsonLd({
      title: 'T',
      description: 'D',
      url: 'u',
      publishedAt: '2026-01-01',
      authorName: 'A',
      locale: 'ko',
      tags: ['nextjs', 'seo'],
    })
    expect(result).toHaveProperty('inLanguage', 'ko-KR')
    expect(result).toHaveProperty('keywords', 'nextjs, seo')
  })

  it('omits inLanguage and keywords when absent', () => {
    const result = generateArticleJsonLd({
      title: 'T',
      description: 'D',
      url: 'u',
      publishedAt: '2026-01-01',
      authorName: 'A',
    })
    expect(result).not.toHaveProperty('inLanguage')
    expect(result).not.toHaveProperty('keywords')
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

describe('generateProjectListJsonLd', () => {
  it('builds an ItemList of authored CreativeWorks', () => {
    const result = generateProjectListJsonLd(
      [
        { name: 'Alpha', description: 'First', url: 'https://alpha.dev', techStack: ['TypeScript', 'Next.js'] },
        { name: 'Beta', description: 'Second' },
      ],
      'en',
    )
    expect(result['@type']).toBe('ItemList')
    expect(result.numberOfItems).toBe(2)
    expect(result.itemListElement[0].position).toBe(1)
    expect(result.itemListElement[0].item['@type']).toBe('CreativeWork')
    expect(result.itemListElement[0].item.author).toEqual({
      '@type': 'Person',
      name: 'Si Hyeong Lee',
      url: 'https://writingdeveloper.blog/about',
    })
    expect(result.itemListElement[0].item).toHaveProperty('keywords', 'TypeScript, Next.js')
  })

  it('omits url and keywords when absent and localizes the author', () => {
    const result = generateProjectListJsonLd([{ name: 'Beta', description: 'Second' }], 'ko')
    expect(result.itemListElement[0].item).not.toHaveProperty('url')
    expect(result.itemListElement[0].item).not.toHaveProperty('keywords')
    expect(result.itemListElement[0].item.author.name).toBe('이시형')
  })

  it('emits a MobileApplication when playStore is present', () => {
    const result = generateProjectListJsonLd(
      [
        {
          name: 'Drymora',
          description: 'Sobriety',
          playStore: 'https://play.google.com/store/apps/details?id=com.soursea.drymora',
          appCategory: 'HealthApplication',
          techStack: ['Next.js'],
        },
      ],
      'en',
    )
    // The item is a MobileApplication|CreativeWork union; widen to read app fields.
    const item = result.itemListElement[0].item as Record<string, unknown>
    expect(item['@type']).toBe('MobileApplication')
    expect(item.operatingSystem).toBe('ANDROID')
    expect(item.applicationCategory).toBe('HealthApplication')
    expect(item.installUrl).toBe('https://play.google.com/store/apps/details?id=com.soursea.drymora')
    expect(item.offers).toEqual({ '@type': 'Offer', price: '0', priceCurrency: 'USD' })
    expect(item).toHaveProperty('keywords', 'Next.js')
  })

  it('defaults applicationCategory to LifestyleApplication', () => {
    const result = generateProjectListJsonLd(
      [{ name: 'X', description: 'Y', playStore: 'https://play.google.com/store/apps/details?id=x' }],
      'en',
    )
    const item = result.itemListElement[0].item as Record<string, unknown>
    expect(item.applicationCategory).toBe('LifestyleApplication')
  })

  it('keeps CreativeWork when playStore is absent', () => {
    const result = generateProjectListJsonLd([{ name: 'Web', description: 'D', url: 'https://w.dev' }], 'en')
    expect(result.itemListElement[0].item['@type']).toBe('CreativeWork')
  })
})
