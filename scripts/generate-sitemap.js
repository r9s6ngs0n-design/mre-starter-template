/**
 * Generates public/sitemap.xml from static paths.
 * When NEXT_PUBLIC_SUPABASE_URL is set, also pulls published listings and blog posts.
 */
const fs = require('fs')
const path = require('path')

// TODO(client): set NEXT_PUBLIC_SITE_URL in the environment for production sitemaps.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const staticPaths = [
  '/',
  '/buy',
  '/rent',
  '/projects',
  '/commercial',
  '/about',
  '/insights',
  '/contact',
]

async function fetchPublished(table, slugField = 'slug') {
  if (!SUPABASE_URL || !SUPABASE_ANON) return []
  const url = `${SUPABASE_URL}/rest/v1/${table}?is_published=eq.true&select=${slugField},updated_at`
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
    },
  })
  if (!res.ok) return []
  return res.json()
}

async function main() {
  const urls = staticPaths.map((p) => ({ loc: `${SITE_URL}${p}`, lastmod: new Date().toISOString().slice(0, 10) }))

  try {
    const [listings, posts] = await Promise.all([
      fetchPublished('listings'),
      fetchPublished('blog_posts'),
    ])

    listings.forEach((l) => {
      urls.push({
        loc: `${SITE_URL}/property/${l.slug}`,
        lastmod: (l.updated_at || '').slice(0, 10) || undefined,
      })
    })

    posts.forEach((p) => {
      urls.push({
        loc: `${SITE_URL}/insights/${p.slug}`,
        lastmod: (p.updated_at || '').slice(0, 10) || undefined,
      })
    })
  } catch {
    // Supabase not configured — static paths only
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>
`

  const out = path.join(__dirname, '..', 'public', 'sitemap.xml')
  fs.writeFileSync(out, xml)
  console.log(`Wrote ${urls.length} URLs to public/sitemap.xml`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
