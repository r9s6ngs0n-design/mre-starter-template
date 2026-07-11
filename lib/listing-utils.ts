import type { Tables } from '@/lib/database.types'
import { stripHtml } from '@/lib/rich-text'
import { formatTypeSlug } from '@/lib/slugUtils'

export const UNAVAILABLE_STATUSES = ['sold', 'leased'] as const

export type ListingStatus = Tables<'listings'>['status']

export function isAvailableListing(listing: Pick<Tables<'listings'>, 'status'>) {
  return !UNAVAILABLE_STATUSES.includes(listing.status as (typeof UNAVAILABLE_STATUSES)[number])
}

export function formatListingStatus(status: ListingStatus): string {
  const labels: Record<ListingStatus, string> = {
    available: 'Available',
    under_offer: 'Under Offer',
    sold: 'Sold',
    leased: 'Leased',
    coming_soon: 'Coming Soon',
  }
  return labels[status] ?? status
}

export function schemaOfferAvailability(status: ListingStatus): string {
  const map: Record<ListingStatus, string> = {
    available: 'https://schema.org/InStock',
    under_offer: 'https://schema.org/LimitedAvailability',
    sold: 'https://schema.org/SoldOut',
    leased: 'https://schema.org/SoldOut',
    coming_soon: 'https://schema.org/PreOrder',
  }
  return map[status] ?? 'https://schema.org/InStock'
}

export function stripListingDescription(html: string | null | undefined): string {
  return stripHtml(html)
}

/** First paragraph of plain-text description for feeds and previews. */
export function listingDescriptionParagraph(html: string | null | undefined): string {
  const plain = stripListingDescription(html)
  if (!plain) return ''
  const paragraph = plain.split(/\r?\n\r?\n+/)[0] ?? plain
  return paragraph.split(/\r?\n/).join(' ').trim()
}

export function formatListingSpecs(listing: Pick<Tables<'listings'>, 'bedrooms' | 'bathrooms' | 'carspaces' | 'floor_area_sqm' | 'category' | 'property_type' | 'type_slug'>) {
  if (listing.category === 'commercial') {
    const parts = [
      listing.property_type || listing.type_slug ? formatTypeSlug((listing.property_type ?? listing.type_slug) as string) : null,
      listing.floor_area_sqm != null ? `${listing.floor_area_sqm} m²` : null,
    ].filter(Boolean)
    return parts.join(' · ')
  }

  const parts = [
    listing.bedrooms != null ? `${listing.bedrooms} bed` : null,
    listing.bathrooms != null ? `${listing.bathrooms} bath` : null,
    listing.carspaces != null ? `${listing.carspaces} car` : null,
  ].filter(Boolean)

  return parts.join(' · ')
}
