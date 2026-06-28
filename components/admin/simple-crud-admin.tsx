'use client'

import { useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAdminTable } from '@/hooks/use-admin-table'
import { useAdminTheme } from '@/contexts/admin-theme-context'
import { cn } from '@/lib/utils'
import type { Tables } from '@/lib/database.types'

export { BlogAdmin } from './blog-admin'
export { TeamAdmin } from './team-admin'

type TableName =
  | 'blog_posts'
  | 'testimonials'
  | 'team_members'
  | 'documents'
  | 'page_sections'

interface SimpleCrudAdminProps<T extends { id: string }> {
  title: string
  table: TableName
  orderBy?: string
  columns: { key: keyof T; label: string }[]
  renderForm: (form: Partial<T>, setForm: (f: Partial<T>) => void, inputClass: string) => ReactNode
  emptyForm: Partial<T>
  getLabel: (row: T) => string
  publishField?: 'is_published' | 'is_active'
}

export function SimpleCrudAdmin<T extends { id: string }>({
  title,
  table,
  orderBy = 'updated_at',
  columns,
  renderForm,
  emptyForm,
  getLabel,
  publishField = 'is_published',
}: SimpleCrudAdminProps<T>) {
  const { t } = useAdminTheme()
  const { rows, loading, refresh } = useAdminTable<T>(table, orderBy)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<T>>(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const supabase = createClient()

  const inputClass = cn(t.input, 'w-full px-3 py-2 text-sm')

  async function save() {
    if (editId) {
      await supabase.from(table).update(form as never).eq('id', editId)
    } else {
      await supabase.from(table).insert(form as never)
    }
    setOpen(false)
    refresh()
  }

  async function togglePublish(row: T & Record<string, unknown>) {
    await supabase
      .from(table)
      .update({ [publishField]: !row[publishField] } as never)
      .eq('id', row.id)
    refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">{title}</h1>
        <button
          type="button"
          onClick={() => {
            setEditId(null)
            setForm(emptyForm)
            setOpen(true)
          }}
          className="bg-amber-700 px-4 py-2 text-sm text-white"
        >
          + Add
        </button>
      </div>

      {loading ? (
        <p className={t.textMuted}>Loading…</p>
      ) : (
        <div className={t.tableBorder}>
          <table className="w-full text-left text-sm">
            <thead className={t.tableHeader}>
              <tr>
                {columns.map((c) => (
                  <th key={String(c.key)} className="p-3">{c.label}</th>
                ))}
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className={t.tableRow}>
                  {columns.map((c) => (
                    <td key={String(c.key)} className="p-3">
                      {String(row[c.key as keyof T] ?? '—')}
                    </td>
                  ))}
                  <td className="p-3 space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditId(row.id)
                        setForm({ ...row })
                        setOpen(true)
                      }}
                      className="text-xs text-amber-500"
                    >
                      Edit
                    </button>
                    {publishField in row && (
                      <button
                        type="button"
                        onClick={() => togglePublish(row as T & Record<string, unknown>)}
                        className={cn('text-xs', t.textMuted)}
                      >
                        {(row as Record<string, unknown>)[publishField] ? 'Unpublish' : 'Publish'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className={t.modal}>
            <h2 className="text-lg">{editId ? `Edit ${getLabel(form as T)}` : `New ${title.slice(0, -1)}`}</h2>
            <div className="mt-4 space-y-3">{renderForm(form, setForm, inputClass)}</div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className={t.cancelBtnMd}>
                Cancel
              </button>
              <button type="button" onClick={save} className="bg-amber-700 px-4 py-2 text-sm text-white">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


export function TestimonialsAdmin() {
  return (
    <SimpleCrudAdmin<Tables<'testimonials'>>
      title="Testimonials"
      table="testimonials"
      orderBy="display_order"
      columns={[
        { key: 'client_name', label: 'Client' },
        { key: 'suburb', label: 'Suburb' },
        { key: 'is_published', label: 'Published' },
      ]}
      emptyForm={{ client_name: '', quote: '', suburb: '', client_type: 'buyer', is_published: false }}
      getLabel={(r) => r.client_name ?? ''}
      renderForm={(form, setForm, inputClass) => (
        <>
          <input placeholder="Client name" value={form.client_name ?? ''} onChange={(e) => setForm({ ...form, client_name: e.target.value })} className={inputClass} />
          <textarea placeholder="Quote" value={form.quote ?? ''} onChange={(e) => setForm({ ...form, quote: e.target.value })} className={inputClass} rows={3} />
          <input placeholder="Suburb" value={form.suburb ?? ''} onChange={(e) => setForm({ ...form, suburb: e.target.value })} className={inputClass} />
        </>
      )}
    />
  )
}


