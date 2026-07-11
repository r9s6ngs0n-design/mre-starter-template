import { FadeUp } from "@/components/motion/fade-up"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { EditorialSection } from "@/components/layout/editorial-section"
import { KeyRound, Compass, ClipboardList } from "lucide-react"

// TODO(client): set point-of-view pain points
const pains = [
  {
    icon: KeyRound,
    text: "{{PLACEHOLDER}}",
  },
  {
    icon: Compass,
    text: "{{PLACEHOLDER}}",
  },
  {
    icon: ClipboardList,
    text: "{{PLACEHOLDER}}",
  },
]

export function PointOfView() {
  return (
    <section className="bg-background">
      <EditorialSection index={1}>
        <div className="mx-auto max-w-4xl text-center md:mx-0 md:text-left">
          <SectionEyebrow className="justify-center md:justify-start">Our point of view</SectionEyebrow>
          <p className="mt-8 text-balance text-headline font-serif font-light text-ink">
            {'{{PLACEHOLDER}}'}
          </p>
          <p className="mx-auto mt-8 max-w-xl text-pretty text-body text-muted-foreground md:mx-0">
            {'{{PLACEHOLDER}}'}
          </p>
        </div>
      </EditorialSection>
    </section>
  )
}

export function ProblemSection() {
  return (
    <section className="border-t border-border bg-background">
      <EditorialSection index={3} innerClassName="py-20 md:py-28">
        <div className="max-w-2xl">
          <SectionEyebrow>The problem</SectionEyebrow>
          <h2 className="mt-6 text-balance text-headline font-serif font-light text-ink">
            {'{{PLACEHOLDER}}'}
          </h2>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
          {pains.map((p, i) => (
            <FadeUp key={p.text} delay={i * 120} className="bg-card p-8 md:p-10">
              <p.icon className="h-6 w-6 text-gold" strokeWidth={1.5} aria-hidden />
              <p className="mt-6 text-pretty text-lg leading-relaxed text-ink">{p.text}</p>
            </FadeUp>
          ))}
        </div>
      </EditorialSection>
    </section>
  )
}
