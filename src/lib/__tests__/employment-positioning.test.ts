import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
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

  it('targets senior product, applied AI, and senior full-stack roles in English', () => {
    expect(en.home.metaDescription).toContain('AI-native product engineer')
    expect(en.about.metaTitle).toContain('AI-Native Product Engineer')
    expect(en.hire.metaTitle).toContain('AI-Native Product Engineer')
    expect(en.hire.badgeRemote).toBe('Los Angeles · Remote-first')
    expect(en.hire.fulltime.roles).toBe(
      'Senior Product Engineer · Applied AI / AI Platform Engineer · Senior Full-Stack Engineer'
    )
    expect(en.hire.fulltime.bring).toContain('5+ years owning engineering as a CTO')
  })

  it('keeps the Korean positioning aligned with the English profile', () => {
    expect(ko.home.metaDescription).toContain('AI 네이티브 제품 엔지니어')
    expect(ko.about.metaTitle).toContain('AI 네이티브 제품 엔지니어')
    expect(ko.hire.metaTitle).toContain('AI 네이티브 제품 엔지니어')
    expect(ko.hire.badgeRemote).toBe('로스앤젤레스 · 원격 우선')
    expect(ko.hire.fulltime.roles).toBe(
      '시니어 제품 엔지니어 · Applied AI / AI 플랫폼 엔지니어 · 시니어 풀스택 엔지니어'
    )
  })
})
