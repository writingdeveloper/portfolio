import { describe, it, expect } from 'vitest'
import { successorOf, predecessorOf } from '../lineage'

describe('successorOf', () => {
  it('resolves a tombstone to its live successor project', () => {
    expect(successorOf({ supersededBy: 'drymora' })).toEqual({
      name: 'Drymora',
      url: 'https://drymora.writingdeveloper.blog',
    })
  })

  it('returns null when supersededBy is unset', () => {
    expect(successorOf({})).toBeNull()
  })

  it('returns null when the successor slug does not resolve', () => {
    expect(successorOf({ supersededBy: 'no-such-slug' })).toBeNull()
  })
})

describe('predecessorOf', () => {
  it('resolves a project to the tombstone it was rebuilt from', () => {
    expect(predecessorOf({ succeeds: 'minddump' })).toEqual({ name: 'Minddump' })
  })

  it('returns null when succeeds is unset', () => {
    expect(predecessorOf({})).toBeNull()
  })

  it('returns null when the predecessor slug does not resolve', () => {
    expect(predecessorOf({ succeeds: 'no-such-slug' })).toBeNull()
  })
})
