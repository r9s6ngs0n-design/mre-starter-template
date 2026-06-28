'use client'

import { useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadFile, storagePath } from '@/lib/storage'
import { useAdminTable } from '@/hooks/use-admin-table'
import { useAdminTheme } from '@/contexts/admin-theme-context'
import { RichTextEditor } from '@/components/admin/rich-text-editor'
import { cn } from '@/lib/utils'
import type { Tables } from '@/lib/database.types'

// ─── Types ───────────────────────────────────────────────────────────────────

type BlogPost = Tables<'blog_posts'>

interface FaqItem {
  question: string
  answer: string
}

const CATEGORIES = [
  { value: 'MARKET', label: 'Market Insights' },
  { value: 'INVESTMENT', label: 'Investment' },
  { value: 'PROJECT', label: 'Project Update' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'LIFESTYLE', label: 'Lifestyle' },
]

const EMPTY_FORM: Partial<BlogPost> = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  category: 'MARKET',
  read_time: 5,
  cover_image: '',
  is_published: false,
  seo_title: '',
  seo_description: '',
  faqs: [],
}

// ─── Cover image upload ───────────────────────────────────────────────────────

function CoverImageUpload({
  value,
  onChange,
  dayMode,
}: {
  value: string
  onChange: (url: string) => void
  dayMode: boolean
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true)
      try {
        const path = storagePath('covers', file.name)
        const url = await uploadFile('blog-covers', path, file)
        onChange(url)
      } catch (err) {
        console.error('Upload failed:', err)
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
        className={cn(
          'relative flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-6 text-center transition-colors hover:border-amber-700/60',
          dayMode ? 'border-[#cfc8b6]' : 'border-zinc-700',
        )}
        disabled={uploading}
      >
        {value ? (
           
          <img
            src={value}
            alt="Cover preview"
            className="h-24 w-full rounded object-cover"
          />
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-700/40 bg-amber-900/20">
              <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <span className={cn('text-sm font-medium', dayMode ? 'text-[#261c0d]' : 'text-zinc-300')}>
              {uploading ? 'Uploading…' : 'Click to upload cover'}
            </span>
            <span className={cn('text-[10px] uppercase tracking-wider', dayMode ? 'text-[#8a7660]' : 'text-zinc-600')}>
              Suggested: 1200×630 (1.91:1)
            </span>
          </>
        )}
      </button>
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className={cn('mt-1 text-xs hover:text-red-400', dayMode ? 'text-[#8a7660]' : 'text-zinc-600')}
        >
          Remove image
        </button>
      )}
    </div>
  )
}

// ─── FAQ editor ───────────────────────────────────────────────────────────────

