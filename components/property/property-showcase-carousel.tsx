'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { OptimizedImage } from '@/components/optimized-image'

export interface PropertyShowcaseCarouselProps {
  images: { src: string; alt: string }[]
}

export function PropertyShowcaseCarousel({ images }: PropertyShowcaseCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="relative h-full w-full">
      <div className="relative h-full w-full">
        <div className="absolute inset-0 h-full w-full">
          <OptimizedImage
            src={images[activeIndex].src}
            alt={images[activeIndex].alt}
            priority={activeIndex === 0}
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 hero-scrim pointer-events-none" />
      </div>

      <div className="pointer-events-auto absolute inset-x-0 bottom-0">
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
                onClick={() => setActiveIndex(idx)}
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
    </div>
  )
}
