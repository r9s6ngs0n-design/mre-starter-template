import type { Tables } from '@/lib/database.types'
import type { EditablePageId } from '@/lib/page-sections'

export type SiteDocument = Tables<'documents'>
export type DocumentPlacementSetting = Tables<'document_placement_settings'>

export const DOCUMENT_CATEGORIES = [
  { value: 'guide', label: 'Free Resource / Guide' },
  { value: 'report', label: 'Market Report' },
  { value: 'brochure', label: 'Project Brochure' },
  { value: 'floorplan', label: 'Floorplan' },
] as const

export const DOCUMENT_PLACEMENTS = [
  { id: 'home', label: 'Home', description: 'Resources section on the homepage' },
  { id: 'about', label: 'About', description: 'About page resources block' },
  { id: 'contact', label: 'Contact', description: 'Contact page downloads section' },
  { id: 'insights', label: 'Insights', description: 'Insights page resources block' },
  { id: 'footer', label: 'Footer', description: 'Site footer download links' },
  { id: 'property', label: 'Property Pages', description: 'All property detail pages (or link to a specific listing)' },
] as const

export type DocumentPlacement = (typeof DOCUMENT_PLACEMENTS)[number]['id']

/** Placements that render as a page section via PageLayoutComposer. */
export const PAGE_SECTION_PLACEMENTS: DocumentPlacement[] = [
  'home',
  'about',
  'contact',
  'insights',
]

export const PLACEMENT_PAGE_MAP: Record<DocumentPlacement, EditablePageId | null> = {
  home: 'home',
  about: 'about',
  contact: 'contact',
  insights: 'insights',
  footer: null,
  property: null,
}

export const DEFAULT_PLACEMENT_SECTION_ORDERS: Record<DocumentPlacement, number> = {
  home: 80,
  about: 70,
  contact: 60,
  insights: 20,
  footer: 0,
  property: 0,
}

export function placementHasSectionPosition(placement: DocumentPlacement) {
  return PAGE_SECTION_PLACEMENTS.includes(placement)
}

export function documentCategoryLabel(type: string | null | undefined) {
  return DOCUMENT_CATEGORIES.find((c) => c.value === type)?.label ?? type ?? 'Document'
}

export function documentPlacementLabel(id: string) {
  return DOCUMENT_PLACEMENTS.find((p) => p.id === id)?.label ?? id
}

export function documentUrl(doc: Pick<SiteDocument, 'external_url' | 'file_url'>) {
  return doc.external_url || doc.file_url || null
}

export function sortDocuments(docs: SiteDocument[]) {
  return [...docs].sort((a, b) => a.display_order - b.display_order || a.title.localeCompare(b.title))
}
