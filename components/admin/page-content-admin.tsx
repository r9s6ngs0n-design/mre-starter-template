'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Check,
  Image as ImageIcon,
  LayoutGrid,
  MonitorPlay,
  Palette,
  Plus,
  Upload,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { uploadFile, storagePath } from '@/lib/storage'
import { useAdminTheme } from '@/contexts/admin-theme-context'
import { cn } from '@/lib/utils'
import type { Tables } from '@/lib/database.types'
import { RichTextEditor } from '@/components/admin/rich-text-editor'
import {
  defaultPagePosition,
  EDITABLE_PAGES,
  getButtonLinkType,
  getPagePositionLabel,
  PAGE_POSITION_OPTIONS,
  parseSectionContent,
  slugifySectionKey,
  type BackgroundType,
  type ButtonLinkType,
  type EditablePageId,
  type SectionContent,
  type SectionLayout,
} from '@/lib/page-sections'
import { normalizeRichText, stripHtml } from '@/lib/rich-text'

type PageSection = Tables<'page_sections'>

const BACKGROUND_COLORS = [
  { value: 'cream', label: 'Ivory (Default)' },
  { value: 'white', label: 'White' },
  { value: 'forest-deep', label: 'Forest Deep' },
  { value: 'forest', label: 'Forest' },
  { value: 'muted', label: 'Muted' },
] as const

const LAYOUT_OPTIONS: { value: SectionLayout; label: string; icon: typeof AlignLeft }[] = [
  { value: 'text_left', label: 'Text Left', icon: AlignLeft },
  { value: 'text_right', label: 'Text Right', icon: AlignRight },
  { value: 'centered', label: 'Centered', icon: AlignCenter },
  { value: 'hero', label: 'Hero', icon: LayoutGrid },
]

const BACKGROUND_TYPES: { value: BackgroundType; label: string; icon: typeof Palette }[] = [
  { value: 'color', label: 'Color', icon: Palette },
  { value: 'image', label: 'Image', icon: ImageIcon },
  { value: 'video', label: 'Video', icon: MonitorPlay },
]

