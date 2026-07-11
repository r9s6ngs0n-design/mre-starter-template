import type { Metadata } from 'next'
import { AdminLayoutClient } from './admin-layout-client'
import { SITE_NAME } from '@/lib/seo'

export const metadata: Metadata = {
  title: {
    default: `Admin | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
