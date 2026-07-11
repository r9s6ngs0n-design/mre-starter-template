import { EditorialSection } from '@/components/layout/editorial-section'
import { SectionEyebrow } from '@/components/section-eyebrow'

/** Presentational SEO block copy — supply per client; template ships the shell only. */
export type CategoryFaq = {
  question: string
  answer: string
}

export type CategorySeoCopy = {
  eyebrow: string
  heading: string
  paragraphs: string[]
  faqs: CategoryFaq[]
}

interface CategorySeoContentProps {
  copy: CategorySeoCopy
}

/**
 * Category SEO slot — render only when the client provides `copy`.
 * Template pages leave this unmounted until copy exists (see TODO(client) on category pages).
 */
export function CategorySeoContent({ copy }: CategorySeoContentProps) {
  return (
    <>
      <EditorialSection index={1} bordered>
        <SectionEyebrow>{copy.eyebrow}</SectionEyebrow>
        <h2 className="mt-6 max-w-3xl text-balance text-headline font-serif font-light text-ink">
          {copy.heading}
        </h2>
        <div className="mt-8 max-w-2xl space-y-5 text-pretty text-body text-ink/80">
          {copy.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </EditorialSection>

      <section className="border-t border-border bg-background py-20 md:py-28">
        <div className="container-wide">
          <div className="editorial-grid items-start gap-y-10">
            <div className="col-span-12 md:col-span-4">
              <SectionEyebrow>Common questions</SectionEyebrow>
              <h2 className="mt-6 max-w-sm text-balance text-headline font-serif font-light text-ink">
                Frequently asked questions
              </h2>
            </div>
            <div className="col-span-12 md:col-span-8">
              <dl className="space-y-0">
                {copy.faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="border-t border-border py-6 first:border-t-0 first:pt-0 md:first:pt-1"
                  >
                    <dt className="text-subhead font-serif font-medium text-ink">{faq.question}</dt>
                    <dd className="mt-3 max-w-2xl text-pretty text-body text-ink/75">{faq.answer}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
