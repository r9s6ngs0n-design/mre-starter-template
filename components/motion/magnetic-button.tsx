"use client"

import Link from "next/link"
import { motion, useMotionValue, useSpring } from "framer-motion"
import type { ReactNode, MouseEvent } from "react"
import { duration, easeEditorial, usePrefersReducedMotion } from "@/lib/motion"

interface MagneticButtonProps {
  href: string
  children: ReactNode
  className?: string
  variant?: "outline" | "filled" | "ghost"
}

const variants = {
  outline:
    "inline-flex items-center gap-2 rounded-full border border-gold/70 px-7 py-3 text-xs uppercase tracking-[0.18em] text-cream",
  filled:
    "inline-flex items-center gap-2 bg-gold px-8 py-4 text-xs uppercase tracking-[0.18em] text-forest-deep",
  ghost:
    "inline-flex items-center gap-2 rounded-full border border-cream/30 px-8 py-4 text-xs uppercase tracking-[0.18em] text-cream",
}

const MotionLink = motion.create(Link)

export function MagneticButton({ href, children, className = "", variant = "outline" }: MagneticButtonProps) {
  const reduced = usePrefersReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 20 })
  const springY = useSpring(y, { stiffness: 300, damping: 20 })

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (reduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * 0.08)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.08)
  }

  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <MotionLink
      href={href}
      className={`group relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${variants[variant]} ${className}`}
      style={reduced ? undefined : { x: springX, y: springY }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={reduced ? undefined : { scale: 1.02 }}
      transition={{ duration: duration.fast, ease: easeEditorial }}
    >
      {variant === "outline" && (
        <span
          aria-hidden
          className="absolute inset-0 origin-left scale-x-0 bg-gold transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
        />
      )}
      <span
        className={`relative z-10 transition-colors duration-300 ${
          variant === "outline" ? "group-hover:text-forest-deep" : ""
        }`}
      >
        {children}
      </span>
    </MotionLink>
  )
}
