import { ImageResponse } from 'next/og'
import { getBlogPostBySlug } from '@/lib/queries-server'

export const alt = 'MR ESTATES insight'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const GREEN = '#0B2E22'
const GOLD = '#A37E2C'
const CREAM = '#F5F1E8'

export default async function InsightOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug).catch(() => null)

  const title = post?.title ?? 'Melbourne Market Insights'
  const category = post?.category ?? 'Insights'
  const bgImage = post?.cover_image ?? undefined

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
            background: 'linear-gradient(180deg, rgba(11,46,34,0.45) 0%, rgba(11,46,34,0.94) 100%)',
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
            <div style={{ fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', color: GOLD }}>
              {category}
            </div>
            <div style={{ marginTop: 16, fontSize: 64, lineHeight: 1.15, color: CREAM, maxWidth: 1000 }}>
              {title}
            </div>
          </div>
          <div style={{ fontSize: 26, color: 'rgba(245,241,232,0.8)' }}>mrestates.com.au/insights</div>
        </div>
      </div>
    ),
    size,
  )
}
