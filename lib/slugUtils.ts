import type { ListingCategory, Tables } from '@/lib/database.types'

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const CATEGORY_PATH: Record<ListingCategory, string> = {
  project: 'projects',
  buy: 'buy',
  commercial: 'commercial',
  rent: 'rent',
}

export function getCategoryIndexPath(category: ListingCategory): string {
  return `/${CATEGORY_PATH[category]}`
}

export function buildListingPath(item: Pick<Tables<'listings'>, 'category' | 'suburb_slug' | 'slug' | 'suburb'>): string {
  const category = CATEGORY_PATH[item.category]
  const suburb = item.suburb_slug ?? toSlug(item.suburb ?? 'melbourne')
  return `/${category}/${suburb}/${item.slug}`
}

export const LISTING_CATEGORIES: { value: ListingCategory; label: string }[] = [
  { value: 'buy', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
  { value: 'project', label: 'Off-the-plan' },
  { value: 'commercial', label: 'Commercial' },
]

export const LISTING_STATUSES = [
  'available',
  'under_offer',
  'sold',
  'leased',
  'coming_soon',
] as const

export const INTENT_SLUGS = [
  'buy',
  'invest',
  'sell',
  'lease',
  'commercial',
] as const

export const TYPE_SLUGS = [
  'apartment',
  'penthouse',
  'townhouse',
  'office',
  'retail',
] as const
