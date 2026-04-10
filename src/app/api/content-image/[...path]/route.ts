import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { validateContentImageRequest } from '@/lib/content-image-path'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts')
const MAX_BYTES = 20 * 1024 * 1024

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path
  const validation = validateContentImageRequest(segments, CONTENT_DIR)
  if (!validation.ok) {
    const statusMap: Record<string, number> = {
      'not-found': 404,
      'forbidden-locale': 403,
      'path-traversal': 403,
      'unsupported-mime': 415,
    }
    return new NextResponse(validation.error, { status: statusMap[validation.error] })
  }

  const { candidates, contentType } = validation

  // Probe candidate paths: direct (Keystatic directory mode) first, then
  // legacy `content/` subdirectory.
  let filePath: string | null = null
  for (const candidate of candidates) {
    try {
      await fs.access(candidate)
      filePath = candidate
      break
    } catch {
      // try next
    }
  }
  if (!filePath) {
    return new NextResponse('Not found', { status: 404 })
  }

  // Size guard + access->read race handling
  let fileBuffer: Buffer
  try {
    const stats = await fs.stat(filePath)
    if (stats.size > MAX_BYTES) {
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
