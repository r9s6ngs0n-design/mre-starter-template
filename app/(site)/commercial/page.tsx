import { CategoryHero } from '@/components/category/category-hero'
import { CategoryGrid } from '@/components/category/category-grid'
import type { CategorySeoCopy } from '@/components/category/category-seo-content'
import { CategorySeoContent } from '@/components/category/category-seo-content'
import { EnquirySection } from '@/components/enquiry-section'
import { PropertySearchBar } from '@/components/search/property-search-bar'
import { listingToProperty } from '@/lib/adapters'
import { getAvailableListings } from '@/lib/queries-server'
import { filterListings } from '@/lib/searchFilters'
import { listingsToSearchOptions } from '@/lib/searchSuggestions'
import { buildMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/json-ld'
import { buildBreadcrumb, buildFAQ } from '@/lib/schemaUtils'

export const metadata = buildMetadata({
  title: 'Commercial Property',
  description: '{{PLACEHOLDER}}',
  path: '/commercial',
})

interface Props {
  searchParams: Promise<{ suburb?: string; type?: string; maxPrice?: string; beds?: string; baths?: string }>
}

/* TODO(client): provide category SEO copy — when set, CategorySeoContent + FAQ JSON-LD render */
const categorySeo: CategorySeoCopy | null = null

export default async function CommercialPage({ searchParams }: Props) {
  const params = await searchParams
  const listings = await getAvailableListings('commercial')
  const filtered = filterListings(listings, params)
  const commercialList = filtered.map(listingToProperty)

  return (
    <main className="bg-background">
      <JsonLd
        data={buildBreadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Commercial Property', url: '/commercial' },
        ])}
      />
      {categorySeo ? <JsonLd data={buildFAQ(categorySeo.faqs)} /> : null}
      <CategoryHero
        title="Commercial Property"
        subtitle="Strategic Opportunity"
        description="{{PLACEHOLDER}}"
        image="/images/pillar-commercial.png"
      />
      <section className="bg-cream py-8">
        <div className="container-wide">
          <PropertySearchBar
            category="commercial"
            listings={listingsToSearchOptions(listings)}
            initialSuburb={params.suburb ?? ''}
            initialType={params.type ?? ''}
            initialMaxPrice={params.maxPrice ?? ''}
          />
        </div>
      </section>
      <CategoryGrid
        properties={commercialList}
        title="Commercial Portfolio"
        emptyMessage="No commercial properties match your search. Try adjusting your filters."
      />
      {categorySeo ? <CategorySeoContent copy={categorySeo} /> : null}
      <EnquirySection />
    </main>
  )
}
