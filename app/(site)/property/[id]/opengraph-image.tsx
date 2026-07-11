import { ImageResponse } from 'next/og'
import { getListingBySlug } from '@/lib/queries-server'

export const alt = 'MR ESTATES property'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const GREEN = '#0B2E22'
const GOLD = '#A37E2C'
const CREAM = '#F5F1E8'

export default async function PropertyOgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const listing = await getListingBySlug(id).catch(() => null)

  const title = listing?.title ?? 'Melbourne Property'
  const suburb = listing?.suburb ?? 'Melbourne'
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
          background: GREEN,
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
            background: 'linear-gradient(180deg, rgba(11,46,34,0.35) 0%, rgba(11,46,34,0.92) 100%)',
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
              color: GOLD,
            }}
          >
            MR Estates
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(245,241,232,0.85)' }}>
              {suburb}
            </div>
            <div style={{ marginTop: 16, fontSize: 68, lineHeight: 1.1, color: CREAM, maxWidth: 1000 }}>
              {title}
            </div>
            {price ? (
              <div style={{ marginTop: 24, fontSize: 34, color: GOLD }}>{price}</div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    size,
  )
}
