import { ImageResponse } from 'next/og'
import { SITE_NAME } from '@/lib/seo'

// TODO(client): set OG image alt text
export const alt = '{{PLACEHOLDER}}'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const BG = '#2a2a2a'
const ACCENT = '#888888'
const TEXT = '#f5f5f5'

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
          background: BG,
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: ACCENT,
          }}
        >
          {SITE_NAME}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 76,
              lineHeight: 1.1,
              color: TEXT,
              maxWidth: 900,
            }}
          >
            {'{{PLACEHOLDER}}'}
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: 'rgba(245,245,245,0.72)', maxWidth: 860 }}>
            {'{{PLACEHOLDER}}'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 64, height: 3, background: ACCENT }} />
          <div style={{ marginLeft: 20, fontSize: 26, color: 'rgba(245,245,245,0.8)' }}>
            {'{{PLACEHOLDER}}'}
          </div>
        </div>
      </div>
    ),
    size,
  )
}
