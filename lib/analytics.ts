import { createClient } from '@/lib/supabase/client'

export async function logSearchQuery(query: string, resultCount: number, sessionId: string) {
  const supabase = createClient()
  await supabase.from('search_queries').insert({
    query,
    result_count: resultCount,
    session_id: sessionId,
  })
}
