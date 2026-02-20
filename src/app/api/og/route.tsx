import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
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
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-1px',
          }}
        >
          WritingDeveloper
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            fontWeight: 400,
            color: '#888888',
            marginTop: 20,
          }}
        >
          Dev Stories &amp; Tech Tutorials
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
