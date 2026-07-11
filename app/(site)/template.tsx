"use client"

import { motion } from "framer-motion"
import { useRef } from "react"

// Module-level flag — persists across SPA navigations within the same browser session.
// On first mount the intro curtain is the sole reveal mechanic, so we skip the
// opacity fade-in here. On every subsequent route change we animate normally.
let firstMountDone = false

export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  const isFirstMount = useRef(!firstMountDone)

  if (!firstMountDone) {
    firstMountDone = true
  }

  return (
    <motion.div
      suppressHydrationWarning
      initial={{ opacity: isFirstMount.current ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