function usePageContentStyles() {
  const { t, isDayMode } = useAdminTheme()

  return {
    t,
    isDayMode,
    title: isDayMode ? 'text-[#261c0d]' : 'text-zinc-100',
    subtitle: t.textMuted,
    input: cn(
      t.input,
      'w-full rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-700/60',
      isDayMode ? 'text-[#261c0d] placeholder:text-[#8a7660]' : 'text-zinc-200 placeholder:text-zinc-600',
    ),
    select: cn(
      t.select,
      'rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-700/60',
      isDayMode ? 'text-[#261c0d]' : 'text-zinc-200',
    ),
    label: cn(
      'mb-1.5 block text-[11px] font-semibold uppercase tracking-widest',
      isDayMode ? 'text-[#8a7660]' : 'text-zinc-500',
    ),
    hint: isDayMode ? 'text-[#b0a090]' : 'text-zinc-600',
    panel: cn(t.panel, 'p-6 md:p-10'),
    card: cn(
      'rounded-lg border p-4',
      isDayMode ? 'border-[#cfc8b6] bg-[#f0e9da]/60' : 'border-zinc-800 bg-zinc-950/60',
    ),
    badge: isDayMode ? 'bg-[#ddd5c3] text-[#7a6a54]' : 'bg-zinc-800 text-zinc-400',
    overlay: isDayMode ? 'bg-black/50' : 'bg-black/80',
    modal: cn(
      t.modal,
      'flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl p-0 shadow-2xl',
    ),
    modalBorder: isDayMode ? 'border-[#cfc8b6]' : 'border-zinc-800',
    closeBtn: isDayMode ? 'text-[#b0a090] hover:text-[#261c0d]' : 'text-zinc-600 hover:text-zinc-400',
    optionActive: isDayMode
      ? 'border-amber-600 bg-amber-100/50 text-amber-800'
      : 'border-amber-600 bg-amber-950/30 text-amber-400',
    optionInactive: isDayMode
      ? 'border-[#cfc8b6] bg-[#f0e9da] text-[#8a7660] hover:border-[#b0a090] hover:text-[#261c0d]'
      : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300',
    toggleTrack: isDayMode ? 'border-[#cfc8b6] bg-[#e9e2d4]' : 'border-zinc-800 bg-zinc-950',
    toggleActive: isDayMode ? 'bg-amber-100/70 text-amber-800' : 'bg-amber-950/40 text-amber-400',
    toggleInactive: isDayMode ? 'text-[#8a7660] hover:text-[#261c0d]' : 'text-zinc-500 hover:text-zinc-300',
    published: isDayMode ? 'bg-amber-100/60 text-amber-800' : 'bg-amber-950/40 text-amber-400',
    draft: isDayMode ? 'bg-[#ddd5c3] text-[#8a7660]' : 'bg-zinc-800 text-zinc-500',
    error: isDayMode
      ? 'rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800'
      : 'rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300',
    primaryBtn:
      'rounded-lg bg-amber-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60 transition-colors',
    cancelBtn: cn(
      'rounded-lg border px-5 py-2.5 text-sm transition-colors',
      isDayMode
        ? 'border-[#cfc8b6] text-[#8a7660] hover:border-[#b0a090] hover:text-[#261c0d]'
        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200',
    ),
    link: 'text-xs text-amber-500 hover:text-amber-400',
    emptyIcon: isDayMode ? 'text-[#cfc8b6]' : 'text-zinc-700',
    uploadZone: isDayMode
      ? 'border-[#cfc8b6] bg-[#f0e9da]/50 hover:border-amber-700/50'
      : 'border-zinc-700 bg-zinc-900/50 hover:border-amber-700/50',
    uploadIcon: isDayMode ? 'text-[#cfc8b6] group-hover:text-[#8a7660]' : 'text-zinc-600 group-hover:text-zinc-400',
  }
}

type Styles = ReturnType<typeof usePageContentStyles>

function parseContent(raw: PageSection['content']): SectionContent {
  return parseSectionContent(raw)
}

function SectionImageUpload({
  value,
  onChange,
  label = 'Upload Section Image',
  s,
}: {
  value: string
  onChange: (url: string) => void
  label?: string
  s: Styles
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true)
      try {
        const path = storagePath('page-sections', file.name)
        const url = await uploadFile('blog-covers', path, file)
        onChange(url)
      } catch (err) {
        console.error('Section image upload failed:', err)
      } finally {
        setUploading(false)
      }
    },
    [onChange],
  )

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          'group relative flex h-40 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed transition-colors',
          s.uploadZone,
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Section media" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <>
            <Upload className={cn('h-8 w-8 transition-colors', s.uploadIcon)} />
            <span className={cn('text-xs', s.hint)}>{uploading ? 'Uploading…' : label}</span>
          </>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-xs text-zinc-400">Uploading…</span>
          </div>
        )}
      </button>
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className={cn('mt-2 text-[11px] transition-colors hover:text-red-400', s.hint)}
        >
          Remove image
        </button>
      )}
    </div>
  )
}

function OptionButton({
  active,
  onClick,
  icon: Icon,
  label,
  s,
}: {
  active: boolean
  onClick: () => void
  icon: typeof AlignLeft
  label: string
  s: Styles
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border px-3 py-4 text-[10px] font-semibold uppercase tracking-wider transition-colors',
        active ? s.optionActive : s.optionInactive,
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={1.5} />
      {label}
    </button>
  )
}

