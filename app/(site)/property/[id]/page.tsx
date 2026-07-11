import { PropertyShowcase } from '@/components/property/property-showcase'
import { PropertyDetails } from '@/components/property/property-details'
import { PropertyActions } from '@/components/property/property-actions'
import { PropertySchedule } from '@/components/property/property-schedule'
import { EnquiryForm } from '@/components/enquiry-form'
import { JsonLd } from '@/components/seo/json-ld'
import { listingToProperty } from '@/lib/adapters'
import { buildRealEstateListing, buildBreadcrumb } from '@/lib/schemaUtils'
import { getCategoryIndexPath } from '@/lib/slugUtils'
import { getListingBySlug, getDocumentsForProperty, getAvailableListings } from '@/lib/queries-server'
import { buildMetadata } from '@/lib/seo'
import {
  formatListingSpecs,
  formatListingStatus,
  stripListingDescription,
} from '@/lib/listing-utils'
import { notFound } from 'next/navigation'

type PageParams = Promise<{ id: string }>

export const revalidate = 3600

export async function generateStaticParams() {
  const listings = await getAvailableListings()
  return listings.map((listing) => ({ id: listing.slug }))
}

export async function generateMetadata(props: { params: PageParams }) {
  const params = await props.params
  const listing = await getListingBySlug(params.id)
  if (!listing) return buildMetadata({ title: 'Property', path: `/property/${params.id}`, noIndex: true })
  return buildMetadata({
    title: listing.title,
    description: listing.headline ?? stripListingDescription(listing.description) ?? listing.title,
    path: `/property/${listing.slug}`,
  })
}

const CATEGORY_LABELS: Record<string, string> = {
  buy: 'Buy',
  rent: 'Rent',
  project: 'Off the Plan',
  commercial: 'Commercial',
}

export default async function PropertyPage(props: { params: PageParams }) {
  const params = await props.params
  const listing = await getListingBySlug(params.id)

  if (!listing) notFound()

  const propertyDocuments = await getDocumentsForProperty(listing.id)

  const property = listingToProperty(listing)
  const images = listing.images.length
    ? listing.images.map((src, i) => ({ src, alt: `${listing.title} image ${i + 1}` }))
    : [{ src: '/placeholder.svg', alt: listing.title }]

  const inspectionTimes = (listing as { listing_inspection_times?: { id: string; listing_id: string; starts_at: string; ends_at: string; notes: string | null; is_cancelled: boolean; created_at: string }[] }).listing_inspection_times ?? []

  const overview = stripListingDescription(listing.description) || property.descriptor
  const statusLabel = formatListingStatus(listing.status)
  const specs = formatListingSpecs(listing)

  return (
    <>
      <JsonLd data={buildRealEstateListing(listing)} />
      <JsonLd
        data={buildBreadcrumb([
          { name: 'Home', url: '/' },
          { name: property.category, url: getCategoryIndexPath(listing.category) },
          { name: listing.title, url: `/property/${listing.slug}` },
        ])}
      />
      <main className="bg-background">
        <PropertyShowcase
          title={property.title}
          location={property.suburb}
          type={CATEGORY_LABELS[listing.category] ?? property.category}
          price={property.priceFrom}
          status={statusLabel}
          specs={specs}
          images={images}
          videoUrl={listing.video_url}
        />
        <div className="container-wide pt-8 pb-0">
          <PropertyActions listingId={listing.id} listingTitle={listing.title} />
          <PropertySchedule
            listingId={listing.id}
            listingTitle={listing.title}
            auctionAt={listing.auction_at ?? null}
            auctionLocation={listing.auction_location ?? null}
            auctionNotes={listing.auction_notes ?? null}
            auctionCancelled={listing.auction_cancelled ?? false}
            inspectionTimes={inspectionTimes}
          />
        </div>
        <PropertyDetails
          listingId={listing.id}
          descriptor={property.descriptor}
          overview={overview}
          features={listing.key_features ?? []}
          amenities={listing.amenities ?? []}
          developer={listing.developer ?? undefined}
          brochureUrl={listing.brochure_url}
          floorplanUrl={listing.floorplans?.[0] ?? null}
          documents={propertyDocuments}
          specification={[
            { label: 'Location', value: property.suburb },
            { label: 'Status', value: statusLabel },
            { label: 'Category', value: CATEGORY_LABELS[listing.category] ?? property.category },
            ...(property.beds ? [{ label: 'Bedrooms', value: property.beds }] : []),
            ...(property.baths ? [{ label: 'Bathrooms', value: property.baths }] : []),
            ...(property.cars ? [{ label: 'Carspaces', value: property.cars }] : []),
            ...(property.area ? [{ label: 'Floor Area', value: property.area }] : []),
            { label: 'Price', value: property.priceFrom },
          ]}
          enquirySlot={
            <EnquiryForm
              compact
              title="Register your interest"
              presetEnquiryType="register_interest"
              listingId={listing.id}
            />
          }
        />
      </main>
    </>
  )
}
