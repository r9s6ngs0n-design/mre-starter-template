import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'
import { getSupabaseEnv } from '@/lib/supabase/client'

export async function createClient() {
  const { url, key } = getSupabaseEnv()
  if (!url || !key) return null

  try {
    const cookieStore = await cookies()

    return createServerClient<Database>(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from Server Component — safe to ignore
          }
        },
      },
    })
  } catch {
    // Static generation/build has no request context, so `cookies()` throws.
    return createServerClient<Database>(url, key, {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    })
  }
}
