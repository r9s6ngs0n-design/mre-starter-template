'use client'

import { ProjectCard } from '../project-card'
import { FadeUp } from '@/components/motion/fade-up'
import type { Property } from '@/lib/data'

export interface CategoryGridProps {
  properties: Property[]
  title: string
}

export function CategoryGrid({ properties, title }: CategoryGridProps) {
  const [featured, ...rest] = properties

  return (
    <section className="bg-background py-28 md:py-40">
      <div className="container-wide">
        <FadeUp className="mb-12 max-w-2xl">
          <h2 className="text-headline font-serif font-light text-ink">{title}</h2>
        </FadeUp>

        {featured && (
          <FadeUp className="mb-8">
            <ProjectCard property={featured} imageClassName="aspect-[16/9] md:aspect-[21/9]" featured />
          </FadeUp>
        )}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {rest.length === 0 && !featured && (
            <p className="col-span-full text-muted-foreground">No listings published yet.</p>
          )}
          {rest.map((property, idx) => (
            <FadeUp key={property.slug} delay={idx * 100}>
              <ProjectCard
                property={property}
                imageClassName={idx % 3 === 1 ? 'aspect-[3/4]' : 'aspect-[4/5]'}
              />
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
