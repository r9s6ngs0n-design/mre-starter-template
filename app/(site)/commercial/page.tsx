import { CategoryHero } from '@/components/category/category-hero'
import { CategoryGrid } from '@/components/category/category-grid'
import { EnquirySection } from '@/components/enquiry-section'
import { listingToProperty } from '@/lib/adapters'
import { getPublishedListings } from '@/lib/queries-server'

export const metadata = {
  title: 'Commercial Property — {{BRAND_NAME}}',
  description: '{{SITE_DESCRIPTION}}',
}

export default async function CommercialPage() {
  const listings = await getPublishedListings('commercial')
  const commercialList = listings.map(listingToProperty)

  return (
    <main className="bg-background">
        <CategoryHero
          title="Commercial Property"
          subtitle="Strategic Opportunity"
          description="{{PLACEHOLDER: commercial hero description}}"
          image="/images/pillar-commercial.png"
        />
        <CategoryGrid properties={commercialList} title="Commercial Portfolio" />
        <EnquirySection />
    </main>
  )
}