function SectionModal({
  pageId,
  section,
  onClose,
  onSaved,
  s,
}: {
  pageId: EditablePageId
  section: PageSection | null
  onClose: () => void
  onSaved: () => void
  s: Styles
}) {
  const supabase = createClient()
  const isEditing = Boolean(section?.id)
  const initialContent = parseContent(section?.content ?? {})
  const positions = PAGE_POSITION_OPTIONS[pageId]

  const [content, setContent] = useState<SectionContent>(initialContent)
  const [buttonLinkType, setButtonLinkType] = useState<ButtonLinkType>(
    getButtonLinkType(initialContent),
  )
  const [sectionKey, setSectionKey] = useState(section?.section_key ?? '')
  const [displayOrder, setDisplayOrder] = useState(
    section?.display_order ?? defaultPagePosition(pageId),
  )
  const [isPublished, setIsPublished] = useState(section?.is_published ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof SectionContent>(field: K, value: SectionContent[K]) =>
    setContent((prev) => ({ ...prev, [field]: value }))

  const hasCustomPosition = !positions.some((p) => p.value === displayOrder)

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const key =
        sectionKey.trim() || slugifySectionKey(stripHtml(content.heading) || 'section')
      const normalizedContent: SectionContent = {
        ...content,
        heading: normalizeRichText(content.heading ?? ''),
        subheading: normalizeRichText(content.subheading ?? ''),
        eyebrow: normalizeRichText(content.eyebrow ?? ''),
        body: normalizeRichText(content.body ?? ''),
        button_link_type: buttonLinkType,
      }
      const payload = {
        page_id: pageId,
        section_key: key,
        content: normalizedContent as never,
        display_order: Number(displayOrder) || 0,
        is_published: isPublished,
      }

      const { error: saveError } = isEditing
        ? await supabase.from('page_sections').update(payload as never).eq('id', section!.id)
        : await supabase.from('page_sections').insert(payload as never)

      if (saveError) {
        setError(saveError.message)
        return
      }
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center p-4', s.overlay)}>
      <div className={s.modal}>
        <div className={cn('flex shrink-0 items-center justify-between border-b px-6 py-5', s.modalBorder)}>
          <h2 className={cn('text-lg font-semibold', s.title)}>
            {isEditing ? 'Edit Section' : 'Add New Section'}
          </h2>
          <button type="button" onClick={onClose} className={cn('transition-colors', s.closeBtn)} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className={s.label}>Heading</label>
                <RichTextEditor
                  key={`${section?.id ?? 'new'}-heading`}
                  value={content.heading ?? ''}
                  onChange={(heading) => {
                    set('heading', heading)
                    if (!isEditing && !sectionKey) {
                      setSectionKey(slugifySectionKey(stripHtml(heading) || 'section'))
                    }
                  }}
                  size="compact"
                  dayMode={s.isDayMode}
                />
              </div>
              <div>
                <label className={s.label}>Subheading</label>
                <RichTextEditor
                  key={`${section?.id ?? 'new'}-subheading`}
                  value={content.subheading ?? ''}
                  onChange={(html) => set('subheading', html)}
                  size="compact"
                  dayMode={s.isDayMode}
                />
              </div>
              <div>
                <label className={s.label}>Eyebrow (small text above heading)</label>
                <RichTextEditor
                  key={`${section?.id ?? 'new'}-eyebrow`}
                  value={content.eyebrow ?? ''}
                  onChange={(html) => set('eyebrow', html)}
                  size="compact"
                  dayMode={s.isDayMode}
                />
              </div>
              <div>
                <label className={s.label}>Main Content</label>
                <RichTextEditor
                  key={`${section?.id ?? 'new'}-body`}
                  value={content.body ?? ''}
                  onChange={(html) => set('body', html)}
                  dayMode={s.isDayMode}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={s.label}>Button Text</label>
                  <input
                    value={content.button_text ?? ''}
                    onChange={(e) => set('button_text', e.target.value)}
                    className={s.input}
                  />
                </div>
                <div>
                  <label className={s.label}>Button Link</label>
                  <div className={cn('mb-2 flex gap-1 rounded-lg border p-1', s.toggleTrack)}>
                    {(['internal', 'external'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setButtonLinkType(type)}
                        className={cn(
                          'flex-1 rounded-md px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors',
                          buttonLinkType === type ? s.toggleActive : s.toggleInactive,
                        )}
                      >
                        {type === 'internal' ? 'Internal' : 'External URL'}
                      </button>
                    ))}
                  </div>
                  <input
                    value={content.button_link ?? ''}
                    onChange={(e) => set('button_link', e.target.value)}
                    placeholder={
                      buttonLinkType === 'internal'
                        ? '/contact'
                        : 'https://example.com/register'
                    }
                    type={buttonLinkType === 'external' ? 'url' : 'text'}
                    className={s.input}
                  />
                  <p className={cn('mt-1.5 text-[11px]', s.hint)}>
                    {buttonLinkType === 'internal'
                      ? 'Site path starting with /'
                      : 'Full URL including https://'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className={s.label}>Section Layout</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {LAYOUT_OPTIONS.map(({ value, label, icon }) => (
                    <OptionButton
                      key={value}
                      active={content.layout === value}
                      onClick={() => set('layout', value)}
                      icon={icon}
                      label={label}
                      s={s}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className={s.label}>Background Type</label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {BACKGROUND_TYPES.map(({ value, label, icon }) => (
                    <OptionButton
                      key={value}
                      active={content.background_type === value}
                      onClick={() => set('background_type', value)}
                      icon={icon}
                      label={label}
                      s={s}
                    />
                  ))}
                </div>
              </div>

              {content.background_type === 'color' && (
                <div>
                  <label className={s.label}>Background Color</label>
                  <select
                    value={content.background_color ?? 'cream'}
                    onChange={(e) => set('background_color', e.target.value)}
                    className={s.input}
                  >
                    {BACKGROUND_COLORS.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(content.background_type === 'image' || content.background_type === 'video') && (
                <div>
                  <label className={s.label}>
                    {content.background_type === 'video' ? 'Video Poster' : 'Image / Poster'}
                  </label>
                  <SectionImageUpload
                    value={content.image_url ?? ''}
                    onChange={(url) => set('image_url', url)}
                    label={
                      content.background_type === 'video'
                        ? 'Upload Poster Image'
                        : 'Upload Section Image'
                    }
                    s={s}
                  />
                </div>
              )}

              {content.background_type === 'video' && (
                <div>
                  <label className={s.label}>Video URL</label>
                  <input
                    value={content.video_url ?? ''}
                    onChange={(e) => set('video_url', e.target.value)}
                    placeholder="https://…"
                    className={s.input}
                  />
                </div>
              )}

              <div>
                <label className={s.label}>Page Position</label>
                <select
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className={s.input}
                >
                  {hasCustomPosition && (
                    <option value={displayOrder}>
                      Custom ({displayOrder}) — choose a slot below to reposition
                    </option>
                  )}
                  {positions.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <p className={cn('mt-1.5 text-[11px]', s.hint)}>
                  Controls where this section appears on the live page relative to built-in content.
                  Lower numbers appear higher.
                </p>
              </div>

              <div>
                <label className={s.label}>Status</label>
                <button
                  type="button"
                  onClick={() => setIsPublished((v) => !v)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors',
                    isPublished ? s.published : cn(s.draft, s.modalBorder),
                  )}
                >
                  <Check className={cn('h-4 w-4', !isPublished && 'opacity-30')} />
                  {isPublished ? 'Published' : 'Draft'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {error ? <div className={cn('mx-6 mt-4', s.error)}>{error}</div> : null}

        <div className={cn('flex shrink-0 items-center justify-end gap-3 border-t px-6 py-4', s.modalBorder)}>
          <button type="button" onClick={onClose} className={s.cancelBtn}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className={s.primaryBtn}>
            {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Section'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function PageContentAdmin() {
  const s = usePageContentStyles()
  const supabase = createClient()

  const [selectedPage, setSelectedPage] = useState<EditablePageId>(EDITABLE_PAGES[0].id)
  const [sections, setSections] = useState<PageSection[]>([])
  const [loading, setLoading] = useState(true)
  const [modalSection, setModalSection] = useState<PageSection | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    const { data, error } = await supabase
      .from('page_sections')
      .select('*')
      .eq('page_id', selectedPage)
      .order('display_order', { ascending: true })
    if (error) {
      setLoadError(error.message)
      setSections([])
    } else {
      setSections((data as PageSection[]) ?? [])
    }
    setLoading(false)
  }, [supabase, selectedPage])

  useEffect(() => {
    refresh()
  }, [refresh])

  function openNew() {
    setModalSection(null)
    setModalOpen(true)
  }

  function openEdit(section: PageSection) {
    setModalSection(section)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setModalSection(null)
  }

  async function deleteSection(section: PageSection) {
    const content = parseContent(section.content)
    const name = stripHtml(content.heading) || section.section_key
    if (!window.confirm(`Delete section "${name}"? This cannot be undone.`)) return
    const { error } = await supabase.from('page_sections').delete().eq('id', section.id)
    if (error) {
      setLoadError(error.message)
      return
    }
    refresh()
  }

  const pageLabel = EDITABLE_PAGES.find((p) => p.id === selectedPage)?.label ?? selectedPage

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={cn('text-2xl font-semibold', s.title)}>Page Content Management</h1>
          <p className={cn('mt-1 text-sm', s.subtitle)}>
            Manage dynamic sections across public pages
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value as EditablePageId)}
            className={s.select}
          >
            {EDITABLE_PAGES.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={openNew}
            className={cn('flex items-center gap-2 px-4 py-2.5 text-sm font-medium', s.primaryBtn)}
          >
            <Plus className="h-4 w-4" />
            Add Section
          </button>
        </div>
      </div>

      {loadError ? <div className={s.error}>Could not load sections: {loadError}</div> : null}

      <div className={s.panel}>
        {loading ? (
          <p className={s.subtitle}>Loading…</p>
        ) : sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <LayoutGrid className={cn('mb-4 h-12 w-12', s.emptyIcon)} strokeWidth={1} />
            <p className={s.subtitle}>No sections found for this page.</p>
            <button type="button" onClick={openNew} className={cn('mt-3 text-sm font-medium', s.link)}>
              Create your first section
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className={cn('mb-4 text-xs uppercase tracking-widest', s.hint)}>
              {pageLabel} · {sections.length} section{sections.length === 1 ? '' : 's'}
            </p>
            {sections.map((section) => {
              const content = parseContent(section.content)
              return (
                <div
                  key={section.id}
                  className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', s.card)}
                >
                  <div className="min-w-0">
                    <p className={cn('truncate font-medium', s.title)}>
                      {stripHtml(content.heading) || section.section_key}
                    </p>
                    <p className={cn('mt-0.5 truncate text-sm', s.subtitle)}>
                      {stripHtml(content.subheading) || stripHtml(content.eyebrow) || '—'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={cn('rounded px-2 py-0.5 text-[10px] uppercase tracking-wider', s.badge)}>
                        {content.layout?.replace('_', ' ') ?? 'text left'}
                      </span>
                      <span className={cn('rounded px-2 py-0.5 text-[10px] uppercase tracking-wider', s.badge)}>
                        {getPagePositionLabel(selectedPage, section.display_order)}
                      </span>
                      <span
                        className={cn(
                          'rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
                          section.is_published ? s.published : s.draft,
                        )}
                      >
                        {section.is_published ? 'Published' : 'Draft — not on site'}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <button type="button" onClick={() => openEdit(section)} className={s.link}>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSection(section)}
                      className={cn('text-xs transition-colors hover:text-red-400', s.hint)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <SectionModal
          pageId={selectedPage}
          section={modalSection}
          onClose={closeModal}
          onSaved={() => {
            closeModal()
            refresh()
          }}
          s={s}
        />
      )}
    </div>
  )
}
