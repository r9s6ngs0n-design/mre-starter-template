import Link from 'next/link'
import { OptimizedImage } from '@/components/optimized-image'
import { ArticleCard } from '@/components/article-card'
import { HoverZoom } from '@/components/motion/hover-zoom'
import { FadeUp } from '@/components/motion/fade-up'
import { blogPostToArticle } from '@/lib/adapters'
import { getPublishedBlogPosts, getDocumentPlacementOrders } from '@/lib/queries-server'
import { DocumentPlacementSlot } from '@/components/documents/document-placement-slot'
import { PageLayoutComposer } from '@/components/page-sections/page-layout-composer'
import { buildMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/json-ld'
import { buildBreadcrumb } from '@/lib/schemaUtils'

const insightsBreadcrumb = buildBreadcrumb([
  { name: 'Home', url: '/' },
  { name: 'Insights', url: '/insights' },
])

export const metadata = buildMetadata({
  title: 'Insights',
  // TODO(client): insights page meta description
  description: '{{PLACEHOLDER}}',
  path: '/insights',
})

export default async function InsightsPage() {
  const [posts, placementOrders] = await Promise.all([
    getPublishedBlogPosts(),
    getDocumentPlacementOrders(),
  ])
  const articles = posts.map(blogPostToArticle)

  if (!articles.length) {
    return (
      <main className="bg-background py-28">
        <JsonLd data={insightsBreadcrumb} />
        <PageLayoutComposer
          pageId="insights"
          blocks={[
            {
              order: 0,
              key: 'empty',
              children: (
                <div className="container-wide">
                  <h1 className="text-display font-serif font-light text-ink">Insights</h1>
                  <p className="mt-6 text-muted-foreground">Articles coming soon.</p>
                </div>
              ),
            },
            { order: placementOrders.insights, key: 'documents', children: <DocumentPlacementSlot placement="insights" /> },
          ]}
        />
      </main>
    )
  }

  const [featured, ...rest] = articles

  return (
    <main className="bg-background">
      <JsonLd data={insightsBreadcrumb} />
      <PageLayoutComposer
        pageId="insights"
        blocks={[
          {
            order: 0,
            key: 'intro',
            children: (
              <section className="py-28 md:py-40">
                <div className="container-wide">
                  <div className="max-w-2xl">
                    <h1 className="text-display font-serif font-light text-ink">Insights</h1>
                    <p className="mt-6 text-body text-ink/80">
                      {'{{PLACEHOLDER}}'}
                    </p>
                  </div>
                </div>
              </section>
            ),
          },
          { order: placementOrders.insights, key: 'documents', children: <DocumentPlacementSlot placement="insights" /> },
          {
            order: 30,
            key: 'articles',
            children: (
              <section className="border-t border-border pb-28 md:pb-40">
                <div className="container-wide">
                  <FadeUp>
                    <Link href={`/insights/${featured.slug}`} className="group block">
                      <HoverZoom className="relative aspect-[21/9] min-h-[280px]">
                        <OptimizedImage
                          src={featured.image || '/placeholder.svg'}
                          alt={featured.title}
                          sizes="100vw"
                        />
                        <div className="absolute inset-0 hero-scrim opacity-80" />
                        <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
                          <span className="eyebrow !text-gold">{featured.category}</span>
                          <h2 className="mt-4 max-w-3xl text-headline font-serif font-light text-cream">{featured.title}</h2>
                          <p className="mt-4 max-w-xl text-body text-cream/75">{featured.excerpt}</p>
                        </div>
                      </HoverZoom>
                    </Link>
                  </FadeUp>

                  <div className="mt-16 divide-y divide-border border-y border-border">
                    {rest.map((article, i) => (
                      <FadeUp key={article.slug} delay={i * 80} className="py-8 first:pt-8 last:pb-8">
                        <ArticleCard article={article} variant="horizontal" />
                      </FadeUp>
                    ))}
                  </div>
                </div>
              </section>
            ),
          },
        ]}
      />
    </main>
  )
}
