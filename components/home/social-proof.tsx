import { FadeUp } from "@/components/motion/fade-up"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { EditorialSection } from "@/components/layout/editorial-section"
import { Star } from "lucide-react"
import type { Testimonial } from "@/lib/data"

function Stars() {
  return (
    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden />
      ))}
    </div>
  )
}

export function SocialProof({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) {
    return (
      <EditorialSection index={5} className="bg-background" bordered>
        <SectionEyebrow>In their words</SectionEyebrow>
        <p className="mt-6 text-muted-foreground">Client testimonials will appear here soon.</p>
      </EditorialSection>
    )
  }

  const [featured, ...rest] = testimonials

  return (
    <EditorialSection index={5} className="bg-background" bordered>
      <SectionEyebrow>In their words</SectionEyebrow>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <FadeUp>
          <Stars />
          <blockquote className="mt-6 text-balance font-serif text-3xl font-light italic leading-[1.15] text-ink sm:text-4xl md:text-5xl">
            &ldquo;{featured.quote}&rdquo;
          </blockquote>
          <footer className="mt-8 text-caption text-muted-foreground">
            <span className="text-ink">{featured.name}</span> — {featured.suburb} · {featured.type}
          </footer>
        </FadeUp>

        <div className="flex flex-col gap-px self-center border border-border bg-border">
          {rest.map((t, i) => (
            <FadeUp key={t.name} delay={i * 120} className="bg-card p-8">
              <Stars />
              <p className="mt-4 text-pretty text-body text-ink">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-4 text-caption text-muted-foreground">
                <span className="text-ink">{t.name}</span> — {t.suburb} · {t.type}
              </p>
            </FadeUp>
          ))}
        </div>
      </div>
    </EditorialSection>
  )
}
