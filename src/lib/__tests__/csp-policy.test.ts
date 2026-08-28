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
  it('keeps Troika text on the main thread and pins its resolver under strict CSP', () => {
    const playSource = fs.readFileSync(path.join(process.cwd(), 'src/app/[locale]/play/PlayClient.tsx'), 'utf8')
    const resolverBase = 'https://cdn.jsdelivr.net/gh/lojjic/unicode-font-resolver@v1.0.1/packages/data'

    expect(playSource).toContain('useWorker: false')
    expect(playSource).toContain(resolverBase)
    expect(source).toContain(`${resolverBase}/`)
    expect(source).toContain('https://csi.gstatic.com')

    const scriptDirective = source.match(/const scriptSrc = \[([\s\S]*?)\]\s*\.filter/)?.[1] ?? ''
    expect(scriptDirective).not.toContain('blob:')
  })
})
