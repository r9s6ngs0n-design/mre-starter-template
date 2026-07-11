import type { Metadata } from 'next'

/* ── Template config (replace per client) ─────────────────────────────────── */

/** Public site origin (no trailing slash). Prefer env in deploy; placeholder for local. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com').replace(/\/$/, '')

/* TODO(client): brand / agency display name */
export const SITE_NAME = 'Agency Name'

/* TODO(client): default document title (used when a page omits `title`) */
export const DEFAULT_TITLE = 'Agency Name — Tagline'

/* TODO(client): default meta description */
export const DEFAULT_DESCRIPTION =
  'Premium real estate agency. Replace this description with the client value proposition.'

export const TITLE_TEMPLATE = `%s — ${SITE_NAME}`

/* ── Helpers (generic) ────────────────────────────────────────────────────── */

/** Resolve a path or URL to an absolute URL against the configured site origin. */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

interface BuildMetadataArgs {
  /** Bare page title (the `— ${SITE_NAME}` suffix is added by the layout template). */
  title?: string
  description?: string
  /** Absolute path for the canonical URL, e.g. `/buy`. */
  path?: string
  /** Absolute or root-relative image URL for social cards. Omit to fall back to the file-based OG image. */
  image?: string
  type?: 'website' | 'article'
  /** Skip indexing for private/utility pages. */
  noIndex?: boolean
}

/**
 * Central metadata builder — attaches canonical URL, Open Graph, and Twitter card
 * data so every public page produces consistent, crawlable social metadata.
 */
export function buildMetadata({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  noIndex = false,
}: BuildMetadataArgs = {}): Metadata {
  const canonical = absoluteUrl(path)
  const brandedTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE
  const images = image ? [{ url: absoluteUrl(image) }] : undefined

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type,
      title: brandedTitle,
      description: description ?? undefined,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'en_AU',
      ...(images ? { images } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: brandedTitle,
      description: description ?? undefined,
      ...(images ? { images } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}
