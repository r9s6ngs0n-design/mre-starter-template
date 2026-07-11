interface SectionEyebrowProps {
  children: React.ReactNode
  className?: string
  light?: boolean
}

export function SectionEyebrow({ children, className = "", light = false }: SectionEyebrowProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span aria-hidden className="h-px w-8 bg-gold" />
      <span className={`eyebrow tracking-[0.18em] ${light ? "!text-gold" : ""}`}>{children}</span>
    </div>
  )
}
