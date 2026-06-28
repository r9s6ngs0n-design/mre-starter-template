import { FileDown } from 'lucide-react'
import { FadeUp } from '@/components/motion/fade-up'
import { SectionEyebrow } from '@/components/section-eyebrow'
import { EditorialSection } from '@/components/layout/editorial-section'
import {
  documentCategoryLabel,
  documentUrl,
  type SiteDocument,
} from '@/lib/documents'
import { cn } from '@/lib/utils'

const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

function DocumentDownloadButton({
  doc,
  className,
  compact,
}: {
  doc: SiteDocument
  className?: string
  compact?: boolean
}) {
  const url = documentUrl(doc)
  if (!url) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={doc.file_url ? true : undefined}
      className={cn(
        'group inline-flex items-center justify-center gap-2 border border-gold bg-transparent text-gold transition-colors hover:bg-gold hover:text-ink',
        compact
          ? 'px-4 py-2.5 text-xs font-medium uppercase tracking-widest'
          : 'w-full px-5 py-3.5 text-sm font-medium uppercase tracking-widest',
        className,
      )}
    >
      <DownloadIcon />
      <span>{doc.title}</span>
    </a>
  )
}

export function DocumentButtonList({
  documents,
  className,
  compact,
}: {
  documents: SiteDocument[]
  className?: string
  compact?: boolean
}) {
  if (!documents.length) return null

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {documents.map((doc, i) => (
        <FadeUp key={doc.id} delay={i * 60}>
          <DocumentDownloadButton doc={doc} compact={compact} />
        </FadeUp>
      ))}
    </div>
  )
}

export function DocumentResourcesSection({
  documents,
  title = 'Free Resources',
  description = 'Guides and market reports to help you make informed decisions.',
}: {
  documents: SiteDocument[]
  title?: string
  description?: string
}) {
  if (!documents.length) return null

  return (
    <EditorialSection className="bg-muted/20" bordered innerClassName="py-24 md:py-32">
      <div className="max-w-2xl">
        <SectionEyebrow>Resources</SectionEyebrow>
        <h2 className="mt-6 text-headline font-serif font-light text-ink">{title}</h2>
        <p className="mt-4 text-body text-ink/75">{description}</p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc, i) => {
          const url = documentUrl(doc)
          if (!url) return null
          return (
            <FadeUp key={doc.id} delay={i * 80}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                download={doc.file_url ? true : undefined}
                className="group flex h-full flex-col justify-between border border-border bg-card p-6 transition-colors hover:border-gold/60"
              >
                <div>
                  <span className="eyebrow !text-gold">{documentCategoryLabel(doc.type)}</span>
                  <h3 className="mt-4 text-subhead font-serif font-light text-ink group-hover:text-gold transition-colors">
                    {doc.title}
                  </h3>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-gold">
                  <FileDown className="h-3.5 w-3.5" aria-hidden />
                  Download
                </span>
              </a>
            </FadeUp>
          )
        })}
      </div>
    </EditorialSection>
  )
}

export function DocumentFooterLinks({ documents }: { documents: SiteDocument[] }) {
  if (!documents.length) return null

  return (
    <div>
      <h3 className="eyebrow !text-gold">Resources</h3>
      <ul className="mt-5 flex flex-col gap-3">
        {documents.map((doc) => {
          const url = documentUrl(doc)
          if (!url) return null
          return (
            <li key={doc.id}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                download={doc.file_url ? true : undefined}
                className="inline-flex items-center gap-2 text-sm text-cream/75 transition-colors hover:text-gold"
              >
                <FileDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {doc.title}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function DocumentSidebarBlock({
  documents,
  title = 'Downloads',
}: {
  documents: SiteDocument[]
  title?: string
}) {
  if (!documents.length) return null

  return (
    <div className="border border-border bg-card p-6">
      <span className="eyebrow">{title}</span>
      <DocumentButtonList documents={documents} className="mt-5" compact />
    </div>
  )
}
