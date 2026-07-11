'use client'

import { AuthProvider } from '@/contexts/auth-context'
import { usePageTracking } from '@/hooks/use-page-tracking'
import type { ReactNode } from 'react'

function PageTracker() {
  usePageTracking()
  return null
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PageTracker />
      {children}
    </AuthProvider>
  )
}
