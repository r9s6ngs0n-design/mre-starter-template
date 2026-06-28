'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAdminTable<T extends { id: string }>(
  table: 'listings' | 'blog_posts' | 'testimonials' | 'team_members' | 'documents' | 'leads' | 'newsletter_subscribers' | 'users' | 'page_sections',
  orderBy = 'created_at'
) {
  const supabase = createClient()
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from(table).select('*').order(orderBy, { ascending: false })
    setRows((data as unknown as T[]) ?? [])
    setLoading(false)
  }, [supabase, table, orderBy])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { rows, loading, refresh, supabase }
}
