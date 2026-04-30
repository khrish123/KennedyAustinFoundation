"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const TYPES = ["article", "video", "pdf", "link"]

type ResourceInput = {
  title: string
  description: string
  category: string
  type: string
  url: string
  phone: string
  content: string
  is_crisis_resource: boolean
  is_published: boolean
  order_index: number
}

function nullable(v: string) {
  const t = v.trim()
  return t === "" ? null : t
}

function parseFormData(formData: FormData): ResourceInput | { error: string } {
  const title = (formData.get("title") || "").toString().trim()
  if (!title) return { error: "Title is required" }

  const category = (formData.get("category") || "").toString().trim()
  if (!category) return { error: "Category is required" }

  const type = (formData.get("type") || "").toString().trim()
  if (!TYPES.includes(type)) return { error: "Invalid type" }

  const orderRaw = formData.get("order_index")
  const order = orderRaw ? parseInt(orderRaw.toString(), 10) : 0

  return {
    title,
    description: (formData.get("description") || "").toString().trim(),
    category,
    type,
    url: (formData.get("url") || "").toString().trim(),
    phone: (formData.get("phone") || "").toString().trim(),
    content: (formData.get("content") || "").toString().trim(),
    is_crisis_resource:
      formData.get("is_crisis_resource") === "on" ||
      formData.get("is_crisis_resource") === "true",
    is_published:
      formData.get("is_published") === "on" ||
      formData.get("is_published") === "true",
    order_index: Number.isFinite(order) ? order : 0,
  }
}

function toRow(input: ResourceInput) {
  return {
    title: input.title,
    description: nullable(input.description),
    category: input.category,
    type: input.type,
    url: nullable(input.url),
    phone: nullable(input.phone),
    content: nullable(input.content),
    is_crisis_resource: input.is_crisis_resource,
    is_published: input.is_published,
    order_index: input.order_index,
  }
}

export async function createResourceAction(formData: FormData) {
  const parsed = parseFormData(formData)
  if ("error" in parsed) return { error: parsed.error }

  const supabase = await createClient()
  const { error } = await supabase.from("resources").insert(toRow(parsed))

  if (error) return { error: error.message }
  revalidatePath("/admin/content/resources")
  revalidatePath("/resources")
  return { ok: true }
}

export async function updateResourceAction(id: string, formData: FormData) {
  const parsed = parseFormData(formData)
  if ("error" in parsed) return { error: parsed.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from("resources")
    .update(toRow(parsed))
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/content/resources")
  revalidatePath("/resources")
  return { ok: true }
}

export async function toggleResourceAction(id: string, currentlyPublished: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("resources")
    .update({ is_published: !currentlyPublished })
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/content/resources")
  revalidatePath("/resources")
  return { ok: true }
}

export async function deleteResourceAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("resources").delete().eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/content/resources")
  revalidatePath("/resources")
  return { ok: true }
}
