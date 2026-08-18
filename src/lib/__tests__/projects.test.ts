import { describe, it, expect } from 'vitest'
import {
  getHireStats,
  hasIndexablePage,
  HIRE_CASE_STUDIES,
  HOME_GROUPS,
  PROJECT_SHOWCASE,
  projectHref,
  sortProjectsFeaturedFirst,
} from '../projects'
import type { Project } from '@/types/content'
import projectsData from '../../../content/projects.json'

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

// Deliberately a slug with no PROJECT_SHOWCASE entry, so "bare" stays bare.
// Reach for a real slug here and the negative cases start passing for the
// wrong reason.
const bare = {
  slug: 'a-project-with-no-showcase',
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

  // The case this rule exists for: private work with no public surface at all,
  // which therefore cannot qualify any other way. A showcase page is somewhere
  // to go, and "nowhere to go" is the whole test.
  it('accepts a private project whose page links to a showcase', () => {
    for (const slug of Object.keys(PROJECT_SHOWCASE)) {
      expect(
        hasIndexablePage({
          ...bare,
          slug,
          private: true,
          github: 'https://github.com/writingdeveloper/secret',
        }),
        `${slug} has a showcase page but was filtered out as thin`,
      ).toBe(true)
    }
  })

  it('keeps every showcase entry pointing at a slug that exists', () => {
    const slugs = new Set((projectsData.projects as Project[]).map((p) => p.slug))
    for (const slug of Object.keys(PROJECT_SHOWCASE)) {
      expect(slugs.has(slug), `PROJECT_SHOWCASE names "${slug}", which is not a project`).toBe(true)
    }
  })
})

describe('projectHref', () => {
  it('leaves Korean unprefixed and prefixes every other locale', () => {
    expect(projectHref('drymora', 'ko')).toBe('/projects/drymora')
    expect(projectHref('drymora', 'en')).toBe('/en/projects/drymora')
  })
})

describe('getHireStats', () => {
  // No cast: getHireStats takes a Pick, so a fixture needs only the two fields
  // it reads. Forging a whole Project here would be noise.
  const sample = [
    { website: 'https://a.example.com' },
    { website: 'https://d.example.com' },
    { playStore: 'https://play.google.com/store/apps/details?id=b' },
    { website: 'https://c.example.com', playStore: 'https://play.google.com/store/apps/details?id=c' },
    {},
    {},
  ]

  it('counts only what a visitor can open right now', () => {
    // Two rows carry only a website, one carries only a Play Store listing, and
    // one carries both — four distinct rows with a public destination. The
    // last two rows stand for real work with no public destination — a
    // private build, or one that only has a repo. Nothing on them can be
    // clicked, so they must not be claimed as shipped product.
    expect(getHireStats(sample).shipped).toBe(4)
  })

  it('counts store listings separately', () => {
    expect(getHireStats(sample).playStore).toBe(2)
  })

  it('reports the whole ledger as the total', () => {
    expect(getHireStats(sample).total).toBe(6)
  })

  it('never claims more shipped than the ledger holds', () => {
    const stats = getHireStats(projectsData.projects as Project[])
    expect(stats.shipped).toBeLessThanOrEqual(stats.total)
    expect(stats.playStore).toBeLessThanOrEqual(stats.shipped)
    expect(stats.shipped).toBeGreaterThan(0)
  })
})

describe('HIRE_CASE_STUDIES', () => {
  // The page renders these by slug. If a project is renamed or dropped, fail
  // here rather than shipping a hire page with a hole in it.
  it.each(HIRE_CASE_STUDIES)('%s exists in projects.json', (slug) => {
    const found = (projectsData.projects as Project[]).find((p) => p.slug === slug)
    expect(found, `${slug} is missing from projects.json`).toBeDefined()
  })

  it('each case study has something to link to', () => {
    for (const slug of HIRE_CASE_STUDIES) {
      const p = (projectsData.projects as Project[]).find((x) => x.slug === slug)!
      expect(Boolean(p.website || p.playStore)).toBe(true)
    }
  })
})

describe('HOME_GROUPS', () => {
  // The home page resolves these slugs against the ledger and drops whatever
  // does not match, so both kinds of drift are silent: a slug that no longer
  // exists just disappears, and a project nobody listed never renders at all.
  // Neither shows up as an error, a warning, or a visibly broken page — which
  // is exactly why it has to fail here.
  const grouped = Object.values(HOME_GROUPS).flat()
  const ledger = (projectsData.projects as Project[]).map((p) => p.slug)

  it('lists every project in the ledger', () => {
    const listed = new Set(grouped)
    const missing = ledger.filter((slug) => !listed.has(slug))
    expect(missing, `not shown on the home page: ${missing.join(', ')}`).toEqual([])
  })

  it('names no project the ledger does not have', () => {
    const known = new Set(ledger)
    const ghosts = grouped.filter((slug) => !known.has(slug))
    expect(ghosts, `named on the home page but not a project: ${ghosts.join(', ')}`).toEqual([])
  })

  it('puts each project in exactly one group', () => {
    const seen = new Set<string>()
    const dupes = grouped.filter((slug) => (seen.has(slug) ? true : (seen.add(slug), false)))
    expect(dupes, `listed more than once: ${dupes.join(', ')}`).toEqual([])
  })
})
