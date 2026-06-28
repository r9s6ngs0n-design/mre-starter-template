'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ImageReveal } from '@/components/motion/image-reveal'
import { OptimizedImage } from '@/components/optimized-image'
import { AnimatePresence } from 'framer-motion'

export interface PropertyShowcaseProps {
  title: string
  location: string
  type: string
  images: { src: string; alt: string }[]
}

export function PropertyShowcase({ title, location, type, images }: PropertyShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")

  const goToPrevious = () => {
    setDirection("backward")
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setDirection("forward")
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-background">
      <div className="relative h-full w-full">
        <AnimatePresence mode="wait">
          <ImageReveal key={activeIndex} direction={direction} className="absolute inset-0 h-full w-full">
            <OptimizedImage
              src={images[activeIndex].src}
              alt={images[activeIndex].alt}
              priority={activeIndex === 0}
              sizes="100vw"
            />
          </ImageReveal>
        </AnimatePresence>
        <div className="absolute inset-0 hero-scrim pointer-events-none" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-between">
        <div className="container-wide relative pt-28">
          <p className="eyebrow text-gold">{type}</p>
          <h1 className="mt-4 text-balance text-display font-serif font-light text-white">{title}</h1>
          <p className="mt-2 text-lg text-white/85">{location}</p>
        </div>

        <div className="container-wide flex items-center justify-between pb-12">
          <button
            onClick={goToPrevious}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>

          <div className="flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setDirection(idx > activeIndex ? "forward" : "backward"); setActiveIndex(idx) }}
                className={`h-2 rounded-full transition-all ${
                  idx === activeIndex ? 'w-8 bg-gold' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  )
}
