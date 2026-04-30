import { Metadata } from "next"
import Link from "next/link"
import { Sparkles, ArrowLeft, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { HeroSlide } from "@/types/hero"
import { SlideCard } from "./slide-card"
import { SlideForm } from "./slide-form"

export const metadata: Metadata = {
  title: "Hero Slides | Admin",
}

async function fetchSlides(): Promise<{ slides: HeroSlide[]; tableMissing: boolean }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .order("order_index", { ascending: true })

    if (error) {
      const tableMissing = /relation .* does not exist/i.test(error.message)
      return { slides: [], tableMissing }
    }
    return { slides: (data || []) as HeroSlide[], tableMissing: false }
  } catch {
    return { slides: [], tableMissing: false }
  }
}

export default async function AdminHeroSlidesPage() {
  const { slides, tableMissing } = await fetchSlides()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/content"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Content
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Hero Slides</h1>
          <p className="text-muted-foreground">
            Rotating hero carousel on the homepage. Drag-style reorder via the order number.
          </p>
        </div>
      </div>

      {tableMissing && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900 text-base">
              Database table not found
            </CardTitle>
            <CardDescription className="text-amber-900/80">
              The <code className="px-1 rounded bg-amber-100">hero_slides</code> table
              hasn&apos;t been created yet. Apply{" "}
              <code className="px-1 rounded bg-amber-100">
                supabase/migrations/002_hero_slides.sql
              </code>{" "}
              in the Supabase SQL editor, then refresh this page.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card className="bg-teal-50/60 border-teal-200">
        <CardContent className="flex items-start gap-3 py-4">
          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-teal-100">
            <Sparkles className="h-4 w-4 text-teal-700" />
          </div>
          <p className="text-sm text-teal-900">
            <strong>Tip:</strong> Create multiple slides for a rotating hero on your homepage.
            The carousel auto-advances every 7 seconds. Each slide can have an image{" "}
            <em>or</em> a video background, plus up to two call-to-action buttons.
          </p>
        </CardContent>
      </Card>

      {slides.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide) => (
            <SlideCard key={slide.id} slide={slide} />
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-5 w-5" />
            {slides.length === 0 ? "Add your first slide" : "Add new slide"}
          </CardTitle>
          {slides.length === 0 && !tableMissing && (
            <CardDescription>
              No slides yet — the homepage is showing the default fallback. Add a slide below
              to take over the hero.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <SlideForm />
        </CardContent>
      </Card>
    </div>
  )
}
