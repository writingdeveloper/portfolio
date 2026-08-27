import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const layout = fs.readFileSync(path.join(process.cwd(), 'src', 'app', '[locale]', 'layout.tsx'), 'utf8')
const globals = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'globals.css'), 'utf8')

describe('font loading', () => {
  it('does not preload Inter when Pretendard is the body font', () => {
    expect(layout).not.toContain('Inter,')
    expect(layout).not.toContain('Inter({')
    expect(layout).not.toContain('inter.variable')
    expect(globals).not.toContain('var(--font-inter)')
  })
})
