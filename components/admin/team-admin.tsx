'use client'

import { useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadFile, storagePath } from '@/lib/storage'
import { useAdminTable } from '@/hooks/use-admin-table'
import { useAdminTheme } from '@/contexts/admin-theme-context'
import { cn } from '@/lib/utils'
import type { Tables } from '@/lib/database.types'

type TeamMember = Tables<'team_members'>

const EMPTY_FORM: Partial<TeamMember> = {
  name: '',
  slug: '',
  role_title: '',
  bio: '',
  email: '',
  phone: '',
  linkedin_url: '',
  avatar_url: '',
  display_order: 0,
  is_published: false,
}

function useTeamStyles() {
  const { t, isDayMode } = useAdminTheme()

  return {
    t,
    isDayMode,
    input: cn(
      t.input,
      'w-full rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-700/60',
      isDayMode ? 'text-[#261c0d] placeholder:text-[#8a7660]' : 'text-zinc-200 placeholder:text-zinc-600',
    ),
    label: cn('mb-1.5 block text-[11px] font-semibold uppercase tracking-widest', t.textMuted),
    modal: cn(t.modal, 'flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl p-0 shadow-2xl'),
    modalBorder: isDayMode ? 'border-[#cfc8b6]' : 'border-zinc-800',
    overlay: isDayMode ? 'bg-black/50' : 'bg-black/70',
    closeBtn: isDayMode ? 'text-[#b0a090] hover:text-[#261c0d]' : 'text-zinc-600 hover:text-zinc-400',
    uploadBtn: isDayMode
      ? 'border-[#cfc8b6] bg-[#f0e9da]/50 hover:border-amber-700/60'
      : 'border-zinc-700 bg-zinc-900 hover:border-amber-700/60',
    uploadIcon: isDayMode ? 'text-[#cfc8b6] group-hover:text-[#8a7660]' : 'text-zinc-700 group-hover:text-zinc-500',
    avatarPlaceholder: isDayMode ? 'bg-[#ddd5c3] text-[#8a7660]' : 'bg-zinc-800 text-zinc-500',
    published: isDayMode ? 'bg-green-100/80 text-green-800' : 'bg-green-900/40 text-green-400',
    draft: isDayMode ? 'bg-[#ddd5c3] text-[#8a7660]' : 'bg-zinc-800 text-zinc-500',
    deleteBtn: isDayMode ? 'text-[#b0a090] hover:text-red-600' : 'text-zinc-700 hover:text-red-400',
    link: 'text-xs text-amber-600 hover:text-amber-500',
  }
}

type TeamStyles = ReturnType<typeof useTeamStyles>

// ─── Avatar upload ────────────────────────────────────────────────────────────

function AvatarUpload({
  value,
  onChange,
  s,
}: {
  value: string
  onChange: (url: string) => void
  s: TeamStyles
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true)
      try {
        const path = storagePath('avatars', file.name)
        const url = await uploadFile('team-photos', path, file)
        onChange(url)
      } catch (err) {
        console.error('Avatar upload failed:', err)
      } finally {
        setUploading(false)
      }
    },
    [onChange],
  )

  return (
    <div className="flex flex-col items-center gap-2">
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
          'group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors',
          s.uploadBtn,
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Avatar preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <svg
            className={cn('h-10 w-10 transition-colors', s.uploadIcon)}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
            <span className={cn('text-xs', s.t.textSecondary)}>Uploading…</span>
          </div>
        )}
      </button>
      <p className={cn('text-[11px]', s.t.textDim)}>
        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="transition-colors hover:text-red-500"
          >
            Remove photo
          </button>
        ) : (
          'Click to upload photo'
        )}
      </p>
    </div>
  )
}

// ─── Member modal ─────────────────────────────────────────────────────────────

