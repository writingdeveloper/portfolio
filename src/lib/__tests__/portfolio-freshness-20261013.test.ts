import { statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import projects from '../../../content/projects.json'
import type { Project } from '@/types/content'
import demos from '../../../content/verified-demos.json'

const project = (slug: string) => (projects.projects as Project[]).find((value) => value.slug === slug)

describe('verified portfolio refresh: 2026-10-13', () => {
  it('references the actual October 13 public BRAIN//VAT NPC proof, not an LLM claim', () => {
    const brain = project('brain-vat-siege')
    const item = demos.demos.find((entry) => entry.project === 'brain-vat-siege')
    expect(brain?.updatedAt).toBe('2026-10-13')
    expect(brain?.status).toBe('active')
    expect(brain?.descriptionEn).toContain('deterministic rule-driven')
    expect(brain?.caseStudy?.evidenceEn).toContain('200/200')
    expect(item).toBeDefined()
    expect(item?.sourceCommit).toBe('854213620980fe9c62ea72c12c8d58ec93c9c2e9')
    expect(item?.verifiedAt).toBe('2026-10-13')
    expect(item?.demoUrl).toBe('https://brain-vat-siege.vercel.app/npc')
    expect(item?.descriptionEn).toContain('rule-based')
    expect(item?.caveatEn).toContain('no trained policy')
    expect(item?.caveatKo).toContain('학습된 정책')
    expect(statSync(join(process.cwd(), 'public', item!.image.slice(1))).size).toBeGreaterThan(10000)
  })

  it('describes Creator OS as a testing-only external pilot rather than an unreleased OAuth prototype', () => {
    const pilot = project('creator-learning-os')
    expect(pilot?.updatedAt).toBe('2026-10-08')
    expect(pilot?.private).toBe(true)
    expect(pilot?.status).toBe('building')
    expect(pilot?.website).toBe('https://creator.writingdeveloper.blog/demo')
    expect(pilot?.descriptionEn).toContain('Testing-only')
    expect(pilot?.descriptionEn).toContain('not unrestricted signup')
    expect(pilot?.descriptionKo).toContain('승인된 테스트 사용자')
    expect(pilot?.caseStudy?.evidenceEn).toContain('without a provider model call')
  })

  it('marks Creator OS product and release-hardening entry as two views of one product', () => {
    const product = project('creator-learning-os')
    const engineering = project('creator-os')
    expect(product?.name).toContain('Product & External Pilot')
    expect(engineering?.name).toContain('Release Engineering')
    expect(engineering?.descriptionEn).toContain('same Creator OS product')
    expect(engineering?.caseStudy?.resultKo).toContain('두 번째 제품이 아닌')
  })

  it('does not present the personal Soursea sourcing tool as an offered LLC product', () => {
    const tool = project('soursea')
    expect(tool?.private).toBe(true)
    expect(tool?.website).toBeUndefined()
    expect(tool?.name).toContain('Personal Sourcing Workspace')
    expect(tool?.descriptionKo).toContain('고객용 서비스 목록과 별개')
  })

  it('leaves unverified updatedAt fields unknown rather than inventing dates', () => {
    for (const p of projects.projects as Project[]) {
      if (p.updatedAt) expect(p.updatedAt).toMatch(/^20\d{2}-\d{2}-\d{2}$/)
    }
    expect(project('studios')?.updatedAt).toBeUndefined()
    expect(project('kindling')?.updatedAt).toBeUndefined()
  })
})
