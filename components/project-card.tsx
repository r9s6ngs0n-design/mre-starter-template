'use client'

import { NavLink } from "@/components/nav-link"
import type { Property } from "@/lib/data"
import { HoverZoom } from "@/components/motion/hover-zoom"
import { DrawUnderline } from "@/components/motion/draw-underline"
import { OptimizedImage } from "@/components/optimized-image"
import { trackCtaClick } from "@/lib/analytics"

const CATEGORY_LABELS: Record<string, string> = {
  PROJECT: "Off the Plan",
  BUY: "Buy",
  COMMERCIAL: "Commercial",
  RENT: "Rent",
}

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
      onClick={() => trackCtaClick(`view_property_${property.slug}`, `/property/${property.slug}`)}
      className={`group block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-background ${className}`}
    >
      <HoverZoom className={`relative ${imageClassName}`}>
        <OptimizedImage
          src={property.image || "/placeholder.svg"}
          alt={`${property.title}, ${property.suburb}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <span className="absolute left-4 top-4 z-10 bg-cream/90 px-3 py-1 text-caption font-medium uppercase text-forest-deep">
          {CATEGORY_LABELS[property.category] ?? property.category}
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
        {property.specs ? (
          <p className="mt-2 text-caption text-muted-foreground">{property.specs}</p>
        ) : null}
        {property.status ? (
          <p className="mt-2 text-caption uppercase tracking-widest text-forest-deep/70">{property.status}</p>
        ) : null}
        <p className="mt-3 eyebrow">From {property.priceFrom}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-sm text-forest-deep">
            <DrawUnderline>View listing</DrawUnderline>
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>

          {property.videoUrl && (
            <a
              href={property.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-forest-deep transition-colors"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5 translate-x-px" aria-hidden="true">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </span>
              Watch
            </a>
          )}
        </div>
      </div>
    </NavLink>
  )
}
