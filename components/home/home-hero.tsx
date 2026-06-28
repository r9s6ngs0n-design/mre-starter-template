"use client"

import { ChevronDown } from "lucide-react"
import { TextReveal } from "@/components/motion/text-reveal"
import { MagneticButton } from "@/components/motion/magnetic-button"
import { FadeUp } from "@/components/motion/fade-up"
import { OptimizedImage } from "@/components/optimized-image"

export function HomeHero() {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-forest-deep">
      {/* TODO(client): replace hero image + alt text. */}
      <OptimizedImage
        src="/images/hero-tower.png"
        alt="{{PLACEHOLDER: hero image alt}}"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 hero-scrim" />

      <div className="container-wide relative flex h-full flex-col justify-end pb-20 md:pb-28">
        <div className="max-w-3xl">
          {/* TODO(client): set the hero headline + intro paragraph. */}
          <TextReveal
            text="{{HERO_HEADLINE}}"
            as="h1"
            immediate
            className="text-display font-serif font-light leading-[1.08] text-balance text-cream"
          />
          <FadeUp immediate>
            <p className="mt-6 max-w-lg text-pretty text-body text-cream/79">
              {'{{PLACEHOLDER: hero intro paragraph}}'}
            </p>
          </FadeUp>
          <FadeUp immediate>
            <div className="mt-8">
              <MagneticButton href="/projects">
                Explore the collection <span aria-hidden>→</span>
              </MagneticButton>
            </div>
          </FadeUp>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cream/60">
        <ChevronDown className="h-6 w-6 animate-scroll-hint" strokeWidth={1.5} aria-hidden />
        <span className="sr-only">Scroll for more</span>
      </div>
    </section>
  )
}
