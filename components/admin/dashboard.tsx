'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAdminTheme } from '@/contexts/admin-theme-context'
import { cn } from '@/lib/utils'
import { formatDateTimeMelbourne, startOfMonthMelbourne } from '@/lib/datetime'
import type { LeadCategory } from '@/lib/database.types'

export function AdminDashboard() {
  const { t } = useAdminTheme()
  const [stats, setStats] = useState({
    buyer: 0,
    vendor: 0,
    landlord: 0,
    tenant: 0,
    appraisals: 0,
    inspections: 0,
    contracts: 0,
    sold: 0,
    pageViews: 0,
    topPages: [] as { path: string; count: number }[],
  })
  const [activities, setActivities] = useState<
    { id: string; body: string | null; type: string; created_at: string; lead_id: string }[]
  >([])

  useEffect(() => {
    const supabase = createClient()
    const startOfMonth = startOfMonthMelbourne()
    const since = startOfMonth.toISOString()

    async function load() {
      const { data: leads } = await supabase.from('leads').select('category, enquiry_type, status').gte('created_at', since)

      const counts = { buyer: 0, vendor: 0, landlord: 0, tenant: 0, appraisals: 0, inspections: 0, contracts: 0, sold: 0 }
      leads?.forEach((l) => {
        counts[l.category as LeadCategory]++
        if (l.enquiry_type === 'appraisal') counts.appraisals++
        if (l.enquiry_type === 'inspection') counts.inspections++
        if (l.status === 'contract_issued') counts.contracts++
        if (l.status === 'sold') counts.sold++
      })

      const { data: views } = await supabase.from('page_views').select('path').gte('created_at', since)
      const pageMap = new Map<string, number>()
      views?.forEach((v) => pageMap.set(v.path, (pageMap.get(v.path) ?? 0) + 1))
      const topPages = [...pageMap.entries()]
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      const { data: acts } = await supabase
        .from('lead_activities')
        .select('id, body, type, created_at, lead_id')
        .order('created_at', { ascending: false })
        .limit(10)

      setStats({ ...counts, pageViews: views?.length ?? 0, topPages })
      setActivities(acts ?? [])
    }
    load()
  }, [])

  const cards = [
    { label: 'Buyer leads', value: stats.buyer },
    { label: 'Vendor leads', value: stats.vendor },
    { label: 'Landlord leads', value: stats.landlord },
    { label: 'Tenant leads', value: stats.tenant },
    { label: 'Appraisals booked', value: stats.appraisals },
    { label: 'Inspections booked', value: stats.inspections },
    { label: 'Contracts issued', value: stats.contracts },
    { label: 'Sold', value: stats.sold },
    { label: 'Page views (MTD)', value: stats.pageViews },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium">Dashboard</h1>
        <p className={cn('text-sm', t.textMuted)}>Monthly review — current month to date</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className={t.panel}>
            <p className={cn('p-4 text-xs', t.textMuted)}>{c.label}</p>
            <p className="px-4 pb-4 mt-1 text-3xl font-light text-amber-500/90">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={t.panel}>
          <div className="p-4">
            <h2 className={cn('text-sm font-medium', t.textSecondary)}>Top pages</h2>
            <ul className="mt-3 space-y-2">
              {stats.topPages.length === 0 && <li className={cn('text-sm', t.textDim)}>No data yet</li>}
              {stats.topPages.map((p) => (
                <li key={p.path} className="flex justify-between text-sm">
                  <span className={cn('truncate', t.textSecondary)}>{p.path}</span>
                  <span className={t.textMuted}>{p.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={t.panel}>
          <div className="p-4">
            <h2 className={cn('text-sm font-medium', t.textSecondary)}>Recent activity</h2>
            <ul className="mt-3 space-y-3">
              {activities.length === 0 && <li className={cn('text-sm', t.textDim)}>No activity yet</li>}
              {activities.map((a) => (
                <li key={a.id} className="text-sm">
                  <span className={t.timelineType}>{a.type}</span>
                  <p className={t.timelineBody}>{a.body}</p>
                  <p className={cn('text-xs', t.textDim)}>{formatDateTimeMelbourne(a.created_at)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
