'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { Calendar, MapPin, ExternalLink, X, Clock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  formatDayOfMonthMelbourne,
  formatMonthShortMelbourne,
  formatTimeMelbourne,
  formatYearMelbourne,
} from '@/lib/datetime'
import type { Tables, BookingStatus } from '@/lib/database.types'

type Booking = Tables<'user_bookings'> & {
  listings: Pick<Tables<'listings'>, 'id' | 'title' | 'suburb' | 'address' | 'images'> | null
}

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-gold/10 text-gold-text border-gold/30' },
  confirmed: { label: 'Confirmed', className: 'bg-forest-deep/10 text-forest-deep border-forest-deep/30' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  completed: { label: 'Completed', className: 'bg-muted text-muted-foreground border-border' },
}

export function BookingsDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('user_bookings')
      .select('*, listings(id, title, suburb, address, images)')
      .eq('user_id', user.id)
      .order('scheduled_at', { ascending: true })
      .then(({ data }) => {
        setBookings((data as Booking[]) ?? [])
        setLoading(false)
      })
  }, [user])

  async function cancelBooking(id: string) {
    const supabase = createClient()
    await supabase.from('user_bookings').update({ status: 'cancelled' }).eq('id', id)
    setBookings((b) => b.map((bk) => bk.id === id ? { ...bk, status: 'cancelled' } : bk))
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

  const upcoming = bookings.filter((b) => b.status !== 'cancelled' && b.status !== 'completed' && new Date(b.scheduled_at) >= new Date())
  const past = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled' || new Date(b.scheduled_at) < new Date())

  return (
    <div className="space-y-6">
      <PageHeader />

      {bookings.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-ink border-b border-border pb-2">Upcoming</h2>
              {upcoming.map((booking) => (
                <BookingCard key={booking.id} booking={booking} onCancel={cancelBooking} />
              ))}
            </section>
          )}
          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">Past & Cancelled</h2>
              {past.map((booking) => (
                <BookingCard key={booking.id} booking={booking} onCancel={cancelBooking} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  )
}

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel: (id: string) => void }) {
  const listing = booking.listings
  const cfg = statusConfig[booking.status]
  const dt = new Date(booking.scheduled_at)
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'

  return (
    <div className="rounded border border-border bg-white p-4 flex gap-4">
      {/* Date block */}
      <div className="shrink-0 w-14 rounded bg-forest-deep/5 border border-forest-deep/10 flex flex-col items-center justify-center py-2 text-center">
        <span className="text-[0.625rem] text-muted-foreground uppercase tracking-wider">
          {formatMonthShortMelbourne(dt)}
        </span>
        <span className="text-2xl font-serif text-forest-deep leading-none">
          {formatDayOfMonthMelbourne(dt)}
        </span>
        <span className="text-[0.625rem] text-muted-foreground">
          {formatYearMelbourne(dt)}
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
            <Clock className="w-3 h-3" />
            {formatTimeMelbourne(dt, { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
          {listing?.suburb && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {listing.suburb}
            </span>
          )}
        </div>
        {booking.notes && (
          <p className="text-xs text-muted-foreground italic mb-2 line-clamp-2">{booking.notes}</p>
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
              onClick={() => onCancel(booking.id)}
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
      <h1 className="font-serif text-3xl text-ink">My Bookings</h1>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded border border-dashed border-border bg-white p-12 text-center">
      <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
      <h2 className="font-serif text-xl text-ink mb-2">No bookings yet</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Book a private viewing from any property listing page.
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
