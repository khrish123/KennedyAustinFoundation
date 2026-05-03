import { createClient } from "@/lib/supabase/server"
import type { EventRecord, EventRegistration } from "@/types/events"

export async function getUpcomingPublishedEvents(): Promise<EventRecord[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .gte("date", new Date().toISOString())
      .order("date", { ascending: true })
    if (error || !data) return []
    return data as EventRecord[]
  } catch {
    return []
  }
}

export async function getPastPublishedEvents(limit = 50): Promise<EventRecord[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .lt("date", new Date().toISOString())
      .order("date", { ascending: false })
      .limit(limit)
    if (error || !data) return []
    return data as EventRecord[]
  } catch {
    return []
  }
}

export async function getEventById(id: string): Promise<EventRecord | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .maybeSingle()
    return (data as EventRecord) || null
  } catch {
    return null
  }
}

export async function getRegistrationsForEvent(
  eventId: string
): Promise<{
  registrations: EventRegistration[]
  tableMissing: boolean
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
    if (error) {
      const tableMissing = /relation .* does not exist/i.test(error.message)
      return { registrations: [], tableMissing }
    }
    return {
      registrations: (data || []) as EventRegistration[],
      tableMissing: false,
    }
  } catch {
    return { registrations: [], tableMissing: false }
  }
}

export async function getRegistrationCountForEvent(
  eventId: string
): Promise<number> {
  try {
    const supabase = await createClient()
    const { count } = await supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .neq("status", "canceled")
    return count || 0
  } catch {
    return 0
  }
}
