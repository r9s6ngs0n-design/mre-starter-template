import { OptimizedImage } from '@/components/optimized-image'
import { EnquirySection } from '@/components/enquiry-section'
import { JsonLd } from '@/components/seo/json-ld'
import { FadeUp } from '@/components/motion/fade-up'
import { TextReveal } from '@/components/motion/text-reveal'
import { blogPostToArticle } from '@/lib/adapters'
import { buildBlogPosting, buildBreadcrumb } from '@/lib/schemaUtils'
import { getBlogPostBySlug } from '@/lib/queries-server'
import { notFound } from 'next/navigation'

type PageParams = Promise<{ slug: string }>

export async function generateMetadata(props: { params: PageParams }) {
  const params = await props.params
  const post = await getBlogPostBySlug(params.slug)
  if (!post) return { title: 'Article — {{BRAND_NAME}}' }
  return {
    title: post.seo_title ?? `${post.title} — {{BRAND_NAME}}`,
    description: post.seo_description ?? post.excerpt ?? undefined,
  }
}

export default async function ArticlePage(props: { params: PageParams }) {
  const params = await props.params
  const post = await getBlogPostBySlug(params.slug)

  if (!post) notFound()

  const article = blogPostToArticle(post)
  const authorName =
    post.team_members && typeof post.team_members === 'object' && 'name' in post.team_members
      ? String(post.team_members.name)
      : undefined

  const bodyHtml = post.body ?? `<p>${article.excerpt}</p>`

  type FaqItem = { question: string; answer: string }
  const faqs: FaqItem[] = Array.isArray(post.faqs)
    ? (post.faqs as unknown as FaqItem[]).filter((f) => f.question)
    : []

  return (
    <>
      <JsonLd data={buildBlogPosting(post, authorName)} />
      <JsonLd
        data={buildBreadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Insights', url: '/insights' },
          { name: post.title, url: `/insights/${post.slug}` },
        ])}
      />
      <main className="bg-background">
        <FadeUp immediate>
          <section className="relative h-[50svh] min-h-[400px] w-full overflow-hidden">
            <OptimizedImage src={article.image} alt={article.title} priority sizes="100vw" />
            <div className="absolute inset-0 hero-scrim" />
          </section>
        </FadeUp>

        <section className="py-28 md:py-40">
          <div className="container-wide">
            <article className="mx-auto max-w-[65ch]">
              <FadeUp immediate>
                <p className="eyebrow text-gold">{article.category}</p>
              </FadeUp>
              <TextReveal
                as="h1"
                text={article.title}
                className="mt-4 text-headline font-serif font-light text-ink"
                immediate
              />
              <FadeUp delay={120} immediate>
                <div className="mt-6 flex items-center gap-4 text-caption text-muted-foreground">
                  <span>{article.date}</span>
                  <span aria-hidden>·</span>
                  <span>{article.readTime}</span>
                  {authorName && (
                    <>
                      <span aria-hidden>·</span>
                      <span>{authorName}</span>
                    </>
                  )}
                </div>
              </FadeUp>

              <FadeUp delay={180}>
                <div
                  className="prose prose-neutral mt-12 border-t border-gold/30 pt-12 max-w-none"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              </FadeUp>

              {faqs.length > 0 && (
                <FadeUp delay={240}>
                  <div className="mt-16 border-t border-gold/30 pt-12">
                    <h2 className="font-serif text-2xl font-light text-ink">
                      Frequently Asked Questions
                    </h2>
                    <dl className="mt-8 space-y-8">
                      {faqs.map((faq, i) => (
                        <div key={i} className="border-t border-border pt-6">
                          <dt className="font-medium text-ink">{faq.question}</dt>
                          <dd className="mt-3 text-body text-ink/75">{faq.answer}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </FadeUp>
              )}
            </article>
          </div>
        </section>

        <EnquirySection title="Discuss this with an advisor" />
      </main>
    </>
  )
}
