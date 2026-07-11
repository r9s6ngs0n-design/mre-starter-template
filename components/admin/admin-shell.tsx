'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Moon,
  Settings,
  Star,
  Sun,
  Users,
  Building2,
  PenSquare,
  UserCog,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { AdminThemeProvider, useAdminTheme } from '@/contexts/admin-theme-context'
import { RequireAuth } from '@/components/admin/require-auth'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/leads', label: 'Leads', icon: MessageSquare },
  { href: '/admin/listings', label: 'Listings', icon: Building2 },
  { href: '/admin/blog', label: 'Insights', icon: PenSquare },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { href: '/admin/team', label: 'Team', icon: Users },
  { href: '/admin/documents', label: 'Documents', icon: FolderOpen },
  { href: '/admin/page-content', label: 'Page Content', icon: FileText },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: UserCog, adminOnly: true },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()
  const { isDayMode, toggleTheme, t } = useAdminTheme()

  return (
    <RequireAuth>
      <div className={cn('flex min-h-screen transition-colors duration-300', t.wrapper)}>
        <aside className={cn('hidden w-56 shrink-0 border-r md:flex md:flex-col', t.aside)}>
          <Link
            href="/"
            className={cn(
              'block border-b px-5 py-5 transition-colors focus:outline-none focus-visible:ring-2',
              t.logoLink
            )}
            aria-label="MR Estates home"
          >
            <p className={cn('font-serif text-lg', t.logoTitle)}>MR ESTATES</p>
            <p className={cn('text-xs', t.logoSub)}>Admin CRM</p>
          </Link>
          <nav className="flex-1 space-y-0.5 p-3">
            {nav
              .filter((item) => !item.adminOnly || profile?.role === 'admin')
              .map((item) => {
                const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                      active ? t.navActive : t.navInactive
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className={cn('flex items-center justify-between border-b px-4 py-3 md:px-6', t.header)}>
            <Link
              href="/"
              className={cn(
                'md:hidden font-serif transition-colors focus:outline-none focus-visible:ring-2',
                t.mobileLogo
              )}
              aria-label="MR Estates home"
            >
              MR ESTATES Admin
            </Link>
            <div className="ml-auto flex items-center gap-3">
              <span className={cn('rounded-full border px-2.5 py-0.5 text-xs capitalize', t.badge)}>
                {profile?.role}
              </span>
              <span className={cn('hidden text-sm sm:inline', t.userName)}>{profile?.full_name}</span>

              <button
                type="button"
                onClick={toggleTheme}
                title={isDayMode ? 'Switch to night mode' : 'Switch to day mode'}
                aria-label={isDayMode ? 'Switch to night mode' : 'Switch to day mode'}
                className={cn(
                  'flex items-center justify-center rounded-md p-1.5 transition-colors',
                  t.toggleBtn
                )}
              >
                {isDayMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={() => signOut()}
                className={cn('flex items-center gap-1.5 text-sm', t.signOut)}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </RequireAuth>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </AdminThemeProvider>
  )
}
