'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadFile, storagePath } from '@/lib/storage'
import { toSlug } from '@/lib/slugUtils'
import { useAdminTable } from '@/hooks/use-admin-table'
import { useAdminTheme } from '@/contexts/admin-theme-context'
import { cn } from '@/lib/utils'
import type { ListingCategory, ListingStatus, Tables, TablesInsert } from '@/lib/database.types'
import { LISTING_CATEGORIES, LISTING_STATUSES, TYPE_SLUGS } from '@/lib/slugUtils'

type Listing = Tables<'listings'>
type InspectionTime = Tables<'listing_inspection_times'>

const empty: TablesInsert<'listings'> = {
  title: '',
  slug: '',
  category: 'project',
  status: 'available',
  headline: '',
  description: '',
  suburb: '',
  address: '',
  price_display: '',
  price_min: 0,
  images: [],
  is_published: false,
  featured: false,
  video_url: null,
  city_slug: '',
  suburb_slug: '',
  type_slug: null,
  listing_slug: '',
  completion_date: null,
  project_phase: '',
  key_features: [],
  amenities: [],
  developer: null,
}

// ─── Label component ──────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
      {children}
    </p>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="mb-4 flex items-start gap-3 border-b border-zinc-800 pb-3">
      <div className="mt-0.5 text-amber-500">{icon}</div>
      <div>
        <p className="font-medium">{title}</p>
        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
      </div>
    </div>
  )
}

