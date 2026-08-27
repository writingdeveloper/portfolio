import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const read = (...parts: string[]) => fs.readFileSync(path.join(process.cwd(), ...parts), 'utf8')

function luminance(hex: string) {
  const value = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4]
    .map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(foreground: string, background: string) {
  const a = luminance(foreground)
  const b = luminance(background)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

function block(css: string, selector: string) {
  const marker = `${selector} {`
  const start = css.indexOf(marker)
  if (start < 0) throw new Error(`Missing ${selector}`)
  const end = css.indexOf('}', start + marker.length)
  if (end < 0) throw new Error(`Unclosed ${selector}`)
  return css.slice(start, end + 1)
}

function token(cssBlock: string, name: string) {
  const marker = `${name}:`
  const start = cssBlock.indexOf(marker)
  if (start < 0) throw new Error(`Missing ${name}`)
  const tail = cssBlock.slice(start + marker.length).trimStart()
  const semicolon = tail.indexOf(';')
  if (semicolon < 0) throw new Error(`Missing terminator for ${name}`)
  const value = tail.slice(0, semicolon).trim()
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) throw new Error(`Invalid ${name}: ${value}`)
  return value
}

describe('accessibility regressions', () => {
  it('restores mobile-menu focus to the trigger on Escape', () => {
    const source = read('src', 'components', 'layout', 'Header.tsx')
    expect(source).toContain('menuButtonRef')
    expect(source).toContain('menuButtonRef.current?.focus()')
  })

  it('keeps visible locale text in the language toggle accessible name', () => {
    const source = read('src', 'components', 'layout', 'LanguageToggle.tsx')
    expect(source).toContain('aria-label=')
    expect(source).toContain('locale.toUpperCase()')
  })

  it('lets the Google Play badge use its visible text as its accessible name', () => {
    const source = read('src', 'components', 'projects', 'ProjectCard.tsx')
    const playBlock = source.slice(source.indexOf('{project.playStore &&'))
    expect(playBlock).not.toContain("aria-label={t('viewOnPlayStore')}")
  })

  it('gives the server-rendered Play experience a main landmark', () => {
    const source = read('src', 'app', '[locale]', 'play', 'PlaySemanticFallback.tsx')
    expect(source).toContain('<main className="relative h-screen')
    expect(source).toContain('</main>')
  })

  it('keeps meaningful muted text at WCAG AA contrast in both themes', () => {
    const css = read('src', 'app', 'globals.css')
    const dark = block(css, '.dark')
    const light = block(css, '.light')
    const ledger = block(css, '.ledger')

    expect(contrast(token(dark, '--text-muted'), token(dark, '--bg-primary'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(token(dark, '--text-muted'), token(dark, '--bg-card'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(token(light, '--text-muted'), token(light, '--bg-primary'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(token(light, '--text-muted'), token(light, '--bg-card'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(token(ledger, '--l-dim'), token(ledger, '--l-bg'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(token(ledger, '--l-dim'), token(ledger, '--l-card'))).toBeGreaterThanOrEqual(4.5)
  })
})
