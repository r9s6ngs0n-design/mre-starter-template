'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { getSessionId } from '@/hooks/use-page-tracking'

interface CTAButtonProps extends ComponentProps<typeof Link> {
  ctaLabel: string
}

export function CTAButton({ ctaLabel, href, onClick, ...props }: CTAButtonProps) {
  const handleClick: ComponentProps<typeof Link>['onClick'] = (e) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (url) {
      fetch(`${url}/functions/v1/track-cta-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          cta_label: ctaLabel,
          destination_url: typeof href === 'string' ? href : undefined,
          page_path: window.location.pathname,
          session_id: getSessionId(),
        }),
      }).catch(() => {})
    }
    onClick?.(e)
  }

  return <Link href={href} onClick={handleClick} {...props} />
}
