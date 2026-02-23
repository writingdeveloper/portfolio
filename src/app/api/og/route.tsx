import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')
  const description = searchParams.get('description')

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
      { width: 1200, height: 630 }
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
    { width: 1200, height: 630 }
  )
}
