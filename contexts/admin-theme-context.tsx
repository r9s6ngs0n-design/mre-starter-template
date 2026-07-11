'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Token definitions — one object per mode.
// Every key used in any admin component lives here so a single import
// gives components everything they need.
// ---------------------------------------------------------------------------

export const nightTokens = {
  // Shell
  wrapper:           'bg-zinc-950 text-zinc-100',
  aside:             'bg-zinc-900/50 border-zinc-800',
  logoLink:          'border-zinc-800 hover:bg-zinc-800/40 focus-visible:ring-amber-500/50',
  logoTitle:         'text-amber-500/90',
  logoSub:           'text-zinc-500',
  navActive:         'bg-zinc-800 text-amber-400',
  navInactive:       'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200',
  header:            'border-zinc-800',
  mobileLogo:        'text-amber-500/90 hover:text-amber-400 focus-visible:ring-amber-500/50',
  badge:             'border-zinc-700 text-zinc-400',
  userName:          'text-zinc-400',
  signOut:           'text-zinc-500 hover:text-zinc-300',
  toggleBtn:         'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60',
  // Form elements
  input:             'border border-zinc-700 bg-zinc-900',
  select:            'border border-zinc-700 bg-zinc-900',
  // Panels / cards
  panel:             'rounded-lg border border-zinc-800 bg-zinc-900/50',
  panelBorder:       'border border-zinc-800',
  // Tables
  tableBorder:       'overflow-x-auto rounded-lg border border-zinc-800',
  tableHeader:       'border-b border-zinc-800 text-zinc-500',
  tableRow:          'border-b border-zinc-800/50',
  tableRowHover:     'cursor-pointer border-b border-zinc-800/50 hover:bg-zinc-900',
  tableRowTop:       'border-t border-zinc-800',
  // Text
  textMuted:         'text-zinc-500',
  textSecondary:     'text-zinc-400',
  textDim:           'text-zinc-600',
  // Tabs
  tabActive:         'bg-zinc-800 text-amber-400',
  tabInactive:       'text-zinc-500',
  // Buttons
  exportBtn:         'rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 hover:border-amber-600 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-40',
  countBadge:        'rounded bg-zinc-700 px-1.5 py-0.5 text-xs text-zinc-400',
  cancelBtn:         'text-sm text-zinc-500 hover:text-zinc-300',
  cancelBtnMd:       'px-4 py-2 text-sm text-zinc-500',
  // Lead drawer
  drawer:            'fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6 shadow-xl',
  infoBox:           'rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs',
  // Modal
  modal:             'max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-6',
  // Pipeline
  pipelineActive:    'bg-amber-700 text-zinc-950',
  pipelineInactive:  'bg-zinc-800 text-zinc-400',
  // Contact status buttons (inactive state)
  contactStatusOff:  'bg-zinc-800 text-zinc-500 border border-zinc-700 opacity-50 hover:opacity-80',
  // Timeline / notes
  taskDone:          'text-zinc-600 line-through',
  noteInput:         'flex-1 border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm',
  noteBtn:           'bg-zinc-800 px-3 text-sm',
  timelineType:      'text-xs uppercase text-zinc-600',
  timelineBody:      'text-zinc-400',
  // Auth loading screen
  requireAuthBg:     'flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400',
}

