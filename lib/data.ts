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
  status?: string
  specs?: string
  videoUrl?: string | null
}

export const properties: Property[] = [
  {
    slug: "the-mercer-south-yarra",
    title: "The Mercer",
    suburb: "South Yarra",
    category: "PROJECT",
    descriptor: "A curved-glass landmark of one, two & three-bedroom residences.",
    image: "/images/project-1.png",
    priceFrom: "$685,000",
    beds: "1–3",
    baths: "1–2",
    cars: "1–2",
  },
  {
    slug: "boulevard-residences-st-kilda-road",
    title: "Boulevard Residences",
    suburb: "St Kilda Road",
    category: "PROJECT",
    descriptor: "Boulevard-facing apartments with parkland and city outlooks.",
    image: "/images/project-2.png",
    priceFrom: "$910,000",
    beds: "2–3",
    baths: "2",
    cars: "1–2",
  },
  {
    slug: "the-bayle-brighton",
    title: "The Bayle",
    suburb: "Brighton",
    category: "BUY",
    descriptor: "Boutique garden residences, move-in ready by the bay.",
    image: "/images/project-3.png",
    priceFrom: "$1,250,000",
    beds: "2–4",
    baths: "2–3",
    cars: "2",
  },
  {
    slug: "skyline-penthouse-cbd",
    title: "Skyline Penthouse",
    suburb: "Melbourne CBD",
    category: "BUY",
    descriptor: "A singular penthouse with wraparound terrace and skyline views.",
    image: "/images/project-4.png",
    priceFrom: "$3,400,000",
    beds: "3",
    baths: "3",
    cars: "3",
  },
  {
    slug: "collins-quarter-commercial",
    title: "Collins Quarter",
    suburb: "Melbourne CBD",
    category: "COMMERCIAL",
    descriptor: "Mixed-use retail and A-grade office floors on Collins.",
    image: "/images/project-5.png",
    priceFrom: "$2,100,000",
    area: "120–540 m²",
    propertyType: "Office / Retail",
  },
  {
    slug: "carlton-collective",
    title: "Carlton Collective",
    suburb: "Carlton",
    category: "PROJECT",
    descriptor: "Heritage-inspired residences wrapped in greenery.",
    image: "/images/project-6.png",
    priceFrom: "$740,000",
    beds: "1–3",
    baths: "1–2",
    cars: "1",
  },
]

export interface Testimonial {
  quote: string
  name: string
  suburb: string
  type: string
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "MR Estates showed us a residence weeks before it was advertised. Their guidance turned a daunting process into something genuinely calm.",
    name: "Helena & James R.",
    suburb: "South Yarra",
    type: "Off-the-plan purchase",
  },
  {
    quote: "Considered, honest, and impeccably organised from first call to settlement.",
    name: "Daniel P.",
    suburb: "Brighton",
    type: "Completed apartment",
  },
  {
    quote: "They understood our investment brief precisely and matched it without the usual noise.",
    name: "Anita S.",
    suburb: "St Kilda Road",
    type: "Investment",
  },
]

export interface TeamMember {
  name: string
  role: string
  image: string
  linkedinUrl?: string
}

export const team: TeamMember[] = [
  { name: "Lionel Marchetti", role: "Principal & Director", image: "/images/team-1.png" },
  { name: "Sofia Renard", role: "Senior Sales Associate", image: "/images/team-2.png" },
  { name: "Marcus Hale", role: "Commercial Director", image: "/images/team-3.png" },
  { name: "Priya Anand", role: "Project Marketing", image: "/images/team-4.png" },
]

export interface Article {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  image: string
}

export const articles: Article[] = [
  {
    slug: "melbourne-property-investment-2026",
    title: "The Melbourne Property Investment Outlook for 2026",
    excerpt:
      "Where considered capital is moving across the city, and what it means for off-the-plan buyers this cycle.",
    category: "INVESTMENT",
    date: "May 2026",
    readTime: "7 min read",
    image: "/images/insight-1.png",
  },
  {
    slug: "st-kilda-road-investment",
    title: "St Kilda Road: Melbourne's Enduring Boulevard Investment",
    excerpt: "Why the city's grand boulevard continues to reward patient, design-led ownership.",
    category: "MARKET",
    date: "April 2026",
    readTime: "6 min read",
    image: "/images/insight-2.png",
  },
  {
    slug: "student-accommodation-melbourne",
    title: "Student Accommodation: A Quietly Resilient Asset Class",
    excerpt: "Demand, yields, and the locations that matter for Melbourne's education-led rental market.",
    category: "INVESTMENT",
    date: "March 2026",
    readTime: "5 min read",
    image: "/images/insight-3.png",
  },
]

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
