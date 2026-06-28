'use client'

import { AdminShell } from '@/components/admin/admin-shell'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login'

  if (isLogin) return <>{children}</>

  return <AdminShell>{children}</AdminShell>
}
