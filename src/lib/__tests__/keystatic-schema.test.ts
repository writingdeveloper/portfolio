import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(path.join(process.cwd(), 'keystatic.config.ts'), 'utf8')

describe('Keystatic content schema parity', () => {
  it('covers every project field that the portfolio data model persists', () => {
    for (const field of [
      'playStore',
      'screenshot',
      'screenshotAltKo',
      'screenshotAltEn',
      'updatedAt',
      'succeeds',
      'caseStudy',
    ]) {
      expect(source, `missing project field ${field}`).toContain(`${field}: fields.`)
    }

    for (const field of [
      'problemKo',
      'problemEn',
      'decisionKo',
      'decisionEn',
      'evidenceKo',
      'evidenceEn',
      'resultKo',
      'resultEn',
    ]) {
      expect(source, `missing case-study field ${field}`).toContain(`${field}: fields.text`)
    }
  })

  it('covers graveyard lineage metadata', () => {
    expect(source).toContain('supersededBy: fields.text')
  })
})
