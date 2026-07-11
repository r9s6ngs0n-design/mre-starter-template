import { createClient } from '@/lib/supabase/client'
import { getSessionId } from '@/hooks/use-page-tracking'

export async function logSearchQuery(query: string, resultCount: number | null, sessionId: string) {
  const supabase = createClient()
  await supabase.from('search_queries').insert({
    query,
    result_count: resultCount,
    session_id: sessionId,
  })
}

/**
 * Records a CTA click directly into `cta_clicks` (same client-side insert
 * pattern as page-view tracking — RLS already allows anon insert).
 */
export async function trackCtaClick(ctaLabel: string, destinationUrl?: string) {
  if (typeof window === 'undefined') return
  try {
    const supabase = createClient()
    await supabase.from('cta_clicks').insert({
      cta_label: ctaLabel,
      destination_url: destinationUrl ?? null,
      page_path: window.location.pathname,
      session_id: getSessionId(),
    })
  } catch {
    // env not configured during build or offline
  }
}
