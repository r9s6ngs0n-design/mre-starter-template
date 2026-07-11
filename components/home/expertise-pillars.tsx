import Link from "next/link"
import { FadeUp } from "@/components/motion/fade-up"
import { OptimizedImage } from "@/components/optimized-image"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { EditorialSection } from "@/components/layout/editorial-section"
import { HoverZoom } from "@/components/motion/hover-zoom"
import { DrawUnderline } from "@/components/motion/draw-underline"

// TODO(client): set expertise pillar captions
const pillars = [
  {
    tag: "Buy",
    title: "Move-in ready",
    caption: "{{PLACEHOLDER}}",
    image: "/images/pillar-completed.png",
    href: "/buy",
  },
  {
    tag: "Rent",
    title: "Premium tenancies",
    caption: "{{PLACEHOLDER}}",
    image: "/images/pillar-completed.png",
    href: "/rent",
  },
  {
    tag: "Off the Plan",
    title: "Off-the-plan",
    caption: "{{PLACEHOLDER}}",
    image: "/images/pillar-projects.png",
    href: "/projects",
  },
  {
    tag: "Commercial",
    title: "Investment & yield",
    caption: "{{PLACEHOLDER}}",
    image: "/images/pillar-commercial.png",
    href: "/commercial",
  },
]

export function ExpertisePillars() {
  return (
    <EditorialSection index={4} className="bg-background">
      <div className="max-w-2xl">
        <SectionEyebrow>Our expertise</SectionEyebrow>
        <h2 className="mt-6 text-balance text-headline font-serif font-light text-ink">
          Four disciplines, one standard of care.
        </h2>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-12">
        {pillars.map((p, i) => (
          <FadeUp
            key={p.tag}
            delay={i * 120}
            as="article"
            className={i === 0 || i === 2 ? "md:col-span-6" : "md:col-span-6"}
          >
            <Link href={p.href} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold">
              <HoverZoom className="relative aspect-[4/5]">
                <OptimizedImage
                  src={p.image || "/placeholder.svg"}
                  alt={`${p.title} properties`}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-forest-deep/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <span className="eyebrow !text-gold">{p.tag}</span>
                  <h3 className="mt-2 text-subhead font-serif font-light text-cream">{p.title}</h3>
                  <p className="mt-2 max-w-xs text-pretty text-caption text-cream/75">{p.caption}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-cream">
                    <DrawUnderline>Discover</DrawUnderline>
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </HoverZoom>
            </Link>
          </FadeUp>
        ))}
      </div>
    </EditorialSection>
  )
}
