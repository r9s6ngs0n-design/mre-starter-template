'use client'

import { NavLink } from "@/components/nav-link"
import type { Property } from "@/lib/data"
import { HoverZoom } from "@/components/motion/hover-zoom"
import { DrawUnderline } from "@/components/motion/draw-underline"
import { OptimizedImage } from "@/components/optimized-image"

interface ProjectCardProps {
  property: Property
  className?: string
  imageClassName?: string
  featured?: boolean
  compact?: boolean
}

export function ProjectCard({
  property,
  className = "",
  imageClassName = "aspect-[3/4]",
  featured = false,
  compact = false,
}: ProjectCardProps) {
  const specs =
    property.category === "COMMERCIAL"
      ? [property.propertyType, property.area].filter(Boolean)
      : [
          property.beds ? `${property.beds} bed` : null,
          property.baths ? `${property.baths} bath` : null,
          property.cars ? `${property.cars} car` : null,
        ].filter(Boolean)

  return (
    <NavLink
      href={`/property/${property.slug}`}
      className={`group block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-background ${className}`}
    >
      <HoverZoom className={`relative ${imageClassName}`}>
        <OptimizedImage
          src={property.image || "/placeholder.svg"}
          alt={`${property.title}, ${property.suburb}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <span className="absolute left-4 top-4 z-10 bg-cream/90 px-3 py-1 text-caption font-medium uppercase text-forest-deep">
          {property.category}
        </span>

        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-forest-deep/90 p-5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-cream/80">
            {specs.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      </HoverZoom>

      <div className={`${compact ? "pt-4" : "pt-5"}`}>
        <p className="text-caption text-muted-foreground">{property.suburb}</p>
        <h3 className="mt-1 text-subhead font-serif font-medium leading-tight text-ink">
          {property.title}
        </h3>
        {!compact && (
          <p className="mt-2 max-w-sm text-pretty text-body text-muted-foreground">{property.descriptor}</p>
        )}
        <p className="mt-3 eyebrow">From {property.priceFrom}</p>

        <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-forest-deep">
          <DrawUnderline>View project</DrawUnderline>
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </NavLink>
  )
}
