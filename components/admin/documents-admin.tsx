'use client'

import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadFile, storagePath } from '@/lib/storage'
import { useAdminTable } from '@/hooks/use-admin-table'
import { useAdminTheme } from '@/contexts/admin-theme-context'
import { cn } from '@/lib/utils'
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_PLACEMENTS,
  DEFAULT_PLACEMENT_SECTION_ORDERS,
  PLACEMENT_PAGE_MAP,
  documentCategoryLabel,
  documentPlacementLabel,
  documentUrl,
  placementHasSectionPosition,
  type DocumentPlacement,
  type SiteDocument,
} from '@/lib/documents'
import {
  PAGE_POSITION_OPTIONS,
  PAGE_STATIC_ANCHORS,
  getPagePositionLabel,
} from '@/lib/page-sections'

const EMPTY_FORM: Partial<SiteDocument> = {
  title: '',
  type: 'guide',
  file_url: null,
  external_url: null,
  placements: [],
  display_order: 0,
  listing_id: null,
  is_active: true,
}

type ListingOption = { id: string; title: string }
type SectionOrders = Record<DocumentPlacement, number>

// ─── Section position settings (where the downloads block sits on each page) ──

function SectionPositionsPanel({
  sectionOrders,
  onChange,
  onSave,
  saving,
}: {
  sectionOrders: SectionOrders
  onChange: (placement: DocumentPlacement, order: number) => void
  onSave: () => void
  saving: boolean
}) {
  const { t } = useAdminTheme()
  const inputCls = cn(t.input, 'w-full rounded-lg px-3 py-2 text-sm')

  return (
    <div className={cn('rounded-xl border p-5', t.panelBorder, t.panel)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider">Downloads Section Position</h2>
          <p className={cn('mt-1 text-sm', t.textMuted)}>
            Controls where the downloads block appears on each page — same scale as Page Content sections.
            Lower numbers appear higher on the page.
          </p>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="bg-amber-700 px-4 py-2 text-xs font-medium uppercase tracking-wider text-white hover:bg-amber-600 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Positions'}
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {DOCUMENT_PLACEMENTS.filter((p) => placementHasSectionPosition(p.id)).map((placement) => {
          const pageId = PLACEMENT_PAGE_MAP[placement.id]!
          const options = PAGE_POSITION_OPTIONS[pageId]
          const anchors = PAGE_STATIC_ANCHORS[pageId]
          return (
            <div key={placement.id} className={cn('rounded-lg border p-4', t.panelBorder)}>
              <p className="text-sm font-medium">{placement.label}</p>
              <p className={cn('mt-0.5 text-xs', t.textMuted)}>
                Slots between: {anchors.map((a) => a.label).join(' → ')}
              </p>
              <select
                value={sectionOrders[placement.id]}
                onChange={(e) => onChange(placement.id, Number(e.target.value))}
                className={cn(inputCls, 'mt-3')}
              >
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className={cn('mt-1.5 text-[11px]', t.textDim)}>
                Current: {getPagePositionLabel(pageId, sectionOrders[placement.id])}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Document modal ───────────────────────────────────────────────────────────

function DocumentModal({
  document,
  listings,
  onClose,
  onSaved,
}: {
  document: Partial<SiteDocument> | null
  listings: ListingOption[]
  onClose: () => void
  onSaved: () => void
}) {
  const { t } = useAdminTheme()
  const supabase = createClient()
  const isEditing = Boolean(document?.id)

  const [form, setForm] = useState<Partial<SiteDocument>>(document ?? { ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const inputCls = cn(
    t.input,
    'w-full rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-700/60',
  )
  const labelCls = cn('mb-1.5 block text-[11px] font-semibold uppercase tracking-widest', t.textMuted)

  const togglePlacement = (placement: DocumentPlacement) => {
    setForm((prev) => {
      const current = prev.placements ?? []
      const next = current.includes(placement)
        ? current.filter((p) => p !== placement)
        : [...current, placement]
      return { ...prev, placements: next }
    })
  }

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      window.alert('Only PDF files are supported.')
      return
    }
    setUploading(true)
    try {
      const path = storagePath('pdfs', file.name)
      const url = await uploadFile('documents', path, file)
      setForm((prev) => ({
        ...prev,
        file_url: url,
        external_url: null,
      }))
    } catch (err) {
      console.error('Document upload failed:', err)
      window.alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [])

  async function handleSave() {
    if (!form.title?.trim()) {
      window.alert('Please enter a document display name.')
      return
    }
    if (!form.external_url && !form.file_url) {
      window.alert('Please provide an external URL or upload a PDF.')
      return
    }
    if (!form.listing_id && !(form.placements?.length)) {
      window.alert('Choose at least one page placement, or link this document to a specific listing.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        type: form.type ?? 'guide',
        file_url: form.file_url ?? null,
        external_url: form.external_url ?? null,
        placements: form.placements ?? [],
        display_order: Number(form.display_order ?? 0),
        listing_id: form.listing_id || null,
        is_active: form.is_active ?? true,
      }

      if (isEditing) {
        await supabase.from('documents').update(payload as never).eq('id', document!.id!)
      } else {
        await supabase.from('documents').insert(payload as never)
      }
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  const hasUploadedPdf = Boolean(form.file_url && !form.external_url)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className={cn('flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-xl shadow-2xl', t.modal)}>
        <div className={cn('flex shrink-0 items-start justify-between border-b px-6 py-5', t.panelBorder)}>
          <div>
            <h2 className="text-lg font-semibold">
              {isEditing ? `Edit ${form.title || 'Document'}` : 'Upload New Document'}
            </h2>
            <p className={cn('mt-0.5 text-sm', t.textMuted)}>
              Choose which pages show this download, and set button order within the list.
            </p>
          </div>
          <button type="button" onClick={onClose} className={cn('transition-colors hover:opacity-80', t.textDim)}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div>
            <label className={labelCls}>Document Display Name</label>
            <input
              placeholder="e.g. Q2 2026 Market Report"
              value={form.title ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category</label>
              <select
                value={form.type ?? 'guide'}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                className={inputCls}
              >
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Button Sort Order</label>
              <input
                type="number"
                min={0}
                value={form.display_order ?? 0}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, display_order: Number(e.target.value) }))
                }
                className={inputCls}
              />
              <p className={cn('mt-1 text-[11px]', t.textDim)}>
                Order of this button within the downloads list (not page position — use Section Position above)
              </p>
            </div>
          </div>

          <div>
            <label className={labelCls}>Show Download Button On</label>
            <div className={cn('space-y-2 rounded-lg border p-4', t.panelBorder)}>
              {DOCUMENT_PLACEMENTS.map((placement) => {
                const checked = (form.placements ?? []).includes(placement.id)
                return (
                  <label
                    key={placement.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                      checked ? 'border-amber-700/50 bg-amber-700/10' : t.panelBorder,
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePlacement(placement.id)}
                      className="mt-0.5 h-4 w-4 rounded accent-amber-700"
                    />
                    <span>
                      <span className="block text-sm font-medium">{placement.label}</span>
                      <span className={cn('text-xs', t.textMuted)}>{placement.description}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          <div>
            <label className={labelCls}>Link to Specific Listing (optional)</label>
            <select
              value={form.listing_id ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  listing_id: e.target.value || null,
                }))
              }
              className={inputCls}
            >
              <option value="">None — site-wide only</option>
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.title}
                </option>
              ))}
            </select>
            <p className={cn('mt-1 text-[11px]', t.textDim)}>
              Listing-linked documents always appear on that property page.
            </p>
          </div>

          <div className={cn('space-y-4 rounded-lg border p-5', t.panelBorder)}>
            <div>
              <label className={labelCls}>Option 1: External URL</label>
              <input
                type="url"
                placeholder="https://dropbox.com/… or https://drive.google.com/…"
                value={form.external_url ?? ''}
                onChange={(e) => {
                  const val = e.target.value
                  setForm((prev) => ({
                    ...prev,
                    external_url: val || null,
                    file_url: val ? null : prev.file_url,
                  }))
                }}
                className={inputCls}
              />
            </div>

            <div className={cn('flex items-center gap-3 text-xs', t.textMuted)}>
              <div className={cn('h-px flex-1', t.panelBorder, 'border-t')} />
              OR
              <div className={cn('h-px flex-1', t.panelBorder, 'border-t')} />
            </div>

            <div>
              <label className={labelCls}>Option 2: PDF File Upload</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files?.[0]
                  if (file) handleFile(file)
                }}
                className={cn(
                  'flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 transition-colors',
                  'border-zinc-700 text-zinc-500 hover:border-amber-700/60 hover:text-amber-600',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                {uploading ? (
                  <span className="text-xs">Uploading…</span>
                ) : (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Click to browse or drag and drop</span>
                    <span className={cn('text-xs', t.textDim)}>Only PDF files supported</span>
                  </>
                )}
              </button>
              {hasUploadedPdf && <p className="mt-2 text-xs text-amber-600">PDF uploaded ✓</p>}
            </div>

            {(form.external_url || form.file_url) && (
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, external_url: null, file_url: null }))}
                className="text-xs text-red-500 hover:underline"
              >
                Remove document source
              </button>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.is_active ?? true}
              onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              className="h-4 w-4 rounded accent-amber-700"
            />
            <span className="text-sm">Active — visible on the live site</span>
          </label>
        </div>

        <div className={cn('flex shrink-0 items-center justify-end gap-3 border-t px-6 py-4', t.panelBorder)}>
          <button
            type="button"
            onClick={onClose}
            className={cn('px-4 py-2 text-sm uppercase tracking-wider transition-colors', t.cancelBtn)}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex items-center gap-2 bg-amber-700 px-6 py-2.5 text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
          >
            {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Upload Document'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main DocumentsAdmin ──────────────────────────────────────────────────────

export function DocumentsAdmin() {
  const { t } = useAdminTheme()
  const { rows, loading, refresh } = useAdminTable<SiteDocument>('documents', 'display_order')
  const supabase = createClient()

  const [search, setSearch] = useState('')
  const [modalDocument, setModalDocument] = useState<Partial<SiteDocument> | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [listings, setListings] = useState<ListingOption[]>([])
  const [sectionOrders, setSectionOrders] = useState<SectionOrders>({
    ...DEFAULT_PLACEMENT_SECTION_ORDERS,
  })
  const [savingPositions, setSavingPositions] = useState(false)

  useEffect(() => {
    supabase
      .from('listings')
      .select('id, title')
      .order('title')
      .then(({ data }) => setListings((data as ListingOption[]) ?? []))

    supabase
      .from('document_placement_settings')
      .select('placement, section_order')
      .then(({ data }) => {
        if (!data?.length) return
        setSectionOrders((prev) => {
          const next = { ...prev }
          for (const row of data) {
            if (row.placement in next) {
              next[row.placement as DocumentPlacement] = row.section_order
            }
          }
          return next
        })
      })
  }, [supabase])

  const sortedRows = useMemo(
    () =>
      [...rows].sort(
        (a, b) => a.display_order - b.display_order || a.title.localeCompare(b.title),
      ),
    [rows],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sortedRows
    return sortedRows.filter(
      (row) =>
        row.title.toLowerCase().includes(q) ||
        documentCategoryLabel(row.type).toLowerCase().includes(q) ||
        (row.placements ?? []).some((p) => documentPlacementLabel(p).toLowerCase().includes(q)),
    )
  }, [sortedRows, search])

  const listingTitle = (id: string | null) =>
    listings.find((l) => l.id === id)?.title ?? 'Linked listing'

  function openNew() {
    setModalDocument(null)
    setModalOpen(true)
  }

  function openEdit(row: SiteDocument) {
    setModalDocument({ ...row, placements: row.placements ?? [] })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setModalDocument(null)
  }

  function onSaved() {
    closeModal()
    refresh()
  }

  async function toggleActive(row: SiteDocument) {
    await supabase
      .from('documents')
      .update({ is_active: !row.is_active } as never)
      .eq('id', row.id)
    refresh()
  }

  async function saveSectionPositions() {
    setSavingPositions(true)
    try {
      const rows = DOCUMENT_PLACEMENTS.filter((p) => placementHasSectionPosition(p.id)).map(
        (placement) => ({
          placement: placement.id,
          page_id: PLACEMENT_PAGE_MAP[placement.id]!,
          section_order: sectionOrders[placement.id],
        }),
      )
      await supabase.from('document_placement_settings').upsert(rows as never)
    } finally {
      setSavingPositions(false)
    }
  }

  async function deleteDocument(row: SiteDocument) {
    if (!window.confirm(`Delete "${row.title}"? This cannot be undone.`)) return
    await supabase.from('documents').delete().eq('id', row.id)
    refresh()
  }

  async function moveDocument(row: SiteDocument, direction: 'up' | 'down') {
    const index = sortedRows.findIndex((r) => r.id === row.id)
    const swapWith = direction === 'up' ? sortedRows[index - 1] : sortedRows[index + 1]
    if (!swapWith) return

    await Promise.all([
      supabase
        .from('documents')
        .update({ display_order: swapWith.display_order } as never)
        .eq('id', row.id),
      supabase
        .from('documents')
        .update({ display_order: row.display_order } as never)
        .eq('id', swapWith.id),
    ])
    refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Documents</h1>
          <p className={cn('mt-1 text-sm', t.textMuted)}>
            Upload guides and reports. Set section position above; sort individual buttons in each document.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="bg-amber-700 px-5 py-2.5 text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-amber-600"
        >
          + Upload New Document
        </button>
      </div>

      <SectionPositionsPanel
        sectionOrders={sectionOrders}
        onChange={(placement, order) =>
          setSectionOrders((prev) => ({ ...prev, [placement]: order }))
        }
        onSave={saveSectionPositions}
        saving={savingPositions}
      />

      <div className="relative">
        <svg
          className={cn('pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2', t.textMuted)}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="search"
          placeholder="Search by name, category, or placement…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            t.input,
            'w-full rounded-lg py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-amber-700/50',
          )}
        />
      </div>

      {loading ? (
        <p className={t.textMuted}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div className={cn('flex flex-col items-center justify-center rounded-xl border py-20', t.panelBorder, t.panel)}>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-amber-700/30 bg-amber-700/10">
            <svg className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <p className="font-medium">
            {search ? 'No documents match your search' : 'No documents found'}
          </p>
          <p className={cn('mt-1 text-sm', t.textMuted)}>
            {search
              ? 'Try a different search term.'
              : 'Get started by uploading your first document.'}
          </p>
          {!search && (
            <button
              type="button"
              onClick={openNew}
              className="mt-6 bg-amber-700 px-5 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
            >
              Upload Document
            </button>
          )}
        </div>
      ) : (
        <div className={t.tableBorder}>
          <table className="w-full text-left text-sm">
            <thead className={t.tableHeader}>
              <tr>
                <th className="p-3 w-16">List #</th>
                <th className="p-3">Document</th>
                <th className="p-3">Category</th>
                <th className="p-3">Placements</th>
                <th className="p-3">Source</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const sortedIndex = sortedRows.findIndex((r) => r.id === row.id)
                const url = documentUrl(row)
                const isExternal = Boolean(row.external_url)
                const placements = row.placements ?? []
                return (
                  <tr key={row.id} className={t.tableRow}>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span className={cn('w-5 text-center text-xs', t.textMuted)}>
                          {row.display_order}
                        </span>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            disabled={sortedIndex <= 0}
                            onClick={() => moveDocument(row, 'up')}
                            className={cn('text-xs disabled:opacity-30', t.textDim)}
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={sortedIndex < 0 || sortedIndex >= sortedRows.length - 1}
                            onClick={() => moveDocument(row, 'down')}
                            className={cn('text-xs disabled:opacity-30', t.textDim)}
                            title="Move down"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-medium">
                      {row.title}
                      {row.listing_id && (
                        <p className={cn('mt-0.5 text-xs', t.textMuted)}>
                          → {listingTitle(row.listing_id)}
                        </p>
                      )}
                    </td>
                    <td className={cn('p-3', t.textSecondary)}>{documentCategoryLabel(row.type)}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {placements.length > 0 ? (
                          placements.map((p) => (
                            <span
                              key={p}
                              className="rounded bg-amber-700/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700"
                            >
                              {documentPlacementLabel(p)}
                            </span>
                          ))
                        ) : row.listing_id ? (
                          <span className={cn('text-xs', t.textMuted)}>Property only</span>
                        ) : (
                          <span className={t.textDim}>—</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-amber-600 hover:text-amber-500 hover:underline"
                        >
                          {isExternal ? 'External link' : 'Uploaded PDF'}
                        </a>
                      ) : (
                        <span className={t.textDim}>—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          'rounded px-2 py-0.5 text-xs font-medium',
                          row.is_active
                            ? 'bg-green-900/30 text-green-600'
                            : cn('bg-zinc-800/50', t.textMuted),
                        )}
                      >
                        {row.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 space-x-3">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="text-xs text-amber-600 hover:text-amber-500"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(row)}
                        className={cn('text-xs hover:opacity-80', t.textMuted)}
                      >
                        {row.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDocument(row)}
                        className="text-xs text-zinc-600 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <DocumentModal
          document={modalDocument}
          listings={listings}
          onClose={closeModal}
          onSaved={onSaved}
        />
      )}
    </div>
  )
}
