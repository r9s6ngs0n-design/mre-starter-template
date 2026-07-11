'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StaffAuthForm, type StaffAuthMode } from '@/components/staff-auth-form'
import { useAuth } from '@/contexts/auth-context'

interface StaffAuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMode?: StaffAuthMode
}

export function StaffAuthDialog({ open, onOpenChange, initialMode = 'signin' }: StaffAuthDialogProps) {
  const router = useRouter()
  const { profile } = useAuth()

  function handleSuccess() {
    onOpenChange(false)
    // Route based on role: staff → admin CRM, everyone else → user dashboard
    const isStaff = profile?.role === 'admin' || profile?.role === 'agent'
    router.push(isStaff ? '/admin' : '/dashboard')
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light text-ink">Sign In</DialogTitle>
        </DialogHeader>
        <StaffAuthForm
          initialMode={initialMode}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}
