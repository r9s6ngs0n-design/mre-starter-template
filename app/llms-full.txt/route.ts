import { SITE_URL } from '@/lib/seo'
import { getAvailableListings, getPublishedBlogPosts } from '@/lib/queries-server'
import { stripHtml } from '@/lib/rich-text'

// Regenerate at most hourly.
export const revalidate = 3600

const CATEGORY_LABEL: Record<string, string> = {
  buy: 'Buy',
  rent: 'Rent',
  project: 'Off-the-plan project',
  commercial: 'Commercial',
}

const CATEGORY_PATH: Record<string, string> = {
  buy: '/buy',
  rent: '/rent',
  project: '/projects',
  commercial: '/commercial',
}

export async function GET() {
  const [listings, posts] = await Promise.all([getAvailableListings(), getPublishedBlogPosts()])

  const lines: string[] = []

  lines.push('# MR ESTATES — Full index')
  lines.push('')
  lines.push(
    '> A structured, machine-readable index of MR Estates: a premium Melbourne real estate agency for residential sales, rentals, off-the-plan projects, and commercial property.',
  )
  lines.push('')

  lines.push('## Property categories')
  lines.push('')
  for (const [value, label] of Object.entries(CATEGORY_LABEL)) {
    lines.push(`- ${label}: ${SITE_URL}${CATEGORY_PATH[value]}`)
  }
  lines.push('')

  if (listings.length) {
    lines.push('## Current listings')
    lines.push('')
    for (const listing of listings) {
      const category = CATEGORY_LABEL[listing.category] ?? listing.category
      const parts = [
        listing.suburb ? `${listing.suburb}` : null,
        listing.price_display ?? null,
        listing.bedrooms != null ? `${listing.bedrooms} bed` : null,
      ].filter(Boolean)
      const meta = parts.length ? ` — ${parts.join(', ')}` : ''
      lines.push(`- [${category}] ${listing.title}${meta}: ${SITE_URL}/property/${listing.slug}`)
    }
    lines.push('')
  }

  if (posts.length) {
    lines.push('## Market insights')
    lines.push('')
    for (const post of posts) {
      const summary = post.excerpt ? stripHtml(post.excerpt).slice(0, 160) : ''
      const meta = summary ? ` — ${summary}` : ''
      lines.push(`- ${post.title}${meta}: ${SITE_URL}/insights/${post.slug}`)
    }
    lines.push('')
  }

  lines.push('## Contact')
  lines.push('')
  lines.push('- Email: hello@mrestates.com.au')
  lines.push('- Phone: (03) 9824 9824')
  lines.push('- Office: Level 2, 530 Collins Street, Melbourne VIC 3000')
  lines.push('')

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
