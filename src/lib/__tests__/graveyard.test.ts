import { describe, it, expect } from 'vitest'
import { tombstoneCopy, formatLifespan } from '../graveyard'
import type { Tombstone } from '@/types/content'

const base: Tombstone = {
  name: 'Ghostly',
  slug: 'ghostly',
  bornAt: '2024',
  diedAt: '2025',
  causeOfDeath: 'no-pmf',
  epitaphKo: '좋은 시도였다',
  epitaphEn: 'It was a good try',
  retroKo: '수요를 검증하지 않았다',
  retroEn: 'I never validated demand',
  techStack: ['Next.js'],
}

describe('tombstoneCopy', () => {
  it('selects Korean copy for the ko locale', () => {
    const copy = tombstoneCopy(base, 'ko')
    expect(copy.epitaph).toBe('좋은 시도였다')
    expect(copy.retro).toBe('수요를 검증하지 않았다')
    expect(copy.lifespan).toBe('2024–2025')
  })

  it('selects English copy for the en locale', () => {
    const copy = tombstoneCopy(base, 'en')
    expect(copy.epitaph).toBe('It was a good try')
    expect(copy.retro).toBe('I never validated demand')
  })

  it('falls back to Korean when English copy is empty', () => {
    const copy = tombstoneCopy({ ...base, epitaphEn: '', retroEn: '' }, 'en')
    expect(copy.epitaph).toBe('좋은 시도였다')
    expect(copy.retro).toBe('수요를 검증하지 않았다')
  })
})

describe('formatLifespan', () => {
  it('renders a range when the years differ', () => {
    expect(formatLifespan('2024', '2025')).toBe('2024–2025')
  })

  it('collapses to a single value when the years match', () => {
    expect(formatLifespan('2024', '2024')).toBe('2024')
  })

  it('drops a dangling dash when a bound is missing', () => {
    expect(formatLifespan('2024', '')).toBe('2024')
    expect(formatLifespan('', '2025')).toBe('2025')
  })
})
