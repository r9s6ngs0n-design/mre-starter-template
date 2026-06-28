'use client'

import { FadeUp } from '@/components/motion/fade-up'
import { EnquiryForm } from '@/components/enquiry-form'
import { DocumentButtonList } from '@/components/documents/document-resources'
import type { SiteDocument } from '@/lib/documents'
import type { ReactNode } from 'react'

export interface PropertyDetailsProps {
  overview: string
  features: string[]
  amenities: string[]
  specification: {
    label: string
    value: string
  }[]
  descriptor?: string
  developer?: string
  listingId?: string
  brochureUrl?: string | null
  documents?: SiteDocument[]
  enquirySlot?: ReactNode
}

export function PropertyDetails({
  overview,
  features,
  amenities,
  specification,
  descriptor,
  developer,
  brochureUrl,
  documents = [],
  enquirySlot,
}: PropertyDetailsProps) {
  const enquiry = enquirySlot ?? (
    <EnquiryForm compact title="Enquire about this property" presetType="buying" />
  )

  return (
    <section className="bg-background py-28 md:py-40">
      <div className="container-wide">
        <div className="grid gap-16 lg:grid-cols-[1fr_340px] lg:gap-20">
          <div>
            {descriptor && (
              <FadeUp>
                <blockquote className="mb-12 border-l-2 border-gold pl-6 font-serif text-2xl font-light italic leading-snug text-ink md:text-3xl">
                  &ldquo;{descriptor}&rdquo;
                </blockquote>
              </FadeUp>
            )}

            <FadeUp>
              <h2 className="text-headline font-serif font-light text-ink">Overview</h2>
              <p className="mt-6 text-pretty text-body text-ink/80">{overview}</p>
            </FadeUp>

            {features.length > 0 && (
              <FadeUp delay={100} className="mt-16">
                <h3 className="text-subhead font-serif font-light text-ink">Key Features</h3>
                <ul className="mt-6 divide-y divide-border border-y border-border">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-4 py-4">
                      <span className="mt-2 h-px w-6 shrink-0 bg-gold" aria-hidden />
                      <span className="text-body text-ink">{feature}</span>
                    </li>
                  ))}
                </ul>
              </FadeUp>
            )}

            {amenities.length > 0 && (
              <FadeUp delay={150} className="mt-12">
                <h3 className="text-subhead font-serif font-light text-ink">Amenities</h3>
                <ul className="mt-6 divide-y divide-border border-y border-border">
                  {amenities.map((amenity, idx) => (
                    <li key={idx} className="flex items-start gap-4 py-4">
                      <span className="mt-2 h-px w-6 shrink-0 bg-gold" aria-hidden />
                      <span className="text-body text-ink">{amenity}</span>
                    </li>
                  ))}
                </ul>
              </FadeUp>
            )}
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <FadeUp delay={200}>
              <div className="border border-border bg-card p-8">
                <span className="eyebrow">Specification</span>
                <dl className="mt-6 divide-y divide-border">
                  {specification.map((spec, idx) => (
                    <div key={idx} className="py-5 first:pt-0 last:pb-0">
                      <dt className="text-caption uppercase text-gold">{spec.label}</dt>
                      <dd className="mt-2 text-2xl font-light text-ink">{spec.value}</dd>
                    </div>
                  ))}
                  {developer && (
                    <div className="py-5">
                      <dt className="text-caption uppercase text-gold">Developer</dt>
                      <dd className="mt-2 text-2xl font-light text-ink">{developer}</dd>
                    </div>
                  )}
                </dl>
                {brochureUrl && (
                  <a
                    href={brochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="mt-6 flex w-full items-center justify-center gap-2 border border-gold bg-transparent px-4 py-3 text-sm font-medium uppercase tracking-widest text-gold transition-colors hover:bg-gold hover:text-ink"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download Brochure
                  </a>
                )}
                {documents.length > 0 && (
                  <DocumentButtonList documents={documents} className="mt-4" compact />
                )}
              </div>
            </FadeUp>

            <FadeUp delay={250} className="mt-6 hidden border border-border bg-card p-6 lg:block">
              {enquiry}
            </FadeUp>
          </div>
        </div>

        <div className="mt-10 border border-border bg-card p-6 lg:hidden">{enquiry}</div>
      </div>
    </section>
  )
}
