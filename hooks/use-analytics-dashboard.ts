'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FUNNEL_PROPERTY_INTEREST_PREFIXES } from '@/lib/analytics-config'
import { datetimeLocalToIso, melbourneDateKey, melbourneDateOffset } from '@/lib/datetime'

export type AnalyticsRange = '7d' | '30d' | '90d'

/** Re-export for consumers that imported the funnel prefixes from this hook. */
export { FUNNEL_PROPERTY_INTEREST_PREFIXES } from '@/lib/analytics-config'

const RANGE_DAYS: Record<AnalyticsRange, number> = { '7d': 7, '30d': 30, '90d': 90 }
const AUTO_REFRESH_MS = 5 * 60 * 1000
const MAX_ROWS = 5000

const ENQUIRY_LABELS: Record<string, string> = {
  general: 'General Enquiry',
  appraisal: 'Appraisal Request',
  inspection: 'Inspection Registration',
  register_interest: 'Register Interest',
  investment: 'Investment Enquiry',
  property_management: 'Property Management',
}

export interface CountItem {
  label: string
  count: number
}

export interface FunnelStage {
  stage: string
  count: number
}

export interface DeviceCount {
  device: 'desktop' | 'mobile' | 'tablet'
  count: number
}

export interface TrendPoint {
  day: string
  count: number
}

export interface AnalyticsData {
  loading: boolean
  lastUpdated: Date | null
  range: AnalyticsRange
  setRange: (r: AnalyticsRange) => void
  refresh: () => void
  totalPageViews: number
  totalPageViewsDelta: number
  uniqueVisitors: number
  uniqueVisitorsDelta: number
  conversionRate: number
  conversionRateDelta: number
  funnel: FunnelStage[]
  deviceBreakdown: DeviceCount[]
  visitorTrend: TrendPoint[]
  topPages: CountItem[]
  referrers: CountItem[]
  topCtas: CountItem[]
  topSearches: CountItem[]
  originForms: CountItem[]
  trafficSummary: { direct: number; referral: number }
}

function classifyDevice(userAgent: string | null): DeviceCount['device'] {
  if (!userAgent) return 'desktop'
  const ua = userAgent.toLowerCase()
  if (/ipad|tablet|(android(?!.*mobile))/.test(ua)) return 'tablet'
  if (/mobi|iphone|android/.test(ua)) return 'mobile'
  return 'desktop'
}

function hostnameFromReferrer(referrer: string | null): string {
  if (!referrer) return 'Direct/Organic'
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '')
    return host || 'Direct/Organic'
  } catch {
    return 'Direct/Organic'
  }
}

function isPropertyInterestPath(path: string): boolean {
  return FUNNEL_PROPERTY_INTEREST_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(prefix),
  )
}

function topN(map: Map<string, number>, n: number): CountItem[] {
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
}

function pctDelta(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0
  return ((curr - prev) / prev) * 100
}

const EMPTY_DATA: Omit<AnalyticsData, 'loading' | 'lastUpdated' | 'range' | 'setRange' | 'refresh'> = {
  totalPageViews: 0,
  totalPageViewsDelta: 0,
  uniqueVisitors: 0,
  uniqueVisitorsDelta: 0,
  conversionRate: 0,
  conversionRateDelta: 0,
  funnel: [],
  deviceBreakdown: [],
  visitorTrend: [],
  topPages: [],
  referrers: [],
  topCtas: [],
  topSearches: [],
  originForms: [],
  trafficSummary: { direct: 0, referral: 0 },
}

