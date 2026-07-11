'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'

export type StaffAuthMode = 'signin' | 'signup'

interface StaffAuthFormProps {
  initialMode?: StaffAuthMode
  onSuccess?: () => void
  className?: string
}

export function StaffAuthForm({ initialMode = 'signin', onSuccess, className = '' }: StaffAuthFormProps) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<StaffAuthMode>(initialMode)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (mode === 'signup') {
      const { error: err, needsEmailConfirmation } = await signUp(email, password, fullName)
      setLoading(false)
      if (err) {
        setError(err)
        return
      }
      if (needsEmailConfirmation) {
        setMessage('Account created. Check your email to confirm, then sign in.')
        setMode('signin')
        return
      }
      onSuccess?.()
      return
    }

    const { error: err } = await signIn(email, password)
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    onSuccess?.()
  }

  return (
    <div className={className}>
      <div className="flex gap-4 border-b border-border">
        <button
          type="button"
          onClick={() => {
            setMode('signin')
            setError(null)
            setMessage(null)
          }}
          className={`pb-3 text-sm transition-colors ${
            mode === 'signin' ? 'border-b-2 border-gold text-ink' : 'text-muted-foreground'
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup')
            setError(null)
            setMessage(null)
          }}
          className={`pb-3 text-sm transition-colors ${
            mode === 'signup' ? 'border-b-2 border-gold text-ink' : 'text-muted-foreground'
          }`}
        >
          Create account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === 'signup' && (
          <div>
            <label htmlFor="staff-name" className="text-xs font-medium text-muted-foreground">
              Full name
            </label>
            <input
              id="staff-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full border border-border bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
            />
          </div>
        )}

        <div>
          <label htmlFor="staff-email" className="text-xs font-medium text-muted-foreground">
            Email
          </label>
          <input
            id="staff-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
          />
        </div>

        <div>
          <label htmlFor="staff-password" className="text-xs font-medium text-muted-foreground">
            Password
          </label>
          <input
            id="staff-password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
          />
          {mode === 'signup' && (
            <p className="mt-1 text-xs text-muted-foreground">Minimum 8 characters.</p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-forest">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-forest-deep py-2.5 text-xs uppercase tracking-[0.14em] text-cream transition-colors hover:bg-forest disabled:opacity-50"
        >
          {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <p className="mt-4 text-xs text-muted-foreground">
        Sign in to access your MR ESTATES account.
      </p>
    </div>
  )
}
