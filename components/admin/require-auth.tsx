'use client'

import { useAuth } from '@/contexts/auth-context'
import { useAdminTheme } from '@/contexts/admin-theme-context'
import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import type { UserRole } from '@/lib/database.types'

interface RequireAuthProps {
  children: ReactNode
  role?: UserRole | UserRole[]
}

export function RequireAuth({ children, role }: RequireAuthProps) {
  const { user, profile, loading } = useAuth()
  const { t } = useAdminTheme()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user || !profile) {
      router.replace('/admin/login')
      return
    }
    if (profile.suspended_at) {
      router.replace('/admin/login')
      return
    }
    // Site users (role: 'user') are not staff — send them to their dashboard
    if (profile.role === 'user') {
      router.replace('/dashboard')
      return
    }
    if (role) {
      const allowed = Array.isArray(role) ? role : [role]
      if (!allowed.includes(profile.role)) {
        router.replace('/admin')
      }
    }
  }, [user, profile, loading, role, router])

  if (loading || !user || !profile) {
    return (
      <div className={t.requireAuthBg}>
        Loading…
      </div>
    )
  }

  return <>{children}</>
}
