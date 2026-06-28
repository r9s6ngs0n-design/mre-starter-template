import { createClient } from '@/lib/supabase/server'
import type { ListingCategory } from '@/lib/database.types'
import type { DocumentPlacement } from '@/lib/documents'
import { DEFAULT_PLACEMENT_SECTION_ORDERS, sortDocuments } from '@/lib/documents'

export async function getPublishedListings(category?: ListingCategory) {
  const supabase = await createClient()
  if (!supabase) return []
  let query = supabase
    .from('listings')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true })
  if (category) query = query.eq('category', category)
  const { data, error } = await query
  if (error) return []
  return data ?? []
}

export async function getListingBySlug(slug: string) {
  const supabase = await createClient()
  if (!supabase) return null
  const { data } = await supabase
    .from('listings')
    .select('*, listing_inspection_times(*)')
    .eq('slug', slug)
    .eq('is_published', true)
    .order('starts_at', { referencedTable: 'listing_inspection_times', ascending: true })
    .maybeSingle()
  return data
}

export async function getFeaturedListings(limit = 3) {
  const supabase = await createClient()
  if (!supabase) return []
  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('is_published', true)
    .eq('featured', true)
    .order('display_order', { ascending: true })
    .limit(limit)
  return data ?? []
}

export async function getPublishedBlogPosts() {
  const supabase = await createClient()
  if (!supabase) return []
  const { data } = await supabase
    .from('blog_posts')
    .select('*, team_members(name, slug)')
    .eq('is_published', true)
    .order('published_at', { ascending: false, nullsFirst: false })
  return data ?? []
}

export async function getBlogPostBySlug(slug: string) {
  const supabase = await createClient()
  if (!supabase) return null
  const { data } = await supabase
    .from('blog_posts')
    .select('*, team_members(name, slug, avatar_url)')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()
  return data
}

export async function getPublishedTestimonials() {
  const supabase = await createClient()
  if (!supabase) return []
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true })
  return data ?? []
}

export async function getPublishedTeam() {
  const supabase = await createClient()
  if (!supabase) return []
  const { data } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true })
  return data ?? []
}

export async function getPublishedPageSections(pageId: string) {
  const supabase = await createClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('page_sections')
    .select('*')
    .eq('page_id', pageId)
    .eq('is_published', true)
    .order('display_order', { ascending: true })
  if (error) {
    console.error('[getPublishedPageSections]', error.message)
    return []
  }
  return data ?? []
}

export async function getDocumentsForPlacement(placement: DocumentPlacement) {
  const supabase = await createClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('is_active', true)
    .is('listing_id', null)
    .contains('placements', [placement])
    .order('display_order', { ascending: true })
  if (error) {
    console.error('[getDocumentsForPlacement]', error.message)
    return []
  }
  return sortDocuments(data ?? [])
}

export async function getDocumentsForProperty(listingId: string) {
  const supabase = await createClient()
  if (!supabase) return []

  const [listingResult, globalResult] = await Promise.all([
    supabase
      .from('documents')
      .select('*')
      .eq('is_active', true)
      .eq('listing_id', listingId)
      .order('display_order', { ascending: true }),
    supabase
      .from('documents')
      .select('*')
      .eq('is_active', true)
      .is('listing_id', null)
      .contains('placements', ['property'])
      .order('display_order', { ascending: true }),
  ])

  if (listingResult.error) {
    console.error('[getDocumentsForProperty:listing]', listingResult.error.message)
  }
  if (globalResult.error) {
    console.error('[getDocumentsForProperty:global]', globalResult.error.message)
  }

  const merged = [...(listingResult.data ?? []), ...(globalResult.data ?? [])]
  const seen = new Set<string>()
  const unique = merged.filter((doc) => {
    if (seen.has(doc.id)) return false
    seen.add(doc.id)
    return true
  })

  return sortDocuments(unique)
}

export async function getDocumentPlacementOrders(): Promise<Record<DocumentPlacement, number>> {
  const supabase = await createClient()
  const orders = { ...DEFAULT_PLACEMENT_SECTION_ORDERS }

  if (!supabase) return orders

  const { data, error } = await supabase.from('document_placement_settings').select('placement, section_order')
  if (error) {
    console.error('[getDocumentPlacementOrders]', error.message)
    return orders
  }

  for (const row of data ?? []) {
    if (row.placement in orders) {
      orders[row.placement as DocumentPlacement] = row.section_order
    }
  }

  return orders
}

export async function getDocumentSectionOrder(placement: DocumentPlacement) {
  const orders = await getDocumentPlacementOrders()
  return orders[placement] ?? DEFAULT_PLACEMENT_SECTION_ORDERS[placement]
}
