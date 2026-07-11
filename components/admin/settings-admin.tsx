'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { useAdminTheme } from '@/contexts/admin-theme-context'
import { cn } from '@/lib/utils'

export function SettingsAdmin() {
  const { profile } = useAuth()
  const { t } = useAdminTheme()
  const [isPending, startTransition] = useTransition()

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const email = profile?.email ?? ''

  function flash(setter: typeof setProfileMsg, ok: boolean, text: string) {
    setter({ ok, text })
    setTimeout(() => setter(null), 4000)
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return

    startTransition(async () => {
      const { error } = await createClient()
        .from('users')
        .update({ full_name: fullName.trim() || null, phone: phone.trim() || null })
        .eq('id', profile.id)

      if (error) {
        flash(setProfileMsg, false, error.message)
      } else {
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
        flash(setPwMsg, true, 'Password updated.')
      }
    })
  }

  const inputClass = cn(t.input, 'w-full px-3 py-2 text-sm')
  const labelClass = cn('mb-1.5 block text-xs', t.textMuted)
  const btnClass = 'bg-amber-700 px-4 py-2 text-sm text-white hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors'

  return (
    <div className="max-w-md space-y-8">
      <h1 className="text-2xl font-medium">Settings</h1>

      <section className={cn(t.panel, 'overflow-hidden')}>
        <div className={cn('border-b px-4 py-3', t.panelBorder)}>
          <h2 className="text-sm font-medium">Profile</h2>
        </div>
        <form onSubmit={saveProfile} className="space-y-3 p-4">
          <div>
            <label htmlFor="admin-full-name" className={labelClass}>
              Full name
            </label>
            <input
              id="admin-full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="admin-phone" className={labelClass}>
              Phone
            </label>
            <input
              id="admin-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className={inputClass}
            />
          </div>
          {profileMsg && <Feedback ok={profileMsg.ok} text={profileMsg.text} />}
          <button type="submit" disabled={isPending} className={btnClass}>
            Save profile
          </button>
        </form>
      </section>

      <section className={cn(t.panel, 'overflow-hidden')}>
        <div className={cn('border-b px-4 py-3', t.panelBorder)}>
          <h2 className="text-sm font-medium">Change password</h2>
          <p className={cn('mt-0.5 text-xs', t.textMuted)}>Must be at least 8 characters.</p>
        </div>
        <form onSubmit={changePassword} className="space-y-3 p-4">
          <div>
            <label htmlFor="admin-current-pw" className={labelClass}>
              Current password
            </label>
            <input
              id="admin-current-pw"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="admin-new-pw" className={labelClass}>
              New password
            </label>
            <input
              id="admin-new-pw"
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
            <label htmlFor="admin-confirm-pw" className={labelClass}>
              Confirm new password
            </label>
            <input
              id="admin-confirm-pw"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          {pwMsg && <Feedback ok={pwMsg.ok} text={pwMsg.text} />}
          <button type="submit" disabled={isPending} className={btnClass}>
            Update password
          </button>
        </form>
      </section>
    </div>
  )
}

function Feedback({ ok, text }: { ok: boolean; text: string }) {
  return (
    <p className={cn('text-sm', ok ? 'text-green-600' : 'text-red-600')}>
      {text}
    </p>
  )
}