function MemberModal({
  member,
  onClose,
  onSaved,
  s,
}: {
  member: Partial<TeamMember> | null
  onClose: () => void
  onSaved: () => void
  s: TeamStyles
}) {
  const supabase = createClient()
  const isEditing = Boolean(member?.id)

  const [form, setForm] = useState<Partial<TeamMember>>(
    member ?? { ...EMPTY_FORM },
  )
  const [saving, setSaving] = useState(false)

  const set = (field: keyof TeamMember) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  // Auto-generate slug from name
  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
    setForm((prev) => ({
      ...prev,
      name,
      slug: !isEditing ? slug : prev.slug,
    }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        ...form,
        display_order: Number(form.display_order ?? 0),
      }
      if (isEditing) {
        await supabase.from('team_members').update(payload as never).eq('id', member!.id!)
      } else {
        await supabase.from('team_members').insert(payload as never)
      }
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center p-4', s.overlay)}>
      <div className={s.modal}>

        {/* Header */}
        <div className={cn('flex shrink-0 items-start justify-between border-b px-6 py-5', s.modalBorder)}>
          <div>
            <h2 className="text-lg font-semibold">
              {isEditing ? `Edit ${form.name || 'Member'}` : 'New Team Member'}
            </h2>
            <p className={cn('mt-0.5 text-sm', s.t.textMuted)}>
              {isEditing ? 'Update team member profile' : 'Add a new member to the team'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn('transition-colors', s.closeBtn)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Avatar */}
          <AvatarUpload
            value={form.avatar_url ?? ''}
            onChange={(url) => setForm((prev) => ({ ...prev, avatar_url: url }))}
            s={s}
          />

          {/* Two-column grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={s.label}>Full Name</label>
              <input
                placeholder="e.g. Sarah Johnson"
                value={form.name ?? ''}
                onChange={onNameChange}
                className={s.input}
              />
            </div>
            <div>
              <label className={s.label}>Job Title / Role</label>
              <input
                placeholder="e.g. Senior Agent"
                value={form.role_title ?? ''}
                onChange={set('role_title')}
                className={s.input}
              />
            </div>

            <div>
              <label className={s.label}>Email Address</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={form.email ?? ''}
                onChange={set('email')}
                className={s.input}
              />
            </div>
            <div>
              <label className={s.label}>Phone Number</label>
              <input
                type="tel"
                placeholder="+61 4XX XXX XXX"
                value={form.phone ?? ''}
                onChange={set('phone')}
                className={s.input}
              />
            </div>

            <div>
              <label className={s.label}>LinkedIn URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/…"
                value={form.linkedin_url ?? ''}
                onChange={set('linkedin_url')}
                className={s.input}
              />
            </div>
            <div>
              <label className={s.label}>Display Order</label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={form.display_order ?? 0}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    display_order: Number(e.target.value),
                  }))
                }
                className={s.input}
              />
            </div>
          </div>

          {/* Bio — full width */}
          <div>
            <label className={s.label}>Professional Bio / Description</label>
            <textarea
              placeholder="Write a short professional bio…"
              value={form.bio ?? ''}
              onChange={set('bio')}
              rows={5}
              className={s.input}
            />
          </div>

          {/* Slug (collapsed) */}
          <details className="group">
            <summary
              className={cn(
                'cursor-pointer select-none text-[11px] font-semibold uppercase tracking-widest transition-colors hover:opacity-80',
                s.t.textDim,
              )}
            >
              Advanced ▸
            </summary>
            <div className="mt-3 space-y-3">
              <div>
                <label className={s.label}>URL Slug</label>
                <input
                  placeholder="sarah-johnson"
                  value={form.slug ?? ''}
                  onChange={set('slug')}
                  className={s.input}
                />
              </div>
            </div>
          </details>
        </div>

        {/* Footer */}
        <div className={cn('flex shrink-0 items-center justify-end gap-3 border-t px-6 py-4', s.modalBorder)}>
          <button
            type="button"
            onClick={onClose}
            className={cn('px-4 py-2 text-sm uppercase tracking-wider transition-colors', s.t.cancelBtn)}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-amber-700 px-6 py-2.5 text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
          >
            {!saving && (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main TeamAdmin ───────────────────────────────────────────────────────────

export function TeamAdmin() {
  const s = useTeamStyles()
  const { t } = s
  const { rows, loading, refresh } = useAdminTable<TeamMember>(
    'team_members',
    'display_order',
  )
  const supabase = createClient()

  const [modalMember, setModalMember] = useState<Partial<TeamMember> | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  function openNew() {
    setModalMember(null)
    setModalOpen(true)
  }

  function openEdit(row: TeamMember) {
    setModalMember({ ...row })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setModalMember(null)
  }

  function onSaved() {
    closeModal()
    refresh()
  }

  async function togglePublish(row: TeamMember) {
    await supabase
      .from('team_members')
      .update({ is_published: !row.is_published } as never)
      .eq('id', row.id)
    refresh()
  }

  async function deleteMember(row: TeamMember) {
    if (!window.confirm(`Remove "${row.name}" from the team? This cannot be undone.`)) return
    await supabase.from('team_members').delete().eq('id', row.id)
    refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Team</h1>
        <button
          type="button"
          onClick={openNew}
          className="bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
        >
          + Add Member
        </button>
      </div>

      {loading ? (
        <p className={t.textMuted}>Loading…</p>
      ) : (
        <div className={t.tableBorder}>
          <table className="w-full text-left text-sm">
            <thead className={t.tableHeader}>
              <tr>
                <th className="p-3">Member</th>
                <th className="p-3">Role</th>
                <th className="p-3">Order</th>
                <th className="p-3">Published</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className={t.tableRow}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {row.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.avatar_url}
                          alt={row.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full text-xs',
                            s.avatarPlaceholder,
                          )}
                        >
                          {row.name?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                      )}
                      <span className="font-medium">{row.name}</span>
                    </div>
                  </td>
                  <td className={cn('p-3', t.textSecondary)}>{row.role_title ?? '—'}</td>
                  <td className={cn('p-3', t.textMuted)}>{row.display_order}</td>
                  <td className="p-3">
                    <span
                      className={cn(
                        'rounded px-2 py-0.5 text-xs font-medium',
                        row.is_published ? s.published : s.draft,
                      )}
                    >
                      {row.is_published ? 'Live' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-3 space-x-3">
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className={s.link}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePublish(row)}
                      className={cn('text-xs hover:opacity-80', t.textMuted)}
                    >
                      {row.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMember(row)}
                      className={s.deleteBtn}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className={cn('p-6 text-center', t.textMuted)}>
                    No team members yet — add your first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <MemberModal
          member={modalMember}
          onClose={closeModal}
          onSaved={onSaved}
          s={s}
        />
      )}
    </div>
  )
}
