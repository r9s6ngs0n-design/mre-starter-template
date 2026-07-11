"use client"

import Link from "next/link"
import { DrawUnderline } from "@/components/motion/draw-underline"

interface AnimatedLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  showArrow?: boolean
  onClick?: () => void
}

export function AnimatedLink({ href, children, className = "", showArrow = true, onClick }: AnimatedLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group inline-flex items-center gap-1.5 text-sm text-forest-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${className}`}
    >
      <DrawUnderline>{children}</DrawUnderline>
      {showArrow && (
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      )}
    </Link>
  )
}
