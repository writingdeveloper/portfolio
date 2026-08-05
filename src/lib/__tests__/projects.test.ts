import { describe, it, expect } from 'vitest'
import { hasIndexablePage, projectHref, sortProjectsFeaturedFirst } from '../projects'
import type { Project } from '@/types/content'

const p = (name: string, featured: boolean): Project => ({
  name,
  slug: name.toLowerCase(),
  descriptionKo: '',
  descriptionEn: '',
  techStack: [],
  status: 'active',
  featured,
})

describe('sortProjectsFeaturedFirst', () => {
  it('places featured projects before non-featured', () => {
    const out = sortProjectsFeaturedFirst([p('A', false), p('B', true), p('C', false), p('D', true)])
    expect(out.map((x) => x.name)).toEqual(['B', 'D', 'A', 'C'])
  })

  it('preserves original order within each group (stable)', () => {
    const out = sortProjectsFeaturedFirst([p('A', true), p('B', true), p('C', false)])
    expect(out.map((x) => x.name)).toEqual(['A', 'B', 'C'])
  })

  it('does not mutate the input array', () => {
    const input = [p('A', false), p('B', true)]
    sortProjectsFeaturedFirst(input)
    expect(input.map((x) => x.name)).toEqual(['A', 'B'])
  })
})

const bare = {
  screenshot: undefined,
  website: undefined,
  github: undefined,
  playStore: undefined,
  private: false,
} as const

describe('hasIndexablePage', () => {
  it('rejects a project that is nothing but a blurb', () => {
    expect(hasIndexablePage(bare)).toBe(false)
  })

  it.each([
    ['screenshot', { screenshot: '/images/projects/x.webp' }],
    ['website', { website: 'https://example.com' }],
    ['playStore', { playStore: 'https://play.google.com/store/apps/details?id=x' }],
    ['github', { github: 'https://github.com/writingdeveloper/x' }],
  ])('accepts a project that has a %s', (_label, extra) => {
    expect(hasIndexablePage({ ...bare, ...extra })).toBe(true)
  })

  it('accepts a bare project once a post links to it', () => {
    expect(hasIndexablePage(bare, true)).toBe(true)
  })

  // The Private rule withholds a private repo's URL from the page, so it is not
  // something the page offers and must not qualify it for the sitemap.
  it('does not count a private repo link, which the page never renders', () => {
    expect(
      hasIndexablePage({
        ...bare,
        private: true,
        github: 'https://github.com/writingdeveloper/secret',
      }),
    ).toBe(false)
  })

  it('still accepts a private project that ships a public demo', () => {
    expect(
      hasIndexablePage({
        ...bare,
        private: true,
        github: 'https://github.com/writingdeveloper/secret',
        website: 'https://demo.example.com',
      }),
    ).toBe(true)
  })
})

describe('projectHref', () => {
  it('leaves Korean unprefixed and prefixes every other locale', () => {
    expect(projectHref('drymora', 'ko')).toBe('/projects/drymora')
    expect(projectHref('drymora', 'en')).toBe('/en/projects/drymora')
  })
})
