import type { ReactNode } from "react"

type TypographyProps = {
  children: ReactNode
  className?: string
  as?: keyof React.JSX.IntrinsicElements
}

export function Display({ children, className = "", as: Tag = "h1" }: TypographyProps) {
  return <Tag className={`text-display font-serif font-light text-balance ${className}`}>{children}</Tag>
}

export function Headline({ children, className = "", as: Tag = "h2" }: TypographyProps) {
  return <Tag className={`text-headline font-serif font-light text-balance ${className}`}>{children}</Tag>
}

export function Subhead({ children, className = "", as: Tag = "h3" }: TypographyProps) {
  return <Tag className={`text-subhead font-serif font-medium ${className}`}>{children}</Tag>
}

export function Body({ children, className = "", as: Tag = "p" }: TypographyProps) {
  return <Tag className={`text-body prose-width ${className}`}>{children}</Tag>
}

export function Caption({ children, className = "", as: Tag = "span" }: TypographyProps) {
  return <Tag className={`text-caption text-muted-foreground ${className}`}>{children}</Tag>
}
