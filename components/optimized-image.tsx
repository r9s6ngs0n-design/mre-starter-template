import Image from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
  fill?: boolean
  width?: number
  height?: number
}

export function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  sizes = "100vw",
  fill = true,
  width,
  height,
}: OptimizedImageProps) {
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn("object-cover", className)}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width!}
      height={height!}
      priority={priority}
      sizes={sizes}
      className={cn("object-cover", className)}
    />
  )
}
