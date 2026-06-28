import { DocumentPlacementSlot } from '@/components/documents/document-placement-slot'
import { EnquiryForm } from '@/components/enquiry-form'
import { PageLayoutComposer } from '@/components/page-sections/page-layout-composer'
import { FadeUp } from '@/components/motion/fade-up'
import { TextReveal } from '@/components/motion/text-reveal'
import { getDocumentPlacementOrders } from '@/lib/queries-server'

export const metadata = {
  title: 'Contact — {{BRAND_NAME}}',
  description: '{{SITE_DESCRIPTION}}',
}

export default async function ContactPage() {
  const placementOrders = await getDocumentPlacementOrders()

  return (
    <main className="bg-background">
      <PageLayoutComposer
        pageId="contact"
        blocks={[
          {
            order: 0,
            key: 'contact',
            children: (
              <section className="py-28 md:py-40">
                <div className="container-wide">
                  <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
                    <div className="max-w-xl">
                      <TextReveal
                        as="h1"
                        text="Get In Touch"
                        className="text-display font-serif font-light text-ink"
                        immediate
                      />
                      <FadeUp delay={100}>
                        <p className="mt-6 text-body text-ink/80">
                          Whether you&apos;re looking to buy, sell, invest, or simply explore the market, we&apos;re here to
                          help. Complete the form or reach out directly.
                        </p>
                      </FadeUp>

                      <div className="mt-12 space-y-8">
                        <FadeUp delay={180}>
                          <div>
                            <p className="eyebrow">Phone</p>
                            {/* TODO(client): set contact phone number. */}
                            <p className="mt-3 text-xl text-ink">{'{{CONTACT_PHONE}}'}</p>
                          </div>
                        </FadeUp>
                        <FadeUp delay={240}>
                          <div>
                            <p className="eyebrow">Email</p>
                            {/* TODO(client): set contact email. */}
                            <p className="mt-3 text-xl text-ink">{'{{CONTACT_EMAIL}}'}</p>
                          </div>
                        </FadeUp>
                        <FadeUp delay={300}>
                          <div>
                            <p className="eyebrow">Address</p>
                            {/* TODO(client): set office address. */}
                            <p className="mt-3 text-xl text-ink">{'{{OFFICE_ADDRESS}}'}</p>
                          </div>
                        </FadeUp>
                      </div>
                    </div>

                    <FadeUp delay={200}>
                      <div className="border border-border bg-card p-6 md:p-8">
                        <EnquiryForm />
                      </div>
                    </FadeUp>
                  </div>
                </div>
              </section>
            ),
          },
          {
            order: placementOrders.contact,
            key: 'documents',
            children: <DocumentPlacementSlot placement="contact" />,
          },
        ]}
      />
    </main>
  )
}
