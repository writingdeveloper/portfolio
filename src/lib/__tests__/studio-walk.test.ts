import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { WALK_HOPS, WALK_REJECTS } from '../studio-walk'
import ko from '../../../messages/ko.json'
import en from '../../../messages/en.json'

/** Both message files, so every assertion below runs against each locale. */
const LOCALES = { ko: ko.studio, en: en.studio } as const

/** Walks a dotted path, returning undefined rather than throwing on a gap. */
function lookup(root: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (node, key) =>
        node && typeof node === 'object' ? (node as Record<string, unknown>)[key] : undefined,
      root,
    )
}

function flatten(root: unknown, prefix = ''): string[] {
  if (!root || typeof root !== 'object') return [prefix]
  return Object.entries(root as Record<string, unknown>).flatMap(([key, value]) =>
    flatten(value, prefix ? `${prefix}.${key}` : key),
  )
}

describe('studio walk data', () => {
  // The page renders each record row as t(`record.${row.key}`). next-intl
  // throws on a missing key, so a row whose label was never added takes the
  // whole page down — in one locale only, which is exactly the kind of break
  // that reaches production.
  it('has a record label in both locales for every row key used by a hop', () => {
    for (const [locale, messages] of Object.entries(LOCALES)) {
      for (const hop of WALK_HOPS) {
        for (const row of hop.record) {
          expect(
            lookup(messages, `record.${row.key}`),
            `${locale}: studio.record.${row.key} is missing, used by hop "${hop.key}"`,
          ).toBeTypeOf('string')
        }
      }
    }
  })

  it('has heading, body and alt text in both locales for every hop', () => {
    for (const [locale, messages] of Object.entries(LOCALES)) {
      for (const hop of WALK_HOPS) {
        for (const field of ['heading', 'body', 'alt']) {
          expect(
            lookup(messages, `hops.${hop.key}.${field}`),
            `${locale}: studio.hops.${hop.key}.${field} is missing`,
          ).toBeTypeOf('string')
        }
      }
    }
  })

  it('has a note and alt text in both locales for every reject', () => {
    for (const [locale, messages] of Object.entries(LOCALES)) {
      for (const reject of WALK_REJECTS) {
        expect(
          lookup(messages, `rejects.${reject.noteKey}`),
          `${locale}: studio.rejects.${reject.noteKey} is missing`,
        ).toBeTypeOf('string')
        expect(
          lookup(messages, `rejects.${reject.noteKey}Alt`),
          `${locale}: studio.rejects.${reject.noteKey}Alt is missing`,
        ).toBeTypeOf('string')
      }
    }
  })

  // Every artifact is a file committed under public/. If one is renamed or
  // never lands, next/image renders a broken frame on a page whose entire
  // argument rests on the artifacts being real.
  it('points every asset at a file that exists under public/', () => {
    const assets = [...WALK_HOPS.map((h) => h.src), ...WALK_REJECTS.map((r) => r.src)]
    expect(assets.length).toBeGreaterThan(0)

    for (const src of assets) {
      expect(src.startsWith('/'), `${src} must be a root-relative public path`).toBe(true)
      expect(
        existsSync(join(process.cwd(), 'public', src)),
        `public${src} is referenced but not committed`,
      ).toBe(true)
    }
  })

  it('keeps the ko and en studio namespaces on the same key set', () => {
    const koKeys = flatten(ko.studio).sort()
    const enKeys = flatten(en.studio).sort()

    expect(koKeys.filter((k) => !enKeys.includes(k)), 'keys present only in ko').toEqual([])
    expect(enKeys.filter((k) => !koKeys.includes(k)), 'keys present only in en').toEqual([])
  })
})
