'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Search, Home, DollarSign, BedDouble, Bath, ChevronDown } from 'lucide-react'
import { formatTypeSlug, RESIDENTIAL_PROPERTY_TYPE_SLUGS, TYPE_SLUGS } from '@/lib/slugUtils'
import { logSearchQuery } from '@/lib/analytics'
import { getSessionId } from '@/hooks/use-page-tracking'
import {
  filterSearchListingOptions,
  type SearchListingOption,
  type SearchListingsByCategory,
} from '@/lib/searchSuggestions'

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchCategory = 'buy' | 'rent' | 'project' | 'commercial'

interface SearchState {
  suburb: string
  type: string
  maxPrice: string
  beds: string
  baths: string
}

interface PropertySearchBarProps {
  /** When placed on a category page, locks the active tab. */
  category?: SearchCategory
  /** Available listings for the locked category page. */
  listings?: SearchListingOption[]
  /** Available listings grouped by category for the home page search bar. */
  listingsByCategory?: SearchListingsByCategory
  /** Initial values pre-populated from URL params. */
  initialSuburb?: string
  initialType?: string
  initialMaxPrice?: string
  initialBeds?: string
  initialBaths?: string
  className?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: { value: SearchCategory; label: string }[] = [
  { value: 'buy', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
  { value: 'project', label: 'Off-the-plan' },
  { value: 'commercial', label: 'Commercial' },
]

const RESIDENTIAL_TYPE_SLUGS = RESIDENTIAL_PROPERTY_TYPE_SLUGS
const COMMERCIAL_TYPE_SLUGS = TYPE_SLUGS.filter((slug) => slug === 'office' || slug === 'retail')

function typeOptionsForSlugs(slugs: readonly string[]): { value: string; label: string }[] {
  return [
    { value: '', label: 'All types' },
    ...slugs.map((slug) => ({
      value: slug,
      label: formatTypeSlug(slug),
    })),
  ]
}

const TYPE_OPTIONS: Record<SearchCategory, { value: string; label: string }[]> = {
  buy: typeOptionsForSlugs(RESIDENTIAL_TYPE_SLUGS),
  rent: typeOptionsForSlugs(RESIDENTIAL_TYPE_SLUGS),
  project: typeOptionsForSlugs(RESIDENTIAL_TYPE_SLUGS),
  commercial: typeOptionsForSlugs(COMMERCIAL_TYPE_SLUGS),
}

const PRICE_OPTIONS: Record<SearchCategory, { value: string; label: string }[]> = {
  buy: [
    { value: '', label: 'Any price' },
    { value: '500000', label: '$500K' },
    { value: '1000000', label: '$1M' },
    { value: '2000000', label: '$2M' },
    { value: '5000000', label: '$5M' },
    { value: '10000000', label: '$10M+' },
  ],
  rent: [
    { value: '', label: 'Any price' },
    { value: '500', label: '$500/pw' },
    { value: '1000', label: '$1,000/pw' },
    { value: '1500', label: '$1,500/pw' },
    { value: '2000', label: '$2,000/pw+' },
  ],
  project: [
    { value: '', label: 'Any price' },
    { value: '500000', label: '$500K' },
    { value: '1000000', label: '$1M' },
    { value: '2000000', label: '$2M' },
    { value: '5000000', label: '$5M' },
    { value: '10000000', label: '$10M+' },
  ],
  commercial: [
    { value: '', label: 'Any price' },
    { value: '1000000', label: '$1M' },
    { value: '2000000', label: '$2M' },
    { value: '5000000', label: '$5M' },
    { value: '10000000', label: '$10M+' },
  ],
}

const BEDS_OPTIONS = [
  { value: '', label: 'Any beds' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' },
]

const BATHS_OPTIONS = [
  { value: '', label: 'Any baths' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
]

const CATEGORY_PATHS: Record<SearchCategory, string> = {
  buy: '/buy',
  rent: '/rent',
  project: '/projects',
  commercial: '/commercial',
}

// ─── Dropdown component ────────────────────────────────────────────────────────

interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  open: boolean
  onToggle: () => void
  onClose: () => void
  align?: 'left' | 'right'
}

function Dropdown({ trigger, children, open, onToggle, onClose, align = 'left' }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-ink transition-colors hover:text-forest-deep focus:outline-none"
        aria-expanded={open}
      >
        {trigger}
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute top-full z-[100] mt-2 max-h-72 min-w-[180px] overflow-y-auto rounded-xl border border-border bg-white py-1 shadow-xl ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PropertySearchBar({
  category: lockedCategory,
  listings,
  listingsByCategory,
  initialSuburb = '',
  initialType = '',
  initialMaxPrice = '',
  initialBeds = '',
  initialBaths = '',
  className = '',
}: PropertySearchBarProps) {
  const router = useRouter()
  const locationRef = useRef<HTMLDivElement>(null)
  const [activeCategory, setActiveCategory] = useState<SearchCategory>(lockedCategory ?? 'buy')
  const [state, setState] = useState<SearchState>({
    suburb: initialSuburb,
    type: initialType,
    maxPrice: initialMaxPrice,
    beds: initialBeds,
    baths: initialBaths,
  })

  const [openDropdown, setOpenDropdown] = useState<'type' | 'price' | 'beds' | 'baths' | null>(null)
  const [showListingSuggestions, setShowListingSuggestions] = useState(false)

  const closeAll = useCallback(() => setOpenDropdown(null), [])

  const activeListings =
    listings ??
    listingsByCategory?.[lockedCategory ?? activeCategory] ??
    []

  const listingSuggestions = filterSearchListingOptions(activeListings, state.suburb)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowListingSuggestions(false)
      }
    }
    if (showListingSuggestions) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showListingSuggestions])

