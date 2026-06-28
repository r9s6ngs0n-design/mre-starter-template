import { Suspense } from 'react'
import { Metadata } from 'next'
import { UserAuthForm } from '@/components/user-auth-form'

export const metadata: Metadata = {
  title: 'Sign In | {{BRAND_NAME}}',
  description: 'Sign in to your {{BRAND_NAME}} account to manage favourites, bookings and inspections.',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <p className="text-[0.6875rem] tracking-[0.2em] uppercase text-gold-text mb-3">
            Member Portal
          </p>
          <h1 className="font-serif text-4xl text-ink">Welcome Back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account or create one to save listings and book inspections.
          </p>
        </div>
        <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading…</div>}>
          <UserAuthForm />
        </Suspense>
      </div>
    </main>
  )
}
