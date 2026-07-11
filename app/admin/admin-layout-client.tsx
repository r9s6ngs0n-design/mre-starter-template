'use client'

import { AdminShell } from '@/components/admin/admin-shell'
import { usePathname } from 'next/navigation'

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login'

  if (isLogin) return <>{children}</>

  return <AdminShell>{children}</AdminShell>
}