  const toggleDropdown = (name: 'type' | 'price' | 'beds' | 'baths') => {
    setOpenDropdown((prev) => (prev === name ? null : name))
  }

  function handleCategoryChange(cat: SearchCategory) {
    if (lockedCategory) return
    setActiveCategory(cat)
    setState({ suburb: '', type: '', maxPrice: '', beds: '', baths: '' })
    setOpenDropdown(null)
    setShowListingSuggestions(false)
  }

  function handleListingSelect(option: SearchListingOption) {
    setState((current) => ({ ...current, suburb: option.suburb || option.title }))
    setShowListingSuggestions(false)
    closeAll()
  }

  function handleSearch() {
    const params = new URLSearchParams()
    const suburb = state.suburb.trim()
    if (suburb) params.set('suburb', suburb)
    if (state.type) params.set('type', state.type)
    if (state.maxPrice) params.set('maxPrice', state.maxPrice)
    if (state.beds) params.set('beds', state.beds)
    if (state.baths) params.set('baths', state.baths)

    if (suburb) {
      logSearchQuery(suburb, null, getSessionId()).catch(() => {})
    }

    const path = CATEGORY_PATHS[activeCategory]
    const qs = params.toString()
    router.push(qs ? `${path}?${qs}` : path)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
  }

  const typeOptions = TYPE_OPTIONS[activeCategory]
  const priceOptions = PRICE_OPTIONS[activeCategory]
  const showBeds = activeCategory !== 'commercial'

  const selectedTypeLabel =
    typeOptions.find((o) => o.value === state.type)?.label ?? 'Type'
  const selectedPriceLabel =
    priceOptions.find((o) => o.value === state.maxPrice)?.label ?? 'Price'
  const selectedBedsLabel =
    BEDS_OPTIONS.find((o) => o.value === state.beds)?.label ?? 'Beds'
  const selectedBathsLabel =
    BATHS_OPTIONS.find((o) => o.value === state.baths)?.label ?? 'Baths'

