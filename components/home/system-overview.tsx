import { FadeUp } from "@/components/motion/fade-up"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { SectionNumeral } from "@/components/layout/section-numeral"

// TODO(client): set how-we-work process steps
const steps = [
  {
    n: "01",
    title: "{{PLACEHOLDER}}",
    text: "{{PLACEHOLDER}}",
  },
  {
    n: "02",
    title: "{{PLACEHOLDER}}",
    text: "{{PLACEHOLDER}}",
  },
  {
    n: "03",
    title: "{{PLACEHOLDER}}",
    text: "{{PLACEHOLDER}}",
  },
  {
    n: "04",
    title: "{{PLACEHOLDER}}",
    text: "{{PLACEHOLDER}}",
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
                {'{{PLACEHOLDER}}'}
              </h2>
              <p className="mt-6 max-w-lg text-pretty text-body text-cream/70">
                {'{{PLACEHOLDER}}'}
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
