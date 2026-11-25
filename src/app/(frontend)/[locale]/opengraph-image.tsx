import { ImageResponse } from 'next/og'

// Default branded share image (Latin text only: the built-in OG font has no Cyrillic).
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'INVENTO: Build. Discover. Create.'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0D1B2A',
          color: '#F2F2F2',
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 72,
              background: '#FF7A00',
              border: '6px solid #F2F2F2',
              borderRadius: 10,
              display: 'flex',
            }}
          />
          <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: 4 }}>INVENTO</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 120, fontWeight: 900, lineHeight: 0.9 }}>
          <span>BUILD.</span>
          <span style={{ color: '#FF7A00' }}>DISCOVER.</span>
          <span style={{ color: '#FFD166' }}>CREATE.</span>
        </div>
        <div style={{ fontSize: 30 }}>Wooden build-it-yourself kits for ages 6-12 · North Macedonia</div>
      </div>
    ),
    size,
  )
}
