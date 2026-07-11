'use client'

import { Monitor, Smartphone, Tablet } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { cn } from '@/lib/utils'
import { useAdminTheme } from '@/contexts/admin-theme-context'
import type { DeviceCount } from '@/hooks/use-analytics-dashboard'

const DEVICE_META: Record<DeviceCount['device'], { label: string; icon: typeof Monitor; color: string }> = {
  desktop: { label: 'Desktop', icon: Monitor, color: '#d97706' },
  mobile: { label: 'Mobile', icon: Smartphone, color: '#a1a1aa' },
  tablet: { label: 'Tablet', icon: Tablet, color: '#10b981' },
}

interface DeviceDonutProps {
  data: DeviceCount[]
}

export function DeviceDonut({ data }: DeviceDonutProps) {
  const { t, isDayMode } = useAdminTheme()
  const total = data.reduce((sum, d) => sum + d.count, 0)
  const chartData = data
    .filter((d) => d.count > 0)
    .map((d) => ({ name: DEVICE_META[d.device].label, value: d.count, color: DEVICE_META[d.device].color }))
  const tooltipStyle = isDayMode
    ? { background: '#f0e9da', border: '1px solid #cfc8b6', color: '#261c0d' }
    : { background: '#18181b', border: '1px solid #3f3f46' }

  return (
    <div className={cn(t.panel, 'p-4')}>
      <h2 className="text-lg font-medium">Device Source</h2>

      <div className="mt-2 h-44">
        {chartData.length === 0 ? (
          <div className={cn('flex h-full items-center justify-center text-sm', t.textDim)}>No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={2}
                strokeWidth={0}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {data.map((d) => {
          const meta = DEVICE_META[d.device]
          const Icon = meta.icon
          const pct = total > 0 ? ((d.count / total) * 100).toFixed(1) : '0.0'
          return (
            <div key={d.device} className="flex items-center justify-between text-sm">
              <span className={cn('flex items-center gap-2', t.textSecondary)}>
                <Icon className="h-4 w-4" style={{ color: meta.color }} />
                {meta.label}
              </span>
              <div className="text-right">
                <p>{d.count}</p>
                <p className={cn('text-xs', t.textDim)}>{pct}% of traffic</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
