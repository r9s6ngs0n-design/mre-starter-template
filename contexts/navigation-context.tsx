'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface NavigationContextValue {
  pending: boolean
  setPending: (id: string, pending: boolean) => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [pendingLinks, setPendingLinks] = useState<Record<string, boolean>>({})

  const setPending = useCallback((id: string, pending: boolean) => {
    setPendingLinks((prev) => {
      const next = { ...prev }
      if (pending) next[id] = true
      else delete next[id]
      return next
    })
  }, [])

  const pending = Object.keys(pendingLinks).length > 0

  const value = useMemo(() => ({ pending, setPending }), [pending, setPending])

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

export function useNavigationPending() {
  return useContext(NavigationContext)?.pending ?? false
}

export function useSetNavigationPending() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useSetNavigationPending must be used within NavigationProvider')
  return ctx.setPending
}
