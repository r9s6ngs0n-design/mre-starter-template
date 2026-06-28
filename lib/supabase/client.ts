import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  return { url, key }
}

export function createClient() {
  const { url, key } = getSupabaseEnv()
  if (!url || !key) {
    throw new Error(
      'Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    )
  }
  return createBrowserClient<Database>(url, key)
}
