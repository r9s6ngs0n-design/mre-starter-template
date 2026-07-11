'use client'

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { NavLink } from "@/components/nav-link"
import { SiteLogo } from "@/components/site-logo"
import { StaffAuthDialog } from "@/components/staff-auth-dialog"
import { useAuth } from "@/contexts/auth-context"
import { useNavigationPending } from "@/contexts/navigation-context"
import { duration, easeEditorial } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { SITE_NAME } from "@/lib/seo"

const HERO_TRANSPARENT_PATHS = new Set(["/", "/buy", "/rent", "/projects", "/commercial", "/about"])

const links = [
  { label: "Buy", href: "/buy" },
  { label: "Rent", href: "/rent" },
  { label: "Off the Plan", href: "/projects" },
  { label: "Commercial", href: "/commercial" },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
]

interface SiteNavProps {
  transparentOverHero?: boolean
}

export function SiteNav({ transparentOverHero }: SiteNavProps) {
  const { user, profile, loading, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const navigating = useNavigationPending()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")

  useEffect(() => {
    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24)
        ticking = false
      })
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  function openAuth(mode: "signin" | "signup") {
    setAuthMode(mode)
    setAuthOpen(true)
    setMenuOpen(false)
  }

  async function handleSignOut() {
    await signOut()
    setMenuOpen(false)
    router.push("/")
  }

  const overHero = transparentOverHero ?? HERO_TRANSPARENT_PATHS.has(pathname)
  const solid = scrolled || !overHero || navigating
  const isAuthenticated = Boolean(user)
  const isStaff = Boolean(
    profile && (profile.role === 'admin' || profile.role === 'agent') && !profile.suspended_at,
  )

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[background-color]",
          solid ? "bg-forest-deep/95 backdrop-blur-sm" : "bg-transparent",
        )}
      >
        <nav className="container-wide flex h-20 items-center gap-6 lg:gap-8">
          <div className="shrink-0">
            <NavLink
              href="/"
              className="inline-flex items-center leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              aria-label={`${SITE_NAME} home`}
            >
              <SiteLogo variant="light" size="nav" priority />
            </NavLink>
          </div>

          <ul className="hidden min-w-0 flex-1 items-center justify-center gap-7 lg:flex xl:gap-9">
            {links.map((l) => {
              const isActive = pathname === l.href
              return (
                <li key={l.href} className="shrink-0">
                  <NavLink
                    href={l.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`whitespace-nowrap text-sm transition-colors hover:text-cream ${
                      isActive
                        ? "text-cream underline decoration-gold/60 underline-offset-4"
                        : "text-cream/85"
                    }`}
                  >
                    {l.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>

          <div className="ml-auto flex shrink-0 items-center gap-6 lg:ml-0 lg:gap-8">
            {!loading && (
              <>
                {isStaff ? (
                  <>
                    <NavLink
                      href="/admin"
                      className="hidden whitespace-nowrap text-sm text-cream/85 transition-colors hover:text-cream lg:inline-block"
                    >
                      Dashboard
                    </NavLink>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="hidden whitespace-nowrap text-xs uppercase tracking-[0.14em] text-cream/70 transition-colors hover:text-cream lg:inline-block"
                    >
                      Sign out
                    </button>
                  </>
                ) : isAuthenticated ? (
                  <>
                    <NavLink
                      href="/dashboard"
                      className="hidden whitespace-nowrap text-sm text-cream/85 transition-colors hover:text-cream lg:inline-block"
                    >
                      My Dashboard
                    </NavLink>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="hidden whitespace-nowrap text-xs uppercase tracking-[0.14em] text-cream/70 transition-colors hover:text-cream lg:inline-block"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <NavLink
                    href="/login"
                    className="hidden whitespace-nowrap text-sm text-cream/85 transition-colors hover:text-cream lg:inline-block"
                  >
                    Login / Sign up
                  </NavLink>
                )}
              </>
            )}
            <NavLink
              href="/contact"
              className="hidden whitespace-nowrap rounded-full border border-gold/70 px-5 py-2 text-xs uppercase tracking-[0.16em] text-cream transition-colors hover:bg-gold hover:text-forest-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-forest-deep lg:inline-block"
            >
              Request an Appraisal
            </NavLink>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="text-cream lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" strokeWidth={1.5} />
            </button>
          </div>
        </nav>
      </header>

      <StaffAuthDialog open={authOpen} onOpenChange={setAuthOpen} initialMode={authMode} />

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-cream lg:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: duration.base, ease: easeEditorial }}
          >
            <div className="container-wide grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="flex h-full items-center justify-self-start">
                <SiteLogo variant="dark" size="nav" />
              </div>
              <div />
              <div className="flex items-center justify-end justify-self-end">
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="text-forest-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                >
                  <X className="h-6 w-6" strokeWidth={1.5} />
                </button>
              </div>
            </div>
            <ul className="container-wide mt-8 flex flex-col gap-1">
              {links.map((l, i) => (
                <motion.li
                  key={l.href}
                  className="border-b border-border"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05, duration: duration.fast, ease: easeEditorial } }}
                  exit={{ opacity: 0, x: 24, transition: { delay: (links.length - 1 - i) * 0.04, duration: duration.fast * 0.7, ease: easeEditorial } }}
                >
                  <NavLink
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-5 font-serif text-3xl font-light text-ink"
                  >
                    {l.label}
                  </NavLink>
                </motion.li>
              ))}
            </ul>
            <div className="container-wide mt-8 flex flex-col gap-3">
              {!loading && (
                <>
                  {isStaff ? (
                    <>
                      <NavLink
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="inline-block bg-forest-deep px-6 py-3 text-xs uppercase tracking-[0.16em] text-cream"
                      >
                        Dashboard
                      </NavLink>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="text-left text-sm text-muted-foreground"
                      >
                        Sign out
                      </button>
                    </>
                  ) : isAuthenticated ? (
                    <>
                      <NavLink
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="inline-block bg-forest-deep px-6 py-3 text-xs uppercase tracking-[0.16em] text-cream"
                      >
                        My Dashboard
                      </NavLink>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="text-left text-sm text-muted-foreground"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <NavLink
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="inline-block bg-forest-deep px-6 py-3 text-xs uppercase tracking-[0.16em] text-cream"
                    >
                      Login / Sign up
                    </NavLink>
                  )}
                </>
              )}
              <NavLink
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="mt-2 inline-block border border-forest-deep px-6 py-3 text-xs uppercase tracking-[0.16em] text-forest-deep"
              >
                Request an Appraisal
              </NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
