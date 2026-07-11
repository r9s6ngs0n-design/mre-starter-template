'use client'

import { NavLink } from "@/components/nav-link"
import { Instagram, Linkedin, Facebook } from "lucide-react"
import { useState } from "react"
import { SiteLogo } from "@/components/site-logo"
import { subscribeNewsletter } from "@/lib/leads"
import type { SiteDocument } from "@/lib/documents"
import { DocumentFooterLinks } from "@/components/documents/document-resources"

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Buy", href: "/buy" },
      { label: "Rent", href: "/rent" },
      { label: "Off the Plan", href: "/projects" },
      { label: "Commercial", href: "/commercial" },
    ],
  },
  {
    title: "Agency",
    links: [
      { label: "About", href: "/about" },
      { label: "Insights", href: "/insights" },
      { label: "Contact", href: "/contact" },
    ],
  },
]

export function SiteFooter({ documents = [] }: { documents?: SiteDocument[] }) {
  const [role, setRole] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !role) return
    setLoading(true)
    setError(null)
    const { error: err } = await subscribeNewsletter({ email, interest: role })
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    setDone(true)
    setEmail("")
  }

  return (
    <footer className="bg-forest-deep text-cream">
      <div className="container-wide py-16 md:py-20">
        <div
          className={
            documents.length > 0
              ? 'grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr]'
              : 'grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]'
          }
        >
          <div>
            <NavLink href="/" aria-label="MR Estates home">
              <SiteLogo variant="light" size="lg" />
            </NavLink>
            <p className="mt-5 max-w-xs text-pretty text-sm leading-relaxed text-cream/70">
              A premium Melbourne agency for off-the-plan projects, residential sales, rentals and commercial property.
              Curated, organised, calm.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow !text-gold">{col.title}</h3>
              <ul className="mt-5 flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <NavLink href={l.href} className="text-sm text-cream/75 transition-colors hover:text-gold">
                      {l.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {documents.length > 0 && <DocumentFooterLinks documents={documents} />}

          <div>
            <h3 className="eyebrow !text-gold">Stay informed</h3>
            <p className="mt-5 text-sm leading-relaxed text-cream/70">
              Receive curated releases and market insight before they reach the public.
            </p>
            <form className="mt-5 flex flex-col gap-3" aria-label="Newsletter signup" onSubmit={handleNewsletter}>
              <label className="sr-only" htmlFor="footer-role">
                I am a
              </label>
              <select
                id="footer-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full border border-cream/20 bg-transparent px-4 py-3 text-sm text-cream focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold [&>option]:text-ink"
              >
                <option value="" disabled>
                  I am a…
                </option>
                <option value="buyer">Buyer</option>
                <option value="vendor">Vendor</option>
                <option value="landlord">Landlord</option>
                <option value="tenant">Tenant</option>
              </select>
              <div className="flex">
                <label className="sr-only" htmlFor="footer-email">
                  Email address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full border border-cream/20 bg-transparent px-4 py-3 text-sm text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
                />
                <button
                  type="submit"
                  disabled={loading || done}
                  className="shrink-0 bg-gold px-5 text-xs uppercase tracking-[0.14em] text-forest-deep transition-colors hover:bg-[#8a6a22] active:bg-[#7a5e1c] disabled:opacity-50"
                >
                  {done ? "Joined" : loading ? "…" : "Join"}
                </button>
              </div>
              {error && <p className="text-xs text-destructive-foreground">{error}</p>}
            </form>
          </div>
        </div>

        <div className="mt-14 h-px w-full bg-cream/15" />

        <div className="mt-8 grid gap-6 text-sm text-cream/65 md:grid-cols-3">
          <div>
            <p className="eyebrow !text-cream/50">Office</p>
            <p className="mt-3 leading-relaxed">
              Level 2, 530 Collins Street
              <br />
              Melbourne VIC 3000
            </p>
          </div>
          <div>
            <p className="eyebrow !text-cream/50">Contact</p>
            <p className="mt-3 leading-relaxed">
              <a href="tel:+61398249824" className="transition-colors hover:text-gold">
                (03) 9824 9824
              </a>
              <br />
              <a href="mailto:hello@mrestates.com.au" className="transition-colors hover:text-gold">
                hello@mrestates.com.au
              </a>
            </p>
          </div>
          <div>
            <p className="eyebrow !text-cream/50">Follow</p>
            <div className="mt-3 flex gap-4">
              <a href="#" aria-label="Instagram" className="text-cream/65 transition-colors hover:text-gold">
                <Instagram className="h-5 w-5" strokeWidth={1.5} />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-cream/65 transition-colors hover:text-gold">
                <Linkedin className="h-5 w-5" strokeWidth={1.5} />
              </a>
              <a href="#" aria-label="Facebook" className="text-cream/65 transition-colors hover:text-gold">
                <Facebook className="h-5 w-5" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-cream/15 pt-6 text-xs text-cream/45 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} MR Estates. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-gold">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-gold">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-gold">
              Disclaimer
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
