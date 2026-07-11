import { createClient } from '@/lib/supabase/client'
import type { ListingCategory, Tables } from '@/lib/database.types'

export type Listing = Tables<'listings'>
export type BlogPost = Tables<'blog_posts'>
export type Testimonial = Tables<'testimonials'>
export type TeamMember = Tables<'team_members'>

export async function fetchPublishedListings(category?: ListingCategory) {
  const supabase = createClient()
  let query = supabase
    .from('listings')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true })

  if (category) query = query.eq('category', category)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function fetchListingBySlug(slug: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  if (error) throw error
  return data
}

export async function fetchFeaturedListings(limit = 3) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('is_published', true)
    .eq('featured', true)
    .order('display_order', { ascending: true })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function fetchPublishedBlogPosts() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, team_members(name, slug)')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchBlogPostBySlug(slug: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, team_members(name, slug, avatar_url)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  if (error) throw error
  return data
}

export async function fetchPublishedTestimonials() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function fetchPublishedTeam() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function fetchPageSection(pageId: string, sectionKey: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('page_sections')
    .select('content')
    .eq('page_id', pageId)
    .eq('section_key', sectionKey)
    .eq('is_published', true)
    .maybeSingle()
  if (error) throw error
  return (data as { content: import('@/lib/database.types').Json } | null)?.content ?? null
}

export async function fetchPublishedPageSections(pageId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('page_sections')
    .select('*')
    .eq('page_id', pageId)
    .eq('is_published', true)
    .order('display_order', { ascending: true })
  if (error) throw error
  return data ?? []
}
