'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { Heart, Calendar, ClipboardList, X, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropertyActionsProps {
  listingId: string
  listingTitle: string
}

type Modal = 'booking' | 'inspection' | null

export function PropertyActions({ listingId, listingTitle }: PropertyActionsProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [isFavourited, setIsFavourited] = useState(false)
  const [favouriteId, setFavouriteId] = useState<string | null>(null)
  const [modal, setModal] = useState<Modal>(null)
  const [done, setDone] = useState<Modal>(null)

  // Load existing favourite
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('user_favourites')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) { setIsFavourited(true); setFavouriteId(data.id) }
      })
  }, [user, listingId])

  function requireAuth() {
    router.push(`/login?redirect=/property/${listingId}`)
  }

  async function toggleFavourite() {
    if (!user) { requireAuth(); return }
    const supabase = createClient()
    if (isFavourited && favouriteId) {
      await supabase.from('user_favourites').delete().eq('id', favouriteId)
      setIsFavourited(false)
      setFavouriteId(null)
    } else {
      const { data } = await supabase
        .from('user_favourites')
        .insert({ user_id: user.id, listing_id: listingId })
        .select('id')
        .single()
      if (data) { setIsFavourited(true); setFavouriteId(data.id) }
    }
  }

  return (
    <>
      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={toggleFavourite}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm rounded border transition-colors',
            isFavourited
              ? 'bg-forest-deep text-cream border-forest-deep'
              : 'bg-white text-ink border-border hover:border-forest-deep hover:text-forest-deep'
          )}
        >
          <Heart className={cn('w-4 h-4', isFavourited && 'fill-current')} />
          {isFavourited ? 'Saved' : 'Save'}
        </button>

        <button
          onClick={() => { if (!user) { requireAuth(); return } setModal('booking') }}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded border border-border bg-white text-ink hover:border-forest-deep hover:text-forest-deep transition-colors"
        >
          <Calendar className="w-4 h-4" />
          Book a Viewing
        </button>

        <button
          onClick={() => { if (!user) { requireAuth(); return } setModal('inspection') }}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded border border-border bg-white text-ink hover:border-forest-deep hover:text-forest-deep transition-colors"
        >
          <ClipboardList className="w-4 h-4" />
          Register for Inspection
        </button>
      </div>

      {/* Modals */}
      {modal === 'booking' && (
        <BookingModal
          listingId={listingId}
          listingTitle={listingTitle}
          userId={user!.id}
          isPending={isPending}
          startTransition={startTransition}
          onClose={() => setModal(null)}
          onDone={() => { setModal(null); setDone('booking') }}
        />
      )}
      {modal === 'inspection' && (
        <InspectionModal
          listingId={listingId}
          listingTitle={listingTitle}
          userId={user!.id}
          isPending={isPending}
          startTransition={startTransition}
          onClose={() => setModal(null)}
          onDone={() => { setModal(null); setDone('inspection') }}
        />
      )}

      {/* Success toast */}
      {done && (
        <SuccessToast
          message={done === 'booking' ? 'Viewing booked! Check your dashboard.' : 'Inspection registered! Check your dashboard.'}
          onDismiss={() => setDone(null)}
          dashboardHref={done === 'booking' ? '/dashboard/bookings' : '/dashboard/inspections'}
        />
      )}
    </>
  )
}

// ─── Booking Modal ───────────────────────────────────────────────────────────

interface BookingModalProps {
  listingId: string
  listingTitle: string
  userId: string
  isPending: boolean
  startTransition: (fn: () => void) => void
  onClose: () => void
  onDone: () => void
}

function BookingModal({ listingId, userId, isPending, startTransition, onClose, onDone }: BookingModalProps) {
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().slice(0, 10)

  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!date) { setError('Please select a date.'); return }
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const scheduledAt = `${date}T${time}:00`
      const { error } = await supabase.from('user_bookings').insert({
        user_id: userId,
        listing_id: listingId,
        scheduled_at: scheduledAt,
        notes: notes.trim() || null,
      })
      if (error) { setError(error.message) } else { onDone() }
    })
  }

  return (
    <ModalWrapper onClose={onClose}>
      <h3 className="font-serif text-xl text-ink mb-1">Book a Private Viewing</h3>
      <p className="text-xs text-muted-foreground mb-5">
        Submit your preferred time and our team will confirm shortly.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Date *</label>
            <input type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)}
              required className={fieldClass} />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Preferred Time *</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              required className={fieldClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific questions or requirements…"
            rows={3} className={cn(fieldClass, 'resize-none')} />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm border border-border rounded text-muted-foreground hover:text-ink transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-forest-deep text-cream rounded hover:bg-forest disabled:opacity-50 transition-colors">
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Confirm Booking
          </button>
        </div>
      </form>
    </ModalWrapper>
  )
}

// ─── Inspection Modal ────────────────────────────────────────────────────────

interface InspectionModalProps {
  listingId: string
  listingTitle: string
  userId: string
  isPending: boolean
  startTransition: (fn: () => void) => void
  onClose: () => void
  onDone: () => void
}

function InspectionModal({ listingId, userId, isPending, startTransition, onClose, onDone }: InspectionModalProps) {
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().slice(0, 10)

  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!date) { setError('Please select a date.'); return }
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.from('user_inspections').insert({
        user_id: userId,
        listing_id: listingId,
        inspection_date: date,
        inspection_time: `${time}:00`,
        notes: notes.trim() || null,
      })
      if (error) { setError(error.message) } else { onDone() }
    })
  }

  return (
    <ModalWrapper onClose={onClose}>
      <h3 className="font-serif text-xl text-ink mb-1">Register for Open Inspection</h3>
      <p className="text-xs text-muted-foreground mb-5">
        Enter your preferred inspection date and time.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Date *</label>
            <input type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)}
              required className={fieldClass} />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Time *</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              required className={fieldClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything you'd like us to know…"
            rows={2} className={cn(fieldClass, 'resize-none')} />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm border border-border rounded text-muted-foreground hover:text-ink transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-forest-deep text-cream rounded hover:bg-forest disabled:opacity-50 transition-colors">
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Register
          </button>
        </div>
      </form>
    </ModalWrapper>
  )
}

// ─── Shared UI ───────────────────────────────────────────────────────────────

function ModalWrapper({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
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
        {children}
      </div>
    </div>
  )
}

function SuccessToast({ message, onDismiss, dashboardHref }: { message: string; onDismiss: () => void; dashboardHref: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-forest-deep text-cream rounded shadow-lg px-4 py-3 max-w-sm">
      <CheckCircle2 className="w-5 h-5 text-gold mt-0.5 shrink-0" />
      <div className="flex-1 text-sm">
        <p>{message}</p>
        <a href={dashboardHref} className="text-gold underline underline-offset-2 text-xs mt-0.5 block">
          Go to dashboard →
        </a>
      </div>
      <button onClick={onDismiss} className="text-cream/60 hover:text-cream transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

const fieldClass = cn(
  'w-full rounded border border-border bg-white px-3 py-2 text-sm text-ink',
  'placeholder:text-muted-foreground',
  'focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold',
  'transition-colors'
)
