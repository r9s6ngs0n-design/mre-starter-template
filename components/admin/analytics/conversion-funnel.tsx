'use client'

import { Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminTheme } from '@/contexts/admin-theme-context'
import type { FunnelStage } from '@/hooks/use-analytics-dashboard'

interface ConversionFunnelProps {
  stages: FunnelStage[]
}

const BAR_COLORS = ['bg-amber-500', 'bg-amber-700', 'bg-emerald-500', 'bg-sky-500']

export function ConversionFunnel({ stages }: ConversionFunnelProps) {
  const { t } = useAdminTheme()
  const max = stages[0]?.count || 1

  return (
    <div className={cn(t.panel, 'p-4')}>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-medium">
          <Flag className="h-4 w-4 text-amber-500/90" />
          Conversion Funnel
        </h2>
        <span className={cn('text-xs uppercase tracking-wide', t.textDim)}>User Journey</span>
      </div>

      <div className="mt-6 space-y-5">
        {stages.map((s, i) => {
          const pct = max > 0 ? (s.count / max) * 100 : 0
          return (
            <div key={s.stage}>
              <div className="flex items-center justify-between text-xs">
                <span className={cn('uppercase tracking-wide', t.textSecondary)}>{s.stage}</span>
                <span className={t.textMuted}>
                  {s.count} <span className={t.textDim}>({pct.toFixed(1)}%)</span>
                </span>
              </div>
              <div className={cn('mt-2 h-2.5 w-full overflow-hidden rounded-full', t.panelBorder)}>
                <div
                  className={cn('h-full rounded-full transition-all duration-500', BAR_COLORS[i % BAR_COLORS.length])}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
