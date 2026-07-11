import type { Tables } from '@/lib/database.types'
import {
  formatListingStatus,
  schemaOfferAvailability,
  stripListingDescription,
} from '@/lib/listing-utils'
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo'

export function buildOrganization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/images/logo-mark-square.png`,
      contentUrl: `${SITE_URL}/images/logo-mark-square.png`,
      width: 512,
      height: 512,
      caption: `${SITE_NAME} logo`,
    },
    image: `${SITE_URL}/images/logo-mark-dark@2x.png`,
    description: DEFAULT_DESCRIPTION,
    /* TODO(client): organisation contact + address for JSON-LD */
    telephone: '+61 0 0000 0000',
    email: 'hello@example.com',
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Address line',
      addressLocality: 'City',
      addressRegion: 'State',
      postalCode: '0000',
      addressCountry: 'AU',
    },
    areaServed: {
      '@type': 'City',
      name: 'City',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '17:30',
      },
    ],
  }
}

export function buildWebSite() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/buy?suburb={search_term_string}`,
      },
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
  const description =
    stripListingDescription(listing.description) || listing.headline || listing.title

  const residence: Record<string, unknown> = {
    '@type': 'Residence',
    name: listing.title,
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.suburb ?? undefined,
      streetAddress: listing.address ?? undefined,
      addressRegion: 'VIC',
      addressCountry: 'AU',
    },
  }

  if (listing.bedrooms != null) residence.numberOfRooms = listing.bedrooms
  if (listing.bathrooms != null) residence.numberOfBathroomsTotal = listing.bathrooms
  if (listing.carspaces != null) {
    residence.amenityFeature = {
      '@type': 'LocationFeatureSpecification',
      name: 'Parking',
      value: listing.carspaces,
    }
  }
  if (listing.floor_area_sqm != null) {
    residence.floorSize = {
      '@type': 'QuantitativeValue',
      value: listing.floor_area_sqm,
      unitCode: 'MTK',
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description,
    url: `${SITE_URL}/property/${listing.slug}`,
    image: listing.images?.[0] ?? undefined,
    address: residence.address,
    about: residence,
    ...(listing.bedrooms != null ? { numberOfRooms: listing.bedrooms } : {}),
    ...(listing.bathrooms != null ? { numberOfBathroomsTotal: listing.bathrooms } : {}),
    ...(listing.floor_area_sqm != null
      ? {
          floorSize: {
            '@type': 'QuantitativeValue',
            value: listing.floor_area_sqm,
            unitCode: 'MTK',
          },
        }
      : {}),
    offers: listing.price_display
      ? {
          '@type': 'Offer',
          price: listing.price_min ?? undefined,
          priceCurrency: 'AUD',
          description: listing.price_display,
          availability: schemaOfferAvailability(listing.status),
          itemCondition: 'https://schema.org/NewCondition',
        }
      : {
          '@type': 'Offer',
          availability: schemaOfferAvailability(listing.status),
          description: formatListingStatus(listing.status),
        },
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
    name: SITE_NAME,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avg.toFixed(1),
      reviewCount: testimonials.length,
      bestRating: 5,
    },
  }
}
