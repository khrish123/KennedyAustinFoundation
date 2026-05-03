"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

interface ServiceInput {
  slug: string
  title: string
  short_description: string
  long_description: string
  icon_name: string
  color_class: string
  bg_color_class: string
  image_url: string
  features: string[]
  href_anchor: string
  order_index: number
  is_published: boolean
}

function nullable(v: string) {
  const t = v.trim()
  return t === "" ? null : t
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

function parseFormData(formData: FormData): ServiceInput | { error: string } {
  const title = (formData.get("title") || "").toString().trim()
  if (!title) return { error: "Title is required" }

  const slugRaw = (formData.get("slug") || "").toString().trim()
  const slug = slugRaw ? slugify(slugRaw) : slugify(title)
  if (!slug) return { error: "Could not derive a slug" }

  const orderRaw = formData.get("order_index")
  const order = orderRaw ? parseInt(orderRaw.toString(), 10) : 0

  const featuresRaw = (formData.get("features") || "").toString()
  const features = featuresRaw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)

  return {
    slug,
    title,
    short_description: (formData.get("short_description") || "").toString().trim(),
    long_description: (formData.get("long_description") || "").toString().trim(),
    icon_name: (formData.get("icon_name") || "").toString().trim(),
    color_class: (formData.get("color_class") || "").toString().trim(),
    bg_color_class: (formData.get("bg_color_class") || "").toString().trim(),
    image_url: (formData.get("image_url") || "").toString().trim(),
    features,
    href_anchor: (formData.get("href_anchor") || "").toString().trim(),
    order_index: Number.isFinite(order) ? order : 0,
    is_published:
      formData.get("is_published") === "on" ||
      formData.get("is_published") === "true",
  }
}

function toRow(input: ServiceInput) {
  return {
    slug: input.slug,
    title: input.title,
    short_description: nullable(input.short_description),
    long_description: nullable(input.long_description),
    icon_name: nullable(input.icon_name),
    color_class: nullable(input.color_class),
    bg_color_class: nullable(input.bg_color_class),
    image_url: nullable(input.image_url),
    features: input.features.length ? input.features : null,
    href_anchor: nullable(input.href_anchor) || input.slug,
    order_index: input.order_index,
    is_published: input.is_published,
  }
}

export async function createServiceAction(formData: FormData) {
  const parsed = parseFormData(formData)
  if ("error" in parsed) return { error: parsed.error }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("services")
    .insert(toRow(parsed))
    .select("id")
    .single()
  if (error) return { error: error.message }

  revalidatePath("/admin/content/services")
  revalidatePath("/services")
  revalidatePath("/")
  redirect(`/admin/content/services/${data.id}/edit`)
}

export async function updateServiceAction(id: string, formData: FormData) {
  const parsed = parseFormData(formData)
  if ("error" in parsed) return { error: parsed.error }

  const supabase = await createClient()
  const { error } = await supabase.from("services").update(toRow(parsed)).eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/admin/content/services")
  revalidatePath("/services")
  revalidatePath("/")
  return { ok: true }
}

export async function toggleServicePublishedAction(
  id: string,
  currentlyPublished: boolean
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("services")
    .update({ is_published: !currentlyPublished })
    .eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/content/services")
  revalidatePath("/services")
  revalidatePath("/")
  return { ok: true }
}

export async function deleteServiceAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("services").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/content/services")
  revalidatePath("/services")
  revalidatePath("/")
  return { ok: true }
}
