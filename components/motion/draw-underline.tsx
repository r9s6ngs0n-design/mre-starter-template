"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { duration, easeEditorial, usePrefersReducedMotion } from "@/lib/motion"

interface DrawUnderlineProps {
  children: ReactNode
  className?: string
}

export function DrawUnderline({ children, className = "" }: DrawUnderlineProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <span className={`group/underline relative inline-flex ${className}`}>
      {children}
      <motion.span
        aria-hidden
        className="absolute -bottom-0.5 left-0 h-px bg-gold"
        initial={{ width: reduced ? "100%" : "0%" }}
        whileHover={{ width: "100%" }}
        transition={{ duration: reduced ? 0 : duration.base, ease: easeEditorial }}
      />
    </span>
  )
}
