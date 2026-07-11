import { NextResponse } from 'next/server'
import { getAvailableListings } from '@/lib/queries-server'
import { absoluteUrl } from '@/lib/seo'
import {
  formatListingStatus,
  listingDescriptionParagraph,
} from '@/lib/listing-utils'

export const revalidate = 3600

export async function GET() {
  const listings = await getAvailableListings()

  const payload = listings.map((listing) => ({
    title: listing.title,
    type: listing.category,
    suburb: listing.suburb ?? '',
    price: listing.price_display ?? '',
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    parking: listing.carspaces,
    status: formatListingStatus(listing.status),
    description: listingDescriptionParagraph(listing.description) || listing.headline || listing.title,
    url: absoluteUrl(`/property/${listing.slug}`),
  }))

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
