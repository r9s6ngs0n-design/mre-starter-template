'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useAdminTheme } from '@/contexts/admin-theme-context'
import type { CountItem } from '@/hooks/use-analytics-dashboard'

interface ListPanelProps {
  title: string
  icon?: ReactNode
  tag?: string
  items: CountItem[]
  emptyLabel?: string
  variant?: 'rows' | 'bars'
  barColor?: string
  numbered?: boolean
}

export function ListPanel({
  title,
  icon,
  tag,
  items,
  emptyLabel = 'No data yet',
  variant = 'rows',
  barColor = 'bg-amber-600',
  numbered = false,
}: ListPanelProps) {
  const { t } = useAdminTheme()
  const max = items.reduce((m, i) => Math.max(m, i.count), 0) || 1

  return (
    <div className={cn(t.panel, 'p-4')}>
      <div className="flex items-center justify-between">
        <h2 className={cn('flex items-center gap-2 text-sm font-medium', t.textSecondary)}>
          {icon}
          {title}
        </h2>
        {tag && <span className={cn('text-xs uppercase tracking-wide', t.textDim)}>{tag}</span>}
      </div>

      {items.length === 0 ? (
        <p className={cn('mt-4 text-sm', t.textDim)}>{emptyLabel}</p>
      ) : variant === 'bars' ? (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className={cn('truncate', t.textSecondary)}>{item.label}</span>
                <span className={cn('shrink-0', t.textMuted)}>{item.count}</span>
              </div>
              <div className={cn('mt-1.5 h-2 w-full overflow-hidden rounded-full', t.panelBorder)}>
                <div
                  className={cn('h-full rounded-full', barColor)}
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.map((item, i) => (
            <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
              <span className={cn('flex min-w-0 items-center gap-2', t.textSecondary)}>
                {numbered && <span className={cn('shrink-0 text-xs', t.textDim)}>{String(i + 1).padStart(2, '0')}</span>}
                <span className="truncate">{item.label}</span>
              </span>
              <span className={cn('shrink-0', t.textMuted)}>{item.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
