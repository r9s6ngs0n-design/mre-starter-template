"use client"

import { useEffect, useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { SiteLogo } from "@/components/site-logo"
import { duration, easeEditorial, usePrefersReducedMotion } from "@/lib/motion"

const STORAGE_KEY = "mr-intro-seen"

export function BrandIntroCurtain() {
  const reduced = usePrefersReducedMotion()
  const [visible, setVisible] = useState(false)
  const [canSkip, setCanSkip] = useState(false)

  const dismiss = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, "1")
    setVisible(false)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    if (reduced || sessionStorage.getItem(STORAGE_KEY)) {
      sessionStorage.setItem(STORAGE_KEY, "1")
      return
    }

    setVisible(true)
    const skipTimer = window.setTimeout(() => setCanSkip(true), 400)
    const exitTimer = window.setTimeout(dismiss, 1800)

    return () => {
      window.clearTimeout(skipTimer)
      window.clearTimeout(exitTimer)
    }
  }, [reduced, dismiss])

  useEffect(() => {
    if (!visible || !canSkip) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [visible, canSkip, dismiss])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="presentation"
          className="fixed inset-0 z-[200] flex cursor-pointer items-center justify-center bg-forest-deep"
          exit={{ y: "-100%" }}
          transition={{ duration: 1.05, ease: [0.76, 0, 0.24, 1] }}
          onClick={canSkip ? dismiss : undefined}
        >
          <motion.div
            className="flex w-full flex-col items-center justify-center px-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: duration.slow, ease: easeEditorial, delay: 0.15 }}
          >
            <SiteLogo variant="light" size="intro" priority className="mx-auto shrink-0" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
