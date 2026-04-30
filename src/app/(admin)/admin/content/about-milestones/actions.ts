"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface MilestoneInput {
  year: string
  title: string
  description: string
  order_index: number
  is_published: boolean
}

function nullable(v: string) {
  const t = v.trim()
  return t === "" ? null : t
}

function parseFormData(formData: FormData): MilestoneInput | { error: string } {
  const year = (formData.get("year") || "").toString().trim()
  if (!year) return { error: "Year is required" }
  const title = (formData.get("title") || "").toString().trim()
  if (!title) return { error: "Title is required" }
  const orderRaw = formData.get("order_index")
  const order = orderRaw ? parseInt(orderRaw.toString(), 10) : 0
  return {
    year,
    title,
    description: (formData.get("description") || "").toString().trim(),
    order_index: Number.isFinite(order) ? order : 0,
    is_published:
      formData.get("is_published") === "on" ||
      formData.get("is_published") === "true",
  }
}

function toRow(input: MilestoneInput) {
  return {
    year: input.year,
    title: input.title,
    description: nullable(input.description),
    order_index: input.order_index,
    is_published: input.is_published,
  }
}

export async function createMilestoneAction(formData: FormData) {
  const parsed = parseFormData(formData)
  if ("error" in parsed) return { error: parsed.error }
  const supabase = await createClient()
  const { error } = await supabase.from("about_milestones").insert(toRow(parsed))
  if (error) return { error: error.message }
  revalidatePath("/admin/content/about-milestones")
  revalidatePath("/about")
  return { ok: true }
}

export async function updateMilestoneAction(id: string, formData: FormData) {
  const parsed = parseFormData(formData)
  if ("error" in parsed) return { error: parsed.error }
  const supabase = await createClient()
  const { error } = await supabase
    .from("about_milestones")
    .update(toRow(parsed))
    .eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/content/about-milestones")
  revalidatePath("/about")
  return { ok: true }
}

export async function toggleMilestoneAction(
  id: string,
  currentlyPublished: boolean
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("about_milestones")
    .update({ is_published: !currentlyPublished })
    .eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/content/about-milestones")
  revalidatePath("/about")
  return { ok: true }
}

export async function deleteMilestoneAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("about_milestones").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/content/about-milestones")
  revalidatePath("/about")
  return { ok: true }
}
