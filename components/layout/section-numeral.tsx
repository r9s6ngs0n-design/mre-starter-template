interface SectionNumeralProps {
  index: number | string
  className?: string
  light?: boolean
}

export function SectionNumeral({ index, className = "", light = false }: SectionNumeralProps) {
  const value = typeof index === "number" ? String(index).padStart(2, "0") : index

  return (
    <span
      aria-hidden
      className={`text-numeral font-serif font-light leading-none select-none ${
        light ? "text-gold/40" : "text-gold/25"
      } ${className}`}
    >
      {value}
    </span>
  )
}
