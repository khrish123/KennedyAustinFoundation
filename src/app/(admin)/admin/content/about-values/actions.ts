"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface ValueInput {
  title: string
  description: string
  icon_name: string
  order_index: number
  is_published: boolean
}

function nullable(v: string) {
  const t = v.trim()
  return t === "" ? null : t
}

function parseFormData(formData: FormData): ValueInput | { error: string } {
  const title = (formData.get("title") || "").toString().trim()
  if (!title) return { error: "Title is required" }
  const description = (formData.get("description") || "").toString().trim()
  if (!description) return { error: "Description is required" }
  const orderRaw = formData.get("order_index")
  const order = orderRaw ? parseInt(orderRaw.toString(), 10) : 0
  return {
    title,
    description,
    icon_name: (formData.get("icon_name") || "").toString().trim(),
    order_index: Number.isFinite(order) ? order : 0,
    is_published:
      formData.get("is_published") === "on" ||
      formData.get("is_published") === "true",
  }
}

function toRow(input: ValueInput) {
  return {
    title: input.title,
    description: input.description,
    icon_name: nullable(input.icon_name),
    order_index: input.order_index,
    is_published: input.is_published,
  }
}

export async function createValueAction(formData: FormData) {
  const parsed = parseFormData(formData)
  if ("error" in parsed) return { error: parsed.error }
  const supabase = await createClient()
  const { error } = await supabase.from("about_values").insert(toRow(parsed))
  if (error) return { error: error.message }
  revalidatePath("/admin/content/about-values")
  revalidatePath("/about")
  return { ok: true }
}

export async function updateValueAction(id: string, formData: FormData) {
  const parsed = parseFormData(formData)
  if ("error" in parsed) return { error: parsed.error }
  const supabase = await createClient()
  const { error } = await supabase.from("about_values").update(toRow(parsed)).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/content/about-values")
  revalidatePath("/about")
  return { ok: true }
}

export async function toggleValueAction(id: string, currentlyPublished: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("about_values")
    .update({ is_published: !currentlyPublished })
    .eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/content/about-values")
  revalidatePath("/about")
  return { ok: true }
}

export async function deleteValueAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("about_values").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/content/about-values")
  revalidatePath("/about")
  return { ok: true }
}
