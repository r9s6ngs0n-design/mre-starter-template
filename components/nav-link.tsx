'use client'

import Link, { useLinkStatus, type LinkProps } from 'next/link'
import { useEffect, useId, type ReactNode } from 'react'
import { useSetNavigationPending } from '@/contexts/navigation-context'

function PendingReporter() {
  const { pending } = useLinkStatus()
  const id = useId()
  const setPending = useSetNavigationPending()

  useEffect(() => {
    setPending(id, pending)
    return () => setPending(id, false)
  }, [pending, id, setPending])

  return null
}

type NavLinkProps = LinkProps & {
  children: ReactNode
  className?: string
}

export function NavLink({ children, ...props }: NavLinkProps) {
  return (
    <Link {...props}>
      <PendingReporter />
      {children}
    </Link>
  )
}
