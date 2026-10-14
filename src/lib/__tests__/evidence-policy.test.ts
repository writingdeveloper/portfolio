import { describe, expect, it } from 'vitest'
import data from '../../../content/evidence.json'
import { evidenceProblems, evidenceUrl, evidenceValue, extractMeasurements } from '../evidence-policy'
const now = new Date('2026-09-22T23:59:00Z')
describe('evidence policy', () => {
  it('accepts the curated, dated snapshots', () => expect(evidenceProblems(data, now)).toEqual([]))
  it('rejects mutable branch refs', () => {
    const m = structuredClone(data)
    m.records[0].source.commit = 'main'
    expect(evidenceProblems(m, now)).toContain('Source must use a full commit SHA')
  })
  it('rejects arbitrary paths and private sources', () => {
    const m = structuredClone(data)
    m.records[0].source.path = '../../.env'
    expect(evidenceProblems(m, now).some((x) => x.includes('allowlisted'))).toBe(true)
  })
  it('rejects duplicate records', () => {
    const m = structuredClone(data)
    m.records.push(m.records[0])
    expect(evidenceProblems(m, now).some((x) => x.includes('Duplicate'))).toBe(true)
  })
  it('rejects future dates and unscoped claims', () => {
    const m = structuredClone(data)
    m.records[0].snapshotAt = '2027-01-01'
    m.records[0].scopeKo = ''
    expect(evidenceProblems(m, now)).toContain('Invalid/future evidence date')
    expect(evidenceProblems(m, now)).toContain('Missing localized evidence/scope')
  })
  it('does not permit changing the displayed count independently', () => {
    const m = structuredClone(data)
    m.records[0].value = '999,999 passed'
    expect(evidenceProblems(m, now)).toContain('Display value differs from measurements')
  })
  it('ties visible numbers to their measurement record', () => {
    for (const r of data.records) {
      expect(evidenceValue(r)).toBe(r.value)
      expect(evidenceUrl(r)).toContain(r.source.commit)
    }
  })
  it('extracts pass and skip counts from the exact validation row', () => {
    expect(
      extractMeasurements(
        'devdeck-maintenance',
        '| Unit suite including validation, CAS and real TLS conflict | 108 files; 1,289 passed, 1 pre-existing skip |'
      )
    ).toEqual({ passed: 1289, skipped: 1 })
  })
  it('retains the evaluation denominator, recall and MRR', () => {
    expect(
      extractMeasurements(
        'citefirst-retrieval',
        '56 questions, in the shipped configuration\n| recall@5 | **0.982** |\n| MRR@10 | **0.785** |'
      )
    ).toEqual({ questions: 56, recall5: 0.982, mrr10: 0.785 })
  })
  it('fails on an unknown format rather than manufacturing a metric', () => {
    expect(() => extractMeasurements('devdeck-maintenance', 'all tests great')).toThrow()
    expect(() => extractMeasurements('citefirst-retrieval', 'no numbers')).toThrow()
    expect(() => extractMeasurements('unknown', 'anything')).toThrow()
  })
})

describe('measurement boundaries', () => {
  it('rejects a missing required field without throwing', () => {
    const m = structuredClone(data)
    Reflect.deleteProperty(m.records[0].measurements, 'passed')
    expect(evidenceProblems(m, now)).toContain('Invalid measurements')
  })
  it('rejects an out-of-range fraction', () => {
    const m = structuredClone(data)
    m.records[1].measurements.recall5 = 2
    expect(evidenceProblems(m, now)).toContain('Invalid measurements')
  })
  it('rejects a missing denominator', () => {
    const m = structuredClone(data)
    m.records[1].measurements.questions = 0
    expect(evidenceProblems(m, now)).toContain('Invalid measurements')
  })
  it('reads the committed two-configuration table without confusing the baseline', () => {
    expect(
      extractMeasurements(
        'citefirst-retrieval',
        '46 questions, in the shipped configuration\n| recall@5 | 0.957 | **0.978** |\n| MRR@10 | 0.778 | **0.834** |'
      )
    ).toEqual({ questions: 46, recall5: 0.978, mrr10: 0.834 })
  })
})
