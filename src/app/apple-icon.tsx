import { ImageResponse } from 'next/og'

// iOS "Add to Home Screen" touch icon (180×180 PNG). iOS applies its own
// rounded mask, so we fill the full square with the brand background.
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0f',
          color: '#f3f4f6',
          fontSize: 96,
          fontWeight: 700,
          letterSpacing: -4,
        }}
      >
        WD
      </div>
    ),
    { ...size },
  )
}
