"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const REGISTRATION_TYPES = ["none", "rsvp", "volunteer", "toy_request"] as const
type RegistrationType = (typeof REGISTRATION_TYPES)[number]

const REGISTRATION_STATUSES = [
  "pending",
  "approved",
  "confirmed",
  "waitlist",
  "canceled",
] as const
type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number]

interface EventInput {
  title: string
  description: string
  date: string
  location: string
  image_url: string
  registration_required: boolean
  max_attendees: number | null
  event_type: string
  registration_type: RegistrationType
  registration_deadline: string | null
  is_published: boolean
  featured_on_home: boolean
  allow_flyer_download: boolean
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

  const bool = (name: string) =>
    formData.get(name) === "on" || formData.get(name) === "true"

  const regTypeRaw = (formData.get("registration_type") || "none").toString().trim()
  if (!(REGISTRATION_TYPES as readonly string[]).includes(regTypeRaw))
    return { error: "Invalid registration type" }
  const registration_type = regTypeRaw as RegistrationType

  const deadlineRaw = (formData.get("registration_deadline") || "").toString().trim()
  let registration_deadline: string | null = null
  if (deadlineRaw) {
    const d = new Date(deadlineRaw)
    if (isNaN(d.getTime())) return { error: "Invalid registration deadline" }
    registration_deadline = d.toISOString()
  }

  const is_published = bool("is_published")

  return {
    title,
    description: (formData.get("description") || "").toString().trim(),
    date: date.toISOString(),
    location: (formData.get("location") || "").toString().trim(),
    image_url: (formData.get("image_url") || "").toString().trim(),
    registration_required:
      registration_type !== "none" || bool("registration_required"),
    max_attendees: max,
    event_type: (formData.get("event_type") || "general").toString().trim() || "general",
    registration_type,
    registration_deadline,
    is_published,
    // A draft can never sit in the homepage hero.
    featured_on_home: is_published && bool("featured_on_home"),
    allow_flyer_download: bool("allow_flyer_download"),
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
    event_type: input.event_type,
    registration_type: input.registration_type,
    registration_deadline: input.registration_deadline,
    is_published: input.is_published,
    featured_on_home: input.featured_on_home,
    allow_flyer_download: input.allow_flyer_download,
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

export async function setRegistrationStatusAction(
  registrationId: string,
  status: string,
  eventId: string
) {
  if (!(REGISTRATION_STATUSES as readonly string[]).includes(status)) {
    return { error: "Invalid status" }
  }
  const supabase = await createClient()
  const { error } = await supabase
    .from("event_registrations")
    .update({ status: status as RegistrationStatus })
    .eq("id", registrationId)
  if (error) return { error: error.message }
  revalidatePath(`/admin/events/${eventId}/registrations`)
  return { ok: true }
}

export async function deleteRegistrationAction(
  registrationId: string,
  eventId: string
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("event_registrations")
    .delete()
    .eq("id", registrationId)
  if (error) return { error: error.message }
  revalidatePath(`/admin/events/${eventId}/registrations`)
  return { ok: true }
}
