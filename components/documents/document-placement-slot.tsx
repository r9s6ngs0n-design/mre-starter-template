import {
  DocumentButtonList,
  DocumentFooterLinks,
  DocumentResourcesSection,
  DocumentSidebarBlock,
} from '@/components/documents/document-resources'
import {
  getDocumentsForPlacement,
  getDocumentsForProperty,
} from '@/lib/queries-server'
import type { DocumentPlacement } from '@/lib/documents'

type SlotVariant = 'section' | 'sidebar' | 'inline' | 'footer'

export async function DocumentPlacementSlot({
  placement,
  variant = 'section',
  title,
  description,
}: {
  placement: DocumentPlacement
  variant?: SlotVariant
  title?: string
  description?: string
}) {
  const documents = await getDocumentsForPlacement(placement)
  if (!documents.length) return null

  switch (variant) {
    case 'sidebar':
      return <DocumentSidebarBlock documents={documents} title={title} />
    case 'inline':
      return <DocumentButtonList documents={documents} />
    case 'footer':
      return <DocumentFooterLinks documents={documents} />
    case 'section':
    default:
      return (
        <DocumentResourcesSection
          documents={documents}
          title={title}
          description={description}
        />
      )
  }
}

export async function PropertyDocumentsSlot({
  listingId,
  variant = 'inline',
}: {
  listingId: string
  variant?: 'inline' | 'sidebar'
}) {
  const documents = await getDocumentsForProperty(listingId)
  if (!documents.length) return null

  if (variant === 'sidebar') {
    return <DocumentSidebarBlock documents={documents} title="Downloads" />
  }

  return <DocumentButtonList documents={documents} className="mt-6" compact />
}
