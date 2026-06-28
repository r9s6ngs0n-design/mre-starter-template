'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { Heart, Bed, Bath, Car, ExternalLink, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Tables } from '@/lib/database.types'

type Favourite = Tables<'user_favourites'> & {
  listings: Pick<
    Tables<'listings'>,
    'id' | 'title' | 'slug' | 'suburb' | 'price_display' | 'images' | 'bedrooms' | 'bathrooms' | 'carspaces' | 'status' | 'category'
  > | null
}

export function FavouritesDashboard() {
  const { user } = useAuth()
  const [favourites, setFavourites] = useState<Favourite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('user_favourites')
      .select('*, listings(id, title, slug, suburb, price_display, images, bedrooms, bathrooms, carspaces, status, category)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setFavourites((data as Favourite[]) ?? [])
        setLoading(false)
      })
  }, [user])

  async function removeFavourite(id: string) {
    const supabase = createClient()
    await supabase.from('user_favourites').delete().eq('id', id)
    setFavourites((f) => f.filter((fav) => fav.id !== id))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader />
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-52 rounded bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader />
      {favourites.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {favourites.map((fav) => {
            const listing = fav.listings
            if (!listing) return null
            const image = listing.images?.[0]
            return (
              <div
                key={fav.id}
                className="group relative rounded border border-border bg-white overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-40 bg-muted overflow-hidden">
                  {image ? (
                    <Image
                      src={image}
                      alt={listing.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Heart className="w-8 h-8 opacity-20" />
                    </div>
                  )}
                  {/* Status badge */}
                  <span className={cn(
                    'absolute top-2 left-2 text-[0.6rem] tracking-wider uppercase px-2 py-0.5 rounded font-medium',
                    listing.status === 'available' ? 'bg-forest-deep text-cream' :
                    listing.status === 'under_offer' ? 'bg-gold text-white' :
                    'bg-ink/70 text-white'
                  )}>
                    {listing.status.replace('_', ' ')}
                  </span>
                  {/* Remove */}
                  <button
                    onClick={() => removeFavourite(fav.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-destructive hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Remove from favourites"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-0.5">{listing.suburb}</p>
                  <h3 className="font-serif text-base text-ink leading-snug mb-1 truncate">
                    {listing.title}
                  </h3>
                  {listing.price_display && (
                    <p className="text-sm font-medium text-gold-text mb-3">{listing.price_display}</p>
                  )}
                  {/* Specs */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    {listing.bedrooms != null && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5" /> {listing.bedrooms}
                      </span>
                    )}
                    {listing.bathrooms != null && (
                      <span className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5" /> {listing.bathrooms}
                      </span>
                    )}
                    {listing.carspaces != null && (
                      <span className="flex items-center gap-1">
                        <Car className="w-3.5 h-3.5" /> {listing.carspaces}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/property/${listing.id}`}
                    className="flex items-center gap-1 text-xs text-gold-text hover:text-forest-deep transition-colors"
                  >
                    View property <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PageHeader() {
  return (
    <div>
      <p className="text-[0.6875rem] tracking-[0.15em] uppercase text-gold-text mb-1">Dashboard</p>
      <h1 className="font-serif text-3xl text-ink">Saved Listings</h1>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded border border-dashed border-border bg-white p-12 text-center">
      <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
      <h2 className="font-serif text-xl text-ink mb-2">No saved listings yet</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Browse our properties and tap the heart icon to save listings here.
      </p>
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-forest-deep text-cream rounded hover:bg-forest transition-colors"
      >
        Browse properties
      </Link>
    </div>
  )
}
