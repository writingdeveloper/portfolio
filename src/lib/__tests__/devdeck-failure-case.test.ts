import { statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import cases from '../../../content/failure-cases.json'
import projects from '../../../content/projects.json'

const incident = cases.incidents[0]
const baseline = 'b7817547dd2100751ce46229a83810319affe82b'
const candidate = 'fa8864833b98e7d81f140e598b1f56d4d2b60c39'

describe('DevDeck source-backed failure reconstruction', () => {
  it('describes exactly one case anchored to a real, existing project', () => {
    expect(cases.schemaVersion).toBe(1)
    expect(cases.incidents).toHaveLength(1)
    expect(incident.project).toBe('devdeck')
    expect(projects.projects.some((project) => project.slug === incident.project)).toBe(true)
    expect(incident.baselineCommit).toBe(baseline)
    expect(incident.candidateCommit).toBe(candidate)
  })

  it('distinguishes the historical failure from the Oct 12 rerun and public release', () => {
    expect(incident.recordedAt).toBe('2026-09-08')
    expect(incident.verifiedAt).toBe('2026-10-12')
    expect(incident.statusEn).toContain('not a public release')
    expect(incident.statusKo).toContain('정식 출시 아님')
    expect(incident.verification.limitationsEn).toContain('Not two physical machines')
    expect(incident.verification.limitationsKo).toContain('물리적으로 분리된')
  })

  it('has the reproduced user-visible failure and a specific root cause in both locales', () => {
    for (const [steps, cause, before, after] of [
      [incident.reproduction.stepsEn, incident.rootCause.textEn, incident.before.noteEn, incident.after.noteEn],
      [incident.reproduction.stepsKo, incident.rootCause.textKo, incident.before.noteKo, incident.after.noteKo],
    ] as const) {
      expect(steps).toHaveLength(4)
      expect(cause).toContain('LOCAL_MACHINE_ID')
      expect(before.length).toBeGreaterThan(25)
      expect(after.length).toBeGreaterThan(25)
    }
    expect(incident.changes).toHaveLength(3)
    expect(incident.verification.commands).toEqual([
      'npm test -- src/main/sessionLabels.test.ts src/shared/sessionConsistency.test.ts',
      'npm run qa:session-sync',
    ])
  })

  it('shows the actually executed 20 focused tests and eight independent Electron journeys', () => {
    expect(incident.verification.focusedTests).toBe(20)
    expect(incident.verification.electronJourneys).toBe(8)
    expect(incident.verification.journeys).toHaveLength(8)
    expect(new Set(incident.verification.journeys.map((journey) => journey.en)).size).toBe(8)
    for (const journey of incident.verification.journeys) expect(journey.ko.length).toBeGreaterThan(10)
  })

  it('only publishes small, locally redacted fixture crops; never private paths', () => {
    for (const photo of [incident.before, incident.after]) {
      expect(photo.image).toMatch(/^\/images\/projects\/devdeck-sync-qa-(before|after)\.webp$/)
      const size = statSync(join(process.cwd(), 'public', photo.image.slice(1))).size
      expect(size).toBeGreaterThan(2000)
      expect(size).toBeLessThan(90000)
      expect(photo.noteEn.toLowerCase()).toContain('crop')
    }
  })

  it('links only to immutable GitHub sources and a same-commit successful CI run', () => {
    const kinds = incident.sources.map((source) => source.kind)
    expect(kinds).toEqual(['baseline', 'fix', 'review', 'unit', 'harness', 'ci'])
    for (const source of incident.sources) {
      expect(source.href).toMatch(/^https:\/\/github\.com\/writingdeveloper\/devdeck\//)
      if (source.kind === 'baseline') expect(source.href).toContain(baseline)
      else if (source.kind === 'ci') expect(source.href).toContain('34319241204')
      else expect(source.href).toContain(candidate)
    }
  })
})
