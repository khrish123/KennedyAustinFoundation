"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

type SlideInput = {
  title: string
  subtitle: string
  background_image_url: string
  background_video_url: string
  primary_cta_text: string
  primary_cta_url: string
  secondary_cta_text: string
  secondary_cta_url: string
  order_index: number
  is_active: boolean
}

function parseFormData(formData: FormData): SlideInput {
  const orderRaw = formData.get("order_index")
  const order = orderRaw ? parseInt(orderRaw.toString(), 10) : 0
  return {
    title: (formData.get("title") || "").toString().trim(),
    subtitle: (formData.get("subtitle") || "").toString().trim(),
    background_image_url: (formData.get("background_image_url") || "").toString().trim(),
    background_video_url: (formData.get("background_video_url") || "").toString().trim(),
    primary_cta_text: (formData.get("primary_cta_text") || "").toString().trim(),
    primary_cta_url: (formData.get("primary_cta_url") || "").toString().trim(),
    secondary_cta_text: (formData.get("secondary_cta_text") || "").toString().trim(),
    secondary_cta_url: (formData.get("secondary_cta_url") || "").toString().trim(),
    order_index: Number.isFinite(order) ? order : 0,
    is_active: formData.get("is_active") === "on" || formData.get("is_active") === "true",
  }
}

function toRow(input: SlideInput) {
  return {
    title: input.title,
    subtitle: input.subtitle || null,
    background_image_url: input.background_image_url || null,
    background_video_url: input.background_video_url || null,
    primary_cta_text: input.primary_cta_text || null,
    primary_cta_url: input.primary_cta_url || null,
    secondary_cta_text: input.secondary_cta_text || null,
    secondary_cta_url: input.secondary_cta_url || null,
    order_index: input.order_index,
    is_active: input.is_active,
  }
}

export async function createSlideAction(formData: FormData) {
  const input = parseFormData(formData)
  if (!input.title) return { error: "Title is required" }

  const supabase = await createClient()
  const { error } = await supabase.from("hero_slides").insert(toRow(input))

  if (error) return { error: error.message }
  revalidatePath("/admin/content/hero-slides")
  revalidatePath("/")
  return { ok: true }
}

export async function updateSlideAction(id: string, formData: FormData) {
  const input = parseFormData(formData)
  if (!input.title) return { error: "Title is required" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("hero_slides")
    .update(toRow(input))
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/content/hero-slides")
  revalidatePath("/")
  return { ok: true }
}

export async function toggleSlideAction(id: string, currentlyActive: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("hero_slides")
    .update({ is_active: !currentlyActive })
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/content/hero-slides")
  revalidatePath("/")
  return { ok: true }
}

export async function deleteSlideAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("hero_slides").delete().eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/content/hero-slides")
  revalidatePath("/")
  return { ok: true }
}
