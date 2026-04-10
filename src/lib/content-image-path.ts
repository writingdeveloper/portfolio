import path from 'path'

export const VALID_LOCALES = new Set(['ko', 'en'])

export const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
}

export type ValidationError =
  | 'not-found'
  | 'forbidden-locale'
  | 'path-traversal'
  | 'unsupported-mime'

export type ValidationResult =
  | { ok: true; candidates: string[]; contentType: string }
  | { ok: false; error: ValidationError }

/**
 * Validates a /api/content-image/{locale}/{slug}/{filename} request.
 *
 * Returns candidate filesystem paths to probe (primary + Keystatic content/
 * subdirectory fallback) and the resolved MIME type. All three traversal
 * mitigations are applied here so tests can exercise them without touching
 * the filesystem.
 */
export function validateContentImageRequest(
  segments: string[],
  contentDir: string
): ValidationResult {
  if (segments.length !== 3) {
    return { ok: false, error: 'not-found' }
  }

  const [locale, slug, filename] = segments

  if (!VALID_LOCALES.has(locale)) {
    return { ok: false, error: 'forbidden-locale' }
  }

  if (
    locale.includes('..') ||
    slug.includes('..') ||
    filename.includes('..')
  ) {
    return { ok: false, error: 'path-traversal' }
  }

  const ext = path.extname(filename).toLowerCase()
  const contentType = MIME_TYPES[ext]
  if (!contentType) {
    return { ok: false, error: 'unsupported-mime' }
  }

  const directCandidate = path.join(contentDir, locale, slug, filename)
  const subdirCandidate = path.join(contentDir, locale, slug, 'content', filename)

  // Resolved-path containment check to prevent traversal bypasses
  // even if earlier checks missed a creative encoding.
  const resolvedDirect = path.resolve(directCandidate)
  const resolvedSubdir = path.resolve(subdirCandidate)
  const contentRoot = path.resolve(contentDir)

  if (
    !resolvedDirect.startsWith(contentRoot + path.sep) &&
    resolvedDirect !== contentRoot
  ) {
    return { ok: false, error: 'path-traversal' }
  }
  if (
    !resolvedSubdir.startsWith(contentRoot + path.sep) &&
    resolvedSubdir !== contentRoot
  ) {
    return { ok: false, error: 'path-traversal' }
  }

  return {
    ok: true,
    candidates: [directCandidate, subdirCandidate],
    contentType,
  }
}