export function useAnalyticsDashboard(initialRange: AnalyticsRange = '30d'): AnalyticsData {
  const [range, setRange] = useState<AnalyticsRange>(initialRange)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [data, setData] = useState(EMPTY_DATA)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const days = RANGE_DAYS[range]
      const since = datetimeLocalToIso(`${melbourneDateOffset(-(days - 1))}T00:00`)
      const prevSince = datetimeLocalToIso(`${melbourneDateOffset(-(days * 2 - 1))}T00:00`)

      const [viewsRes, prevViewsRes, leadsRes, prevLeadsRes, ctaRes, searchRes, newsletterRes] = await Promise.all([
        supabase
          .from('page_views')
          .select('path, referrer, user_agent, session_id, created_at')
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(MAX_ROWS),
        supabase.from('page_views').select('session_id').gte('created_at', prevSince).lt('created_at', since).limit(MAX_ROWS),
        supabase.from('leads').select('enquiry_type, created_at').gte('created_at', since).limit(MAX_ROWS),
        supabase.from('leads').select('id').gte('created_at', prevSince).lt('created_at', since).limit(MAX_ROWS),
        supabase.from('cta_clicks').select('cta_label, session_id, created_at').gte('created_at', since).limit(MAX_ROWS),
        supabase.from('search_queries').select('query, created_at').gte('created_at', since).limit(MAX_ROWS),
        supabase.from('newsletter_subscribers').select('id').gte('created_at', since).limit(MAX_ROWS),
      ])

      const views = viewsRes.data ?? []
      const prevViews = prevViewsRes.data ?? []
      const leads = leadsRes.data ?? []
      const prevLeads = prevLeadsRes.data ?? []
      const ctas = ctaRes.data ?? []
      const searches = searchRes.data ?? []
      const newsletter = newsletterRes.data ?? []

      const sessionSet = new Set(views.map((v) => v.session_id).filter(Boolean) as string[])
      const uniqueVisitors = sessionSet.size
      const prevUniqueVisitors = new Set(prevViews.map((v) => v.session_id).filter(Boolean) as string[]).size

      const totalPageViews = views.length
      const prevTotalPageViews = prevViews.length

      const conversionRate = uniqueVisitors > 0 ? (leads.length / uniqueVisitors) * 100 : 0
      const prevConversionRate = prevUniqueVisitors > 0 ? (prevLeads.length / prevUniqueVisitors) * 100 : 0

      const propertyInterestSessions = new Set<string>()
      views.forEach((v) => {
        if (v.session_id && isPropertyInterestPath(v.path)) propertyInterestSessions.add(v.session_id)
      })
      const highIntentSessions = new Set(ctas.map((c) => c.session_id).filter(Boolean) as string[])

      const funnel: FunnelStage[] = [
        { stage: 'Total Visitors', count: uniqueVisitors },
        { stage: 'Property Interest', count: propertyInterestSessions.size },
        { stage: 'High Intent', count: highIntentSessions.size },
        { stage: 'Leads', count: leads.length },
      ]

      const deviceMap = new Map<string, number>()
      views.forEach((v) => {
        const device = classifyDevice(v.user_agent)
        deviceMap.set(device, (deviceMap.get(device) ?? 0) + 1)
      })
      const deviceBreakdown: DeviceCount[] = (['desktop', 'mobile', 'tablet'] as const).map((device) => ({
        device,
        count: deviceMap.get(device) ?? 0,
      }))

      const dayMap = new Map<string, number>()
      for (let i = 0; i < days; i++) {
        dayMap.set(melbourneDateOffset(-(days - 1 - i)), 0)
      }
      views.forEach((v) => {
        const day = melbourneDateKey(v.created_at)
        if (dayMap.has(day)) dayMap.set(day, (dayMap.get(day) ?? 0) + 1)
      })
      const visitorTrend: TrendPoint[] = [...dayMap.entries()].map(([day, count]) => ({ day, count }))

      const pageMap = new Map<string, number>()
      views.forEach((v) => pageMap.set(v.path, (pageMap.get(v.path) ?? 0) + 1))

      const refMap = new Map<string, number>()
      let direct = 0
      let referral = 0
      views.forEach((v) => {
        const host = hostnameFromReferrer(v.referrer)
        refMap.set(host, (refMap.get(host) ?? 0) + 1)
        if (host === 'Direct/Organic') direct++
        else referral++
      })

      const ctaMap = new Map<string, number>()
      ctas.forEach((c) => ctaMap.set(c.cta_label, (ctaMap.get(c.cta_label) ?? 0) + 1))

      const searchMap = new Map<string, number>()
      searches.forEach((s) => searchMap.set(s.query, (searchMap.get(s.query) ?? 0) + 1))

      const formMap = new Map<string, number>()
      leads.forEach((l) => {
        const label = ENQUIRY_LABELS[l.enquiry_type] ?? l.enquiry_type
        formMap.set(label, (formMap.get(label) ?? 0) + 1)
      })
      if (newsletter.length > 0) formMap.set('Newsletter Signup', newsletter.length)

      setData({
        totalPageViews,
        totalPageViewsDelta: pctDelta(totalPageViews, prevTotalPageViews),
        uniqueVisitors,
        uniqueVisitorsDelta: pctDelta(uniqueVisitors, prevUniqueVisitors),
        conversionRate,
        conversionRateDelta: pctDelta(conversionRate, prevConversionRate),
        funnel,
        deviceBreakdown,
        visitorTrend,
        topPages: topN(pageMap, 5),
        referrers: topN(refMap, 5),
        topCtas: topN(ctaMap, 5),
        topSearches: topN(searchMap, 5),
        originForms: topN(formMap, 10),
        trafficSummary: { direct, referral },
      })
      setLastUpdated(new Date())
    } catch {
      // env not configured during build or offline — leave last-known data in place
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const interval = setInterval(load, AUTO_REFRESH_MS)
    return () => clearInterval(interval)
  }, [load])

  return { ...data, loading, lastUpdated, range, setRange, refresh: load }
}
