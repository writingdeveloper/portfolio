import { describe, it, expect } from 'vitest'
import { selectCaptureTargets } from '../capture-targets'
import type { Project } from '@/types/content'

function project(overrides: Partial<Project>): Project {
  return {
    name: 'Example',
    slug: 'example',
    descriptionKo: '',
    descriptionEn: '',
    techStack: [],
    status: 'active',
    featured: false,
    ...overrides,
  }
}

describe('selectCaptureTargets', () => {
  it('selects projects that have a website', () => {
    const targets = selectCaptureTargets([
      project({ slug: 'a', website: 'https://a.example' }),
      project({ slug: 'b' }),
    ])
    expect(targets).toEqual([{ slug: 'a', url: 'https://a.example' }])
  })

  it('includes private projects whose website is public', () => {
    // `private` hides the code link, not the live site.
    const targets = selectCaptureTargets([
      project({ slug: 'p', website: 'https://p.example', private: true }),
    ])
    expect(targets).toHaveLength(1)
  })

  it('skips non-http urls', () => {
    const targets = selectCaptureTargets([
      project({ slug: 'x', website: 'ftp://x.example' }),
    ])
    expect(targets).toEqual([])
  })

  it('returns an empty list when nothing qualifies', () => {
    expect(selectCaptureTargets([])).toEqual([])
  })
})
