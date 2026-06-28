import type { Json, Tables } from '@/lib/database.types'

export type PageSectionRow = Tables<'page_sections'>
export type SectionLayout = 'text_left' | 'text_right' | 'centered' | 'hero'
export type BackgroundType = 'color' | 'image' | 'video'
export type ButtonLinkType = 'internal' | 'external'

export interface SectionContent {
  heading?: string
  subheading?: string
  eyebrow?: string
  body?: string
  button_text?: string
  button_link?: string
  button_link_type?: ButtonLinkType
  layout?: SectionLayout
  background_type?: BackgroundType
  background_color?: string
  image_url?: string
  video_url?: string
}

export const EDITABLE_PAGES = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
  { id: 'insights', label: 'Insights' },
] as const

export type EditablePageId = (typeof EDITABLE_PAGES)[number]['id']

/** CMS sections render between these anchors using `display_order`. Lower = higher on page. */
export const PAGE_STATIC_ANCHORS: Record<
  EditablePageId,
  { order: number; label: string }[]
> = {
  home: [
    { order: 0, label: 'Hero' },
    { order: 20, label: 'Brand statement' },
    { order: 30, label: 'Featured properties' },
    { order: 40, label: 'Expertise pillars' },
    { order: 50, label: 'Testimonials' },
    { order: 60, label: 'System overview' },
    { order: 70, label: 'Insights teaser' },
    { order: 75, label: 'Downloads' },
    { order: 90, label: 'Footer CTA' },
  ],
  about: [
    { order: 0, label: 'Hero' },
    { order: 20, label: 'Our approach' },
    { order: 40, label: 'Quote' },
    { order: 60, label: 'Team' },
    { order: 70, label: 'Downloads' },
    { order: 90, label: 'How we work' },
  ],
  contact: [
    { order: 0, label: 'Contact details & form' },
    { order: 50, label: 'Downloads section' },
  ],
  insights: [
    { order: 0, label: 'Page intro' },
    { order: 20, label: 'Downloads' },
    { order: 30, label: 'Articles' },
  ],
}

/** Admin dropdown options — values sit between static anchors on each page. */
export const PAGE_POSITION_OPTIONS: Record<
  EditablePageId,
  { value: number; label: string }[]
> = {
  home: [
    { value: 5, label: 'Top — before hero' },
    { value: 10, label: 'After hero' },
    { value: 25, label: 'After brand statement' },
    { value: 35, label: 'After featured properties' },
    { value: 45, label: 'After expertise pillars' },
    { value: 55, label: 'After testimonials' },
    { value: 65, label: 'After system overview' },
    { value: 72, label: 'After insights teaser' },
    { value: 82, label: 'Before footer CTA' },
  ],
  about: [
    { value: 10, label: 'After hero' },
    { value: 30, label: 'After our approach' },
    { value: 50, label: 'After quote' },
    { value: 65, label: 'After team' },
    { value: 80, label: 'Before how we work' },
  ],
  contact: [
    { value: 5, label: 'Top — before contact details' },
    { value: 25, label: 'After intro, before form' },
    { value: 60, label: 'After contact section' },
  ],
  insights: [
    { value: 5, label: 'Top — before intro' },
    { value: 15, label: 'After intro' },
    { value: 25, label: 'After downloads' },
    { value: 40, label: 'After articles' },
  ],
}

export function getPagePositionLabel(pageId: EditablePageId, order: number) {
  const match = PAGE_POSITION_OPTIONS[pageId]?.find((p) => p.value === order)
  if (match) return match.label
  return `Custom position (${order})`
}

export function defaultPagePosition(pageId: EditablePageId) {
  return PAGE_POSITION_OPTIONS[pageId]?.[0]?.value ?? 10
}

const EMPTY_CONTENT: SectionContent = {
  heading: '',
  subheading: '',
  eyebrow: '',
  body: '',
  button_text: '',
  button_link: '',
  button_link_type: 'internal',
  layout: 'text_left',
  background_type: 'color',
  background_color: 'cream',
  image_url: '',
  video_url: '',
}

export function parseSectionContent(raw: Json | null | undefined): SectionContent {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...EMPTY_CONTENT }
  return { ...EMPTY_CONTENT, ...(raw as SectionContent) }
}

export function isExternalLink(url: string) {
  return /^https?:\/\//i.test(url.trim()) || url.trim().startsWith('//')
}

export function getButtonLinkType(content: SectionContent): ButtonLinkType {
  if (content.button_link_type) return content.button_link_type
  if (content.button_link && isExternalLink(content.button_link)) return 'external'
  return 'internal'
}

export function sectionBackgroundClass(color?: string) {
  switch (color) {
    case 'white':
      return 'bg-white text-ink'
    case 'forest-deep':
      return 'bg-forest-deep text-cream'
    case 'forest':
      return 'bg-forest text-cream'
    case 'muted':
      return 'bg-muted text-ink'
    case 'cream':
    default:
      return 'bg-cream text-ink'
  }
}

export function slugifySectionKey(text: string) {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 50)
  return slug || `section-${Date.now()}`
}