function FaqEditor({
  faqs,
  onChange,
  dayMode,
}: {
  faqs: FaqItem[]
  onChange: (faqs: FaqItem[]) => void
  dayMode: boolean
}) {
  const add = () => onChange([...faqs, { question: '', answer: '' }])
  const remove = (i: number) => onChange(faqs.filter((_, idx) => idx !== i))
  const update = (i: number, field: keyof FaqItem, val: string) => {
    const next = [...faqs]
    next[i] = { ...next[i], [field]: val }
    onChange(next)
  }

  const labelCls = cn(
    'text-[11px] font-semibold uppercase tracking-widest',
    dayMode ? 'text-[#8a7660]' : 'text-zinc-500',
  )
  const inputCls = cn(
    'w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1',
    dayMode
      ? 'border-[#cfc8b6] bg-[#f0e9da] text-[#261c0d] placeholder:text-[#8a7660] focus:ring-amber-700/60'
      : 'border-zinc-700 bg-zinc-900 text-zinc-200 placeholder:text-zinc-600 focus:ring-zinc-500',
  )
  const cardCls = cn(
    'space-y-2 rounded-lg border p-3',
    dayMode ? 'border-[#cfc8b6] bg-[#f0e9da]/60' : 'border-zinc-800 bg-zinc-900/60',
  )
  const emptyCls = cn(
    'rounded-lg border p-4',
    dayMode ? 'border-[#cfc8b6] bg-[#f0e9da]/40' : 'border-zinc-800 bg-zinc-900/40',
  )
  const disabledInputCls = cn(
    'w-full rounded border px-3 py-2 text-sm',
    dayMode
      ? 'border-[#ddd5c3] bg-[#e9e2d4]/60 text-[#b0a090] placeholder:text-[#cfc8b6]'
      : 'border-zinc-800 bg-zinc-900/60 text-zinc-600 placeholder:text-zinc-700',
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className={labelCls}>
          Frequently Asked Questions
        </span>
        <button
          type="button"
          onClick={add}
          className={cn(
            'flex items-center gap-1 rounded border px-3 py-1 text-xs transition-colors hover:border-amber-700/60 hover:text-amber-500',
            dayMode ? 'border-[#cfc8b6] text-[#8a7660]' : 'border-zinc-700 text-zinc-400',
          )}
        >
          + Add FAQ
        </button>
      </div>

      {faqs.map((faq, i) => (
        <div key={i} className={cardCls}>
          <input
            placeholder="Question…"
            value={faq.question}
            onChange={(e) => update(i, 'question', e.target.value)}
            className={inputCls}
          />
          <textarea
            placeholder="Answer…"
            value={faq.answer}
            onChange={(e) => update(i, 'answer', e.target.value)}
            rows={3}
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className={cn('text-xs hover:text-red-400', dayMode ? 'text-[#8a7660]' : 'text-zinc-600')}
          >
            Remove
          </button>
        </div>
      ))}

      {faqs.length === 0 && (
        <div className={emptyCls}>
          <div className="space-y-2">
            <input
              disabled
              placeholder="Question…"
              className={disabledInputCls}
            />
            <textarea
              disabled
              placeholder="Answer…"
              rows={2}
              className={disabledInputCls}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Post modal ───────────────────────────────────────────────────────────────

function PostModal({
  post,
  onClose,
  onSaved,
}: {
  post: Partial<BlogPost> | null
  onClose: () => void
  onSaved: () => void
}) {
  const { isDayMode } = useAdminTheme()
  const supabase = createClient()
  const isEditing = Boolean(post?.id)

  const [form, setForm] = useState<Partial<BlogPost>>(
    post ?? { ...EMPTY_FORM },
  )
  const [saving, setSaving] = useState(false)

  const faqs: FaqItem[] = Array.isArray(form.faqs)
    ? (form.faqs as unknown as FaqItem[])
    : []

  const setFaqs = (items: FaqItem[]) =>
    setForm((f) => ({ ...f, faqs: items as unknown as BlogPost['faqs'] }))

  const f = (field: keyof BlogPost) => ({
    value: (form[field] as string | number | undefined) ?? '',
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => setForm((prev) => ({ ...prev, [field]: e.target.value })),
  })

  // Auto-generate slug from title
  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug && !isEditing ? prev.slug : slug,
    }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = { ...form }

      if (payload.is_published && !payload.published_at) {
        payload.published_at = new Date().toISOString()
      }
      if (!payload.is_published) {
        payload.published_at = null as unknown as string
      }

      // Convert read_time to int
      if (payload.read_time) {
        payload.read_time = Number(payload.read_time)
      }

      if (isEditing) {
        await supabase.from('blog_posts').update(payload as never).eq('id', post!.id!)
      } else {
        await supabase.from('blog_posts').insert(payload as never)
      }
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  const inputCls = cn(
    'w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-700/60',
    isDayMode
      ? 'border-[#cfc8b6] bg-[#f0e9da] text-[#261c0d] placeholder:text-[#8a7660]'
      : 'border-zinc-700 bg-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:ring-zinc-600',
  )
  const labelCls = cn(
    'mb-1 block text-[11px] font-semibold uppercase tracking-widest',
    isDayMode ? 'text-[#8a7660]' : 'text-zinc-500',
  )

  return (
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center p-4', isDayMode ? 'bg-black/50' : 'bg-black/80')}>
      <div className={cn(
        'flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border shadow-2xl',
        isDayMode ? 'border-[#cfc8b6] bg-[#f0e9da]' : 'border-zinc-800 bg-zinc-950',
      )}>

        {/* Header */}
        <div className={cn('flex shrink-0 items-start justify-between border-b px-6 py-5', isDayMode ? 'border-[#cfc8b6]' : 'border-zinc-800')}>
          <div>
            <h2 className={cn('text-lg font-semibold', isDayMode ? 'text-[#261c0d]' : 'text-zinc-100')}>
              {isEditing ? 'Edit Post' : 'Create New Post'}
            </h2>
            <p className={cn('mt-0.5 text-sm', isDayMode ? 'text-[#8a7660]' : 'text-zinc-500')}>
              Compose your message for the community
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn('transition-colors', isDayMode ? 'text-[#b0a090] hover:text-[#261c0d]' : 'text-zinc-600 hover:text-zinc-400')}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Left panel — metadata */}
          <div className={cn('flex w-80 shrink-0 flex-col gap-5 overflow-y-auto border-r p-6', isDayMode ? 'border-[#cfc8b6]' : 'border-zinc-800')}>
            <div>
              <label className={labelCls}>Title</label>
              <input
                placeholder="e.g. A headline for your article"
                value={form.title ?? ''}
                onChange={onTitleChange}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Slug</label>
              <input
                placeholder="article-slug"
                {...f('slug')}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Category</label>
              <select
                value={form.category ?? 'MARKET'}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value }))
                }
                className={inputCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Read Time</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={60}
                  placeholder="5"
                  value={form.read_time ?? ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      read_time: Number(e.target.value),
                    }))
                  }
                  className={cn(inputCls, 'w-20')}
                />
                <span className={cn('text-sm', isDayMode ? 'text-[#8a7660]' : 'text-zinc-500')}>min read</span>
              </div>
            </div>

            <div>
              <label className={labelCls}>Cover Image</label>
              <CoverImageUpload
                value={form.cover_image ?? ''}
                onChange={(url) =>
                  setForm((prev) => ({ ...prev, cover_image: url }))
                }
                dayMode={isDayMode}
              />
            </div>

            <div>
              <label className={labelCls}>Excerpt</label>
              <textarea
                placeholder="Brief summary shown in article listings…"
                value={form.excerpt ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, excerpt: e.target.value }))
                }
                rows={3}
                className={inputCls}
              />
            </div>

            <div className="mt-auto">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.is_published ?? false}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      is_published: e.target.checked,
                    }))
                  }
                  className={cn('h-4 w-4 rounded accent-amber-600', isDayMode ? 'border-[#cfc8b6] bg-[#f0e9da]' : 'border-zinc-600 bg-zinc-800')}
                />
                <span className={cn('text-sm', isDayMode ? 'text-[#261c0d]' : 'text-zinc-300')}>Publish immediately</span>
              </label>
            </div>
          </div>

          {/* Right panel — content + FAQs */}
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
            <div className="flex-1">
              <label className={labelCls}>Content</label>
              <RichTextEditor
                size="large"
                value={form.body ?? ''}
                onChange={(html) =>
                  setForm((prev) => ({ ...prev, body: html }))
                }
                dayMode={isDayMode}
              />
            </div>

            <FaqEditor faqs={faqs} onChange={setFaqs} dayMode={isDayMode} />

            {/* SEO (collapsed section) */}
            <details className="group">
              <summary className={cn(
                'cursor-pointer select-none text-[11px] font-semibold uppercase tracking-widest',
                isDayMode ? 'text-[#8a7660] hover:text-[#261c0d]' : 'text-zinc-600 hover:text-zinc-400',
              )}>
                SEO Settings ▸
              </summary>
              <div className="mt-3 space-y-3">
                <input
                  placeholder="SEO title"
                  {...f('seo_title')}
                  className={inputCls}
                />
                <input
                  placeholder="SEO description"
                  {...f('seo_description')}
                  className={inputCls}
                />
              </div>
            </details>
          </div>
        </div>

        {/* Footer */}
        <div className={cn('flex shrink-0 items-center justify-end gap-3 border-t px-6 py-4', isDayMode ? 'border-[#cfc8b6]' : 'border-zinc-800')}>
          <button
            type="button"
            onClick={onClose}
            className={cn('px-4 py-2 text-sm', isDayMode ? 'text-[#8a7660] hover:text-[#261c0d]' : 'text-zinc-500 hover:text-zinc-300')}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-amber-700 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
          >
            {saving ? 'Saving…' : isEditing ? 'Update Article' : 'Publish Article'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main BlogAdmin ───────────────────────────────────────────────────────────

export function BlogAdmin() {
  const { t } = useAdminTheme()
  const { rows, loading, refresh } = useAdminTable<BlogPost>('blog_posts', 'updated_at')
  const supabase = createClient()

  const [modalPost, setModalPost] = useState<Partial<BlogPost> | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  function openNew() {
    setModalPost(null)
    setModalOpen(true)
  }

  function openEdit(row: BlogPost) {
    setModalPost({ ...row })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setModalPost(null)
  }

  function onSaved() {
    closeModal()
    refresh()
  }

  async function togglePublish(row: BlogPost) {
    const nowPublished = !row.is_published
    await supabase
      .from('blog_posts')
      .update({
        is_published: nowPublished,
        published_at: nowPublished ? new Date().toISOString() : null,
      } as never)
      .eq('id', row.id)
    refresh()
  }

  async function deletePost(row: BlogPost) {
    if (!window.confirm(`Delete "${row.title}"? This cannot be undone.`)) return
    await supabase.from('blog_posts').delete().eq('id', row.id)
    refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Insights</h1>
        <button
          type="button"
          onClick={openNew}
          className="bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
        >
          + New Post
        </button>
      </div>

      {loading ? (
        <p className={t.textMuted}>Loading…</p>
      ) : (
        <div className={t.tableBorder}>
          <table className="w-full text-left text-sm">
            <thead className={t.tableHeader}>
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Published</th>
                <th className="p-3">Updated</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className={t.tableRow}>
                  <td className="max-w-xs truncate p-3 font-medium">
                    {row.title ?? '—'}
                  </td>
                  <td className="p-3">
                    {CATEGORIES.find((c) => c.value === row.category)?.label ??
                      row.category ??
                      '—'}
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        'rounded px-2 py-0.5 text-xs font-medium',
                        row.is_published
                          ? 'bg-green-900/40 text-green-400'
                          : 'bg-zinc-800 text-zinc-500',
                      )}
                    >
                      {row.is_published ? 'Live' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-zinc-500">
                    {row.updated_at
                      ? new Date(row.updated_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="p-3 space-x-3">
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className="text-xs text-amber-500 hover:text-amber-400"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePublish(row)}
                      className="text-xs text-zinc-500 hover:text-zinc-300"
                    >
                      {row.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePost(row)}
                      className="text-xs text-zinc-700 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-zinc-500">
                    No posts yet — create your first insight.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <PostModal
          post={modalPost}
          onClose={closeModal}
          onSaved={onSaved}
        />
      )}
    </div>
  )
}
