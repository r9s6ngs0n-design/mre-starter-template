import { HomeHero } from "@/components/home/home-hero"
import { PointOfView, ProblemSection } from "@/components/home/brand-statement"
import { SystemOverview } from "@/components/home/system-overview"
import { ExpertisePillars } from "@/components/home/expertise-pillars"
import { FeaturedCollection } from "@/components/home/featured-collection"
import { SocialProof } from "@/components/home/social-proof"
import { InsightsTeaser } from "@/components/home/insights-teaser"
import { DocumentPlacementSlot } from '@/components/documents/document-placement-slot'
import { FinalCta } from "@/components/home/final-cta"
import { PageLayoutComposer } from "@/components/page-sections/page-layout-composer"
import { JsonLd } from "@/components/seo/json-ld"
import { buildOrganization, buildWebSite } from "@/lib/schemaUtils"
import { listingToProperty, blogPostToArticle, dbTestimonialToLegacy } from "@/lib/adapters"
import { getFeaturedListings, getPublishedBlogPosts, getPublishedTestimonials, getDocumentPlacementOrders } from "@/lib/queries-server"

export default async function Page() {
  const [listings, posts, testimonials, placementOrders] = await Promise.all([
    getFeaturedListings(6),
    getPublishedBlogPosts(),
    getPublishedTestimonials(),
    getDocumentPlacementOrders(),
  ])

  const properties = listings.map(listingToProperty)
  const articles = posts.map(blogPostToArticle)
  const testimonialItems = testimonials.map(dbTestimonialToLegacy)

  return (
    <main className="bg-background">
      <JsonLd data={buildOrganization()} />
      <JsonLd data={buildWebSite()} />
      <PageLayoutComposer
        pageId="home"
        blocks={[
          { order: 0, key: 'hero', children: <HomeHero /> },
          { order: 20, key: 'brand', children: <PointOfView /> },
          { order: 30, key: 'featured', children: <FeaturedCollection properties={properties.length ? properties : []} /> },
          { order: 40, key: 'problem', children: <ProblemSection /> },
          { order: 50, key: 'expertise', children: <ExpertisePillars /> },
          { order: 60, key: 'social', children: <SocialProof testimonials={testimonialItems} /> },
          { order: 70, key: 'system', children: <SystemOverview /> },
          { order: 75, key: 'insights', children: <InsightsTeaser articles={articles.slice(0, 3)} /> },
          { order: placementOrders.home, key: 'documents', children: <DocumentPlacementSlot placement="home" /> },
          { order: 90, key: 'cta', children: <FinalCta /> },
        ]}
      />
    </main>
  )
}
