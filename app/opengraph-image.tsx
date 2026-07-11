import { ImageResponse } from 'next/og'

export const alt = 'MR ESTATES — Melbourne Living, Curated'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const GREEN = '#0B2E22'
const GOLD = '#A37E2C'
const CREAM = '#F5F1E8'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: GREEN,
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: GOLD,
          }}
        >
          MR Estates
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 76,
              lineHeight: 1.1,
              color: CREAM,
              maxWidth: 900,
            }}
          >
            Melbourne Living, Curated
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: 'rgba(245,241,232,0.72)', maxWidth: 860 }}>
            Residential sales, rentals, off-the-plan projects, and commercial property.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 64, height: 3, background: GOLD }} />
          <div style={{ marginLeft: 20, fontSize: 26, color: 'rgba(245,241,232,0.8)' }}>
            mrestates.com.au
          </div>
        </div>
      </div>
    ),
    size,
  )
}
