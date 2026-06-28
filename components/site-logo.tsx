import { cn } from "@/lib/utils"

type LogoVariant = "dark" | "light"
type LogoSize = "sm" | "nav" | "md" | "lg" | "intro" | "hero"

/** Trimmed logo mark aspect ratio (276 × 204). */
const LOGO_ASPECT = 276 / 204

const sizeConfig = {
  sm: { height: 40, className: "block h-10 w-auto" },
  nav: { height: 56, className: "block h-14 w-auto" },
  md: { height: 56, className: "block h-14 w-auto" },
  lg: { height: 88, className: "block h-[5.5rem] w-auto" },
  intro: { height: 120, className: "block h-[7.5rem] w-auto max-w-[min(100%,16rem)] sm:h-32 sm:max-w-[18rem]" },
  hero: { height: 144, className: "block h-36 w-auto max-w-[min(100%,20rem)] sm:h-40" },
} as const

const sources = {
  dark: "/images/logo-mark-dark.png",
  light: "/images/logo-mark-light.png",
} as const

const sources2x = {
  dark: "/images/logo-mark-dark@2x.png",
  light: "/images/logo-mark-light@2x.png",
} as const

interface SiteLogoProps {
  variant?: LogoVariant
  size?: LogoSize
  className?: string
  priority?: boolean
}

export function SiteLogo({ variant = "dark", size = "md", className, priority = false }: SiteLogoProps) {
  const config = sizeConfig[size]
  const width = Math.round(config.height * LOGO_ASPECT)

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sources[variant]}
      srcSet={`${sources[variant]} 1x, ${sources2x[variant]} 2x`}
      alt="{{BRAND_NAME}}"
      width={width}
      height={config.height}
      fetchPriority={priority ? "high" : undefined}
      decoding={priority ? "sync" : "async"}
      className={cn("select-none", config.className, className)}
    />
  )
}
