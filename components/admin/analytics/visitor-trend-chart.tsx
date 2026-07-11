'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { cn } from '@/lib/utils'
import { useAdminTheme } from '@/contexts/admin-theme-context'
import type { TrendPoint } from '@/hooks/use-analytics-dashboard'

interface VisitorTrendChartProps {
  data: TrendPoint[]
}

export function VisitorTrendChart({ data }: VisitorTrendChartProps) {
  const { t, isDayMode } = useAdminTheme()
  const tickColor = isDayMode ? '#7a6a54' : '#71717a'
  const gridColor = isDayMode ? '#cfc8b6' : '#27272a'
  const tooltipStyle = isDayMode
    ? { background: '#f0e9da', border: '1px solid #cfc8b6', color: '#261c0d' }
    : { background: '#18181b', border: '1px solid #3f3f46' }

  return (
    <div className={cn(t.panel, 'p-4')}>
      <h2 className="text-lg font-medium">Visitor Trend</h2>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="visitorTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: tickColor, fontSize: 10 }} tickLine={false} axisLine={{ stroke: gridColor }} />
            <YAxis tick={{ fill: tickColor, fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: tickColor }} />
            <Area type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} fill="url(#visitorTrendFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
