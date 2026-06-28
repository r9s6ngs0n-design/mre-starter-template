"use client"

import { createElement } from "react"
import { motion } from "framer-motion"
import { duration, easeEditorial, usePrefersReducedMotion } from "@/lib/motion"

interface TextRevealProps {
  text: string
  className?: string
  as?: "h1" | "h2" | "h3" | "p"
  delay?: number
  /** Render visible immediately — use for above-the-fold hero content on route changes */
  immediate?: boolean
}

const textTransition = {
  duration: duration.text,
  ease: easeEditorial,
}

export function TextReveal({
  text,
  className = "",
  as = "h1",
  delay = 0,
  immediate = false,
}: TextRevealProps) {
  const reduced = usePrefersReducedMotion()
  const Component = motion.create(as)
  const lines = text.split("\n").filter(Boolean)
  const delaySeconds = delay / 1000

  if (reduced || immediate) {
    return createElement(as, { className }, text)
  }

  // Single-line headlines: gentle fade + small lift — avoids clipping descenders
  if (lines.length === 1) {
    return (
      <Component
        className={className}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...textTransition, delay: delaySeconds }}
      >
        {text}
      </Component>
    )
  }

  return (
    <Component className={className} aria-label={text}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.12em]">
          <motion.span
            className="block"
            initial={{ y: "0.35em", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              ...textTransition,
              delay: delaySeconds + i * 0.08,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Component>
  )
}
