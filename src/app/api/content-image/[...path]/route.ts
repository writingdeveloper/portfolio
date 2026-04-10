import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const VALID_LOCALES = new Set(['ko', 'en'])

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts')

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path

  // Expected: /api/content-image/{locale}/{slug}/{filename}
  if (segments.length !== 3) {
    return new NextResponse('Not found', { status: 404 })
  }

  const [locale, slug, filename] = segments

  // Validate locale against allowlist
  if (!VALID_LOCALES.has(locale)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Prevent path traversal - blocklist check
  if (
    locale.includes('..') ||
    slug.includes('..') ||
    filename.includes('..')
  ) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Check both direct (Keystatic directory mode) and content/ subdirectory
  let filePath = path.join(CONTENT_DIR, locale, slug, filename)
  try {
    await fs.access(filePath)
  } catch {
    filePath = path.join(CONTENT_DIR, locale, slug, 'content', filename)
  }

  // Resolved-path containment check to prevent traversal bypasses
  const resolvedPath = path.resolve(filePath)
  if (!resolvedPath.startsWith(path.resolve(CONTENT_DIR))) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    await fs.access(filePath)
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }

  const ext = path.extname(filename).toLowerCase()
  const contentType = MIME_TYPES[ext]
  if (!contentType) {
    return new NextResponse('Unsupported file type', { status: 415 })
  }

  // Size guard: refuse to serve suspiciously large files (> 20 MB) through
  // the serverless function. Also handles the access->readFile race where
  // the file could disappear between the two calls.
  let fileBuffer: Buffer
  try {
    const stats = await fs.stat(filePath)
    if (stats.size > 20 * 1024 * 1024) {
      return new NextResponse('Payload too large', { status: 413 })
    }
    fileBuffer = await fs.readFile(filePath)
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }

  return new NextResponse(fileBuffer as BodyInit, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': fileBuffer.length.toString(),
    },
  })
}
