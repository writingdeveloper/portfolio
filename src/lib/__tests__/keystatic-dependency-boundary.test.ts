import fs from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { isKeystaticDisabled } from '../keystatic-access'

const root = process.cwd()
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8')).packages

afterEach(() => vi.unstubAllEnvs())

describe('Keystatic runtime dependency isolation', () => {
  it('pins Keystatic file watching to the maintained Chokidar 4 package', () => {
    expect(pkg.overrides['@keystatic/next'].chokidar).toBe('^4.0.3')
    expect(lock['node_modules/@keystatic/next'].version).toBe('5.0.5')
    expect(lock['node_modules/chokidar'].version).toMatch(/^4\./)
    expect(lock['node_modules/chokidar'].dev).toBeFalsy()
  })

  it('keeps all installed braces packages outside the production dependency tree', () => {
    const affected = Object.entries(lock).filter(([name]) => /(^|\/)braces$/.test(name))
    expect(affected.length).toBeGreaterThan(0)
    for (const [name, record] of affected) {
      expect((record as { dev?: boolean }).dev, name).toBe(true)
    }
  })

  it('keeps local-storage CMS routes blocked in production with no GitHub app', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG', '')
    expect(isKeystaticDisabled()).toBe(true)
  })

  it('preserves local development CMS availability', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG', '')
    expect(isKeystaticDisabled()).toBe(false)
  })
})
