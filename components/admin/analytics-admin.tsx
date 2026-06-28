'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAdminTheme } from '@/contexts/admin-theme-context'
import { cn } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function AnalyticsAdmin() {
  const { isDayMode, t } = useAdminTheme()
  const [viewsByDay, setViewsByDay] = useState<{ day: string; count: number }[]>([])
  const [ctaTotal, setCtaTotal] = useState(0)
  const [searches, setSearches] = useState<{ query: string; count: number }[]>([])

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: views } = await supabase.from('page_views').select('created_at').order('created_at')
      const dayMap = new Map<string, number>()
      views?.forEach((v) => {
        const day = v.created_at.slice(0, 10)
        dayMap.set(day, (dayMap.get(day) ?? 0) + 1)
      })
      setViewsByDay([...dayMap.entries()].map(([day, count]) => ({ day, count })).slice(-14))

      const { count } = await supabase.from('cta_clicks').select('*', { count: 'exact', head: true })
      setCtaTotal(count ?? 0)

      const { data: sq } = await supabase.from('search_queries').select('query')
      const qMap = new Map<string, number>()
      sq?.forEach((s) => qMap.set(s.query, (qMap.get(s.query) ?? 0) + 1))
      setSearches([...qMap.entries()].map(([query, count]) => ({ query, count })).slice(0, 10))
    }
    load()
  }, [])

  const tickColor = isDayMode ? '#7a6a54' : '#71717a'
  const tooltipStyle = isDayMode
    ? { background: '#f0e9da', border: '1px solid #cfc8b6', color: '#261c0d' }
    : { background: '#18181b', border: '1px solid #3f3f46' }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-medium">Analytics</h1>
      <div className={t.panel}>
        <div className="p-4">
          <p className={cn('text-sm', t.textMuted)}>Page views (last 14 days)</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewsByDay}>
                <XAxis dataKey="day" tick={{ fill: tickColor, fontSize: 10 }} />
                <YAxis tick={{ fill: tickColor, fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#b45309" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={t.panelBorder + ' rounded-lg p-4'}>
          <p className={cn('text-xs', t.textMuted)}>Total CTA clicks</p>
          <p className="text-3xl text-amber-500/90">{ctaTotal}</p>
        </div>
        <div className={t.panelBorder + ' rounded-lg p-4'}>
          <p className={cn('text-xs', t.textMuted)}>Top searches</p>
          <ul className="mt-2 space-y-1 text-sm">
            {searches.map((s) => (
              <li key={s.query} className="flex justify-between">
                <span>{s.query}</span>
                <span className={t.textDim}>{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
