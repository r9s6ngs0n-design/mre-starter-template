import { ProjectCard } from '../project-card'
import type { Property } from '@/lib/data'

export interface CategoryGridProps {
  properties: Property[]
  title: string
  /** Shown when the array is empty, e.g. after a search filter yields no results. */
  emptyMessage?: string
}

export function CategoryGrid({ properties, title, emptyMessage }: CategoryGridProps) {
  const validProperties = properties.filter((p) => !!p.slug)

  return (
    <section className="bg-background py-28 md:py-40">
      <div className="container-wide">
        <header className="mb-12 max-w-2xl">
          <h2 className="text-headline font-serif font-light text-ink">{title}</h2>
        </header>

        {validProperties.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-subhead font-serif font-light text-ink/50">
              {emptyMessage ?? 'No listings published yet.'}
            </p>
            <p className="mt-3 text-body text-muted-foreground">
              Try broadening your search or{' '}
              <a href="." className="underline underline-offset-4 hover:text-forest-deep">
                clear all filters
              </a>
              .
            </p>
          </div>
        )}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {validProperties.map((property) => (
            <ProjectCard
              key={property.slug}
              property={property}
              imageClassName="aspect-[4/5]"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
