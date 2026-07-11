import { FadeUp } from "@/components/motion/fade-up"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { EditorialSection } from "@/components/layout/editorial-section"
import { ProjectCard } from "@/components/project-card"
import { AnimatedLink } from "@/components/ui/animated-link"
import type { Property } from "@/lib/data"

interface FeaturedCollectionProps {
  properties: Property[]
}

export function FeaturedCollection({ properties }: FeaturedCollectionProps) {
  if (!properties.length) {
    return (
      <EditorialSection index={2} className="bg-background" bordered>
        <SectionEyebrow>Featured collection</SectionEyebrow>
        <p className="mt-6 text-muted-foreground">Featured listings will appear here soon.</p>
      </EditorialSection>
    )
  }

  return (
    <EditorialSection index={2} className="bg-background" bordered>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <SectionEyebrow>Featured collection</SectionEyebrow>
          <h2 className="mt-6 text-balance text-headline font-serif font-light text-ink">
            A curated portfolio, not a search result.
          </h2>
        </div>
        <AnimatedLink href="/buy">View all</AnimatedLink>
      </div>

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p, i) => (
          <FadeUp key={p.slug} delay={i * 80}>
            <ProjectCard property={p} imageClassName="aspect-[4/5]" />
          </FadeUp>
        ))}
      </div>
    </EditorialSection>
  )
}
