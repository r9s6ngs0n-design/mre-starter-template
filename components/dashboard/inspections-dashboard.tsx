'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { ClipboardList, MapPin, ExternalLink, X } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Tables, InspectionStatus } from '@/lib/database.types'

type Inspection = Tables<'user_inspections'> & {
  listings: Pick<Tables<'listings'>, 'id' | 'title' | 'suburb' | 'address' | 'images'> | null
}

const statusConfig: Record<InspectionStatus, { label: string; className: string }> = {
  registered: { label: 'Registered', className: 'bg-forest-deep/10 text-forest-deep border-forest-deep/30' },
  attended:   { label: 'Attended',   className: 'bg-muted text-muted-foreground border-border' },
  cancelled:  { label: 'Cancelled',  className: 'bg-destructive/10 text-destructive border-destructive/30' },
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function InspectionsDashboard() {
  const { user } = useAuth()
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('user_inspections')
      .select('*, listings(id, title, suburb, address, images)')
      .eq('user_id', user.id)
      .order('inspection_date', { ascending: true })
      .then(({ data }) => {
        setInspections((data as Inspection[]) ?? [])
        setLoading(false)
      })
  }, [user])

  async function cancelInspection(id: string) {
    const supabase = createClient()
    await supabase.from('user_inspections').update({ status: 'cancelled' }).eq('id', id)
    setInspections((ins) => ins.map((i) => i.id === id ? { ...i, status: 'cancelled' } : i))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 rounded bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming = inspections.filter((i) => i.status === 'registered' && parseLocalDate(i.inspection_date) >= today)
  const past = inspections.filter((i) => i.status !== 'registered' || parseLocalDate(i.inspection_date) < today)

  return (
    <div className="space-y-6">
      <PageHeader />

      {inspections.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-ink border-b border-border pb-2">Upcoming</h2>
              {upcoming.map((ins) => (
                <InspectionCard key={ins.id} inspection={ins} onCancel={cancelInspection} />
              ))}
            </section>
          )}
          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">Past & Cancelled</h2>
              {past.map((ins) => (
                <InspectionCard key={ins.id} inspection={ins} onCancel={cancelInspection} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  )
}

function InspectionCard({ inspection, onCancel }: { inspection: Inspection; onCancel: (id: string) => void }) {
  const listing = inspection.listings
  const cfg = statusConfig[inspection.status]
  const dt = parseLocalDate(inspection.inspection_date)
  const [hh, mm] = inspection.inspection_time.split(':')
  const hour = parseInt(hh)
  const timeStr = `${hour % 12 || 12}:${mm} ${hour < 12 ? 'AM' : 'PM'}`
  const canCancel = inspection.status === 'registered'

  return (
    <div className="rounded border border-border bg-white p-4 flex gap-4">
      {/* Date block */}
      <div className="shrink-0 w-14 rounded bg-forest-deep/5 border border-forest-deep/10 flex flex-col items-center justify-center py-2 text-center">
        <span className="text-[0.625rem] text-muted-foreground uppercase tracking-wider">
          {MONTHS[dt.getMonth()]}
        </span>
        <span className="text-2xl font-serif text-forest-deep leading-none">
          {dt.getDate()}
        </span>
        <span className="text-[0.625rem] text-muted-foreground">
          {dt.getFullYear()}
        </span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-medium text-sm text-ink truncate">{listing?.title ?? 'Property'}</h3>
          <span className={cn('shrink-0 text-[0.625rem] tracking-wide uppercase px-2 py-0.5 rounded border font-medium', cfg.className)}>
            {cfg.label}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            🕐 {timeStr}
          </span>
          {listing?.suburb && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {listing.suburb}
            </span>
          )}
        </div>
        {inspection.notes && (
          <p className="text-xs text-muted-foreground italic mb-2 line-clamp-2">{inspection.notes}</p>
        )}
        <div className="flex items-center gap-3">
          {listing && (
            <Link
              href={`/property/${listing.id}`}
              className="flex items-center gap-1 text-xs text-gold-text hover:text-forest-deep transition-colors"
            >
              View listing <ExternalLink className="w-3 h-3" />
            </Link>
          )}
          {canCancel && (
            <button
              onClick={() => onCancel(inspection.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function PageHeader() {
  return (
    <div>
      <p className="text-[0.6875rem] tracking-[0.15em] uppercase text-gold-text mb-1">Dashboard</p>
      <h1 className="font-serif text-3xl text-ink">My Inspections</h1>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded border border-dashed border-border bg-white p-12 text-center">
      <ClipboardList className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
      <h2 className="font-serif text-xl text-ink mb-2">No inspections registered</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Register for open home inspections directly from any property listing.
      </p>
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-forest-deep text-cream rounded hover:bg-forest transition-colors"
      >
        Browse properties
      </Link>
    </div>
  )
}
