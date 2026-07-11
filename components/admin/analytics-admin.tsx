'use client'

import { useMemo } from 'react'
import { RefreshCw, Eye, Users, Target, FileText, Globe, MousePointerClick, Search, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTimeMelbourne } from '@/lib/datetime'
import { useAdminTheme } from '@/contexts/admin-theme-context'
import { useAnalyticsDashboard, type AnalyticsRange } from '@/hooks/use-analytics-dashboard'
import { StatCard } from './analytics/stat-card'
import { ConversionFunnel } from './analytics/conversion-funnel'
import { DeviceDonut } from './analytics/device-donut'
import { VisitorTrendChart } from './analytics/visitor-trend-chart'
import { ListPanel } from './analytics/list-panel'

const RANGE_OPTIONS: { value: AnalyticsRange; label: string }[] = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
]

export function AnalyticsAdmin() {
  const { t } = useAdminTheme()
  const {
    loading,
    lastUpdated,
    range,
    setRange,
    refresh,
    totalPageViews,
    totalPageViewsDelta,
    uniqueVisitors,
    uniqueVisitorsDelta,
    conversionRate,
    conversionRateDelta,
    funnel,
    deviceBreakdown,
    visitorTrend,
    topPages,
    referrers,
    topCtas,
    topSearches,
    originForms,
    trafficSummary,
  } = useAnalyticsDashboard('30d')

  const lastUpdatedLabel = lastUpdated ? formatTimeMelbourne(lastUpdated, { hour12: false }) : '—'

  const trafficItems = useMemo(
    () => [
      { label: 'Direct / Organic', count: trafficSummary.direct },
      { label: 'Referral', count: trafficSummary.referral },
    ],
    [trafficSummary]
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Analytics Dashboard</h1>
          <p className={cn('mt-1 text-sm', t.textMuted)}>
            Last updated: {lastUpdatedLabel} · Auto-refresh active (5m)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            aria-label="Refresh analytics"
            className={cn(
              'rounded-md p-2 transition-colors',
              t.panelBorder,
              t.textSecondary,
              'hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
          <div className={cn('flex overflow-hidden rounded-md', t.panelBorder)}>
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRange(opt.value)}
                className={cn('px-3 py-1.5 text-sm font-medium', range === opt.value ? t.tabActive : t.tabInactive)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Page Views"
          value={totalPageViews.toLocaleString()}
          deltaPct={totalPageViewsDelta}
          icon={<Eye className="h-4 w-4" />}
        />
        <StatCard
          label="Unique Visitors"
          value={uniqueVisitors.toLocaleString()}
          deltaPct={uniqueVisitorsDelta}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Conversion Rate"
          value={`${conversionRate.toFixed(1)}%`}
          deltaPct={conversionRateDelta}
          icon={<Target className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ConversionFunnel stages={funnel} />
        </div>
        <DeviceDonut data={deviceBreakdown} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VisitorTrendChart data={visitorTrend} />
        </div>
        <div className="space-y-6">
          <ListPanel
            title="Origin Forms"
            icon={<ArrowUpRight className="h-4 w-4 text-emerald-500" />}
            tag="Internal"
            items={originForms}
            variant="bars"
            barColor="bg-amber-600"
          />
          <ListPanel
            title="Traffic Source"
            icon={<Globe className="h-4 w-4 text-amber-500/90" />}
            tag="External"
            items={trafficItems}
            variant="bars"
            barColor="bg-sky-500"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ListPanel title="Top Pages" icon={<FileText className="h-4 w-4" />} items={topPages} numbered />
        <ListPanel title="Referrers" icon={<Globe className="h-4 w-4" />} items={referrers} numbered />
        <ListPanel
          title="Top CTAs"
          icon={<MousePointerClick className="h-4 w-4" />}
          items={topCtas}
          numbered
          emptyLabel="No CTA clicks yet"
        />
        <ListPanel
          title="Top Searches"
          icon={<Search className="h-4 w-4" />}
          items={topSearches}
          numbered
          emptyLabel="No searches yet"
        />
      </div>
    </div>
  )
}
