'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { StaffAuthForm } from '@/components/staff-auth-form'

function AdminLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="font-serif text-2xl text-amber-500/90">MR ESTATES</h1>
        <p className="mt-1 text-sm text-zinc-500">Staff access</p>

        <div className="mt-8 [&_label]:text-zinc-500 [&_input]:border-zinc-700 [&_input]:bg-zinc-950 [&_input]:text-zinc-100 [&_button[type=submit]]:bg-amber-700 [&_button[type=submit]]:text-zinc-950 [&_.border-border]:border-zinc-800 [&_.text-ink]:text-zinc-100 [&_.text-muted-foreground]:text-zinc-500 [&_.text-forest]:text-amber-400">
          <StaffAuthForm
            initialMode={mode}
            onSuccess={() => router.push(searchParams.get('redirect') ?? '/admin')}
          />
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          <Link href="/" className="hover:text-zinc-400">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginContent />
    </Suspense>
  )
}
