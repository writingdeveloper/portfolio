import { describe, it, expect } from 'vitest'
import { isImmersiveRoute } from '../layout-chrome-rules'

describe('isImmersiveRoute', () => {
  it('returns true for /play', () => {
    expect(isImmersiveRoute('/play')).toBe(true)
  })

  it('returns true for /en/play', () => {
    expect(isImmersiveRoute('/en/play')).toBe(true)
  })

  it('returns true for Korean default /play (no locale prefix)', () => {
    expect(isImmersiveRoute('/play')).toBe(true)
  })

  it('returns true for /play with trailing slash', () => {
    expect(isImmersiveRoute('/play/')).toBe(true)
  })

  it('returns false for /blog', () => {
    expect(isImmersiveRoute('/blog')).toBe(false)
  })

  it('returns false for /en/blog', () => {
    expect(isImmersiveRoute('/en/blog')).toBe(false)
  })

  it('returns false for /about', () => {
    expect(isImmersiveRoute('/about')).toBe(false)
  })

  it('returns false for the home page', () => {
    expect(isImmersiveRoute('/')).toBe(false)
    expect(isImmersiveRoute('/en')).toBe(false)
  })

  it('does not false-match /display', () => {
    expect(isImmersiveRoute('/display')).toBe(false)
  })

  it('does not false-match /replay', () => {
    expect(isImmersiveRoute('/replay')).toBe(false)
    expect(isImmersiveRoute('/en/replay')).toBe(false)
  })

  it('does not false-match /playlist', () => {
    expect(isImmersiveRoute('/playlist')).toBe(false)
  })

  it('does not false-match /foreplay', () => {
    expect(isImmersiveRoute('/foreplay')).toBe(false)
  })

  it('handles null pathname as non-immersive', () => {
    expect(isImmersiveRoute(null)).toBe(false)
  })

  it('handles undefined pathname as non-immersive', () => {
    expect(isImmersiveRoute(undefined)).toBe(false)
  })

  it('handles empty string as non-immersive', () => {
    expect(isImmersiveRoute('')).toBe(false)
  })
})
