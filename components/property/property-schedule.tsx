'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { Gavel, Clock, X, Loader2, CheckCircle2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Tables } from '@/lib/database.types'

type InspectionTime = Tables<'listing_inspection_times'>

interface PropertyScheduleProps {
  listingId: string
  listingTitle: string
  auctionAt: string | null
  auctionLocation: string | null
  auctionNotes: string | null
  auctionCancelled: boolean
  inspectionTimes: InspectionTime[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function PropertySchedule({
  listingId,
  listingTitle,
  auctionAt,
  auctionLocation,
  auctionNotes,
  auctionCancelled,
  inspectionTimes,
}: PropertyScheduleProps) {
  const now = new Date()

  const upcomingInspections = inspectionTimes.filter(
    (t) => !t.is_cancelled && new Date(t.starts_at) > now
  )

  const hasAuction = !!auctionAt
  const hasInspections = upcomingInspections.length > 0

  if (!hasAuction && !hasInspections) return null

  return (
    <div className="border-t border-border mt-6 pt-6 space-y-4">
      {/* ── Auction ── */}
      {hasAuction && (
        <AuctionBlock
          auctionAt={auctionAt!}
          auctionLocation={auctionLocation}
          auctionNotes={auctionNotes}
          auctionCancelled={auctionCancelled}
          listingId={listingId}
          listingTitle={listingTitle}
        />
      )}

      {/* ── Open Inspections ── */}
      {hasInspections && (
        <InspectionsBlock
          inspections={upcomingInspections}
          listingId={listingId}
          listingTitle={listingTitle}
        />
      )}
    </div>
  )
}

// ─── Auction Block ────────────────────────────────────────────────────────────

function AuctionBlock({
  auctionAt,
  auctionLocation,
  auctionNotes,
  auctionCancelled,
  listingId,
  listingTitle,
}: {
  auctionAt: string
  auctionLocation: string | null
  auctionNotes: string | null
  auctionCancelled: boolean
  listingId: string
  listingTitle: string
}) {
  const [showModal, setShowModal] = useState(false)
  const [done, setDone] = useState(false)
  const isPast = new Date(auctionAt) < new Date()

  return (
    <div className={cn(
      'rounded border p-4',
      auctionCancelled || isPast
        ? 'border-border bg-surface/40 opacity-60'
        : 'border-gold/40 bg-gold/5'
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Gavel className={cn('w-4 h-4 mt-0.5 shrink-0', auctionCancelled || isPast ? 'text-muted-foreground' : 'text-gold')} />
          <div>
            <p className={cn('text-[10px] font-semibold uppercase tracking-wider mb-0.5', auctionCancelled || isPast ? 'text-muted-foreground' : 'text-gold')}>
              {auctionCancelled ? 'Auction — Cancelled' : isPast ? 'Auction — Concluded' : 'Auction'}
            </p>
            <p className="text-sm font-medium text-ink">
              {formatDate(auctionAt)} at {formatTime(auctionAt)}
            </p>
            {auctionLocation && (
              <p className="text-xs text-muted-foreground mt-0.5">{auctionLocation}</p>
            )}
            {auctionNotes && (
              <p className="text-xs text-muted-foreground mt-1 italic">{auctionNotes}</p>
            )}
          </div>
        </div>
        {!auctionCancelled && !isPast && !done && (
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 px-3 py-1.5 text-xs bg-gold text-ink font-medium rounded hover:bg-gold/80 transition-colors"
          >
            Register
          </button>
        )}
        {done && (
          <span className="shrink-0 flex items-center gap-1 text-xs text-forest-deep">
            <CheckCircle2 className="w-3.5 h-3.5" /> Registered
          </span>
        )}
      </div>

      {showModal && (
        <EventRegistrationModal
          type="auction"
          listingId={listingId}
          listingTitle={listingTitle}
          eventLabel={`Auction — ${formatDate(auctionAt)} at ${formatTime(auctionAt)}`}
          onClose={() => setShowModal(false)}
          onDone={() => { setShowModal(false); setDone(true) }}
        />
      )}
    </div>
  )
}

// ─── Inspections Block ────────────────────────────────────────────────────────

function InspectionsBlock({
  inspections,
  listingId,
  listingTitle,
}: {
  inspections: InspectionTime[]
  listingId: string
  listingTitle: string
}) {
  const [activeSlot, setActiveSlot] = useState<InspectionTime | null>(null)
  const [doneSlots, setDoneSlots] = useState<Set<string>>(new Set())

  return (
    <div className="rounded border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-forest-deep" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-forest-deep">
          Open Inspections
        </p>
      </div>
      <div className="space-y-2">
        {inspections.map((slot) => {
          const registered = doneSlots.has(slot.id)
          return (
            <div
              key={slot.id}
              className="flex items-center justify-between gap-4 py-2 border-t border-border/50 first:border-t-0"
            >
              <div>
                <p className="text-sm text-ink">
                  {formatDate(slot.starts_at)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(slot.starts_at)} – {formatTime(slot.ends_at)}
                  {slot.notes && ` · ${slot.notes}`}
                </p>
              </div>
              {registered ? (
                <span className="shrink-0 flex items-center gap-1 text-xs text-forest-deep">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                </span>
              ) : (
                <button
                  onClick={() => setActiveSlot(slot)}
                  className="shrink-0 px-3 py-1.5 text-xs border border-forest-deep text-forest-deep rounded hover:bg-forest-deep hover:text-cream transition-colors"
                >
                  Register
                </button>
              )}
            </div>
          )
        })}
      </div>

      {activeSlot && (
        <EventRegistrationModal
          type="inspection"
          listingId={listingId}
          listingTitle={listingTitle}
          inspectionTimeId={activeSlot.id}
          eventLabel={`${formatDate(activeSlot.starts_at)}, ${formatTime(activeSlot.starts_at)} – ${formatTime(activeSlot.ends_at)}`}
          onClose={() => setActiveSlot(null)}
          onDone={() => {
            setDoneSlots((prev) => new Set(prev).add(activeSlot.id))
            setActiveSlot(null)
          }}
        />
      )}
    </div>
  )
}

// ─── Registration Modal ───────────────────────────────────────────────────────

interface RegistrationModalProps {
  type: 'auction' | 'inspection'
  listingId: string
  listingTitle: string
  inspectionTimeId?: string
  eventLabel: string
  onClose: () => void
  onDone: () => void
}

function EventRegistrationModal({
  type,
  listingId,
  inspectionTimeId,
  eventLabel,
  onClose,
  onDone,
}: RegistrationModalProps) {
  const { user } = useAuth()
  const [isPending, startTransition] = useTransition()

  const [fullName, setFullName] = useState(user?.user_metadata?.full_name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [mobile, setMobile] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !email.trim()) {
      setError('Please fill in your name and email.')
      return
    }
    setError(null)
    startTransition(async () => {
      const supabase = createClient()

      // Insert into leads for CRM visibility
      const { error: leadError } = await supabase.from('leads').insert({
        full_name: fullName.trim(),
        email: email.trim(),
        mobile: mobile.trim() || null,
        category: 'buyer',
        enquiry_type: type === 'auction' ? 'auction_registration' : 'inspection_registration',
        status: 'new',
        source: 'property_schedule',
        listing_id: listingId,
        requirements: inspectionTimeId ? `Inspection slot: ${inspectionTimeId}` : null,
      })

      if (leadError) {
        setError(leadError.message)
        return
      }

      onDone()
    })
  }

  const isLoggedIn = !!user

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white rounded shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-ink transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          {type === 'auction' ? (
            <Gavel className="w-4 h-4 text-gold" />
          ) : (
            <Clock className="w-4 h-4 text-forest-deep" />
          )}
          <h3 className="font-serif text-xl text-ink">
            {type === 'auction' ? 'Register for Auction' : 'Register for Inspection'}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground mb-5">{eventLabel}</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Full Name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
              readOnly={isLoggedIn && !!fullName}
              className={cn(fieldClass, isLoggedIn && fullName ? 'bg-surface text-muted-foreground' : '')}
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              readOnly={isLoggedIn}
              className={cn(fieldClass, isLoggedIn ? 'bg-surface text-muted-foreground' : '')}
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Mobile</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+61 4xx xxx xxx"
              className={fieldClass}
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded text-muted-foreground hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-forest-deep text-cream rounded hover:bg-forest disabled:opacity-50 transition-colors"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Confirm Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const fieldClass = cn(
  'w-full rounded border border-border bg-white px-3 py-2 text-sm text-ink',
  'placeholder:text-muted-foreground',
  'focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold',
  'transition-colors'
)
