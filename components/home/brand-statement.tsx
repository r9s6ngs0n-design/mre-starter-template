import { FadeUp } from "@/components/motion/fade-up"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { EditorialSection } from "@/components/layout/editorial-section"
import { KeyRound, Compass, ClipboardList } from "lucide-react"

const pains = [
  {
    icon: KeyRound,
    text: "The best off-the-plan stock is allocated before it ever reaches the public listings.",
  },
  {
    icon: Compass,
    text: "Investors are handed noise and pressure — not considered, independent guidance.",
  },
  {
    icon: ClipboardList,
    text: "The process feels scattered: too many agents, too little clarity, no single point of trust.",
  },
]

export function PointOfView() {
  return (
    <section className="bg-background">
      <EditorialSection index={1}>
        <div className="mx-auto max-w-4xl text-center md:mx-0 md:text-left">
          <SectionEyebrow className="justify-center md:justify-start">Our point of view</SectionEyebrow>
          <p className="mt-8 text-balance text-headline font-serif font-light text-ink">
            For three decades, we have believed that buying property should feel less like a transaction and more
            like being shown something <em className="font-serif italic text-gold">rare</em> — by someone who already
            knows it intimately.
          </p>
          <p className="mx-auto mt-8 max-w-xl text-pretty text-body text-muted-foreground md:mx-0">
            MR Estates is a deliberately small agency. We represent a curated portfolio across Melbourne&apos;s most
            considered addresses, and we guide a select group of buyers and investors through it with patience and
            precision.
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
            The right property is rarely the one everyone else can see.
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
