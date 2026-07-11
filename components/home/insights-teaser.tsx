import Link from "next/link"
import { FadeUp } from "@/components/motion/fade-up"
import { OptimizedImage } from "@/components/optimized-image"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { EditorialSection } from "@/components/layout/editorial-section"
import { ArticleCard } from "@/components/article-card"
import { AnimatedLink } from "@/components/ui/animated-link"
import { HoverZoom } from "@/components/motion/hover-zoom"
import type { Article } from "@/lib/data"

export function InsightsTeaser({ articles }: { articles: Article[] }) {
  if (!articles.length) {
    return (
      <EditorialSection index={7} className="bg-background" bordered innerClassName="py-24 md:py-32">
        <SectionEyebrow>Insights</SectionEyebrow>
        <p className="mt-6 text-muted-foreground">Market insights will appear here soon.</p>
      </EditorialSection>
    )
  }

  const [featured, ...rest] = articles

  return (
    <EditorialSection index={7} className="bg-background" bordered innerClassName="py-24 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <SectionEyebrow>Insights</SectionEyebrow>
          <h2 className="mt-6 text-balance text-headline font-serif font-light text-ink">
            {'{{PLACEHOLDER}}'}
          </h2>
        </div>
        <AnimatedLink href="/insights">All articles</AnimatedLink>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-12">
        <FadeUp className="lg:col-span-7">
          <Link href={`/insights/${featured.slug}`} className="group block">
            <HoverZoom className="relative aspect-[16/10]">
              <OptimizedImage
                src={featured.image || "/placeholder.svg"}
                alt={featured.title}
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <span className="eyebrow !text-gold">{featured.category}</span>
                <h3 className="mt-3 text-headline font-serif font-light text-cream">{featured.title}</h3>
              </div>
            </HoverZoom>
          </Link>
        </FadeUp>

        <div className="flex flex-col gap-6 lg:col-span-5">
          {rest.map((a, i) => (
            <FadeUp key={a.slug} delay={i * 100}>
              <ArticleCard article={a} variant="horizontal" />
            </FadeUp>
          ))}
        </div>
      </div>
    </EditorialSection>
  )
}
