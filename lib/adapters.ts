import type { Tables } from '@/lib/database.types'
import type { Property, Category, Article, Testimonial } from '@/lib/data'

const CATEGORY_MAP: Record<Tables<'listings'>['category'], Category> = {
  project: 'PROJECT',
  buy: 'BUY',
  commercial: 'COMMERCIAL',
  rent: 'RENT',
}

export function listingToProperty(listing: Tables<'listings'>): Property {
  const category = CATEGORY_MAP[listing.category]
  return {
    slug: listing.slug,
    title: listing.title,
    suburb: listing.suburb ?? '',
    category,
    descriptor: listing.headline ?? listing.description?.replace(/<[^>]+>/g, '').slice(0, 120) ?? '',
    image: listing.images[0] ?? '/placeholder.svg',
    priceFrom: listing.price_display ?? '',
    beds: listing.bedrooms != null ? String(listing.bedrooms) : undefined,
    baths: listing.bathrooms != null ? String(listing.bathrooms) : undefined,
    cars: listing.carspaces != null ? String(listing.carspaces) : undefined,
    area: listing.floor_area_sqm != null ? `${listing.floor_area_sqm} m²` : undefined,
    propertyType: listing.category === 'commercial' ? listing.type_slug ?? 'Commercial' : undefined,
  }
}

export function blogPostToArticle(post: Tables<'blog_posts'>): Article {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? '',
    category: post.category ?? 'MARKET',
    date: post.published_at
      ? new Date(post.published_at).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
      : '',
    readTime: post.read_time ? `${post.read_time} min read` : '',
    image: post.cover_image ?? '/placeholder.svg',
  }
}

export function dbTestimonialToLegacy(t: Tables<'testimonials'>): Testimonial {
  return {
    quote: t.quote,
    name: t.client_name,
    suburb: t.suburb ?? '',
    type: t.client_type ?? '',
  }
}
