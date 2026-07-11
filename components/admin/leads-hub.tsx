'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAdminTheme } from '@/contexts/admin-theme-context'
import { cn } from '@/lib/utils'
import { formatShortDateMelbourne, melbourneDateKey } from '@/lib/datetime'
import type { LeadCategory, Tables } from '@/lib/database.types'
import { useAuth } from '@/contexts/auth-context'

type Lead = Tables<'leads'>
type TeamMember = Tables<'team_members'>
type LeadStatus = Tables<'lead_statuses'>
type ContactStatus = 'new' | 'contacted' | 'closed'

type LeadWithListing = Lead & {
  listings: { slug: string; title: string } | null
}

const INSPECTION_ENQUIRY_TYPES = ['inspection_registration', 'auction_registration']

const CONTACT_STATUS_CONFIG: Record<ContactStatus, { label: string; classes: string }> = {
  new:       { label: 'NEW',       classes: 'bg-blue-900/50 text-blue-300 border border-blue-700' },
  contacted: { label: 'CONTACTED', classes: 'bg-amber-900/50 text-amber-300 border border-amber-700' },
  closed:    { label: 'CLOSED',    classes: 'bg-green-900/50 text-green-300 border border-green-700' },
}

function ContactStatusBadge({ status }: { status: ContactStatus }) {
  const cfg = CONTACT_STATUS_CONFIG[status] ?? CONTACT_STATUS_CONFIG.new
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium tracking-wide ${cfg.classes}`}>
      {cfg.label}
    </span>
  )
}

export function LeadsHub() {
  const { user } = useAuth()
  const { t } = useAdminTheme()
  const [leads, setLeads] = useState<LeadWithListing[]>([])
  const [inspectionLeads, setInspectionLeads] = useState<LeadWithListing[]>([])
  const [subscribers, setSubscribers] = useState<Tables<'newsletter_subscribers'>[]>([])
  const [agents, setAgents] = useState<TeamMember[]>([])
  const [statuses, setStatuses] = useState<LeadStatus[]>([])
  const [tab, setTab] = useState<'enquiries' | 'newsletter' | 'inspections'>('enquiries')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterContactStatus, setFilterContactStatus] = useState<string>('')
  const [filterInspectionType, setFilterInspectionType] = useState<string>('')
  const [filterInspectionContact, setFilterInspectionContact] = useState<string>('')
  const [selected, setSelected] = useState<LeadWithListing | null>(null)
  const [tasks, setTasks] = useState<Tables<'lead_tasks'>[]>([])
  const [activities, setActivities] = useState<Tables<'lead_activities'>[]>([])
  const [note, setNote] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()

    // Enquiries: exclude inspection/auction registrations
    let q = supabase
      .from('leads')
      .select('*, listings(slug, title)')
      .not('enquiry_type', 'in', `(${INSPECTION_ENQUIRY_TYPES.join(',')})`)
      .order('created_at', { ascending: false })
    if (filterCategory) q = q.eq('category', filterCategory as LeadCategory)
    if (filterStatus) q = q.eq('status', filterStatus)
    if (filterContactStatus) q = q.eq('contact_status', filterContactStatus)

    // Inspection registrations
    let iq = supabase
      .from('leads')
      .select('*, listings(slug, title)')
      .in('enquiry_type', INSPECTION_ENQUIRY_TYPES)
      .order('created_at', { ascending: false })
    if (filterInspectionType) iq = iq.eq('enquiry_type', filterInspectionType)
    if (filterInspectionContact) iq = iq.eq('contact_status', filterInspectionContact)

    const [{ data: l }, { data: il }, { data: s }, { data: a }, { data: st }] = await Promise.all([
      q,
      iq,
      supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }),
      supabase.from('team_members').select('*').order('name'),
      supabase.from('lead_statuses').select('*').order('display_order'),
    ])
    setLeads((l ?? []) as LeadWithListing[])
    setInspectionLeads((il ?? []) as LeadWithListing[])
    setSubscribers(s ?? [])
    setAgents(a ?? [])
    setStatuses(st ?? [])
  }, [filterCategory, filterStatus, filterContactStatus, filterInspectionType, filterInspectionContact])

  useEffect(() => {
    load()
  }, [load])

  async function loadLeadDetail(lead: LeadWithListing) {
    setSelected(lead)
    setDeleteConfirm(false)
    const supabase = createClient()
    const [{ data: taskData }, { data: act }] = await Promise.all([
      supabase.from('lead_tasks').select('*').eq('lead_id', lead.id).order('due_at'),
      supabase.from('lead_activities').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false }),
    ])
    setTasks(taskData ?? [])
    setActivities(act ?? [])
  }

  async function updateLead(id: string, patch: Partial<Lead>) {
    const supabase = createClient()
    await supabase.from('leads').update(patch).eq('id', id)
    if (patch.status && selected?.id === id) {
      await supabase.from('lead_activities').insert({
        lead_id: id,
        actor_id: user?.id ?? null,
        type: 'status_change',
        body: `Status changed to ${patch.status}`,
      })
    }
    if (patch.contact_status && selected?.id === id) {
      await supabase.from('lead_activities').insert({
        lead_id: id,
        actor_id: user?.id ?? null,
        type: 'status_change',
        body: `Contact status changed to ${patch.contact_status}`,
      })
    }
    load()
    if (selected) {
      const updated = { ...selected, ...patch }
      setSelected(updated)
      loadLeadDetail(updated)
    }
  }

  async function deleteLead(id: string) {
    const supabase = createClient()
    await supabase.from('leads').delete().eq('id', id)
    setSelected(null)
    setDeleteConfirm(false)
    load()
  }

  async function logNote() {
    if (!selected || !note.trim()) return
    const supabase = createClient()
    await supabase.from('lead_activities').insert({
      lead_id: selected.id,
      actor_id: user?.id ?? null,
      type: 'note',
      body: note.trim(),
    })
    setNote('')
    loadLeadDetail(selected)
  }

  const pipeline = statuses.filter((s) => s.category === selected?.category)

  function downloadCSV(rows: string[][], filename: string) {
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
    const csv = rows.map((r) => r.map(escape).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportLeads() {
    const agentMap = Object.fromEntries(agents.map((a) => [a.id, a.name]))
    const header = [
      'Name', 'Email', 'Mobile', 'Contact State', 'Category',
      'Enquiry Type', 'Property Slug', 'Pipeline Status', 'Budget',
      'Preferred Location', 'Requirements', 'Source', 'Assigned To', 'Created',
    ]
    const rows = leads.map((l) => [
      l.full_name,
      l.email,
      l.mobile ?? '',
      l.contact_status,
      l.category,
      l.enquiry_type,
      l.listings?.slug ?? '',
      l.status,
      l.budget_range ?? '',
      l.preferred_location ?? '',
      l.requirements ?? '',
      l.source ?? '',
      l.assigned_to ? (agentMap[l.assigned_to] ?? l.assigned_to) : '',
      formatShortDateMelbourne(l.created_at),
    ])
    const parts = [
      filterCategory || 'all',
      filterContactStatus || 'all-states',
      filterStatus || 'all-pipeline',
    ].join('_')
    downloadCSV([header, ...rows], `leads_${parts}_${melbourneDateKey()}.csv`)
  }

  function exportSubscribers() {
    const header = ['Email', 'Interest', 'Source', 'Joined']
    const rows = subscribers.map((s) => [
      s.email,
      s.interest ?? '',
      s.source ?? '',
      formatShortDateMelbourne(s.created_at),
    ])
    downloadCSV([header, ...rows], `newsletter_subscribers_${melbourneDateKey()}.csv`)
  }

  function exportInspections() {
    const header = ['Name', 'Email', 'Mobile', 'Type', 'Property Slug', 'Contact State', 'Registered']
    const rows = inspectionLeads.map((l) => [
      l.full_name,
      l.email,
      l.mobile ?? '',
      l.enquiry_type === 'auction_registration' ? 'Auction' : 'Inspection',
      l.listings?.slug ?? '',
      l.contact_status,
      formatShortDateMelbourne(l.created_at),
    ])
    downloadCSV([header, ...rows], `inspection_registrations_${melbourneDateKey()}.csv`)
  }

  const downloadIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium">Leads Hub</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setTab('enquiries'); setSelected(null) }}
            className={`px-3 py-1.5 text-sm ${tab === 'enquiries' ? t.tabActive : t.tabInactive}`}
          >
            Enquiries
          </button>
          <button
            type="button"
            onClick={() => { setTab('inspections'); setSelected(null) }}
            className={`relative px-3 py-1.5 text-sm ${tab === 'inspections' ? t.tabActive : t.tabInactive}`}
          >
            Inspections
            {inspectionLeads.length > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {inspectionLeads.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => { setTab('newsletter'); setSelected(null) }}
            className={`px-3 py-1.5 text-sm ${tab === 'newsletter' ? t.tabActive : t.tabInactive}`}
          >
            Newsletter
          </button>
        </div>
      </div>

      {tab === 'enquiries' && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={cn(t.select, 'px-3 py-1.5 text-sm')}
            >
              <option value="">All categories</option>
              <option value="buyer">Buyer</option>
              <option value="vendor">Vendor</option>
              <option value="landlord">Landlord</option>
              <option value="tenant">Tenant</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={cn(t.select, 'px-3 py-1.5 text-sm')}
            >
              <option value="">All pipeline statuses</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.status}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              value={filterContactStatus}
              onChange={(e) => setFilterContactStatus(e.target.value)}
              className={cn(t.select, 'px-3 py-1.5 text-sm')}
            >
              <option value="">All contact states</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
            <button
              type="button"
              onClick={exportLeads}
              disabled={leads.length === 0}
              className={cn('ml-auto flex items-center gap-1.5', t.exportBtn)}
            >
              {downloadIcon}
              Export CSV
              {leads.length > 0 && (
                <span className={t.countBadge}>{leads.length}</span>
              )}
            </button>
          </div>

          <div className={t.tableBorder}>
            <table className="w-full text-left text-sm">
              <thead className={t.tableHeader}>
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Property Slug</th>
                  <th className="p-3">Pipeline</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={t.tableRowHover}
                    onClick={() => loadLeadDetail(lead)}
                  >
                    <td className="p-3">{lead.full_name}</td>
                    <td className="p-3">
                      <ContactStatusBadge status={lead.contact_status as ContactStatus} />
                    </td>
                    <td className="p-3 capitalize">{lead.category}</td>
                    <td className="p-3">{lead.enquiry_type}</td>
                    <td className={cn('p-3 font-mono text-xs', t.textSecondary)}>
                      {lead.listings?.slug ?? <span className={t.textDim}>—</span>}
                    </td>
                    <td className={cn('p-3', t.textSecondary)}>{lead.status}</td>
                    <td className={cn('p-3', t.textMuted)}>{formatShortDateMelbourne(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'inspections' && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterInspectionType}
              onChange={(e) => setFilterInspectionType(e.target.value)}
              className={cn(t.select, 'px-3 py-1.5 text-sm')}
            >
              <option value="">All types</option>
              <option value="inspection_registration">Open Inspection</option>
              <option value="auction_registration">Auction</option>
            </select>
            <select
              value={filterInspectionContact}
              onChange={(e) => setFilterInspectionContact(e.target.value)}
              className={cn(t.select, 'px-3 py-1.5 text-sm')}
            >
              <option value="">All contact states</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
            <button
              type="button"
              onClick={exportInspections}
              disabled={inspectionLeads.length === 0}
              className={cn('ml-auto flex items-center gap-1.5', t.exportBtn)}
            >
              {downloadIcon}
              Export CSV
              {inspectionLeads.length > 0 && (
                <span className={t.countBadge}>{inspectionLeads.length}</span>
              )}
            </button>
          </div>

          <div className={t.tableBorder}>
            <table className="w-full text-left text-sm">
              <thead className={t.tableHeader}>
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Mobile</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Property</th>
                  <th className="p-3">Registered</th>
                </tr>
              </thead>
              <tbody>
                {inspectionLeads.length === 0 && (
                  <tr>
                    <td colSpan={6} className={cn('p-6 text-center text-sm', t.textMuted)}>
                      No inspection or auction registrations yet.
                    </td>
                  </tr>
                )}
                {inspectionLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={t.tableRowHover}
                    onClick={() => loadLeadDetail(lead)}
                  >
                    <td className="p-3">
                      <div>{lead.full_name}</div>
                      <div className={cn('text-xs', t.textMuted)}>{lead.email}</div>
                    </td>
                    <td className="p-3">
                      <ContactStatusBadge status={lead.contact_status as ContactStatus} />
                    </td>
                    <td className={cn('p-3', t.textSecondary)}>{lead.mobile ?? <span className={t.textDim}>—</span>}</td>
                    <td className="p-3">
                      <span className={cn(
                        'inline-block rounded px-2 py-0.5 text-xs font-medium tracking-wide',
                        lead.enquiry_type === 'auction_registration'
                          ? 'bg-amber-900/50 text-amber-300 border border-amber-700'
                          : 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
                      )}>
                        {lead.enquiry_type === 'auction_registration' ? 'Auction' : 'Inspection'}
                      </span>
                    </td>
                    <td className={cn('p-3 font-mono text-xs', t.textSecondary)}>
                      {lead.listings?.slug ?? <span className={t.textDim}>—</span>}
                    </td>
                    <td className={cn('p-3', t.textMuted)}>{formatShortDateMelbourne(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'newsletter' && (
        <>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={exportSubscribers}
              disabled={subscribers.length === 0}
              className={cn('flex items-center gap-1.5', t.exportBtn)}
            >
              {downloadIcon}
              Export CSV
              {subscribers.length > 0 && (
                <span className={t.countBadge}>{subscribers.length}</span>
              )}
            </button>
          </div>
          <div className={t.tableBorder}>
            <table className="w-full text-left text-sm">
              <thead className={t.tableHeader}>
                <tr>
                  <th className="p-3">Email</th>
                  <th className="p-3">Interest</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id} className={t.tableRow}>
                    <td className="p-3">{s.email}</td>
                    <td className="p-3 capitalize">{s.interest}</td>
                    <td className="p-3">{s.source}</td>
                    <td className={cn('p-3', t.textMuted)}>{formatShortDateMelbourne(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selected && (tab === 'enquiries' || tab === 'inspections') && (
        <div className={t.drawer}>
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setSelected(null)} className={t.cancelBtn}>
              ← Close
            </button>
            {!deleteConfirm ? (
              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="text-xs text-red-500 hover:text-red-400"
              >
                Delete lead
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className={cn('text-xs', t.textSecondary)}>Are you sure?</span>
                <button
                  type="button"
                  onClick={() => deleteLead(selected.id)}
                  className="rounded bg-red-700 px-2 py-1 text-xs text-white hover:bg-red-600"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(false)}
                  className={cn('text-xs', t.cancelBtn)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl">{selected.full_name}</h2>
              <p className={cn('text-sm', t.textMuted)}>{selected.email} · {selected.mobile}</p>
            </div>
            <ContactStatusBadge status={selected.contact_status as ContactStatus} />
          </div>

          {selected.listings && (
            <div className={cn('mt-3', t.infoBox)}>
              <span className={t.textMuted}>Enquired on: </span>
              <span className="font-mono text-amber-500">{selected.listings.slug}</span>
              <span className={cn('ml-2', t.textSecondary)}>{selected.listings.title}</span>
            </div>
          )}

          <div className="mt-6 space-y-4 text-sm">
            <p><span className={t.textMuted}>Budget:</span> {selected.budget_range ?? '—'}</p>
            <p><span className={t.textMuted}>Location:</span> {selected.preferred_location ?? '—'}</p>
            <p><span className={t.textMuted}>Requirements:</span> {selected.requirements ?? '—'}</p>
          </div>

          <div className="mt-6">
            <label className={cn('text-xs', t.textMuted)}>Contact State</label>
            <div className="mt-2 flex gap-2">
              {(['new', 'contacted', 'closed'] as ContactStatus[]).map((cs) => {
                const cfg = CONTACT_STATUS_CONFIG[cs]
                const isActive = selected.contact_status === cs
                return (
                  <button
                    key={cs}
                    type="button"
                    onClick={() => updateLead(selected.id, { contact_status: cs })}
                    className={`rounded px-3 py-1.5 text-xs font-medium tracking-wide transition-opacity ${
                      isActive ? cfg.classes : t.contactStatusOff
                    }`}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6">
            <label className={cn('text-xs', t.textMuted)}>Assign to</label>
            <select
              value={selected.assigned_to ?? ''}
              onChange={(e) => updateLead(selected.id, { assigned_to: e.target.value || null })}
              className={cn('mt-1 w-full px-3 py-2 text-sm', t.select)}
            >
              <option value="">Unassigned</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="mt-6">
            <p className={cn('text-xs', t.textMuted)}>Pipeline</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {pipeline.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => updateLead(selected.id, { status: s.status })}
                  className={`px-2 py-1 text-xs ${selected.status === s.status ? t.pipelineActive : t.pipelineInactive}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className={cn('text-xs', t.textMuted)}>Tasks</p>
            <ul className="mt-2 space-y-1 text-sm">
              {tasks.map((task) => (
                <li key={task.id} className={task.completed ? t.taskDone : ''}>
                  {task.title} {task.due_at && `· ${formatShortDateMelbourne(task.due_at)}`}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <p className={cn('text-xs', t.textMuted)}>Timeline</p>
            <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto text-sm">
              {activities.map((a) => (
                <li key={a.id}>
                  <span className={t.timelineType}>{a.type}</span>
                  <p className={t.timelineBody}>{a.body}</p>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Log a note…"
                className={t.noteInput}
              />
              <button type="button" onClick={logNote} className={t.noteBtn}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
