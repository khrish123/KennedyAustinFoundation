"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

type EventInput = {
  title: string
  description: string
  date: string
  location: string
  image_url: string
  registration_required: boolean
  max_attendees: number | null
}

function nullable(v: string) {
  const t = v.trim()
  return t === "" ? null : t
}

function parseFormData(formData: FormData): EventInput | { error: string } {
  const title = (formData.get("title") || "").toString().trim()
  if (!title) return { error: "Title is required" }

  const dateRaw = (formData.get("date") || "").toString().trim()
  if (!dateRaw) return { error: "Date is required" }
  const date = new Date(dateRaw)
  if (isNaN(date.getTime())) return { error: "Invalid date" }

  const maxRaw = (formData.get("max_attendees") || "").toString().trim()
  const max = maxRaw === "" ? null : parseInt(maxRaw, 10)
  if (max !== null && (!Number.isFinite(max) || max < 0))
    return { error: "Max attendees must be a non-negative integer" }

  return {
    title,
    description: (formData.get("description") || "").toString().trim(),
    date: date.toISOString(),
    location: (formData.get("location") || "").toString().trim(),
    image_url: (formData.get("image_url") || "").toString().trim(),
    registration_required:
      formData.get("registration_required") === "on" ||
      formData.get("registration_required") === "true",
    max_attendees: max,
  }
}

function toRow(input: EventInput) {
  return {
    title: input.title,
    description: nullable(input.description),
    date: input.date,
    location: nullable(input.location),
    image_url: nullable(input.image_url),
    registration_required: input.registration_required,
    max_attendees: input.max_attendees,
  }
}

export async function createEventAction(formData: FormData) {
  const parsed = parseFormData(formData)
  if ("error" in parsed) return { error: parsed.error }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("events")
    .insert(toRow(parsed))
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath("/admin/events")
  revalidatePath("/events")
  revalidatePath("/")
  redirect(`/admin/events/${data.id}/edit`)
}

export async function updateEventAction(id: string, formData: FormData) {
  const parsed = parseFormData(formData)
  if ("error" in parsed) return { error: parsed.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from("events")
    .update(toRow(parsed))
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/admin/events")
  revalidatePath(`/admin/events/${id}/edit`)
  revalidatePath("/events")
  revalidatePath(`/events/${id}`)
  revalidatePath("/")
  return { ok: true }
}

export async function deleteEventAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("events").delete().eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/events")
  revalidatePath("/events")
  revalidatePath("/")
  return { ok: true }
}
