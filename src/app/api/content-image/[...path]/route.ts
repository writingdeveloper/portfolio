import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts')

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
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

  // Prevent path traversal
  if (
    locale.includes('..') ||
    slug.includes('..') ||
    filename.includes('..')
  ) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Check both direct (Keystatic directory mode) and content/ subdirectory
  let filePath = path.join(CONTENT_DIR, locale, slug, filename)
  if (!fs.existsSync(filePath)) {
    filePath = path.join(CONTENT_DIR, locale, slug, 'content', filename)
  }

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const ext = path.extname(filename).toLowerCase()
  const contentType = MIME_TYPES[ext]
  if (!contentType) {
    return new NextResponse('Unsupported file type', { status: 415 })
  }

  const fileBuffer = fs.readFileSync(filePath)

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
