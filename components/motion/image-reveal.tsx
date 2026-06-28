"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { duration, easeEditorial, usePrefersReducedMotion } from "@/lib/motion"

interface ImageRevealProps {
  children: ReactNode
  className?: string
  revealKey?: string | number
  /** "forward" clips bottom-to-top, "backward" clips right-to-left */
  direction?: "forward" | "backward"
}

export function ImageReveal({
  children,
  className = "",
  revealKey,
  direction = "forward",
}: ImageRevealProps) {
  const reduced = usePrefersReducedMotion()

  const enterClip =
    direction === "forward" ? "inset(0 0 100% 0)" : "inset(0 100% 0 0)"
  const exitClip =
    direction === "forward" ? "inset(100% 0 0 0)" : "inset(0 0 0 100%)"
  const visibleClip = "inset(0 0 0% 0)"

  return (
    <motion.div
      key={revealKey}
      className={className}
      initial={reduced ? false : { clipPath: enterClip }}
      animate={{ clipPath: visibleClip }}
      exit={reduced ? undefined : { clipPath: exitClip }}
      transition={{ duration: reduced ? 0 : duration.slow, ease: easeEditorial }}
    >
      {children}
    </motion.div>
  )
}
