import Link from 'next/link'
import { OptimizedImage } from '@/components/optimized-image'
import { RichTextContent } from '@/components/rich-text-content'
import { cn } from '@/lib/utils'
import { stripHtml } from '@/lib/rich-text'
import {
  getButtonLinkType,
  isExternalLink,
  parseSectionContent,
  sectionBackgroundClass,
  type PageSectionRow,
} from '@/lib/page-sections'

function SectionButton({
  text,
  href,
  external,
  light,
}: {
  text: string
  href: string
  external: boolean
  light?: boolean
}) {
  const className = cn(
    'inline-block rounded-full border px-6 py-3 text-xs uppercase tracking-[0.16em] transition-colors',
    light
      ? 'border-gold/70 text-cream hover:bg-gold hover:text-forest-deep'
      : 'border-forest-deep text-forest-deep hover:bg-forest-deep hover:text-cream',
  )

  if (external || isExternalLink(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {text}
      </a>
    )
  }

  return (
    <Link href={href.startsWith('/') ? href : `/${href}`} className={className}>
      {text}
    </Link>
  )
}

function SectionCopy({
  content,
  light,
  centered,
}: {
  content: ReturnType<typeof parseSectionContent>
  light?: boolean
  centered?: boolean
}) {
  return (
    <div className={cn('max-w-2xl', centered && 'mx-auto text-center')}>
      {content.eyebrow ? (
        <RichTextContent
          html={content.eyebrow}
          className={cn('eyebrow', light ? 'text-cream/70' : 'text-muted-foreground')}
        />
      ) : null}
      {content.heading ? (
        <RichTextContent
          html={content.heading}
          className={cn(
            'font-serif text-headline font-light',
            content.eyebrow ? 'mt-4' : '',
            light ? 'text-cream' : 'text-ink',
          )}
        />
      ) : null}
      {content.subheading ? (
        <RichTextContent
          html={content.subheading}
          className={cn(
            'mt-4 text-subhead font-serif font-light',
            light ? 'text-cream/85' : 'text-ink/80',
          )}
        />
      ) : null}
      {content.body ? (
        <RichTextContent
          html={content.body}
          className={cn(
            'mt-6 leading-relaxed',
            light ? 'text-cream/80' : 'text-ink/75',
          )}
        />
      ) : null}
      {content.button_text && content.button_link ? (
        <div className={cn('mt-8', centered && 'flex justify-center')}>
          <SectionButton
            text={content.button_text}
            href={content.button_link}
            external={getButtonLinkType(content) === 'external'}
            light={light}
          />
        </div>
      ) : null}
    </div>
  )
}

export function PageSectionRenderer({ section }: { section: PageSectionRow }) {
  const content = parseSectionContent(section.content)
  const layout = content.layout ?? 'text_left'
  const bgType = content.background_type ?? 'color'
  const lightBg =
    content.background_color === 'forest-deep' || content.background_color === 'forest'
  const hasMedia = Boolean(content.image_url) && bgType !== 'color'

  const sectionStyle =
    bgType === 'image' && content.image_url
      ? { backgroundImage: `url(${content.image_url})` }
      : undefined

  return (
    <section
      className={cn(
        'relative overflow-hidden border-t border-border',
        bgType === 'color' ? sectionBackgroundClass(content.background_color) : 'bg-forest-deep text-cream',
        bgType === 'image' && content.image_url && 'bg-cover bg-center',
        layout === 'hero' && 'py-32 md:py-44',
        layout !== 'hero' && 'py-20 md:py-28',
      )}
      style={sectionStyle}
    >
      {bgType === 'image' && content.image_url ? (
        <div className="absolute inset-0 bg-forest-deep/60" aria-hidden />
      ) : null}

      {bgType === 'video' && content.video_url ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={content.image_url || undefined}
        >
          <source src={content.video_url} />
        </video>
      ) : null}

      {bgType === 'video' && content.video_url ? (
        <div className="absolute inset-0 bg-forest-deep/55" aria-hidden />
      ) : null}

      <div className="container-wide relative">
        {layout === 'hero' || layout === 'centered' ? (
          <SectionCopy content={content} light={lightBg || bgType !== 'color'} centered />
        ) : (
          <div
            className={cn(
              'grid items-center gap-10 lg:grid-cols-2 lg:gap-16',
              layout === 'text_right' && 'lg:[&>*:first-child]:order-2',
            )}
          >
            <SectionCopy content={content} light={lightBg || bgType !== 'color'} />
            {hasMedia ? (
              <div className="relative aspect-[4/3] overflow-hidden">
                <OptimizedImage
                  src={content.image_url!}
                  alt={stripHtml(content.heading) || 'Section image'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div aria-hidden className="hidden lg:block" />
            )}
          </div>
        )}
      </div>
    </section>
  )
}
