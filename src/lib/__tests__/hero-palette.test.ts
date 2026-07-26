import { describe, it, expect } from 'vitest'
import {
  rgbToHsl,
  classifyPixel,
  summarizePixels,
  evaluatePalette,
  type PaletteStats,
} from '../hero-palette'

describe('rgbToHsl', () => {
  it('converts the brand accent #c6f24e to hue ~76', () => {
    const { h, s, l } = rgbToHsl(198, 242, 78)
    expect(h).toBeCloseTo(76.1, 0)
    expect(s).toBeGreaterThan(0.8)
    expect(l).toBeCloseTo(0.63, 1)
  })

  it('reports zero saturation for greys', () => {
    expect(rgbToHsl(128, 128, 128).s).toBe(0)
  })
})

describe('classifyPixel', () => {
  it('classifies the brand background #0a0a0b as background', () => {
    expect(classifyPixel(10, 10, 11)).toBe('background')
  })

  it('classifies the brand accent #c6f24e as accent', () => {
    expect(classifyPixel(198, 242, 78)).toBe('accent')
  })

  it('classifies saturated red as stray', () => {
    expect(classifyPixel(255, 0, 0)).toBe('stray')
  })

  it('classifies mid grey as neutral', () => {
    expect(classifyPixel(160, 160, 160)).toBe('neutral')
  })

  it('prefers background over accent for very dark green', () => {
    // A dark green pixel is part of the backdrop, not an accent highlight.
    expect(classifyPixel(12, 20, 6)).toBe('background')
  })
})

describe('summarizePixels', () => {
  it('counts one pixel per channel group and ignores the alpha channel', () => {
    // 2 pixels, RGBA: background then accent
    const data = [10, 10, 11, 255, 198, 242, 78, 255]
    const stats = summarizePixels(data, 4)
    expect(stats.total).toBe(2)
    expect(stats.background).toBe(1)
    expect(stats.accent).toBe(1)
  })
})

describe('evaluatePalette', () => {
  const base: PaletteStats = {
    background: 800,
    accent: 60,
    stray: 5,
    neutral: 135,
    total: 1000,
  }

  it('passes an on-brand distribution', () => {
    const verdict = evaluatePalette(base)
    expect(verdict.ok).toBe(true)
    expect(verdict.failures).toEqual([])
  })

  it('fails when the image is not predominantly dark', () => {
    const verdict = evaluatePalette({ ...base, background: 300, neutral: 635 })
    expect(verdict.ok).toBe(false)
    expect(verdict.failures.join(' ')).toContain('background')
  })

  it('fails when the accent is absent', () => {
    const verdict = evaluatePalette({ ...base, accent: 2, neutral: 193 })
    expect(verdict.ok).toBe(false)
    expect(verdict.failures.join(' ')).toContain('accent')
  })

  it('fails when the accent floods the image', () => {
    const verdict = evaluatePalette({ ...base, accent: 400, background: 460 })
    expect(verdict.ok).toBe(false)
    expect(verdict.failures.join(' ')).toContain('accent')
  })

  it('fails when off-palette saturated colour exceeds the budget', () => {
    const verdict = evaluatePalette({ ...base, stray: 50, neutral: 90 })
    expect(verdict.ok).toBe(false)
    expect(verdict.failures.join(' ')).toContain('stray')
  })

  it('fails an empty image rather than dividing by zero', () => {
    const verdict = evaluatePalette({
      background: 0, accent: 0, stray: 0, neutral: 0, total: 0,
    })
    expect(verdict.ok).toBe(false)
  })
})