  return (
    <div className={`w-full ${className}`}>
      {/* Category tabs — hidden when locked to a single category */}
      {!lockedCategory && (
        <div className="mb-3 flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleCategoryChange(tab.value)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${
                activeCategory === tab.value
                  ? 'bg-forest-deep text-cream shadow-sm'
                  : 'bg-cream/60 text-ink hover:bg-cream hover:text-forest-deep'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Search row */}
      <div className="relative flex items-stretch rounded-2xl border border-border/60 bg-white/90 shadow-lg backdrop-blur-sm">

        {/* Location input */}
        <div
          ref={locationRef}
          className="relative flex min-w-0 flex-1 items-center gap-2.5 rounded-l-2xl border-r border-border/40 px-4 py-1"
        >
          <MapPin className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Where are you looking?"
            value={state.suburb}
            onChange={(e) => {
              setState((s) => ({ ...s, suburb: e.target.value }))
              setShowListingSuggestions(true)
            }}
            onFocus={() => {
              if (activeListings.length > 0) setShowListingSuggestions(true)
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-ink placeholder:text-muted-foreground focus:outline-none"
            aria-label="Suburb or location"
            aria-expanded={showListingSuggestions && listingSuggestions.length > 0}
            aria-controls="property-search-listings"
            role="combobox"
            autoComplete="off"
          />

          {showListingSuggestions && listingSuggestions.length > 0 && (
            <div
              id="property-search-listings"
              role="listbox"
              className="absolute left-0 right-0 top-full z-[110] mt-3 max-h-72 overflow-y-auto rounded-xl border border-border bg-white py-1 shadow-xl"
            >
              {listingSuggestions.map((option) => (
                <button
                  key={option.slug}
                  type="button"
                  role="option"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleListingSelect(option)}
                  className="block w-full px-4 py-3 text-left transition-colors hover:bg-cream"
                >
                  <span className="block text-sm font-medium text-ink">{option.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {[option.suburb, option.address].filter(Boolean).join(' · ')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Type dropdown */}
        <div className="border-r border-border/40">
          <Dropdown
            open={openDropdown === 'type'}
            onToggle={() => toggleDropdown('type')}
            onClose={closeAll}
            trigger={
              <>
                <Home className="h-4 w-4 text-gold" strokeWidth={1.75} />
                <span>{selectedTypeLabel}</span>
              </>
            }
          >
            {typeOptions.map((opt) => (
              <button
                key={opt.value || 'all-types'}
                type="button"
                role="option"
                aria-selected={state.type === opt.value}
                onClick={() => {
                  setState((s) => ({ ...s, type: opt.value }))
                  closeAll()
                }}
                className={`block w-full rounded-lg px-4 py-2.5 text-left text-sm transition-colors hover:bg-cream ${
                  state.type === opt.value
                    ? 'bg-forest-deep text-cream'
                    : 'text-ink'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </Dropdown>
        </div>

        {/* Price dropdown */}
        <div className={`${showBeds ? 'border-r border-border/40' : ''}`}>
          <Dropdown
            open={openDropdown === 'price'}
            onToggle={() => toggleDropdown('price')}
            onClose={closeAll}
            align="right"
            trigger={
              <>
                <DollarSign className="h-4 w-4 text-gold" strokeWidth={1.75} />
                <span>{selectedPriceLabel}</span>
              </>
            }
          >
            {priceOptions.map((opt) => (
              <button
                key={opt.value || 'any-price'}
                type="button"
                role="option"
                aria-selected={state.maxPrice === opt.value}
                onClick={() => {
                  setState((s) => ({ ...s, maxPrice: opt.value }))
                  closeAll()
                }}
                className={`block w-full rounded-lg px-4 py-2.5 text-left text-sm transition-colors hover:bg-cream ${
                  state.maxPrice === opt.value
                    ? 'bg-forest-deep text-cream'
                    : 'text-ink'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </Dropdown>
        </div>

        {/* Beds dropdown — hidden for commercial */}
        {showBeds && (
          <div className="border-r border-border/40">
            <Dropdown
              open={openDropdown === 'beds'}
              onToggle={() => toggleDropdown('beds')}
              onClose={closeAll}
              align="right"
              trigger={
                <>
                  <BedDouble className="h-4 w-4 text-gold" strokeWidth={1.75} />
                  <span>{selectedBedsLabel}</span>
                </>
              }
            >
              {BEDS_OPTIONS.map((opt) => (
                <button
                  key={opt.value || 'any-beds'}
                  type="button"
                  role="option"
                  aria-selected={state.beds === opt.value}
                  onClick={() => {
                    setState((s) => ({ ...s, beds: opt.value }))
                    closeAll()
                  }}
                  className={`block w-full rounded-lg px-4 py-2.5 text-left text-sm transition-colors hover:bg-cream ${
                    state.beds === opt.value
                      ? 'bg-forest-deep text-cream'
                      : 'text-ink'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </Dropdown>
          </div>
        )}

        {/* Baths dropdown — hidden for commercial */}
        {showBeds && (
          <div className="border-r border-border/40">
            <Dropdown
              open={openDropdown === 'baths'}
              onToggle={() => toggleDropdown('baths')}
              onClose={closeAll}
              align="right"
              trigger={
                <>
                  <Bath className="h-4 w-4 text-gold" strokeWidth={1.75} />
                  <span>{selectedBathsLabel}</span>
                </>
              }
            >
              {BATHS_OPTIONS.map((opt) => (
                <button
                  key={opt.value || 'any-baths'}
                  type="button"
                  role="option"
                  aria-selected={state.baths === opt.value}
                  onClick={() => {
                    setState((s) => ({ ...s, baths: opt.value }))
                    closeAll()
                  }}
                  className={`block w-full rounded-lg px-4 py-2.5 text-left text-sm transition-colors hover:bg-cream ${
                    state.baths === opt.value
                      ? 'bg-forest-deep text-cream'
                      : 'text-ink'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </Dropdown>
          </div>
        )}

        {/* Search button */}
        <button
          type="button"
          onClick={handleSearch}
          aria-label="Search properties"
          className="flex items-center justify-center rounded-r-2xl bg-forest-deep px-5 text-cream transition-colors hover:bg-green-mid focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        >
          <Search className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}
