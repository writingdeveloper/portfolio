import { describe, it, expect } from 'vitest'
import { sortProjectsFeaturedFirst } from '../projects'
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
