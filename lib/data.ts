export type Category = "PROJECT" | "BUY" | "COMMERCIAL" | "RENT"

export interface Property {
  slug: string
  title: string
  suburb: string
  category: Category
  descriptor: string
  image: string
  priceFrom: string
  beds?: string
  baths?: string
  cars?: string
  area?: string
  propertyType?: string
}

// NOTE: Live content comes from Supabase (see lib/queries-server.ts). These
// arrays are legacy fallbacks and ship EMPTY in the starter.
// TODO(client): leave empty (recommended) or add static fallback content.
export const properties: Property[] = []

export interface Testimonial {
  quote: string
  name: string
  suburb: string
  type: string
}

// TODO(client): testimonials come from Supabase; this fallback ships empty.
export const testimonials: Testimonial[] = []

export interface TeamMember {
  name: string
  role: string
  image: string
  linkedinUrl?: string
}

// TODO(client): team comes from Supabase; this fallback ships empty.
export const team: TeamMember[] = []

export interface Article {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  image: string
}

// TODO(client): articles come from Supabase; this fallback ships empty.
export const articles: Article[] = []

export const enquiryTypes = [
  {
    value: "buying",
    label: "Buying",
    options: ["Owner-occupier", "Investor", "First-home buyer"],
  },
  {
    value: "selling",
    label: "Sell / Appraisal",
    options: ["Sales appraisal", "Market update"],
  },
  {
    value: "management",
    label: "Property Management",
    options: ["Management enquiry", "Rental appraisal"],
  },
  {
    value: "renting",
    label: "Renting",
    options: ["Rental enquiry", "Student accommodation"],
  },
]
