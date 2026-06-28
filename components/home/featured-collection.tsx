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

  const [featured, ...rest] = properties

  return (
    <EditorialSection index={2} className="bg-background" bordered>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <SectionEyebrow>Featured collection</SectionEyebrow>
          <h2 className="mt-6 text-balance text-headline font-serif font-light text-ink">
            A curated portfolio, not a search result.
          </h2>
        </div>
        <AnimatedLink href="/projects">View all</AnimatedLink>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:gap-6">
        <FadeUp className="lg:col-span-7">
          <ProjectCard property={featured} imageClassName="aspect-[4/5] lg:aspect-[5/6]" featured />
        </FadeUp>

        <div className="flex flex-col gap-8 lg:col-span-5">
          {rest.slice(0, 2).map((p, i) => (
            <FadeUp key={p.slug} delay={i * 120}>
              <ProjectCard property={p} imageClassName="aspect-[16/10]" compact />
            </FadeUp>
          ))}
        </div>
      </div>

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {rest.slice(2).map((p, i) => (
          <FadeUp key={p.slug} delay={i * 100}>
            <ProjectCard property={p} imageClassName="aspect-[4/5]" />
          </FadeUp>
        ))}
      </div>
    </EditorialSection>
  )
}
