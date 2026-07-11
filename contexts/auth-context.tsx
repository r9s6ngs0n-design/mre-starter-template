'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/database.types'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  full_name: string | null
  email: string
  role: UserRole
  phone: string | null
  country: string | null
  avatar_url: string | null
  suspended_at: string | null
}

/** @deprecated use UserProfile */
type StaffProfile = UserProfile

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  role: UserRole | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => {
    try {
      return createClient()
    } catch {
      return null
    }
  })
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(
    async (authUser: User) => {
      if (!supabase) return
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, role, phone, avatar_url, suspended_at')
        .eq('id', authUser.id)
        .single()

      if (!error && data) {
        // country may not exist before migration 009 is applied — default to null
        setProfile({ ...data, country: (data as Record<string, unknown>)['country'] as string | null ?? null })
        return
      }

      const role: UserRole = 'user'
      const profileRow = {
        id: authUser.id,
        full_name: (authUser.user_metadata?.full_name as string | null) ?? null,
        email: authUser.email ?? '',
        role,
        phone: null,
        country: null,
        avatar_url: null,
        suspended_at: null,
      }

      const { error: upsertError } = await supabase.from('users').upsert(profileRow, { onConflict: 'id' })

      if (!upsertError) {
        const { data: synced } = await supabase
          .from('users')
          .select('id, full_name, email, role, phone, avatar_url, suspended_at')
          .eq('id', authUser.id)
          .single()
        if (synced) {
          setProfile({ ...synced, country: (synced as Record<string, unknown>)['country'] as string | null ?? null })
          return
        }
      }

      setProfile(profileRow)
    },
    [supabase]
  )

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user)
  }, [user, loadProfile])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, loadProfile])

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: 'Supabase not configured' }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error?.message ?? null }
    },
    [supabase]
  )

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      if (!supabase) return { error: 'Supabase not configured', needsEmailConfirmation: false }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName ?? email, role: 'user' },
        },
      })
      return {
        error: error?.message ?? null,
        needsEmailConfirmation: !error && !data.session,
      }
    },
    [supabase]
  )

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [supabase])

  const value = useMemo(
    () => ({
      user,
      profile,
      role: profile?.role ?? null,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [user, profile, loading, signIn, signUp, signOut, refreshProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
