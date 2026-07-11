import { ImageResponse } from 'next/og'
import { getListingBySlug } from '@/lib/queries-server'
import { SITE_NAME } from '@/lib/seo'

// TODO(client): set property OG image alt text
export const alt = '{{PLACEHOLDER}}'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const BG = '#2a2a2a'
const ACCENT = '#888888'
const TEXT = '#f5f5f5'

export default async function PropertyOgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const listing = await getListingBySlug(id).catch(() => null)

  const title = listing?.title ?? '{{PLACEHOLDER}}'
  const suburb = listing?.suburb ?? '{{PLACEHOLDER}}'
  const price = listing?.price_display ?? undefined
  const bgImage = listing?.images?.[0]

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: BG,
          fontFamily: 'sans-serif',
        }}
      >
        {bgImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bgImage}
            alt=""
            width={size.width}
            height={size.height}
            style={{ position: 'absolute', inset: 0, objectFit: 'cover' }}
          />
        ) : null}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(42,42,42,0.35) 0%, rgba(42,42,42,0.92) 100%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            padding: '80px',
          }}
        >
          <div
            style={{
              fontSize: 28,
              letterSpacing: 8,
              textTransform: 'uppercase',
              color: ACCENT,
            }}
          >
            {SITE_NAME}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(245,245,245,0.85)' }}>
              {suburb}
            </div>
            <div style={{ marginTop: 16, fontSize: 68, lineHeight: 1.1, color: TEXT, maxWidth: 1000 }}>
              {title}
            </div>
            {price ? (
              <div style={{ marginTop: 24, fontSize: 34, color: ACCENT }}>{price}</div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    size,
  )
}
