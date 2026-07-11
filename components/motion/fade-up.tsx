"use client"

import {
  type ElementType,
  type ReactNode,
} from "react"
import { cn } from "@/lib/utils"

interface FadeUpProps {
  children: ReactNode
  className?: string
  as?: "div" | "section" | "article" | "li" | "figure"
  delay?: number
  immediate?: boolean
}

export function FadeUp({
  children,
  className = "",
  as = "div",
  delay: _delay = 0,
  immediate: _immediate = false,
}: FadeUpProps) {
  const Component = as as ElementType

  return (
    <Component className={cn(className)}>
      {children}
    </Component>
  )
}
