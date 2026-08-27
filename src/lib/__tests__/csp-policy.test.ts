import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

describe('Content Security Policy', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'src', 'proxy.ts'), 'utf8')

  it('allows same-origin blob workers for Troika without loosening script-src', () => {
    expect(source).toContain("worker-src 'self' blob:")
    const scriptDirective = source.match(/const scriptSrc = \[([\s\S]*?)\]\s*\.filter/)?.[1] ?? ''
    expect(scriptDirective).not.toContain('blob:')
    expect(scriptDirective).not.toContain("'unsafe-inline'")
  })
})
