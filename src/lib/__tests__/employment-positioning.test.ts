import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import about from '../../../content/about.json'
import en from '../../../messages/en.json'
import ko from '../../../messages/ko.json'

describe('employment positioning', () => {
  it('leads the home page with the AI-native product-engineer positioning', () => {
    const home = readFileSync(join(process.cwd(), 'src/app/[locale]/LedgerHome.tsx'), 'utf8')
    expect(home).toContain('AI-NATIVE PRODUCT · AGENT SYSTEMS ENGINEER')
    expect(home).not.toContain('SOLO FULL-STACK BUILDER')
    expect(home).toContain('systems that let AI agents do real work')
    expect(home).toContain('SELECTED_WORK.map')
  })

  it('targets senior product, agent systems, and senior full-stack roles in English', () => {
    expect(en.home.metaDescription).toContain('AI-native product and agent-systems engineer')
    expect(en.about.metaTitle).toContain('AI-Native Product & Agent Systems Engineer')
    expect(en.hire.metaTitle).toContain('AI-Native Product & Agent Systems Engineer')
    expect(en.hire.badgeRemote).toBe('Los Angeles · Remote-first · LA hybrid/on-site · US permanent resident')
    expect(en.hire.fulltime.roles).toBe(
      'Senior Product Engineer · AI Systems / Agent Platform Engineer · Senior Full-Stack Engineer'
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
    expect(ko.home.metaDescription).toContain('AI 네이티브 제품·에이전트 시스템 엔지니어')
    expect(ko.about.metaTitle).toContain('AI 네이티브 제품 · 에이전트 시스템 엔지니어')
    expect(ko.hire.metaTitle).toContain('AI 네이티브 제품 · 에이전트 시스템 엔지니어')
    expect(ko.hire.badgeRemote).toBe('로스앤젤레스 · 원격 우선 · LA 하이브리드/출근 가능 · 미국 영주권자')
    expect(ko.hire.fulltime.roles).toBe(
      '시니어 제품 엔지니어 · AI 시스템 / 에이전트 플랫폼 엔지니어 · 시니어 풀스택 엔지니어'
    )
  })
})
