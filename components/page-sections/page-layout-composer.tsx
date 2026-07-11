import { Fragment } from 'react'
import { getPublishedPageSections } from '@/lib/queries-server'
import type { EditablePageId, PageSectionRow } from '@/lib/page-sections'
import { PageSectionRenderer } from './page-section-renderer'

export type PageLayoutBlock = {
  order: number
  key: string
  children: React.ReactNode
}

type LayoutItem =
  | { kind: 'block'; order: number; key: string; node: React.ReactNode }
  | { kind: 'section'; order: number; key: string; section: PageSectionRow }

function compareLayoutItems(a: LayoutItem, b: LayoutItem) {
  if (a.order !== b.order) return a.order - b.order
  if (a.kind !== b.kind) return a.kind === 'block' ? -1 : 1
  if (a.kind === 'section' && b.kind === 'section') {
    return a.section.created_at.localeCompare(b.section.created_at)
  }
  return 0
}

/** Merges CMS sections into the page at their `display_order` relative to static blocks. */
export async function PageLayoutComposer({
  pageId,
  blocks,
}: {
  pageId: EditablePageId
  blocks: PageLayoutBlock[]
}) {
  const sections = await getPublishedPageSections(pageId)

  const items: LayoutItem[] = [
    ...blocks.map((block) => ({
      kind: 'block' as const,
      order: block.order,
      key: block.key,
      node: block.children,
    })),
    ...sections.map((section) => ({
      kind: 'section' as const,
      order: section.display_order,
      key: section.id,
      section,
    })),
  ].sort(compareLayoutItems)

  return (
    <>
      {items.map((item) =>
        item.kind === 'block' ? (
          <Fragment key={item.key}>{item.node}</Fragment>
        ) : (
          <PageSectionRenderer key={item.key} section={item.section} />
        ),
      )}
    </>
  )
}
