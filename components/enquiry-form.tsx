"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { enquiryTypes } from "@/lib/data"
import { submitLead, type EnquiryPreset } from "@/lib/leads"

interface EnquiryFormProps {
  title?: string
  presetType?: string
  presetEnquiryType?: EnquiryPreset
  listingId?: string
  variant?: "light" | "dark"
  compact?: boolean
  className?: string
}

export function EnquiryForm({
  title,
  presetType,
  presetEnquiryType,
  listingId,
  variant = "light",
  compact = false,
  className = "",
}: EnquiryFormProps) {
  const [type, setType] = useState(presetType ?? enquiryTypes[0].value)
  const [subtype, setSubtype] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [budgetRange, setBudgetRange] = useState("")
  const [requirements, setRequirements] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dark = variant === "dark"
  const currentType = enquiryTypes.find((t) => t.value === type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: err } = await submitLead({
      fullName,
      email,
      mobile: mobile || undefined,
      budgetRange: budgetRange || undefined,
      requirements: requirements || undefined,
      formType: type as 'buying' | 'selling' | 'management' | 'renting',
      subtype: subtype || undefined,
      presetEnquiryType: presetEnquiryType ?? (listingId ? 'register_interest' : undefined),
      listingId,
    })

    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    setSubmitted(true)
  }

  const fieldClass = dark
    ? "w-full border border-cream/20 bg-transparent px-3 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 [&>option]:text-ink"
    : "w-full border border-border bg-background px-3 py-2.5 text-sm text-ink placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"

  const labelClass = `text-xs font-medium ${dark ? "text-cream/70" : "text-muted-foreground"}`

  if (submitted) {
    return (
      <div
        className={`flex flex-col items-center gap-3 py-10 text-center ${dark ? "text-cream" : "text-ink"} ${className}`}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold text-gold">
          <Check className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <h3 className="font-serif text-xl font-light">Thank you.</h3>
        <p className={`max-w-xs text-sm ${dark ? "text-cream/70" : "text-muted-foreground"}`}>
          We&apos;ll be in touch shortly.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false)
            setFullName("")
            setEmail("")
            setMobile("")
            setRequirements("")
          }}
          className="mt-1 text-xs text-gold"
        >
          Send another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={className} aria-label={title ?? "Enquiry form"}>
      {title && (
        <h3 className={`font-serif text-lg font-medium ${dark ? "text-cream" : "text-ink"}`}>{title}</h3>
      )}

      <div className={`grid gap-4 ${title ? "mt-5" : ""}`}>
        {!presetType && !presetEnquiryType && (
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="ef-type">
              Enquiry type
            </label>
            <select
              id="ef-type"
              className={fieldClass}
              value={type}
              onChange={(e) => {
                setType(e.target.value)
                setSubtype("")
              }}
            >
              {enquiryTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {currentType?.options && !presetEnquiryType && (
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="ef-subtype">
              I&apos;m interested in
            </label>
            <select
              id="ef-subtype"
              className={fieldClass}
              value={subtype}
              onChange={(e) => setSubtype(e.target.value)}
            >
              <option value="">Select…</option>
              {currentType.options.map((o) => (
                <option key={o} value={o.toLowerCase().replace(/\s+/g, '_')}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="ef-name">
              Name
            </label>
            <input
              id="ef-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Smith"
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="ef-email">
              Email
            </label>
            <input
              id="ef-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@email.com"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="ef-mobile">
            Mobile <span className="font-normal opacity-70">(optional)</span>
          </label>
          <input
            id="ef-mobile"
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="0400 000 000"
            className={fieldClass}
          />
        </div>

        {!compact && (
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="ef-budget">
              Budget range
            </label>
            <select
              id="ef-budget"
              className={fieldClass}
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
            >
              <option value="">Select…</option>
              <option>Under $750k</option>
              <option>$750k – $1.25m</option>
              <option>$1.25m – $2.5m</option>
              <option>$2.5m +</option>
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="ef-message">
            Message
          </label>
          <textarea
            id="ef-message"
            rows={compact ? 2 : 3}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="What can we help you with?"
            className={`${fieldClass} resize-none`}
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className={`mt-5 px-6 py-2.5 text-xs uppercase tracking-[0.16em] transition-colors disabled:opacity-50 ${
          dark ? "bg-gold text-forest-deep hover:opacity-90" : "bg-forest-deep text-cream hover:bg-forest"
        }`}
      >
        {loading ? "Sending…" : "Submit enquiry"}
      </button>
      <p className={`mt-3 text-xs ${dark ? "text-cream/50" : "text-muted-foreground"}`}>
        Your details are never shared.
      </p>
    </form>
  )
}
