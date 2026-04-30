import { createClient } from "@/lib/supabase/server"
import { DEFAULT_HERO_SLIDES, type HeroSlide } from "@/types/hero"
import type { Event } from "@/types"

export async function getActiveHeroSlides(): Promise<HeroSlide[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true })

    if (error || !data || data.length === 0) {
      return DEFAULT_HERO_SLIDES
    }
    return data as HeroSlide[]
  } catch {
    return DEFAULT_HERO_SLIDES
  }
}

export async function getUpcomingEvents(limit = 3): Promise<Event[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("date", new Date().toISOString())
      .order("date", { ascending: true })
      .limit(limit)

    if (error || !data) return []
    return data as Event[]
  } catch {
    return []
  }
}
