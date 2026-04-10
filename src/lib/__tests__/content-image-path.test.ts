import { describe, it, expect } from 'vitest'
import path from 'path'
import { validateContentImageRequest } from '../content-image-path'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts')

describe('validateContentImageRequest', () => {
  it('accepts a well-formed request', () => {
    const result = validateContentImageRequest(
      ['ko', 'hello', 'image.png'],
      CONTENT_DIR
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.contentType).toBe('image/png')
      expect(result.candidates).toHaveLength(2)
    }
  })

  it('returns not-found for wrong segment count', () => {
    const a = validateContentImageRequest(['ko'], CONTENT_DIR)
    expect(a.ok).toBe(false)
    if (!a.ok) expect(a.error).toBe('not-found')

    const b = validateContentImageRequest(['ko', 'a', 'b', 'c'], CONTENT_DIR)
    expect(b.ok).toBe(false)
    if (!b.ok) expect(b.error).toBe('not-found')
  })

  it('rejects unknown locale', () => {
    const result = validateContentImageRequest(
      ['fr', 'slug', 'img.png'],
      CONTENT_DIR
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('forbidden-locale')
  })

  it('blocks .. in any segment (blocklist)', () => {
    for (const segments of [
      ['..', 'slug', 'img.png'],
      ['ko', '..', 'img.png'],
      ['ko', 'slug', '..png'],
      ['ko', 'slug', '../secret.png'],
      ['ko', '../../etc', 'passwd.png'],
    ]) {
      const result = validateContentImageRequest(segments, CONTENT_DIR)
      expect(result.ok).toBe(false)
      // Either the blocklist check fires (path-traversal) or containment check
      if (!result.ok) {
        expect(['path-traversal', 'forbidden-locale']).toContain(result.error)
      }
    }
  })

  it('rejects unsupported file types', () => {
    const result = validateContentImageRequest(
      ['ko', 'slug', 'script.js'],
      CONTENT_DIR
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('unsupported-mime')

    const txt = validateContentImageRequest(
      ['ko', 'slug', 'readme.txt'],
      CONTENT_DIR
    )
    expect(txt.ok).toBe(false)
    if (!txt.ok) expect(txt.error).toBe('unsupported-mime')
  })

  it('accepts all allowlisted image extensions', () => {
    for (const ext of ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif']) {
      const result = validateContentImageRequest(
        ['ko', 'slug', `img.${ext}`],
        CONTENT_DIR
      )
      expect(result.ok, `Extension ${ext} should be accepted`).toBe(true)
    }
  })

  it('case-insensitive extension', () => {
    const result = validateContentImageRequest(
      ['ko', 'slug', 'IMG.PNG'],
      CONTENT_DIR
    )
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.contentType).toBe('image/png')
  })

  it('produces both direct and subdirectory candidate paths', () => {
    const result = validateContentImageRequest(
      ['en', 'my-post', 'cover.webp'],
      CONTENT_DIR
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.candidates[0]).toContain(path.join('en', 'my-post', 'cover.webp'))
      expect(result.candidates[1]).toContain(path.join('en', 'my-post', 'content', 'cover.webp'))
    }
  })
})
