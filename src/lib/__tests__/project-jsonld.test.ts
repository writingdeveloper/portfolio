import { describe, expect, it } from 'vitest'
import { generateProjectJsonLd } from '../seo'

const base = {
  name: 'Drymora',
  description: 'A sobriety PWA.',
  url: 'https://writingdeveloper.blog/projects/drymora',
  techStack: ['TypeScript', 'Next.js'],
  image: 'https://writingdeveloper.blog/images/projects/drymora.webp',
}

describe('generateProjectJsonLd', () => {
  it('types a Play Store project as MobileApplication and carries the install URL', () => {
    const ld = generateProjectJsonLd(
      { ...base, playStore: 'https://play.google.com/store/apps/details?id=com.soursea.drymora' },
      'ko',
    ) as Record<string, unknown>

    expect(ld['@type']).toBe('MobileApplication')
    expect(ld.operatingSystem).toBe('ANDROID')
    expect(ld.installUrl).toContain('play.google.com')
    expect(ld.screenshot).toBe(base.image)
  })

  it('types a live web project as WebApplication, which may carry a screenshot', () => {
    const ld = generateProjectJsonLd(
      { ...base, website: 'https://drymora.writingdeveloper.blog' },
      'en',
    ) as Record<string, unknown>

    expect(ld['@type']).toBe('WebApplication')
    expect(ld.screenshot).toBe(base.image)
  })

  it('falls back to CreativeWork and claims no screenshot when there is no app', () => {
    // screenshot is a SoftwareApplication property; asserting it on a plain
    // CreativeWork would be invalid structured data.
    const ld = generateProjectJsonLd({ ...base, github: 'https://github.com/x/y' }, 'ko') as Record<
      string,
      unknown
    >

    expect(ld['@type']).toBe('CreativeWork')
    expect(ld.screenshot).toBeUndefined()
    expect(ld.image).toBe(base.image)
  })

  it('collects every external destination into sameAs', () => {
    const ld = generateProjectJsonLd(
      {
        ...base,
        website: 'https://drymora.writingdeveloper.blog',
        github: 'https://github.com/x/y',
        playStore: 'https://play.google.com/store/apps/details?id=com.soursea.drymora',
      },
      'ko',
    ) as Record<string, unknown>

    expect(ld.sameAs).toEqual([
      'https://drymora.writingdeveloper.blog',
      'https://github.com/x/y',
      'https://play.google.com/store/apps/details?id=com.soursea.drymora',
    ])
  })

  it('omits sameAs entirely when the project links nowhere', () => {
    const ld = generateProjectJsonLd(base, 'ko') as Record<string, unknown>
    expect(ld.sameAs).toBeUndefined()
  })

  it('reports the page language', () => {
    expect((generateProjectJsonLd(base, 'ko') as Record<string, unknown>).inLanguage).toBe('ko-KR')
    expect((generateProjectJsonLd(base, 'en') as Record<string, unknown>).inLanguage).toBe('en-US')
  })

  it('honours an explicit application category', () => {
    const ld = generateProjectJsonLd(
      { ...base, playStore: 'https://play.google.com/x', appCategory: 'GameApplication' },
      'ko',
    ) as Record<string, unknown>
    expect(ld.applicationCategory).toBe('GameApplication')
  })
})
