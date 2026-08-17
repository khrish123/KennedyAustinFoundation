import { createClient } from "@/lib/supabase/server"
import { DEFAULT_HERO_SLIDES, type HeroSlide } from "@/types/hero"
import type { Event } from "@/types"
import type { EventRecord } from "@/types/events"

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
      .eq("is_published", true)
      .gte("date", new Date().toISOString())
      .order("date", { ascending: true })
      .limit(limit)

    if (error || !data) return []
    return data as Event[]
  } catch {
    return []
  }
}

function formatSlideDate(iso: string) {
  const d = new Date(iso)
  const date = d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
  const time = d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" })
  return `${date} at ${time}`
}

/**
 * Published + upcoming events an admin flagged with "Feature in the homepage
 * hero", shaped as hero slides. They lead the slider and drop off on their own
 * once the event date passes.
 */
export async function getFeaturedEventSlides(limit = 3): Promise<HeroSlide[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .eq("featured_on_home", true)
      .gte("date", new Date().toISOString())
      .order("date", { ascending: true })
      .limit(limit)

    if (error || !data) return []

    return (data as EventRecord[]).map((event, i) => {
      const details = [formatSlideDate(event.date), event.location]
        .filter(Boolean)
        .join(" · ")
      const subtitle = event.description
        ? `${details}\n${event.description}`
        : details

      return {
        id: `event-${event.id}`,
        title: event.title,
        subtitle,
        background_image_url: event.image_url,
        background_video_url: null,
        primary_cta_text:
          event.registration_type !== "none" ? "Sign up" : "View details",
        primary_cta_url: `/events/${event.id}`,
        secondary_cta_text: "All events",
        secondary_cta_url: "/events",
        order_index: -1000 + i,
        is_active: true,
        created_at: event.created_at,
        updated_at: event.created_at,
        eyebrow: "Upcoming Event",
        image_fit: "contain" as const,
      }
    })
  } catch {
    return []
  }
}
