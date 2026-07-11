'use client'

import { NavLink } from "@/components/nav-link"
import type { Article } from "@/lib/data"
import { HoverZoom } from "@/components/motion/hover-zoom"
import { OptimizedImage } from "@/components/optimized-image"

interface ArticleCardProps {
  article: Article
  variant?: "default" | "horizontal"
}

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  if (variant === "horizontal") {
    return (
      <NavLink
        href={`/insights/${article.slug}`}
        className="group flex gap-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <HoverZoom className="relative aspect-[4/3] w-28 shrink-0 sm:w-36">
          <OptimizedImage
            src={article.image || "/placeholder.svg"}
            alt={article.title}
            sizes="144px"
          />
        </HoverZoom>
        <div className="flex min-w-0 flex-col justify-center py-1">
          <p className="text-caption text-muted-foreground">
            {article.date} · {article.readTime}
          </p>
          <h3 className="mt-1 text-balance font-serif text-xl font-medium leading-tight text-ink group-hover:text-forest-deep">
            {article.title}
          </h3>
        </div>
      </NavLink>
    )
  }

  return (
    <NavLink
      href={`/insights/${article.slug}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <HoverZoom className="relative aspect-[3/2]">
        <OptimizedImage
          src={article.image || "/placeholder.svg"}
          alt={article.title}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <span className="absolute left-4 top-4 z-10 bg-cream/90 px-3 py-1 text-caption font-medium uppercase text-forest-deep">
          {article.category}
        </span>
      </HoverZoom>
      <div className="pt-5">
        <p className="text-caption text-muted-foreground">
          {article.date} · {article.readTime}
        </p>
        <h3 className="mt-2 text-balance text-subhead font-serif font-medium text-ink">{article.title}</h3>
        <p className="mt-2 text-pretty text-body text-muted-foreground">{article.excerpt}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-forest-deep">
          <span className="relative">
            Read
            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold transition-all duration-500 group-hover:w-full" />
          </span>
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </NavLink>
  )
}
