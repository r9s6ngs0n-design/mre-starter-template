'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

const COUNTRIES = [
  'Australia', 'New Zealand', 'United Kingdom', 'United States', 'Canada',
  'China', 'Hong Kong', 'Singapore', 'Malaysia', 'India', 'Japan',
  'South Korea', 'UAE', 'Germany', 'France', 'Italy', 'Spain',
  'South Africa', 'Brazil', 'Other',
]

export function SettingsDashboard() {
  const { profile, refreshProfile } = useAuth()
  const [isPending, startTransition] = useTransition()

  // Profile fields
  const [fullName, setFullName]   = useState(profile?.full_name ?? '')
  const [phone, setPhone]         = useState(profile?.phone ?? '')
  const [country, setCountry]     = useState(profile?.country ?? '')

  // Password fields
  const [currentPw, setCurrentPw]   = useState('')
  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')

  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pwMsg, setPwMsg]           = useState<{ ok: boolean; text: string } | null>(null)

  const email = profile?.email ?? ''

  function flash(setter: typeof setProfileMsg, ok: boolean, text: string) {
    setter({ ok, text })
    setTimeout(() => setter(null), 4000)
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    // Require at least email (always present via auth) OR phone
    if (!email && !phone.trim()) {
      flash(setProfileMsg, false, 'Please provide at least an email or phone number.')
      return
    }
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from('users')
        .update({ full_name: fullName.trim() || null, phone: phone.trim() || null, country: country || null })
        .eq('id', profile!.id)
      if (error) {
        flash(setProfileMsg, false, error.message)
      } else {
        await refreshProfile()
        flash(setProfileMsg, true, 'Profile saved.')
      }
    })
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirmPw) {
      flash(setPwMsg, false, 'New passwords do not match.')
      return
    }
    if (newPw.length < 8) {
      flash(setPwMsg, false, 'Password must be at least 8 characters.')
      return
    }
    startTransition(async () => {
      const supabase = createClient()
      // Re-authenticate, then update
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: currentPw })
      if (signInErr) {
        flash(setPwMsg, false, 'Current password is incorrect.')
        return
      }
      const { error } = await supabase.auth.updateUser({ password: newPw })
      if (error) {
        flash(setPwMsg, false, error.message)
      } else {
        setCurrentPw('')
        setNewPw('')
        setConfirmPw('')
        flash(setPwMsg, true, 'Password updated successfully.')
      }
    })
  }

  const inputClass = cn(
    'w-full rounded border border-border bg-white px-3.5 py-2.5 text-sm text-ink',
    'placeholder:text-muted-foreground',
    'focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'transition-colors'
  )

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[0.6875rem] tracking-[0.15em] uppercase text-gold-text mb-1">Dashboard</p>
        <h1 className="font-serif text-3xl text-ink">Account Settings</h1>
      </div>

      {/* ── Profile ────────────────────────────────────────────────────── */}
      <section className="rounded border border-border bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-medium text-ink">Profile</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            At least one contact method (email or phone) is required.
          </p>
        </div>
        <form onSubmit={saveProfile} className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">
                Email Address
                <span className="ml-1 text-gold-text text-[0.6rem]">(via auth — contact support to change)</span>
              </label>
              <input
                type="email"
                value={email}
                readOnly
                disabled
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">
                Phone Number
                {!email && <span className="ml-1 text-destructive">*</span>}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+61 4XX XXX XXX"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={cn(inputClass, 'cursor-pointer')}
              >
                <option value="">— Select country —</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {profileMsg && <FeedbackBanner ok={profileMsg.ok} text={profileMsg.text} />}

          <div className="pt-1">
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                'flex items-center gap-2 px-5 py-2 text-sm font-medium rounded transition-colors',
                'bg-forest-deep text-cream hover:bg-forest',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Profile
            </button>
          </div>
        </form>
      </section>

      {/* ── Password ───────────────────────────────────────────────────── */}
      <section className="rounded border border-border bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-medium text-ink">Change Password</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Must be at least 8 characters.
          </p>
        </div>
        <form onSubmit={changePassword} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">New Password</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="At least 8 characters"
                required
                autoComplete="new-password"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className={inputClass}
              />
            </div>
          </div>

          {pwMsg && <FeedbackBanner ok={pwMsg.ok} text={pwMsg.text} />}

          <div className="pt-1">
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                'flex items-center gap-2 px-5 py-2 text-sm font-medium rounded transition-colors',
                'bg-forest-deep text-cream hover:bg-forest',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </section>

      {/* ── Danger zone ────────────────────────────────────────────────── */}
      <section className="rounded border border-destructive/20 bg-destructive/5 p-6">
        <h2 className="font-medium text-ink mb-1">Danger Zone</h2>
        <p className="text-xs text-muted-foreground mb-4">
          To delete your account please contact us at{' '}
          <a href="mailto:{{PLACEHOLDER}}" className="text-gold-text underline underline-offset-2">
            {'{{PLACEHOLDER}}'}
          </a>
        </p>
      </section>
    </div>
  )
}

function FeedbackBanner({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={cn(
      'flex items-center gap-2 text-sm px-3 py-2 rounded border',
      ok
        ? 'bg-forest-deep/5 border-forest-deep/20 text-forest-deep'
        : 'bg-destructive/5 border-destructive/20 text-destructive'
    )}>
      {ok
        ? <CheckCircle2 className="w-4 h-4 shrink-0" />
        : <AlertCircle className="w-4 h-4 shrink-0" />}
      {text}
    </div>
  )
}
