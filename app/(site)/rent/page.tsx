import { CategoryHero } from '@/components/category/category-hero'
import { CategoryGrid } from '@/components/category/category-grid'
import { EnquirySection } from '@/components/enquiry-section'
import { listingToProperty } from '@/lib/adapters'
import { getPublishedListings } from '@/lib/queries-server'

export const metadata = {
  title: 'Rent — {{BRAND_NAME}}',
  description: '{{SITE_DESCRIPTION}}',
}

export default async function RentPage() {
  const listings = await getPublishedListings('rent')
  const rentList = listings.map(listingToProperty)

  return (
    <main className="bg-background">
      <CategoryHero
        title="Rent"
        subtitle="Available to Lease"
        description="{{PLACEHOLDER: rent hero description}}"
        image="/images/pillar-completed.png"
      />
      <CategoryGrid properties={rentList} title="Available Rentals" />
      <EnquirySection />
    </main>
  )
}
