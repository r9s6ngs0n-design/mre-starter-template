'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

type Mode = 'signin' | 'signup'

export function UserAuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, signUp } = useAuth()

  const [mode, setMode] = useState<Mode>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState(false)

  const redirect = searchParams.get('redirect') ?? '/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) { setError(error); return }
        router.push(redirect)
        router.refresh()
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match.')
          return
        }
        if (password.length < 8) {
          setError('Password must be at least 8 characters.')
          return
        }
        const { error, needsEmailConfirmation } = await signUp(email, password, fullName)
        if (error) { setError(error); return }
        if (needsEmailConfirmation) {
          setConfirmation(true)
        } else {
          router.push(redirect)
          router.refresh()
        }
      }
    } finally {
      setLoading(false)
    }
  }

  if (confirmation) {
    return (
      <div className="rounded border border-border bg-white p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-forest-deep/10 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-forest-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl text-ink">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a confirmation link to <strong>{email}</strong>.
          Click it to activate your account and sign in.
        </p>
        <button
          onClick={() => { setConfirmation(false); setMode('signin') }}
          className="text-sm text-gold-text underline underline-offset-2 hover:text-forest-deep transition-colors"
        >
          Back to sign in
        </button>
      </div>
    )
  }

  const inputClass = cn(
    'w-full rounded border border-border bg-white px-3.5 py-2.5 text-sm text-ink',
    'placeholder:text-muted-foreground',
    'focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold',
    'transition-colors'
  )

  return (
    <div className="rounded border border-border bg-white p-8 shadow-sm">
      {/* Mode toggle */}
      <div className="flex mb-6 rounded border border-border overflow-hidden">
        {(['signin', 'signup'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(null) }}
            className={cn(
              'flex-1 py-2 text-sm font-medium transition-colors',
              mode === m
                ? 'bg-forest-deep text-cream'
                : 'bg-white text-muted-foreground hover:text-ink'
            )}
          >
            {m === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs tracking-wide text-muted-foreground mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Smith"
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label className="block text-xs tracking-wide text-muted-foreground mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs tracking-wide text-muted-foreground mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
            required
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            className={inputClass}
          />
        </div>

        {mode === 'signup' && (
          <div>
            <label className="block text-xs tracking-wide text-muted-foreground mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            'w-full py-2.5 text-sm font-medium rounded transition-colors',
            'bg-forest-deep text-cream',
            'hover:bg-forest disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {loading
            ? 'Please wait…'
            : mode === 'signin'
            ? 'Sign In'
            : 'Create Account'}
        </button>
      </form>

      {mode === 'signin' && (
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <button
            onClick={() => { setMode('signup'); setError(null) }}
            className="text-gold-text underline underline-offset-2 hover:text-forest-deep transition-colors"
          >
            Sign up free
          </button>
        </p>
      )}
    </div>
  )
}
