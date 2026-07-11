import type { Tables } from '@/lib/database.types'

interface SearchParams {
  suburb?: string
  type?: string
  maxPrice?: string
  beds?: string
  baths?: string
}

/**
 * Applies URL-based search params as in-memory filters on a set of listings.
 * All filters are additive (AND logic). Unset params are ignored.
 */
export function filterListings(
  listings: Tables<'listings'>[],
  params: SearchParams,
): Tables<'listings'>[] {
  return listings.filter((listing) => {
    // Suburb — case-insensitive partial match on suburb or address
    if (params.suburb?.trim()) {
      const query = params.suburb.trim().toLowerCase()
      const suburb = (listing.suburb ?? '').toLowerCase()
      const address = (listing.address ?? '').toLowerCase()
      if (!suburb.includes(query) && !address.includes(query)) return false
    }

    // Property type — matches backend property_type, falling back to SEO type_slug
    if (params.type) {
      const listingType = listing.property_type ?? listing.type_slug
      if (listingType !== params.type) return false
    }

    // Max price — matches against price_max, falling back to price_min
    if (params.maxPrice) {
      const ceiling = Number(params.maxPrice)
      const listingPrice = listing.price_max ?? listing.price_min
      if (listingPrice != null && listingPrice > ceiling) return false
    }

    // Beds — minimum bedroom count
    if (params.beds) {
      const minBeds = Number(params.beds)
      if (listing.bedrooms == null || listing.bedrooms < minBeds) return false
    }

    // Baths — minimum bathroom count
    if (params.baths) {
      const minBaths = Number(params.baths)
      if (listing.bathrooms == null || listing.bathrooms < minBaths) return false
    }

    return true
  })
}
