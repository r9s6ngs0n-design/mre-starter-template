import type { Tables } from '@/lib/database.types'
import { buildListingPath } from '@/lib/slugUtils'

// TODO(client): set NEXT_PUBLIC_SITE_URL in env, and the org/locale values below.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'
const ORG_NAME = '{{BRAND_NAME}}'
const LOCALITY = '{{CITY}}'
const REGION = '{{REGION}}'
const COUNTRY = '{{COUNTRY_CODE}}'

export function buildOrganization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: ORG_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo-mark-dark@2x.png`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: LOCALITY,
      addressRegion: REGION,
      addressCountry: COUNTRY,
    },
    areaServed: LOCALITY,
  }
}

export function buildWebSite() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ORG_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/projects?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildBreadcrumb(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}

export function buildRealEstateListing(listing: Tables<'listings'>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description: listing.headline ?? listing.title,
    url: `${SITE_URL}${buildListingPath(listing)}`,
    image: listing.images?.[0] ?? undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.suburb ?? LOCALITY,
      streetAddress: listing.address ?? undefined,
      addressRegion: REGION,
      addressCountry: COUNTRY,
    },
    offers: listing.price_display
      ? {
          '@type': 'Offer',
          price: listing.price_min ?? undefined,
          priceCurrency: 'AUD',
          description: listing.price_display,
        }
      : undefined,
  }
}

export function buildBlogPosting(post: Tables<'blog_posts'>, authorName?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image ?? undefined,
    datePublished: post.published_at ?? post.created_at,
    author: authorName ? { '@type': 'Person', name: authorName } : undefined,
    url: `${SITE_URL}/insights/${post.slug}`,
  }
}

export function buildFAQ(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

export function buildReviewAggregate(testimonials: Tables<'testimonials'>[]) {
  if (!testimonials.length) return null
  const avg =
    testimonials.reduce((sum, t) => sum + (t.rating ?? 5), 0) / testimonials.length
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avg.toFixed(1),
      reviewCount: testimonials.length,
      bestRating: 5,
    },
  }
}
