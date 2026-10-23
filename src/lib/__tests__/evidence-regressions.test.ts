import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { groupSkills } from '../skill-groups'
import { telemetryPolicy } from '../telemetry-policy'
import { skillCategories, type Skill } from '@/types/content'
import about from '../../../content/about.json'

describe('skills and preview regressions', () => {
  it('renders every skill exactly once with AI first', () => {
    const groups = groupSkills(about.skills as Skill[])
    expect(Object.keys(groups)).toEqual(Object.keys(skillCategories))
    expect(Object.keys(groups)[0]).toBe('ai')
    expect(Object.values(groups).flat()).toHaveLength(about.skills.length)
    expect(groups.ai.some((s) => s.name === 'Claude Code')).toBe(true)
  })
  it.each(['src/components/ui/SkillGrid.tsx', 'src/app/[locale]/play/sections/SkillsSection.tsx'])(
    'uses shared categories in %s',
    (file) => {
      expect(readFileSync(file, 'utf8')).toContain('groupSkills(skills)')
    }
  )
  it.each([null, 'localhost:3100', '100.96.248.54:3100', 'branch.vercel.app', 'writingdeveloper.blog.evil.example'])(
    'keeps telemetry off at %s',
    (host) => {
      expect(telemetryPolicy({ VERCEL_ENV: 'production' }, host)).toEqual({ thirdParty: false, vercel: false })
    }
  )
  it('keeps preview deployments silent even on a canonical host', () => {
    expect(telemetryPolicy({ VERCEL_ENV: 'preview' }, 'writingdeveloper.blog').vercel).toBe(false)
  })
  it('enables production Vercel analytics only on the public host', () => {
    expect(telemetryPolicy({ VERCEL_ENV: 'production' }, 'writingdeveloper.blog')).toEqual({
      thirdParty: true,
      vercel: true,
    })
  })
  it('allows an explicit public self-host opt-in without Vercel scripts', () => {
    expect(telemetryPolicy({ PORTFOLIO_ENABLE_TELEMETRY: '1' }, 'writingdeveloper.blog')).toEqual({
      thirdParty: true,
      vercel: false,
    })
  })
  it('has a defined résumé button token and case-study route for private work', () => {
    const hire = readFileSync('src/app/[locale]/hire/page.tsx', 'utf8')
    expect(hire).not.toContain('bg-[var(--accent)]')
    expect(hire).toContain('bg-[var(--accent-text)]')
    expect(readFileSync('src/app/[locale]/LedgerHome.tsx', 'utf8')).toContain('Case study & evidence')
  })
})
