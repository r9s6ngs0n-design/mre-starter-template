import { ImageResponse } from 'next/og'
import { getBlogPostBySlug } from '@/lib/queries-server'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

// TODO(client): set insight OG image alt text
export const alt = '{{PLACEHOLDER}}'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const BG = '#2a2a2a'
const ACCENT = '#888888'
const TEXT = '#f5f5f5'

export default async function InsightOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug).catch(() => null)

  const title = post?.title ?? '{{PLACEHOLDER}}'
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
            background: 'linear-gradient(180deg, rgba(42,42,42,0.45) 0%, rgba(42,42,42,0.94) 100%)',
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
            <div style={{ fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', color: ACCENT }}>
              {category}
            </div>
            <div style={{ marginTop: 16, fontSize: 64, lineHeight: 1.15, color: TEXT, maxWidth: 1000 }}>
              {title}
            </div>
          </div>
          <div style={{ fontSize: 26, color: 'rgba(245,245,245,0.8)' }}>{`${SITE_URL}/insights`}</div>
        </div>
      </div>
    ),
    size,
  )
}
