"use client"

import { ImageReveal } from "@/components/motion/image-reveal"
import { HoverZoom } from "@/components/motion/hover-zoom"
import { OptimizedImage } from "@/components/optimized-image"

interface BrokenGridImageProps {
  src: string
  alt: string
  className?: string
  bleed?: "left" | "right"
}

export function BrokenGridImage({ src, alt, className = "", bleed = "right" }: BrokenGridImageProps) {
  const bleedClass =
    bleed === "right"
      ? "md:-mr-12 lg:-mr-20 md:translate-x-6"
      : "md:-ml-12 lg:-ml-20 md:-translate-x-6"

  return (
    <div className={`relative ${bleedClass} ${className}`}>
      <ImageReveal className="relative z-10">
        <HoverZoom className="aspect-[4/5] md:aspect-[3/4]">
          <OptimizedImage src={src} alt={alt} sizes="(max-width: 768px) 100vw, 50vw" />
        </HoverZoom>
      </ImageReveal>
    </div>
  )
}
