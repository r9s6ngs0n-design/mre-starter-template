"use client"

import {
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react"
import { usePrefersReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface FadeUpProps {
  children: ReactNode
  className?: string
  delay?: number
  as?: "div" | "section" | "article" | "li" | "figure"
  /** Render visible immediately — use for above-the-fold hero content on route changes */
  immediate?: boolean
}

function isInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  return rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.08
}

export function FadeUp({
  children,
  className = "",
  delay = 0,
  as = "div",
  immediate = false,
}: FadeUpProps) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(reduced || immediate)
  const Component = as as ElementType

  useLayoutEffect(() => {
    if (reduced || immediate) return

    const element = ref.current
    if (!element) return

    if (isInViewport(element)) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "-8% 0px", threshold: 0.12 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [reduced, immediate])

  return (
    <Component
      ref={ref}
      className={cn("fade-up", visible && "fade-up-visible", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Component>
  )
}
