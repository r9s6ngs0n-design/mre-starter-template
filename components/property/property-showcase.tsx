import { PropertyShowcaseCarousel } from '@/components/property/property-showcase-carousel'

export interface PropertyShowcaseProps {
  title: string
  location: string
  type: string
  price: string
  status: string
  specs?: string
  images: { src: string; alt: string }[]
  videoUrl?: string | null
}

export function PropertyShowcase({
  title,
  location,
  type,
  price,
  status,
  specs,
  images,
  videoUrl,
}: PropertyShowcaseProps) {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-background">
      <div className="absolute inset-0">
        <PropertyShowcaseCarousel images={images} />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between">
        <div className="container-wide relative pt-28">
          <p className="eyebrow text-gold">{type}</p>
          <h1 className="mt-4 text-balance text-display font-serif font-light text-white">{title}</h1>
          <p className="mt-2 text-lg text-white/85">{location}</p>
          {price ? <p className="mt-3 text-lg font-light text-white">{price}</p> : null}
          <p className="mt-2 text-sm uppercase tracking-widest text-gold">{status}</p>
          {specs ? <p className="mt-2 text-base text-white/85">{specs}</p> : null}

          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto mt-6 inline-flex items-center gap-3 border border-white/40 bg-black/30 px-5 py-3 text-sm font-medium uppercase tracking-widest text-white backdrop-blur-sm transition-colors hover:border-gold hover:bg-black/50 hover:text-gold"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-3 w-3 translate-x-px"
                  aria-hidden="true"
                >
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </span>
              Property Showcase Video
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