export const dayTokens: typeof nightTokens = {
  // Shell
  wrapper:           'bg-[#f3ede0] text-[#261c0d]',
  aside:             'bg-[#e9e2d4] border-[#cfc8b6]',
  logoLink:          'border-[#cfc8b6] hover:bg-[#ddd5c3]/60 focus-visible:ring-amber-600/50',
  logoTitle:         'text-amber-700',
  logoSub:           'text-[#8a7660]',
  navActive:         'bg-[#ddd5c3] text-amber-800',
  navInactive:       'text-[#7a6a54] hover:bg-[#d8d0be] hover:text-[#261c0d]',
  header:            'border-[#cfc8b6] bg-[#f3ede0]',
  mobileLogo:        'text-amber-700 hover:text-amber-800 focus-visible:ring-amber-600/50',
  badge:             'border-[#c5bba8] text-[#8a7660]',
  userName:          'text-[#8a7660]',
  signOut:           'text-[#a09076] hover:text-[#261c0d]',
  toggleBtn:         'text-[#8a7660] hover:text-[#261c0d] hover:bg-[#ddd5c3]/70',
  // Form elements
  input:             'border border-[#cfc8b6] bg-[#f0e9da]',
  select:            'border border-[#cfc8b6] bg-[#f0e9da]',
  // Panels / cards
  panel:             'rounded-lg border border-[#cfc8b6] bg-[#e9e2d4]/60',
  panelBorder:       'border border-[#cfc8b6]',
  // Tables
  tableBorder:       'overflow-x-auto rounded-lg border border-[#cfc8b6]',
  tableHeader:       'border-b border-[#cfc8b6] text-[#8a7660]',
  tableRow:          'border-b border-[#cfc8b6]/50',
  tableRowHover:     'cursor-pointer border-b border-[#cfc8b6]/50 hover:bg-[#e9e2d4]',
  tableRowTop:       'border-t border-[#cfc8b6]',
  // Text
  textMuted:         'text-[#8a7660]',
  textSecondary:     'text-[#7a6a54]',
  textDim:           'text-[#b0a090]',
  // Tabs
  tabActive:         'bg-[#ddd5c3] text-amber-800',
  tabInactive:       'text-[#8a7660]',
  // Buttons
  exportBtn:         'rounded border border-[#cfc8b6] bg-[#f0e9da] px-3 py-1.5 text-sm text-[#7a6a54] hover:border-amber-600 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40',
  countBadge:        'rounded bg-[#d8d0be] px-1.5 py-0.5 text-xs text-[#7a6a54]',
  cancelBtn:         'text-sm text-[#8a7660] hover:text-[#261c0d]',
  cancelBtnMd:       'px-4 py-2 text-sm text-[#8a7660]',
  // Lead drawer
  drawer:            'fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-[#cfc8b6] bg-[#f0e9da] p-6 shadow-xl',
  infoBox:           'rounded border border-[#cfc8b6] bg-[#e9e2d4] px-3 py-2 text-xs',
  // Modal
  modal:             'max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-[#cfc8b6] bg-[#f0e9da] p-6',
  // Pipeline
  pipelineActive:    'bg-amber-700 text-white',
  pipelineInactive:  'bg-[#ddd5c3] text-[#7a6a54]',
  // Contact status buttons (inactive state)
  contactStatusOff:  'bg-[#e0d8cc] text-[#8a7660] border border-[#cfc8b6] opacity-50 hover:opacity-80',
  // Timeline / notes
  taskDone:          'text-[#b0a090] line-through',
  noteInput:         'flex-1 border border-[#cfc8b6] bg-[#f0e9da] px-3 py-2 text-sm',
  noteBtn:           'bg-[#ddd5c3] px-3 text-sm text-[#261c0d]',
  timelineType:      'text-xs uppercase text-[#b0a090]',
  timelineBody:      'text-[#7a6a54]',
  // Auth loading screen
  requireAuthBg:     'flex min-h-screen items-center justify-center bg-[#f3ede0] text-[#8a7660]',
}

export type AdminThemeTokens = typeof nightTokens

interface AdminThemeContextValue {
  isDayMode: boolean
  toggleTheme: () => void
  t: AdminThemeTokens
}

const AdminThemeContext = createContext<AdminThemeContextValue>({
  isDayMode: false,
  toggleTheme: () => {},
  t: nightTokens,
})

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [isDayMode, setIsDayMode] = useState(false)

  useEffect(() => {
    try {
      setIsDayMode(localStorage.getItem('admin-theme') === 'day')
    } catch {
      // localStorage unavailable — stay in night mode
    }
  }, [])

  const toggleTheme = () => {
    setIsDayMode((prev) => {
      const next = !prev
      try {
        localStorage.setItem('admin-theme', next ? 'day' : 'night')
      } catch {
        // ignore
      }
      return next
    })
  }

  return (
    <AdminThemeContext.Provider value={{ isDayMode, toggleTheme, t: isDayMode ? dayTokens : nightTokens }}>
      {children}
    </AdminThemeContext.Provider>
  )
}

export function useAdminTheme() {
  return useContext(AdminThemeContext)
}
