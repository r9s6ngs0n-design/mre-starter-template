'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import { SITE_NAME } from '@/lib/seo'
import { Heart, Calendar, ClipboardList, Settings, LogOut, Home, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

const nav = [
  { href: '/dashboard/favourites', label: 'Favourites', icon: Heart },
  { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
  { href: '/dashboard/inspections', label: 'Inspections', icon: ClipboardList },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, loading, signOut } = useAuth()

  // Staff members belong in the admin dashboard
  useEffect(() => {
    if (loading) return
    if (profile && (profile.role === 'admin' || profile.role === 'agent')) {
      router.replace('/admin')
    }
  }, [profile, loading, router])
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    router.push('/')
    router.refresh()
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : (profile?.email?.[0] ?? 'U').toUpperCase()

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top bar */}
      <header className="h-14 bg-forest-deep flex items-center px-4 md:px-6 gap-4 shrink-0">
        <Link href="/" className="flex items-center gap-2 mr-auto" aria-label="Back to site">
          <Home className="w-4 h-4 text-gold" />
          <span className="hidden sm:inline text-cream/80 text-xs tracking-wide">{SITE_NAME}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors',
                  active
                    ? 'bg-gold/20 text-gold'
                    : 'text-cream/70 hover:text-cream hover:bg-white/10'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Avatar + sign out */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gold/30 flex items-center justify-center text-xs text-gold font-medium">
            {initials}
          </div>
          <button
            onClick={handleSignOut}
            className="hidden md:flex items-center gap-1.5 text-xs text-cream/60 hover:text-cream transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden text-cream/70 hover:text-cream transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-forest border-b border-white/10">
          <nav className="flex flex-col p-4 gap-1">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 text-sm rounded transition-colors',
                    active
                      ? 'bg-gold/20 text-gold'
                      : 'text-cream/70 hover:text-cream hover:bg-white/10'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              )
            })}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-cream/50 hover:text-cream transition-colors mt-2 border-t border-white/10 pt-4"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </nav>
        </div>
      )}

      {/* Sidebar + content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex flex-col w-52 bg-white border-r border-border shrink-0">
          <div className="p-5 border-b border-border">
            <p className="text-xs text-muted-foreground mb-0.5">Signed in as</p>
            <p className="text-sm font-medium text-ink truncate">
              {profile?.full_name ?? profile?.email ?? 'Member'}
            </p>
            {profile?.email && profile.full_name && (
              <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
            )}
          </div>
          <nav className="flex-1 p-3 space-y-0.5">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 text-sm rounded transition-colors',
                    active
                      ? 'bg-forest-deep text-cream'
                      : 'text-ink hover:bg-muted'
                  )}
                >
                  <Icon className={cn('w-4 h-4', active ? 'text-gold' : 'text-muted-foreground')} />
                  {label}
                </Link>
              )
            })}
          </nav>
          <div className="p-3 border-t border-border">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-ink w-full rounded hover:bg-muted transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
