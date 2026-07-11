"use client"

import { useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"
import { TextReveal } from "@/components/motion/text-reveal"
import { MagneticButton } from "@/components/motion/magnetic-button"
import { FadeUp } from "@/components/motion/fade-up"

export function HomeHero() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // React doesn't sync `muted` as a DOM property — iOS Safari checks the property, not the attribute.
    video.muted = true
    video.defaultMuted = true
    video.volume = 0

    const tryPlay = () => {
      if (!video.paused) return
      video.play().catch(() => {})
    }

    // Attempt 1: immediate (works when autoplay policy allows it)
    tryPlay()

    // Attempt 2: after curtain animation finishes (~1.8s) — iOS may have blocked the
    // initial call while the BrandIntroCurtain was covering the viewport
    const curtainTimer = window.setTimeout(tryPlay, 2000)

    // Attempt 3: on first user touch — required for Low Power Mode and strict autoplay policies
    const onTouch = () => tryPlay()
    document.addEventListener("touchstart", onTouch, { once: true, passive: true })
    document.addEventListener("click", onTouch, { once: true })

    // Attempt 4: if the browser pauses the video unexpectedly (background tab return etc.)
    const onPause = () => {
      if (!document.hidden) tryPlay()
    }
    video.addEventListener("pause", onPause)

    return () => {
      window.clearTimeout(curtainTimer)
      document.removeEventListener("touchstart", onTouch)
      document.removeEventListener("click", onTouch)
      video.removeEventListener("pause", onPause)
    }
  }, [])

  return (
    <section
      className="relative min-h-[580px] w-full overflow-hidden bg-forest-deep"
      style={{ height: "calc(100svh + env(safe-area-inset-bottom))" }}
    >
      <video
        ref={videoRef}
        src="/images/hero-video.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 hero-scrim" />

      <div
        className="container-wide absolute inset-x-0 bottom-10 md:bottom-12"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="max-w-2xl">
          <TextReveal
            text="{{PLACEHOLDER}}"
            as="h1"
            immediate
            className="text-display font-serif font-light leading-[1.08] text-balance text-cream"
          />

          <FadeUp immediate>
            <div className="mt-6 md:mt-8">
              <MagneticButton href="/projects">
                Explore the collection <span aria-hidden>→</span>
              </MagneticButton>
            </div>
          </FadeUp>
        </div>
      </div>

      <div
        className="absolute left-1/2 -translate-x-1/2 text-cream/60"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 2rem)" }}
      >
        <ChevronDown className="h-6 w-6 animate-scroll-hint" strokeWidth={1.5} aria-hidden />
        <span className="sr-only">Scroll for more</span>
      </div>
    </section>
  )
}
