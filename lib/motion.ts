"use client"

import { useEffect, useState } from "react"

export const easeEditorial = [0.16, 1, 0.3, 1] as const

export const duration = {
  fast: 0.5,
  base: 0.85,
  slow: 1.2,
  text: 1.35,
  reveal: 1.1,
} as const

export const viewportOnce = { once: true, margin: "-8% 0px" as const, amount: 0.12 as const }

export function usePrefersReducedMotion() {
  // Lazy initializer reads media query synchronously on the client — no flash for
  // either normal users (false → animations run) or reduced-motion users (true → skip)
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(media.matches)
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  return reduced
}

export function motionTransition(reduced: boolean, seconds = duration.base) {
  return reduced ? { duration: 0 } : { duration: seconds, ease: easeEditorial }
}
