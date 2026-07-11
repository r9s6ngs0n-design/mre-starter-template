'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useAdminTheme } from '@/contexts/admin-theme-context'

interface StatCardProps {
  label: string
  value: string | number
  deltaPct?: number
  icon?: ReactNode
}

export function StatCard({ label, value, deltaPct, icon }: StatCardProps) {
  const { t, isDayMode } = useAdminTheme()
  const hasDelta = typeof deltaPct === 'number'
  const isPositive = (deltaPct ?? 0) >= 0

  const deltaClass = isDayMode
    ? isPositive
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-red-100 text-red-700'
    : isPositive
      ? 'bg-emerald-900/40 text-emerald-400'
      : 'bg-red-900/40 text-red-400'

  return (
    <div className={cn(t.panel, 'p-4')}>
      <div className="flex items-start justify-between">
        {icon && <div className={cn('rounded-md p-2', t.panelBorder, t.textSecondary)}>{icon}</div>}
        {hasDelta && (
          <span className={cn('rounded px-2 py-0.5 text-xs font-medium', deltaClass)}>
            {isPositive ? '+' : ''}
            {deltaPct!.toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-light text-amber-500/90">{value}</p>
      <p className={cn('mt-1 text-xs uppercase tracking-wide', t.textMuted)}>{label}</p>
    </div>
  )
}
