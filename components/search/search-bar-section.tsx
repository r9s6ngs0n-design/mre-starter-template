import { getAvailableListings } from '@/lib/queries-server'
import { groupSearchOptionsByCategory } from '@/lib/searchSuggestions'
import { PropertySearchBar } from './property-search-bar'

/**
 * Cream-background wrapper used directly below the home hero.
 * Overlaps the hero by a small amount via negative margin to create
 * a natural visual connection, then continues on the cream canvas.
 */
export async function SearchBarSection() {
  const listings = await getAvailableListings()
  const listingsByCategory = groupSearchOptionsByCategory(listings)

  return (
    <section className="relative z-10 bg-cream pb-16 pt-10">
      <div className="container-wide">
        <p className="eyebrow mb-4 text-gold-text">Find your next property</p>
        <PropertySearchBar listingsByCategory={listingsByCategory} />
      </div>
    </section>
  )
}
