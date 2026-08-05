import { describe, expect, it } from 'vitest'
import { buildProjectPostMap, projectAnchorHref } from '../post-project-links'

type P = Parameters<typeof buildProjectPostMap>[0][number]

const post = (slug: string, project: string, publishedAt = '2026-01-01'): P => ({
  slug,
  title: `Post ${slug}`,
  project,
  publishedAt,
})

const KNOWN = ['drymora', 'healframe', 'rentrights', 'dont-touch']

describe('buildProjectPostMap', () => {
  it('maps a project to the post that declares it', () => {
    const map = buildProjectPostMap([post('healframe-safety-pipeline', 'healframe')], KNOWN)
    expect(map.get('healframe')).toEqual({
      slug: 'healframe-safety-pipeline',
      title: 'Post healframe-safety-pipeline',
    })
  })

  it('ignores posts that declare no project', () => {
    expect(buildProjectPostMap([post('giving-back', '')], KNOWN).size).toBe(0)
  })

  it('drops a project slug that does not exist', () => {
    // A typo must not render a link pointing at nothing.
    expect(buildProjectPostMap([post('oops', 'drymorra')], KNOWN).size).toBe(0)
  })

  it('trims whitespace around the declared slug', () => {
    expect(buildProjectPostMap([post('a', '  drymora  ')], KNOWN).has('drymora')).toBe(true)
  })

  it('keeps the most recent post when two claim the same project', () => {
    const map = buildProjectPostMap(
      [post('older', 'drymora', '2025-03-01'), post('newer', 'drymora', '2026-07-01')],
      KNOWN,
    )
    expect(map.get('drymora')?.slug).toBe('newer')
  })

  it('is order-independent when picking the most recent', () => {
    const map = buildProjectPostMap(
      [post('newer', 'drymora', '2026-07-01'), post('older', 'drymora', '2025-03-01')],
      KNOWN,
    )
    expect(map.get('drymora')?.slug).toBe('newer')
  })

  it('handles several projects at once', () => {
    const map = buildProjectPostMap(
      [post('a', 'drymora'), post('b', 'healframe'), post('c', 'rentrights')],
      KNOWN,
    )
    expect([...map.keys()].sort()).toEqual(['drymora', 'healframe', 'rentrights'])
  })

  it('tolerates a missing project field', () => {
    const withoutField = { slug: 'x', title: 'X', publishedAt: '2026-01-01' } as P
    expect(buildProjectPostMap([withoutField], KNOWN).size).toBe(0)
  })
})

describe('projectAnchorHref', () => {
  it('points at the project card on the projects page', () => {
    expect(projectAnchorHref('drymora')).toBe('/projects#drymora')
  })
})
