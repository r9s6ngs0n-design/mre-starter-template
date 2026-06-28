import type { ReactNode } from "react"
import { SectionNumeral } from "@/components/layout/section-numeral"

interface EditorialSectionProps {
  index?: number
  children: ReactNode
  className?: string
  innerClassName?: string
  reverse?: boolean
  light?: boolean
  bordered?: boolean
}

export function EditorialSection({
  index,
  children,
  className = "",
  innerClassName = "",
  reverse = false,
  light = false,
  bordered = false,
}: EditorialSectionProps) {
  return (
    <section className={`content-auto ${bordered ? "border-t border-border" : ""} ${className}`}>
      <div className={`container-wide py-28 md:py-40 ${innerClassName}`}>
        <div
          className={`editorial-grid items-start gap-y-10 ${
            index != null ? (reverse ? "md:[&>div:first-child]:order-2" : "") : ""
          }`}
        >
          {index != null && (
            <div className="col-span-12 md:col-span-2 md:row-span-1">
              <SectionNumeral index={index} light={light} />
            </div>
          )}
          <div className={index != null ? "col-span-12 md:col-span-10" : "col-span-12"}>{children}</div>
        </div>
      </div>
    </section>
  )
}
