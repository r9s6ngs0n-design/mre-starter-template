import { CategoryHero } from '@/components/category/category-hero'
import { CategoryGrid } from '@/components/category/category-grid'
import { EnquirySection } from '@/components/enquiry-section'
import { listingToProperty } from '@/lib/adapters'
import { getPublishedListings } from '@/lib/queries-server'

export const metadata = {
  title: 'Buy — {{BRAND_NAME}}',
  description: '{{SITE_DESCRIPTION}}',
}

export default async function BuyPage() {
  const listings = await getPublishedListings('buy')
  const buyList = listings.map(listingToProperty)

  return (
    <main className="bg-background">
        <CategoryHero
          title="Buy"
          subtitle="Move-in Ready"
          description="{{PLACEHOLDER: buy hero description}}"
          image="/images/pillar-completed.png"
        />
        <CategoryGrid properties={buyList} title="Available Now" />
        <EnquirySection />
    </main>
  )
}
