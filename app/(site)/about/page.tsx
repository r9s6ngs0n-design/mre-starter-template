import { CategoryHero } from '@/components/category/category-hero'
import { TeamSection } from '@/components/about/team-section'
import { EditorialSection } from '@/components/layout/editorial-section'
import { SectionNumeral } from '@/components/layout/section-numeral'
import { getPublishedTeam, getDocumentPlacementOrders } from '@/lib/queries-server'
import { DocumentPlacementSlot } from '@/components/documents/document-placement-slot'
import { PageLayoutComposer } from '@/components/page-sections/page-layout-composer'

export const metadata = {
  title: 'About {{BRAND_NAME}}',
  description: '{{SITE_DESCRIPTION}}',
}

const processSteps = [
  {
    title: 'Listen',
    text: 'We begin with your goals — budget, timeline, location and intent — before anything else.',
  },
  {
    title: 'Curate',
    text: 'A shortlist drawn from our portfolio and off-market network, tailored to your brief.',
  },
  {
    title: 'Guide',
    text: 'Inspections, due diligence and negotiation handled with calm, organised expertise.',
  },
  {
    title: 'Settle',
    text: 'Contract to keys, managed end-to-end with one accountable point of contact.',
  },
]

export default async function AboutPage() {
  const [teamRows, placementOrders] = await Promise.all([
    getPublishedTeam(),
    getDocumentPlacementOrders(),
  ])
  const team = teamRows.map((m) => ({
    name: m.name,
    role: m.role_title ?? '',
    image: m.avatar_url ?? '/images/team-1.png',
    linkedinUrl: m.linkedin_url ?? undefined,
  }))

  return (
    <main className="bg-background">
      <PageLayoutComposer
        pageId="about"
        blocks={[
          {
            order: 0,
            key: 'hero',
            children: (
              <CategoryHero
                title="About {{BRAND_NAME}}"
                subtitle="Our Story"
                description="{{PLACEHOLDER: about hero description}}"
                image="/images/about-hero.png"
              />
            ),
          },
          {
            order: 20,
            key: 'approach',
            children: (
              <EditorialSection index={1}>
                <h2 className="text-headline font-serif font-light text-ink">Our Approach</h2>
                <div className="mt-8 space-y-6 text-body text-ink/80">
                  {/* TODO(client): replace with the client's "our approach" copy. */}
                  <p>{'{{PLACEHOLDER: approach paragraph 1}}'}</p>
                  <p>{'{{PLACEHOLDER: approach paragraph 2}}'}</p>
                </div>
              </EditorialSection>
            ),
          },
          {
            order: 40,
            key: 'quote',
            children: (
              <section className="border-y border-border bg-muted/20 py-20 md:py-28">
                <div className="container-wide">
                  <blockquote className="mx-auto max-w-4xl text-center font-serif text-3xl font-light italic leading-[1.2] text-ink md:text-4xl">
                    &ldquo;We&apos;re specialists in understanding not just what property is worth, but why it matters.&rdquo;
                  </blockquote>
                </div>
              </section>
            ),
          },
          { order: 60, key: 'team', children: <TeamSection team={team} /> },
          { order: placementOrders.about, key: 'documents', children: <DocumentPlacementSlot placement="about" /> },
          {
            order: 90,
            key: 'process',
            children: (
              <section className="bg-foreground/5 py-28 md:py-40">
                <div className="container-wide">
                  <div className="editorial-grid items-start gap-y-10">
                    <div className="col-span-12 md:col-span-2">
                      <SectionNumeral index={2} />
                    </div>
                    <div className="col-span-12 md:col-span-10">
                      <h2 className="text-headline font-serif font-light text-ink">How We Work</h2>
                      <p className="mt-6 max-w-2xl text-body text-ink/80">
                        Our process is designed around your goals. From initial consultation through to settlement, we manage
                        the details so you can focus on the decision.
                      </p>

                      <div className="mt-14 grid gap-8 sm:grid-cols-2">
                        {processSteps.map((step, i) => (
                          <div key={step.title} className="border-t border-gold/40 pt-6">
                            <span className="text-numeral font-serif font-light text-gold/50">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <h3 className="mt-4 text-subhead font-serif font-medium text-ink">{step.title}</h3>
                            <p className="mt-3 text-body text-ink/75">{step.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ),
          },
        ]}
      />
    </main>
  )
}
