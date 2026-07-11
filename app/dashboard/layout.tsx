import type { Metadata } from 'next'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { SITE_NAME } from '@/lib/seo'

export const metadata: Metadata = {
  title: {
    default: `Dashboard | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