export function ListingsAdmin() {
  const { t } = useAdminTheme()
  const { rows, loading, refresh } = useAdminTable<Listing>('listings', 'updated_at')
  const [filter, setFilter] = useState<string>('')
  const [view, setView] = useState<'list' | 'form'>('list')
  const [form, setForm] = useState<TablesInsert<'listings'>>(empty)
  const [editId, setEditId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadingBrochure, setUploadingBrochure] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const brochureInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // ── Inspection times state ────────────────────────────────────────────────
  const [inspectionTimes, setInspectionTimes] = useState<InspectionTime[]>([])
  const [newSlotStart, setNewSlotStart] = useState('')
  const [newSlotEnd, setNewSlotEnd] = useState('')
  const [newSlotNotes, setNewSlotNotes] = useState('')
  const [addingSlot, setAddingSlot] = useState(false)
  const [slotError, setSlotError] = useState<string | null>(null)

  const inputClass = cn(t.input, 'w-full px-3 py-2 text-sm rounded')
  const filtered = filter ? rows.filter((r) => r.category === filter) : rows

  // ── Slug preview ─────────────────────────────────────────────────────────────
  const previewSlug = form.listing_slug || toSlug(form.title)
  const liveUrl = [
    form.city_slug,
    form.suburb_slug,
    form.type_slug,
    previewSlug,
  ]
    .filter(Boolean)
    .join('/')

  function autoFillSlug() {
    const slug = toSlug(form.title)
    setForm((f) => ({ ...f, listing_slug: slug, slug }))
  }

  // ── Open / close form ────────────────────────────────────────────────────────
  function openNew() {
    setEditId(null)
    setForm(empty)
    setSaveError(null)
    setView('form')
  }

  function openEdit(row: Listing) {
    setEditId(row.id)
    setForm({ ...row })
    setSaveError(null)
    setInspectionTimes([])
    setView('form')
    supabase
      .from('listing_inspection_times')
      .select('*')
      .eq('listing_id', row.id)
      .order('starts_at', { ascending: true })
      .then(({ data }) => setInspectionTimes(data ?? []))
  }

  function closeForm() {
    setView('list')
    setSaveError(null)
    setInspectionTimes([])
    setNewSlotStart('')
    setNewSlotEnd('')
    setNewSlotNotes('')
    setAddingSlot(false)
    setSlotError(null)
  }

  // ── Inspection slot helpers ───────────────────────────────────────────────
  async function addInspectionSlot() {
    if (!editId) { setSlotError('Save the listing first before adding inspection times.'); return }
    if (!newSlotStart || !newSlotEnd) { setSlotError('Start and end are required.'); return }
    if (new Date(newSlotEnd) <= new Date(newSlotStart)) { setSlotError('End time must be after start time.'); return }
    setSlotError(null)
    const { data, error } = await supabase
      .from('listing_inspection_times')
      .insert({ listing_id: editId, starts_at: newSlotStart, ends_at: newSlotEnd, notes: newSlotNotes.trim() || null })
      .select('*')
      .single()
    if (error) { setSlotError(error.message); return }
    if (data) setInspectionTimes((prev) => [...prev, data].sort((a, b) => a.starts_at.localeCompare(b.starts_at)))
    setNewSlotStart('')
    setNewSlotEnd('')
    setNewSlotNotes('')
    setAddingSlot(false)
  }

  async function removeInspectionSlot(id: string) {
    await supabase.from('listing_inspection_times').delete().eq('id', id)
    setInspectionTimes((prev) => prev.filter((t) => t.id !== id))
  }

  async function toggleSlotCancelled(slot: InspectionTime) {
    const { data } = await supabase
      .from('listing_inspection_times')
      .update({ is_cancelled: !slot.is_cancelled })
      .eq('id', slot.id)
      .select('*')
      .single()
    if (data) setInspectionTimes((prev) => prev.map((t) => t.id === slot.id ? data : t))
  }

  // ── Image upload ─────────────────────────────────────────────────────────────
  async function handleImageFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadingImages(true)
    setSaveError(null)
    try {
      const newUrls: string[] = []
      for (const file of Array.from(files)) {
        const path = storagePath('listings', file.name)
        const url = await uploadFile('listing-images', path, file)
        newUrls.push(url)
      }
      setForm((prev) => ({ ...prev, images: [...(prev.images ?? []), ...newUrls] }))
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setUploadingImages(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  function removeImage(idx: number) {
    setForm((prev) => ({ ...prev, images: (prev.images ?? []).filter((_, i) => i !== idx) }))
  }

  // ── Brochure upload ───────────────────────────────────────────────────────────
  async function handleBrochureFile(file: File | null) {
    if (!file) return
    setUploadingBrochure(true)
    setSaveError(null)
    try {
      const path = storagePath('brochures', file.name)
      const url = await uploadFile('listing-brochures', path, file)
      setForm((prev) => ({ ...prev, brochure_url: url }))
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Brochure upload failed')
    } finally {
      setUploadingBrochure(false)
      if (brochureInputRef.current) brochureInputRef.current.value = ''
    }
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  async function save() {
    setSaveError(null)
    setSaving(true)
    const slug = form.slug || toSlug(form.title)
    const payload = {
      ...form,
      slug,
      suburb_slug: form.suburb_slug || toSlug(form.suburb ?? ''),
      listing_slug: form.listing_slug || slug,
    }
    try {
      if (editId) {
        const { error } = await supabase.from('listings').update(payload).eq('id', editId)
        if (error) { setSaveError(error.message); return }
      } else {
        const { error } = await supabase.from('listings').insert(payload)
        if (error) { setSaveError(error.message); return }
      }
      setView('list')
      refresh()
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(row: Listing) {
    await supabase.from('listings').update({ is_published: !row.is_published }).eq('id', row.id)
    refresh()
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-medium">Listings</h1>
          <button type="button" onClick={openNew} className="bg-amber-700 px-4 py-2 text-sm text-white">
            + New listing
          </button>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={cn(t.select, 'px-3 py-1.5 text-sm')}
        >
          <option value="">All categories</option>
          {LISTING_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        {loading ? (
          <p className={t.textMuted}>Loading…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((row) => (
              <div key={row.id} className={t.panel}>
                {row.images?.[0] && (
                  <img src={row.images[0]} alt={row.title} className="h-36 w-full rounded-t-lg object-cover" />
                )}
                <div className="p-4">
                  <p className="font-medium">{row.title}</p>
                  <p className={cn('mt-0.5 text-xs capitalize', t.textMuted)}>
                    {LISTING_CATEGORIES.find((c) => c.value === row.category)?.label ?? row.category}
                    {' · '}
                    {row.status?.replace(/_/g, ' ')}
                  </p>
                  {row.suburb && <p className={cn('mt-0.5 text-xs', t.textMuted)}>{row.suburb}</p>}
                  {row.images?.length > 0 && (
                    <p className={cn('mt-0.5 text-xs', t.textMuted)}>{row.images.length} image{row.images.length !== 1 ? 's' : ''}</p>
                  )}
                  {row.brochure_url && (
                    <p className="mt-0.5 text-xs text-amber-500">Brochure attached</p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    <button type="button" onClick={() => openEdit(row)} className="text-xs text-amber-500 hover:underline">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePublish(row)}
                      className={cn('text-xs', t.textMuted, 'hover:text-amber-400')}
                    >
                      {row.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <span className={cn(
                      'ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                      row.is_published ? 'bg-emerald-900/50 text-emerald-400' : 'bg-zinc-800 text-zinc-500',
                    )}>
                      {row.is_published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FORM VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={closeForm}
          className={cn('flex items-center gap-1.5 text-sm', t.textMuted, 'hover:text-amber-400')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Listings
        </button>
        <span className={t.textDim}>/</span>
        <h1 className="text-2xl font-medium">{editId ? (form.title || 'Edit listing') : 'New listing'}</h1>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6">

          {/* ─ Core Details ─ */}
          <div className={cn(t.panel, 'p-5')}>
            <SectionHeading
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M4 6h8M4 9h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>}
              title="Project Details"
            />
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Project Title</Label>
                  <input
                    placeholder="e.g. Aurora Tower"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <input
                    placeholder="auto-generated from title"
                    value={form.slug ?? ''}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Phase</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as ListingCategory })}
                    className={inputClass}
                  >
                    {LISTING_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Status</Label>
                  <select
                    value={form.status ?? 'available'}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ListingStatus })}
                    className={inputClass}
                  >
                    {LISTING_STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(form.category === 'project' || form.category === 'buy') && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Completion Date</Label>
                    <input
                      type="date"
                      value={form.completion_date ?? ''}
                      onChange={(e) => setForm({ ...form, completion_date: e.target.value || null })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <Label>Project Phase</Label>
                    <input
                      placeholder="e.g. Under construction"
                      value={form.project_phase ?? ''}
                      onChange={(e) => setForm({ ...form, project_phase: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─ Location & Price ─ */}
          <div className={cn(t.panel, 'p-5')}>
            <SectionHeading
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6c0-2.485-2.015-4.5-4.5-4.5Z" stroke="currentColor" strokeWidth="1.4"/></svg>}
              title="Location & Pricing"
            />
            <div className="space-y-4">
              <div>
                <Label>Location</Label>
                <input
                  placeholder="e.g. Suburb, City"
                  value={form.suburb ?? ''}
                  onChange={(e) => setForm({ ...form, suburb: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <Label>Full Address</Label>
                <input
                  placeholder="e.g. 123 City Rd, Southbank VIC 3006"
                  value={form.address ?? ''}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Starting Price ($)</Label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.price_min ?? 0}
                    onChange={(e) => setForm({ ...form, price_min: Number(e.target.value) || null })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label>Price Display</Label>
                  <input
                    placeholder="e.g. From $650,000"
                    value={form.price_display ?? ''}
                    onChange={(e) => setForm({ ...form, price_display: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─ Content ─ */}
          <div className={cn(t.panel, 'p-5')}>
            <SectionHeading
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h12M2 6h9M2 9h12M2 12h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>}
              title="Content"
            />
            <div className="space-y-4">
              <div>
                <Label>Headline</Label>
                <textarea
                  placeholder="Short attention-grabbing headline"
                  value={form.headline ?? ''}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                  className={inputClass}
                  rows={2}
                />
              </div>
              <div>
                <Label>Description</Label>
                <textarea
                  placeholder="Full property description (HTML supported)"
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClass}
                  rows={6}
                />
              </div>
              <div>
                <Label>Developer <span className={cn('ml-1 font-normal normal-case tracking-normal', t.textMuted)}>(optional)</span></Label>
                <input
                  placeholder="e.g. Lendlease"
                  value={form.developer ?? ''}
                  onChange={(e) => setForm({ ...form, developer: e.target.value || null })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* ─ Key Features ─ */}
          <div className={cn(t.panel, 'p-5')}>
            <SectionHeading
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h7M3 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="13" cy="12" r="2" stroke="currentColor" strokeWidth="1.4"/></svg>}
              title="Key Features"
              subtitle="Bullet points shown on the property page"
            />
            <div className="space-y-2">
              {(form.key_features ?? []).map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={feat}
                    onChange={(e) => {
                      const updated = [...(form.key_features ?? [])]
                      updated[idx] = e.target.value
                      setForm({ ...form, key_features: updated })
                    }}
                    className={cn(inputClass, 'flex-1')}
                    placeholder={`Feature ${idx + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (form.key_features ?? []).filter((_, i) => i !== idx)
                      setForm({ ...form, key_features: updated })
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
                    aria-label="Remove feature"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm({ ...form, key_features: [...(form.key_features ?? []), ''] })}
                className="mt-1 flex items-center gap-1.5 text-xs text-amber-500 hover:underline"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Add feature
              </button>
            </div>
          </div>

          {/* ─ Amenities ─ */}
          <div className={cn(t.panel, 'p-5')}>
            <SectionHeading
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>}
              title="Amenities"
              subtitle="Facilities and features of the development"
            />
            <div className="space-y-2">
              {(form.amenities ?? []).map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={amenity}
                    onChange={(e) => {
                      const updated = [...(form.amenities ?? [])]
                      updated[idx] = e.target.value
                      setForm({ ...form, amenities: updated })
                    }}
                    className={cn(inputClass, 'flex-1')}
                    placeholder={`Amenity ${idx + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (form.amenities ?? []).filter((_, i) => i !== idx)
                      setForm({ ...form, amenities: updated })
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
                    aria-label="Remove amenity"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm({ ...form, amenities: [...(form.amenities ?? []), ''] })}
                className="mt-1 flex items-center gap-1.5 text-xs text-amber-500 hover:underline"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Add amenity
              </button>
            </div>
          </div>

          {/* ─ Video ─ */}
          <div className={cn(t.panel, 'p-5')}>
            <SectionHeading
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="3" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M11 6.5l4-2v7l-4-2V6.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                </svg>
              }
              title="Video URL"
              subtitle="YouTube or Instagram"
            />
            <input
              type="url"
              placeholder="e.g. https://www.youtube.com/watch?v=..."
              value={form.video_url ?? ''}
              onChange={(e) => setForm({ ...form, video_url: e.target.value || null })}
              className={inputClass}
            />
            <p className={cn('mt-1.5 text-xs', t.textMuted)}>Showcase this project with a video link.</p>
          </div>

          {/* ─ SEO & URL Slugs ─ */}
          <div className={cn(t.panel, 'p-5')}>
            <SectionHeading
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.536 3.536 0 0 0-5-5L7.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.536 3.536 0 0 0 5 5L8.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              }
              title="SEO & URL Slugs"
              subtitle="Control the URL structure for this project. Auto-fills but fully editable."
            />
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>City Slug</Label>
                  <input
                    placeholder="e.g. melbourne"
                    value={form.city_slug ?? ''}
                    onChange={(e) => setForm({ ...form, city_slug: e.target.value })}
                    className={cn(inputClass, 'font-mono text-xs')}
                  />
                </div>
                <div>
                  <Label>Suburb Slug</Label>
                  <input
                    placeholder="e.g. southbank"
                    value={form.suburb_slug ?? ''}
                    onChange={(e) => setForm({ ...form, suburb_slug: e.target.value })}
                    className={cn(inputClass, 'font-mono text-xs')}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Property Type</Label>
                  <select
                    value={form.type_slug ?? ''}
                    onChange={(e) => setForm({ ...form, type_slug: e.target.value || null })}
                    className={inputClass}
                  >
                    <option value="">Select type…</option>
                    {TYPE_SLUGS.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Listing Slug</Label>
                  <div className="flex gap-2">
                    <input
                      placeholder="e.g. aurora-tower"
                      value={form.listing_slug ?? ''}
                      onChange={(e) => setForm({ ...form, listing_slug: e.target.value })}
                      className={cn(inputClass, 'font-mono text-xs flex-1')}
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={autoFillSlug}
                className="flex items-center gap-1.5 text-xs text-amber-500 hover:underline"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Auto-fill from Title
              </button>
              {liveUrl && (
                <div className={cn('rounded border px-3 py-2 font-mono text-xs', t.textMuted, t.panelBorder)}>
                  /{liveUrl}
                </div>
              )}
              {!liveUrl && (
                <div className={cn('rounded border px-3 py-2 text-xs italic', t.textMuted, t.panelBorder)}>
                  Fill in all slug fields above to see the live URL preview.
                </div>
              )}
            </div>
          </div>

          {/* ─ Auction ─ */}
          <div className={cn(t.panel, 'p-5')}>
            <SectionHeading
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 13l4-4M2 8l6-6 4 4-6 6-4-4Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              }
              title="Auction"
              subtitle="Leave blank if no auction is scheduled"
            />
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Auction Date & Time</Label>
                  <input
                    type="datetime-local"
                    value={form.auction_at ? form.auction_at.slice(0, 16) : ''}
                    onChange={(e) => setForm({ ...form, auction_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label>Auction Location</Label>
                  <input
                    placeholder="e.g. On-site or auction rooms address"
                    value={form.auction_location ?? ''}
                    onChange={(e) => setForm({ ...form, auction_location: e.target.value || null })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <Label>Auction Notes</Label>
                <textarea
                  placeholder="e.g. Subject to prior sale, register by 5pm the day before…"
                  value={form.auction_notes ?? ''}
                  onChange={(e) => setForm({ ...form, auction_notes: e.target.value || null })}
                  className={inputClass}
                  rows={2}
                />
              </div>
              {form.auction_at && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.auction_cancelled ?? false}
                    onChange={(e) => setForm({ ...form, auction_cancelled: e.target.checked })}
                    className="rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500"
                  />
                  <span className={cn('text-xs', t.textMuted)}>Mark auction as cancelled</span>
                </label>
              )}
            </div>
          </div>

          {/* ─ Open Inspection Times ─ */}
          <div className={cn(t.panel, 'p-5')}>
            <SectionHeading
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="2" width="14" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M5 1v2M11 1v2M1 6h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
                </svg>
              }
              title="Open Inspection Times"
              subtitle={editId ? 'Add scheduled open home slots for this listing' : 'Save the listing first, then add inspection times'}
            />

            {/* Existing slots */}
            {inspectionTimes.length > 0 && (
              <div className="mb-4 space-y-1">
                {inspectionTimes.map((slot) => (
                  <div key={slot.id} className={cn('flex items-center justify-between gap-3 rounded px-3 py-2 text-sm', t.panelBorder, 'border', slot.is_cancelled ? 'opacity-50' : '')}>
                    <div>
                      <span className={t.textSecondary}>
                        {new Date(slot.starts_at).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {' '}
                        {new Date(slot.starts_at).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        {' – '}
                        {new Date(slot.ends_at).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </span>
                      {slot.notes && <span className={cn('ml-2 text-xs', t.textMuted)}>· {slot.notes}</span>}
                      {slot.is_cancelled && <span className="ml-2 text-xs text-red-400">cancelled</span>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleSlotCancelled(slot)}
                        className={cn('text-xs', t.textMuted, 'hover:text-amber-400')}
                      >
                        {slot.is_cancelled ? 'Restore' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeInspectionSlot(slot.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {inspectionTimes.length === 0 && editId && (
              <p className={cn('text-xs mb-4', t.textMuted)}>No inspection times added yet.</p>
            )}

            {/* Add new slot */}
            {editId && (
              <>
                {!addingSlot ? (
                  <button
                    type="button"
                    onClick={() => setAddingSlot(true)}
                    className="flex items-center gap-1.5 text-xs text-amber-500 hover:underline"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    Add inspection time
                  </button>
                ) : (
                  <div className={cn('rounded border p-4 space-y-3', t.panelBorder)}>
                    <p className={cn('text-xs font-medium', t.textSecondary)}>New Inspection Slot</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label>Start</Label>
                        <input
                          type="datetime-local"
                          value={newSlotStart}
                          onChange={(e) => setNewSlotStart(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <Label>End</Label>
                        <input
                          type="datetime-local"
                          value={newSlotEnd}
                          onChange={(e) => setNewSlotEnd(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Notes (optional)</Label>
                      <input
                        placeholder="e.g. Use rear entrance"
                        value={newSlotNotes}
                        onChange={(e) => setNewSlotNotes(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    {slotError && <p className="text-xs text-red-400">{slotError}</p>}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setAddingSlot(false); setSlotError(null) }}
                        className={cn('px-3 py-1.5 text-xs', t.textMuted, 'border border-zinc-700 rounded hover:text-zinc-300')}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={addInspectionSlot}
                        className="px-3 py-1.5 text-xs bg-amber-700 text-white rounded hover:bg-amber-600"
                      >
                        Save slot
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {!editId && (
              <p className={cn('text-xs italic', t.textMuted)}>
                Save this listing first, then re-open it to add inspection times.
              </p>
            )}
          </div>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-6">

          {/* ─ Register Interest ─ */}
          <div className={cn(t.panel, 'p-5')}>
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Register Interest</p>
                <p className={cn('text-xs', t.textMuted)}>Show &ldquo;Register Interest&rdquo; form on this listing</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.register_interest_enabled ?? true}
                  onChange={(e) => setForm({ ...form, register_interest_enabled: e.target.checked })}
                  className="sr-only"
                />
                <div className={cn('h-6 w-11 rounded-full transition-colors', form.register_interest_enabled ? 'bg-amber-600' : 'bg-zinc-700')} />
                <div className={cn('absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', form.register_interest_enabled ? 'translate-x-5' : 'translate-x-0')} />
              </div>
            </label>
          </div>

          {/* ─ Project Images ─ */}
          <div className={cn(t.panel, 'p-5')}>
            <Label>Project Images</Label>
            {(form.images ?? []).length > 0 ? (
              <div className="mb-3 grid grid-cols-2 gap-2">
                {(form.images ?? []).map((url, idx) => (
                  <div key={idx} className="relative">
                    <img src={url} alt={`Image ${idx + 1}`} className="h-24 w-full rounded object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600/90 text-[10px] text-white leading-none"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => handleImageFiles(e.target.files)}
            />
            <button
              type="button"
              disabled={uploadingImages}
              onClick={() => imageInputRef.current?.click()}
              className={cn(
                'flex w-full flex-col items-center justify-center gap-2 rounded border-2 border-dashed py-6',
                'border-zinc-700 text-zinc-500 hover:border-amber-600/60 hover:text-amber-500',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              {uploadingImages ? (
                <span className="text-xs">Uploading…</span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3v10M5 8l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 17h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <span className="text-xs font-medium uppercase tracking-wider">Add Media</span>
                </>
              )}
            </button>
          </div>

          {/* ─ Project Brochure ─ */}
          <div className={cn(t.panel, 'p-5')}>
            <Label>Project Brochure (PDF or Link)</Label>
            <div className="space-y-3">
              <div>
                <p className={cn('mb-1.5 text-xs font-medium', t.textSecondary)}>Option 1: External URL</p>
                <input
                  type="url"
                  placeholder="https://dropbox.com/… or https://drive.google.com/…"
                  value={form.brochure_url?.startsWith('http') ? (form.brochure_url ?? '') : ''}
                  onChange={(e) => setForm({ ...form, brochure_url: e.target.value || null })}
                  className={inputClass}
                />
              </div>
              <div className={cn('flex items-center gap-3 text-xs', t.textMuted)}>
                <div className="h-px flex-1 bg-zinc-800" />
                OR
                <div className="h-px flex-1 bg-zinc-800" />
              </div>
              <div>
                <p className={cn('mb-1.5 text-xs font-medium', t.textSecondary)}>Option 2: PDF File Upload</p>
                <input
                  ref={brochureInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => handleBrochureFile(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  disabled={uploadingBrochure}
                  onClick={() => brochureInputRef.current?.click()}
                  className={cn(
                    'flex w-full flex-col items-center justify-center gap-2 rounded border-2 border-dashed py-5',
                    'border-zinc-700 text-zinc-500 hover:border-amber-600/60 hover:text-amber-500',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                >
                  {uploadingBrochure ? (
                    <span className="text-xs">Uploading…</span>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v9M5 7l4-4 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 15h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                      <span className="text-xs font-medium uppercase tracking-wider">Upload PDF Brochure</span>
                    </>
                  )}
                </button>
                {form.brochure_url && !form.brochure_url.startsWith('http') && (
                  <p className="mt-1.5 truncate text-xs text-amber-500">PDF uploaded ✓</p>
                )}
              </div>
              {form.brochure_url && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, brochure_url: null })}
                  className="text-xs text-red-400 hover:underline"
                >
                  Remove brochure
                </button>
              )}
            </div>
          </div>

          {/* ─ Featured ─ */}
          <div className={cn(t.panel, 'p-5')}>
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Featured</p>
                <p className={cn('text-xs', t.textMuted)}>Highlight this listing across the site</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.featured ?? false}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="sr-only"
                  id="featured-toggle"
                />
                <div
                  className={cn(
                    'h-6 w-11 rounded-full transition-colors',
                    form.featured ? 'bg-amber-600' : 'bg-zinc-700',
                  )}
                />
                <div
                  className={cn(
                    'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    form.featured ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </div>
            </label>
          </div>

          {/* ─ Publish Status ─ */}
          <div className={cn(t.panel, 'p-5')}>
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Publish Status</p>
                <p className={cn('text-xs', t.textMuted)}>Visible to public on the website</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.is_published ?? false}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="sr-only"
                  id="publish-toggle"
                />
                <div
                  className={cn(
                    'h-6 w-11 rounded-full transition-colors',
                    form.is_published ? 'bg-amber-600' : 'bg-zinc-700',
                  )}
                />
                <div
                  className={cn(
                    'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    form.is_published ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </div>
            </label>
          </div>

        </div>
      </div>

      {/* ── Error + Save row ── */}
      {saveError && (
        <div className="rounded bg-red-900/40 px-4 py-3 text-sm text-red-400">{saveError}</div>
      )}
      <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
        <button type="button" onClick={closeForm} className={t.cancelBtnMd}>
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="bg-amber-700 px-6 py-2 text-sm text-white disabled:opacity-60 hover:bg-amber-600"
        >
          {saving ? 'Saving…' : 'Save listing'}
        </button>
      </div>
    </div>
  )
}
