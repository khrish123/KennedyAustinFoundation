"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

type ProviderInput = {
  name: string
  slug: string
  description: string
  logo_url: string
  website_url: string
  phone: string
  populations_served: string
  order_index: number
  is_visible: boolean
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

function parseFormData(formData: FormData): ProviderInput {
  const orderRaw = formData.get("order_index")
  const order = orderRaw ? parseInt(orderRaw.toString(), 10) : 0
  const name = (formData.get("name") || "").toString().trim()
  const slugRaw = (formData.get("slug") || "").toString().trim()
  return {
    name,
    slug: slugRaw || slugify(name),
    description: (formData.get("description") || "").toString().trim(),
    logo_url: (formData.get("logo_url") || "").toString().trim(),
    website_url: (formData.get("website_url") || "").toString().trim(),
    phone: (formData.get("phone") || "").toString().trim(),
    populations_served: (formData.get("populations_served") || "").toString().trim(),
    order_index: Number.isFinite(order) ? order : 0,
    is_visible: formData.get("is_visible") === "on" || formData.get("is_visible") === "true",
  }
}

function toRow(input: ProviderInput) {
  return {
    name: input.name,
    slug: input.slug || null,
    description: input.description || null,
    logo_url: input.logo_url || null,
    website_url: input.website_url || null,
    phone: input.phone || null,
    populations_served: input.populations_served || null,
    order_index: input.order_index,
    is_visible: input.is_visible,
  }
}

export async function createProviderAction(formData: FormData) {
  const input = parseFormData(formData)
  if (!input.name) return { error: "Name is required" }

  const supabase = await createClient()
  const { error } = await supabase.from("ecm_providers").insert(toRow(input))

  if (error) return { error: error.message }
  revalidatePath("/admin/content/ecm-providers")
  revalidatePath("/ecm")
  return { ok: true }
}

export async function updateProviderAction(id: string, formData: FormData) {
  const input = parseFormData(formData)
  if (!input.name) return { error: "Name is required" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("ecm_providers")
    .update(toRow(input))
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/content/ecm-providers")
  revalidatePath("/ecm")
  return { ok: true }
}

export async function toggleProviderVisibilityAction(
  id: string,
  currentlyVisible: boolean
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("ecm_providers")
    .update({ is_visible: !currentlyVisible })
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/content/ecm-providers")
  revalidatePath("/ecm")
  return { ok: true }
}

export async function deleteProviderAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("ecm_providers").delete().eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/content/ecm-providers")
  revalidatePath("/ecm")
  return { ok: true }
}
