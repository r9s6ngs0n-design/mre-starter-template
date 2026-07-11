import { FadeUp } from "@/components/motion/fade-up"
import { MagneticButton } from "@/components/motion/magnetic-button"

export function FinalCta() {
  return (
    <section className="border-t border-cream/10 bg-forest-deep text-cream">
      <div className="container-wide py-28 text-center md:py-40">
        <FadeUp className="mx-auto max-w-3xl">
          <div className="flex items-center justify-center gap-3">
            <span aria-hidden className="h-px w-10 bg-gold" />
            <span className="eyebrow !text-gold">Begin the conversation</span>
            <span aria-hidden className="h-px w-10 bg-gold" />
          </div>
          <h2 className="mt-8 text-balance text-display font-serif font-light">{'{{PLACEHOLDER}}'}</h2>
          <p className="mx-auto mt-6 max-w-md text-pretty text-body text-cream/70">
            {'{{PLACEHOLDER}}'}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <MagneticButton href="/contact" variant="filled">
              Request an Appraisal
            </MagneticButton>
            <MagneticButton href="tel:{{PLACEHOLDER}}" variant="ghost">
              {'{{PLACEHOLDER}}'}
            </MagneticButton>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
