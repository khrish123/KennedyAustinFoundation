"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Download, Heart, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  isDarkColor,
  normalizeHexColor,
  type HeroSlide,
} from "@/types/hero"

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

  const current = slides[index]
  // Flyer-style slides show the artwork whole beside the copy instead of
  // cropping it to fill the hero.
  const showsFlyer =
    current.image_fit === "contain" && !!current.background_image_url

  const bgColor = normalizeHexColor(current.background_color)
  const onDark = !!bgColor && isDarkColor(bgColor)
  const position = current.image_position || "right"
  const centered = showsFlyer && position === "center"

  return (
    <section
      className={cn(
        "relative overflow-hidden min-h-[640px] transition-colors duration-700",
        !bgColor && "gradient-sunrise"
      )}
      style={bgColor ? { backgroundColor: bgColor } : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {/* Slides stack */}
      {slides.map((slide, i) => (
        <Slide key={slide.id} slide={slide} active={i === index} />
      ))}

      {/* Foreground content (uses the active slide) */}
      <div
        className={cn(
          "relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
          // Flyer slides run tighter so the artwork gets the vertical room.
          showsFlyer ? "py-12 lg:py-16" : "py-20 lg:py-28"
        )}
      >
        <div
          className={cn(
            showsFlyer
              ? centered
                ? "flex flex-col items-center text-center gap-8"
                : "grid gap-10 lg:items-center lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
              : "max-w-3xl"
          )}
        >
          <div className={cn(centered && "max-w-3xl", position === "left" && "lg:order-2")}>
            <Badge className="mb-4 bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200">
              {current.eyebrow || "A Safe Place to Begin Your Healing Journey"}
            </Badge>
            <SlideText slide={current} onDark={onDark} centered={centered} />

            {showCrisisLine && !showsFlyer && (
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

          {showsFlyer && (
            <div
              className={cn(
                "space-y-3 w-full",
                centered && "max-w-5xl",
                position === "left" && "lg:order-1"
              )}
            >
              <FlyerImage
                key={current.id}
                slide={current}
                centered={centered}
              />
              {current.allow_download && (
                <div className="flex justify-center">
                  <Button asChild size="sm" variant="secondary">
                    <a href={downloadHref(current)} download>
                      <Download className="h-4 w-4 mr-2" />
                      Download image
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cover-fit slides keep the download button under the copy */}
        {!showsFlyer && current.allow_download && current.background_image_url && (
          <div className="mt-6">
            <Button asChild size="sm" variant="secondary">
              <a href={downloadHref(current)} download>
                <Download className="h-4 w-4 mr-2" />
                Download image
              </a>
            </Button>
          </div>
        )}
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

function downloadHref(slide: HeroSlide) {
  return slide.download_url || `/api/hero-slides/${slide.id}/image`
}

/**
 * The flyer itself: whole, unfaded, and sized from its own aspect ratio so it
 * fills as much of the hero as it can. A tall poster gets height; a wide
 * banner gets width. Measured on load rather than guessed.
 */
function FlyerImage({
  slide,
  centered,
}: {
  slide: HeroSlide
  centered: boolean
}) {
  const [ratio, setRatio] = useState<number | null>(null)

  // Portrait art is height-bound, landscape art is width-bound. Before the
  // image reports its size we use the balanced cap, so nothing jumps far.
  const heightCap =
    ratio === null
      ? "max-h-[32rem]"
      : ratio < 0.85
        ? centered
          ? "max-h-[40rem]"
          : "max-h-[38rem]"
        : ratio > 1.4
          ? "max-h-[28rem]"
          : "max-h-[34rem]"

  const frame = cn(
    "block rounded-2xl overflow-hidden bg-white shadow-warm-lg ring-1 ring-white/60",
    centered && "mx-auto"
  )

  /* eslint-disable @next/next/no-img-element */
  const image = (
    <img
      src={slide.background_image_url!}
      alt={slide.title}
      onLoad={(e) => {
        const el = e.currentTarget
        if (el.naturalHeight > 0) setRatio(el.naturalWidth / el.naturalHeight)
      }}
      className={cn("w-full object-contain", heightCap)}
    />
  )
  /* eslint-enable @next/next/no-img-element */

  if (slide.primary_cta_url) {
    return (
      <Link href={slide.primary_cta_url} className={cn(frame, "hover-lift")}>
        {image}
      </Link>
    )
  }
  return <div className={frame}>{image}</div>
}

function Slide({ slide, active }: { slide: HeroSlide; active: boolean }) {
  const hasMedia = !!(slide.background_video_url || slide.background_image_url)
  const isFlyer = slide.image_fit === "contain" && !!slide.background_image_url

  // Flyer slides render the artwork in the foreground; back here we only blur a
  // copy of it into a soft, tinted backdrop. A chosen background color replaces
  // that backdrop entirely — it is painted on the section itself.
  if (isFlyer) {
    if (normalizeHexColor(slide.background_color)) return null
    return (
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-700 ease-in-out",
          active ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.background_image_url!}
          alt=""
          className="h-full w-full object-cover scale-110 blur-2xl"
        />
        <div className="absolute inset-0 bg-white/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/25" />
      </div>
    )
  }

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

      {/* Readability scrim: strong only behind the copy on the left, so the
          right side of the photo stays vivid instead of washing out. */}
      {hasMedia && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/92 via-white/45 to-transparent" />
      )}

      {/* Soft fade-out at the bottom (matches the original hero) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/25" />
    </div>
  )
}

function SlideText({
  slide,
  onDark,
  centered,
}: {
  slide: HeroSlide
  onDark: boolean
  centered: boolean
}) {
  const primaryHasCta = !!(slide.primary_cta_text && slide.primary_cta_url)
  const secondaryHasCta = !!(slide.secondary_cta_text && slide.secondary_cta_url)

  return (
    <>
      <h1
        className={cn(
          "text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl",
          onDark ? "text-white" : "text-slate-900"
        )}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p
          className={cn(
            "mt-6 text-lg leading-8 max-w-2xl whitespace-pre-line line-clamp-6",
            onDark ? "text-white/90" : "text-slate-700",
            centered && "mx-auto"
          )}
        >
          {slide.subtitle}
        </p>
      )}
      {(primaryHasCta || secondaryHasCta) && (
        <div
          className={cn(
            "mt-8 flex flex-wrap gap-4",
            centered && "justify-center"
          )}
        >
          {primaryHasCta && (
            <Button asChild size="lg" className="shadow-warm hover-lift">
              <Link href={slide.primary_cta_url!}>
                <Heart className="mr-2 h-4 w-4" />
                {slide.primary_cta_text}
              </Link>
            </Button>
          )}
          {secondaryHasCta && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className={cn(
                "hover-lift",
                onDark && "bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white"
              )}
            >
              <Link href={slide.secondary_cta_url!}>{slide.secondary_cta_text}</Link>
            </Button>
          )}
        </div>
      )}
    </>
  )
}
