"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { duration, easeEditorial, usePrefersReducedMotion } from "@/lib/motion"

interface HoverZoomProps {
  children: ReactNode
  className?: string
  scale?: number
}

export function HoverZoom({ children, className = "", scale = 1.04 }: HoverZoomProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        whileHover={reduced ? undefined : { scale }}
        transition={{ duration: duration.slow, ease: easeEditorial }}
        className="relative h-full w-full"
      >
        {children}
      </motion.div>
    </div>
  )
}
