import { FadeUp } from "@/components/motion/fade-up"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { SectionNumeral } from "@/components/layout/section-numeral"

const steps = [
  {
    n: "01",
    title: "Enquire",
    text: "A single conversation to understand your brief — budget, location, timeline and intent.",
  },
  {
    n: "02",
    title: "Matched",
    text: "We curate a shortlist from our portfolio and off-market releases, tailored precisely to you.",
  },
  {
    n: "03",
    title: "Inspect",
    text: "Private inspections and display previews, arranged around your schedule — never rushed.",
  },
  {
    n: "04",
    title: "Secured",
    text: "Offer, contract and settlement, handled end-to-end with one accountable point of contact.",
  },
]

export function SystemOverview() {
  return (
    <section className="bg-forest-deep text-cream">
      <div className="container-wide py-28 md:py-40">
        <div className="editorial-grid items-start gap-y-10">
          <div className="col-span-12 md:col-span-2">
            <SectionNumeral index={6} light />
          </div>
          <div className="col-span-12 md:col-span-10">
            <FadeUp className="max-w-2xl">
              <SectionEyebrow light>How we work</SectionEyebrow>
              <h2 className="mt-6 text-balance text-headline font-serif font-light">
                A calm, considered path from first enquiry to settled keys.
              </h2>
              <p className="mt-6 max-w-lg text-pretty text-body text-cream/70">
                One relationship, four clear stages. No noise, no pressure — only a process designed to make a
                significant decision feel effortless.
              </p>
            </FadeUp>

            <div className="mt-16 grid gap-px overflow-hidden border border-cream/15 bg-cream/15 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <FadeUp key={s.n} delay={i * 120} className="bg-forest-deep p-8 md:p-10">
                  <div className="flex items-center gap-4">
                    <span className="font-serif text-3xl font-light text-gold/80">{s.n}</span>
                    <span aria-hidden className="h-px flex-1 bg-gold/25" />
                  </div>
                  <h3 className="mt-6 text-subhead font-serif font-medium">{s.title}</h3>
                  <p className="mt-3 text-pretty text-caption text-cream/70">{s.text}</p>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
