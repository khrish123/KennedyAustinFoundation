"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

type ClassInput = {
  title: string
  slug: string
  description: string
  category: string
  type: string
  instructor_id: string | null
  thumbnail_url: string
  price: number
  duration_minutes: number
  max_participants: number | null
  location: string
  zoom_link: string
  video_url: string
  is_published: boolean
}

const CATEGORIES = ["grief", "dv", "self_help", "therapy", "wellness"]
const TYPES = ["live", "recorded", "in_person"]

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

function nullable(v: string) {
  const t = v.trim()
  return t === "" ? null : t
}

function parseFormData(formData: FormData): ClassInput | { error: string } {
  const title = (formData.get("title") || "").toString().trim()
  if (!title) return { error: "Title is required" }

  const category = (formData.get("category") || "").toString().trim()
  if (!CATEGORIES.includes(category)) return { error: "Invalid category" }

  const type = (formData.get("type") || "").toString().trim()
  if (!TYPES.includes(type)) return { error: "Invalid class type" }

  const slugRaw = (formData.get("slug") || "").toString().trim()
  const slug = slugRaw ? slugify(slugRaw) : slugify(title)
  if (!slug) return { error: "Could not derive a URL slug from the title" }

  const priceRaw = (formData.get("price") || "0").toString().trim()
  const price = parseFloat(priceRaw)
  if (!Number.isFinite(price) || price < 0)
    return { error: "Price must be a non-negative number" }

  const durationRaw = (formData.get("duration_minutes") || "0").toString().trim()
  const duration = parseInt(durationRaw, 10)
  if (!Number.isFinite(duration) || duration < 0)
    return { error: "Duration must be a non-negative integer" }

  const maxRaw = (formData.get("max_participants") || "").toString().trim()
  const max = maxRaw === "" ? null : parseInt(maxRaw, 10)
  if (max !== null && (!Number.isFinite(max) || max < 0))
    return { error: "Max participants must be a non-negative integer" }

  const instructorRaw = (formData.get("instructor_id") || "").toString().trim()

  return {
    title,
    slug,
    description: (formData.get("description") || "").toString().trim(),
    category,
    type,
    instructor_id: instructorRaw === "" ? null : instructorRaw,
    thumbnail_url: (formData.get("thumbnail_url") || "").toString().trim(),
    price,
    duration_minutes: duration,
    max_participants: max,
    location: (formData.get("location") || "").toString().trim(),
    zoom_link: (formData.get("zoom_link") || "").toString().trim(),
    video_url: (formData.get("video_url") || "").toString().trim(),
    is_published:
      formData.get("is_published") === "on" ||
      formData.get("is_published") === "true",
  }
}

function toRow(input: ClassInput) {
  return {
    title: input.title,
    slug: input.slug,
    description: nullable(input.description),
    category: input.category,
    type: input.type,
    instructor_id: input.instructor_id,
    thumbnail_url: nullable(input.thumbnail_url),
    price: input.price,
    duration_minutes: input.duration_minutes,
    max_participants: input.max_participants,
    location: nullable(input.location),
    zoom_link: nullable(input.zoom_link),
    video_url: nullable(input.video_url),
    is_published: input.is_published,
    translations: {},
  }
}

export async function createClassAction(formData: FormData) {
  const parsed = parseFormData(formData)
  if ("error" in parsed) return { error: parsed.error }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("classes")
    .insert(toRow(parsed))
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath("/admin/classes")
  revalidatePath("/classes")
  redirect(`/admin/classes/${data.id}/edit`)
}

export async function updateClassAction(id: string, formData: FormData) {
  const parsed = parseFormData(formData)
  if ("error" in parsed) return { error: parsed.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from("classes")
    .update(toRow(parsed))
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/admin/classes")
  revalidatePath(`/admin/classes/${id}/edit`)
  revalidatePath("/classes")
  revalidatePath(`/classes/${parsed.slug}`)
  return { ok: true }
}

export async function togglePublishAction(id: string, currentlyPublished: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("classes")
    .update({ is_published: !currentlyPublished })
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/classes")
  revalidatePath("/classes")
  return { ok: true }
}

export async function deleteClassAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("classes").delete().eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/classes")
  revalidatePath("/classes")
  return { ok: true }
}
