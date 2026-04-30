"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Heart, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { HeroSlide } from "@/types/hero"

interface HeroSliderProps {
  slides: HeroSlide[]
  intervalMs?: number
  showCrisisLine?: boolean
}

export function HeroSlider({
  slides,
  intervalMs = 7000,
  showCrisisLine = true,
}: HeroSliderProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const total = slides.length

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % total)
  }, [total])

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + total) % total)
  }, [total])

  useEffect(() => {
    if (total <= 1 || paused) return
    const id = window.setInterval(next, intervalMs)
    return () => window.clearInterval(id)
  }, [next, intervalMs, total, paused])

  if (total === 0) return null

  return (
    <section
      className="relative overflow-hidden gradient-sunrise min-h-[640px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {/* Slides stack */}
      {slides.map((slide, i) => (
        <Slide key={slide.id} slide={slide} active={i === index} />
      ))}

      {/* Foreground content (uses the active slide) */}
      <div className="relative z-20 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="max-w-3xl">
          <Badge className="mb-4 bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200">
            A Safe Place to Begin Your Healing Journey
          </Badge>
          <SlideText slide={slides[index]} />

          {showCrisisLine && (
            <div className="mt-8 p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-teal-200 inline-flex items-center gap-3 shadow-warm">
              <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                <Phone className="h-5 w-5 text-teal-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Need to talk? Our crisis line is always open:</p>
                <a
                  href="tel:909-808-6866"
                  className="font-semibold text-teal-700 hover:underline text-lg"
                >
                  909-808-6866
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Decorative blobs (keep the existing warm aesthetic) */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none z-10" />
      <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-amber-200/30 rounded-full blur-3xl pointer-events-none z-10" />

      {/* Controls */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-warm hover:bg-white transition"
          >
            <ChevronLeft className="h-5 w-5 text-slate-700" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-warm hover:bg-white transition"
          >
            <ChevronRight className="h-5 w-5 text-slate-700" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  i === index ? "w-8 bg-teal-700" : "w-2.5 bg-white/70 hover:bg-white"
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function Slide({ slide, active }: { slide: HeroSlide; active: boolean }) {
  const hasMedia = !!(slide.background_video_url || slide.background_image_url)

  return (
    <div
      className={cn(
        "absolute inset-0 transition-opacity duration-700 ease-in-out",
        active ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      aria-hidden={!active}
    >
      {slide.background_video_url ? (
        <video
          className="h-full w-full object-cover"
          src={slide.background_video_url}
          poster={slide.background_image_url || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : slide.background_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slide.background_image_url}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : null}

      {/* Readability overlay only when we have media */}
      {hasMedia && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-white/30" />
      )}

      {/* Soft fade-out at the bottom (matches the original hero) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/60" />
    </div>
  )
}

function SlideText({ slide }: { slide: HeroSlide }) {
  const primaryHasCta = !!(slide.primary_cta_text && slide.primary_cta_url)
  const secondaryHasCta = !!(slide.secondary_cta_text && slide.secondary_cta_url)

  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p className="mt-6 text-lg leading-8 text-slate-700 max-w-2xl">
          {slide.subtitle}
        </p>
      )}
      {(primaryHasCta || secondaryHasCta) && (
        <div className="mt-8 flex flex-wrap gap-4">
          {primaryHasCta && (
            <Button asChild size="lg" className="shadow-warm hover-lift">
              <Link href={slide.primary_cta_url!}>
                <Heart className="mr-2 h-4 w-4" />
                {slide.primary_cta_text}
              </Link>
            </Button>
          )}
          {secondaryHasCta && (
            <Button asChild size="lg" variant="outline" className="hover-lift">
              <Link href={slide.secondary_cta_url!}>{slide.secondary_cta_text}</Link>
            </Button>
          )}
        </div>
      )}
    </>
  )
}
