import { CategoryHero } from '@/components/category/category-hero'
import { CategoryGrid } from '@/components/category/category-grid'
import { EnquirySection } from '@/components/enquiry-section'
import { listingToProperty } from '@/lib/adapters'
import { getPublishedListings } from '@/lib/queries-server'

export const metadata = {
  title: 'Off-the-Plan Projects — {{BRAND_NAME}}',
  description: '{{SITE_DESCRIPTION}}',
}

export default async function ProjectsPage() {
  const listings = await getPublishedListings('project')
  const projectsList = listings.map(listingToProperty)

  return (
    <main className="bg-background">
        <CategoryHero
          title="Off-the-Plan Projects"
          subtitle="Premium Opportunity"
          description="{{PLACEHOLDER: projects hero description}}"
          image="/images/pillar-projects.png"
        />
        <CategoryGrid properties={projectsList} title="Featured Projects" />
        <EnquirySection />
    </main>
  )
}
