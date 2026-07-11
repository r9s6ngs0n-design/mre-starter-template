import type { ListingCategory, Tables } from '@/lib/database.types'

export interface SearchListingOption {
  title: string
  suburb: string
  address: string
  slug: string
}

export type SearchListingsByCategory = Record<ListingCategory, SearchListingOption[]>

export function listingsToSearchOptions(listings: Tables<'listings'>[]): SearchListingOption[] {
  return listings.map((listing) => ({
    title: listing.title,
    suburb: listing.suburb ?? '',
    address: listing.address ?? '',
    slug: listing.slug,
  }))
}

export function groupSearchOptionsByCategory(listings: Tables<'listings'>[]): SearchListingsByCategory {
  const grouped: SearchListingsByCategory = {
    buy: [],
    rent: [],
    project: [],
    commercial: [],
  }

  for (const listing of listings) {
    grouped[listing.category].push({
      title: listing.title,
      suburb: listing.suburb ?? '',
      address: listing.address ?? '',
      slug: listing.slug,
    })
  }

  return grouped
}

export function filterSearchListingOptions(
  options: SearchListingOption[],
  query: string,
): SearchListingOption[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return options

  return options.filter((option) => {
    const title = option.title.toLowerCase()
    const suburb = option.suburb.toLowerCase()
    const address = option.address.toLowerCase()
    return (
      title.includes(normalized) ||
      suburb.includes(normalized) ||
      address.includes(normalized)
    )
  })
}
