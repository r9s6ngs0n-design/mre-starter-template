'use client'

import { FadeUp } from '@/components/motion/fade-up'
import { TextReveal } from '@/components/motion/text-reveal'
import { OptimizedImage } from '@/components/optimized-image'

export interface CategoryHeroProps {
  title: string
  subtitle: string
  description: string
  image: string
}

export function CategoryHero({ title, subtitle, description, image }: CategoryHeroProps) {
  return (
    <section className="relative h-[60svh] min-h-[500px] w-full overflow-hidden bg-forest-deep">
      <OptimizedImage src={image} alt={title} priority sizes="100vw" />
      <div className="absolute inset-0 hero-scrim" />

      <div className="container-wide relative flex h-full flex-col justify-end pb-16 md:pb-20">
        <div className="max-w-2xl">
          <FadeUp immediate>
            <p className="eyebrow text-gold">{subtitle}</p>
          </FadeUp>
          <TextReveal
            text={title}
            as="h1"
            immediate
            className="mt-4 text-display font-serif font-light leading-[1.08] text-balance text-white"
          />
          <FadeUp immediate>
            <p className="mt-4 max-w-lg text-pretty text-body text-white/79">{description}</p>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
