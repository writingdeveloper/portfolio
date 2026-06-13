import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

// Clamp untrusted query input before it reaches ImageResponse: caps the work
// the renderer does (no multi-MB strings) and strips control chars / bidi
// overrides that could garble or spoof the generated card. Filtering by code
// point keeps this regex-free (no literal control chars in source).
function clampParam(value: string | null, max: number): string | null {
  if (!value) return null
  let cleaned = ''
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0
    // Drop C0 controls (0x00–0x1F), DEL (0x7F), and bidi overrides.
    if (code <= 0x1f || code === 0x7f) continue
    if (code === 0x200e || code === 0x200f || (code >= 0x202a && code <= 0x202e)) continue
    cleaned += ch
  }
  cleaned = cleaned.trim()
  if (!cleaned) return null
  return cleaned.length > max ? cleaned.slice(0, max) : cleaned
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = clampParam(searchParams.get('title'), 120)
  const description = clampParam(searchParams.get('description'), 200)

  // Route-level headers — /api/og is not covered by the src/proxy.ts matcher
  // (api routes are excluded), so we set the security headers here directly.
  const cacheHeaders = {
    'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
  }

  if (!title) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0f',
          }}
        >
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, color: '#ffffff', letterSpacing: '-1px' }}>
            WritingDeveloper
          </div>
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 400, color: '#888888', marginTop: 20 }}>
            Dev Stories &amp; Tech Tutorials
          </div>
        </div>
      ),
      { width: 1200, height: 630, headers: cacheHeaders }
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          backgroundColor: '#0a0a0f',
          padding: '60px 80px',
        }}
      >
        <div style={{ display: 'flex', fontSize: 52, fontWeight: 700, color: '#ffffff', lineHeight: 1.2, marginBottom: 16 }}>
          {title.length > 60 ? title.slice(0, 57) + '...' : title}
        </div>
        {description && (
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 400, color: '#9ca3af', lineHeight: 1.4, marginBottom: 40 }}>
            {description.length > 120 ? description.slice(0, 117) + '...' : description}
          </div>
        )}
        <div style={{ display: 'flex', fontSize: 20, fontWeight: 600, color: '#3b82f6' }}>
          writingdeveloper.blog
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: cacheHeaders }
  )
}
