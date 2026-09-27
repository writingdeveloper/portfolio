import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import about from '../../../content/about.json'
import en from '../../../messages/en.json'
import ko from '../../../messages/ko.json'

describe('employment positioning', () => {
  it('leads the home page with the AI-native product-engineer positioning', () => {
    const home = readFileSync(join(process.cwd(), 'src/app/[locale]/LedgerHome.tsx'), 'utf8')
    expect(home).toContain('AI-NATIVE PRODUCT ENGINEER')
    expect(home).not.toContain('SOLO FULL-STACK BUILDER')
    expect(home).toContain('AI-native products and developer infrastructure')
    expect(home).toContain('SELECTED_WORK.map')
  })

  it('keeps the AI-native identity while targeting revenue-facing engineering work in English', () => {
    expect(en.home.metaDescription).toContain('AI-native product engineer')
    expect(en.about.metaTitle).toContain('AI-Native Product Engineer')
    expect(en.hire.metaTitle).toContain('Browser Automation')
    expect(en.hire.badgeRemote).toBe('Los Angeles · Fully remote · US permanent resident')
    expect(en.hire.fulltime.roles).toBe(
      'Senior Software Engineer · AI Integration / Applied AI Engineer · Senior Full-Stack / Automation Engineer'
    )
    expect(en.hire.fulltime.bring).toContain('Nearly five years owning engineering as a CTO')
  })

  it('keeps the timeline copy free of count-stacking and em dashes', () => {
    const copy = about.timeline.flatMap((entry) => [
      entry.titleEn,
      entry.titleKo,
      entry.descriptionEn,
      entry.descriptionKo,
    ])

    for (const text of copy) {
      // Em dashes read as machine-written; the site uses periods, colons and middots.
      expect(text).not.toContain('\u2014')
    }

    const itembox = about.timeline.find((entry) => entry.titleEn.includes('ItemBox'))
    expect(itembox).toBeDefined()
    // Raw commit/endpoint/entity counts were pulled from the resume for reading as
    // filler rather than evidence. They must not come back through the site copy.
    for (const banned of ['2,458', '857', '72k', '300 REST', '58 controllers', '55 entities']) {
      expect(itembox!.descriptionEn).not.toContain(banned)
    }
    expect(itembox!.descriptionEn).toContain('nine people split between Korea and Vietnam')
    expect(itembox!.descriptionKo).toContain('개발자 아홉 명')
  })

  it('keeps the Korean positioning aligned with the English profile', () => {
    expect(ko.home.metaDescription).toContain('AI 네이티브 제품 엔지니어')
    expect(ko.about.metaTitle).toContain('AI 네이티브 제품 엔지니어')
    expect(ko.hire.metaTitle).toContain('브라우저 자동화')
    expect(ko.hire.badgeRemote).toBe('로스앤젤레스 · 전면 원격 · 미국 영주권자')
    expect(ko.hire.fulltime.roles).toBe(
      '시니어 소프트웨어 엔지니어 · AI 통합 / Applied AI 엔지니어 · 시니어 풀스택 / 자동화 엔지니어'
    )
  })
})
