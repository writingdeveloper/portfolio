import { describe, it, expect } from 'vitest'
import { categoryX } from '../skills-layout'

describe('categoryX', () => {
  it('centers 3 categories on x=0 with default spacing', () => {
    expect(categoryX(0, 3)).toBe(-5)
    expect(categoryX(1, 3)).toBe(0)
    expect(categoryX(2, 3)).toBe(5)
  })

  it('centers 4 categories symmetrically around x=0', () => {
    expect(categoryX(0, 4)).toBe(-7.5)
    expect(categoryX(1, 4)).toBe(-2.5)
    expect(categoryX(2, 4)).toBe(2.5)
    expect(categoryX(3, 4)).toBe(7.5)
  })

  it('places a single category at x=0', () => {
    expect(categoryX(0, 1)).toBe(0)
  })

  it('respects a custom spacing argument', () => {
    expect(categoryX(0, 2, 10)).toBe(-5)
    expect(categoryX(1, 2, 10)).toBe(5)
  })
})
