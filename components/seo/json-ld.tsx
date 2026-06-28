import type { Json } from '@/lib/database.types'

interface JsonLdProps {
  data: Json | Record<string, unknown> | null
}

export function JsonLd({ data }: JsonLdProps) {
  if (!data) return null
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
