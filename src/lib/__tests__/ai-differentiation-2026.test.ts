import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import en from '../../../messages/en.json'
import ko from '../../../messages/ko.json'
import projectsData from '../../../content/projects.json'
import evidence from '../../../content/evidence.json'

const source = (filename: string) => readFileSync(join(process.cwd(), filename), 'utf8')

describe('2026 portfolio: distinguish judgment and evidence from AI tool adoption', () => {
  it('explains acceptance and failure ownership in both language variants', () => {
    expect(en.home.hero.description).toContain('acceptance criteria')
    expect(en.home.hero.description).toContain('safe releases')
    expect(ko.home.hero.description).toContain('완료 기준')
    expect(ko.home.hero.description).toContain('안전한 출시')
    expect(source('src/app/[locale]/LedgerHome.tsx')).toContain("tHome('hero.description')")
  })

  it('renders the same source-pinned evidence records used by Hire', () => {
    const home = source('src/app/[locale]/LedgerHome.tsx')
    const strip = source('src/components/projects/EvidenceSnapshotStrip.tsx')
    expect(home).toContain('<EvidenceSnapshotStrip locale={locale} />')
    expect(strip).toContain('evidence.records.map')
    expect(strip).toContain('record.snapshotAt')
    expect(strip).toContain('record.scopeKo')
    expect(strip).toContain('record.scopeEn')
    expect(strip).toContain('evidenceUrl(record)')
    for (const record of evidence.records) {
      expect(record.source.commit).toMatch(/^[0-9a-f]{40}$/)
      expect(record.scopeEn.length).toBeGreaterThan(35)
      expect(record.scopeKo.length).toBeGreaterThan(20)
    }
  })

  it('never claims every ledger project is a released public demo', () => {
    expect(projectsData.projects.some((p) => p.private && !p.website)).toBe(true)
    expect(en.projects.metaDescription).not.toContain('each with a live demo or store link')
    expect(en.projects.fullLedgerDescription).toContain('not a release')
    expect(ko.projects.fullLedgerDescription).toContain('출시 수')
    expect(en.hire.evidence.shipped).toContain('not necessarily a commercial launch')
  })

  it('makes the AI-assisted delivery approach concrete in both locales', () => {
    const hire = source('src/app/[locale]/hire/page.tsx')
    expect(hire).toContain('id="delivery-method"')
    expect(hire).toContain('DELIVERY_STAGES.map')
    expect(en.hire.approach.heading).toContain('AI-generated')
    expect(ko.hire.approach.heading).toContain('검증 가능한')
    for (const key of ['decision', 'verification', 'release'] as const) {
      expect(en.hire.approach[key].body.length).toBeGreaterThan(55)
      expect(ko.hire.approach[key].body.length).toBeGreaterThan(25)
    }
  })

  it('keeps proof links to three actual case-study pages', () => {
    const hire = source('src/app/[locale]/hire/page.tsx')
    for (const slug of ['devdeck', 'citefirst', 'creator-os']) {
      expect(projectsData.projects.find((p) => p.slug === slug)?.caseStudy).toBeTruthy()
      expect(hire).toContain(`/projects/${slug}`)
    }
  })
})
