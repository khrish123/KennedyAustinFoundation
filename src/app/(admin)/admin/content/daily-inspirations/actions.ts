"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

type InspirationInput = {
  content: string
  category: string
  language: string
  is_active: boolean
}

function nullable(v: string) {
  const t = v.trim()
  return t === "" ? null : t
}

function parseFormData(formData: FormData): InspirationInput {
  return {
    content: (formData.get("content") || "").toString().trim(),
    category: (formData.get("category") || "").toString().trim(),
    language: (formData.get("language") || "en").toString().trim() || "en",
    is_active:
      formData.get("is_active") === "on" || formData.get("is_active") === "true",
  }
}

function toRow(input: InspirationInput) {
  return {
    content: input.content,
    category: nullable(input.category),
    language: input.language,
    is_active: input.is_active,
  }
}

export async function createInspirationAction(formData: FormData) {
  const input = parseFormData(formData)
  if (!input.content) return { error: "Content is required" }

  const supabase = await createClient()
  const { error } = await supabase.from("daily_inspirations").insert(toRow(input))

  if (error) return { error: error.message }
  revalidatePath("/admin/content/daily-inspirations")
  return { ok: true }
}

export async function updateInspirationAction(id: string, formData: FormData) {
  const input = parseFormData(formData)
  if (!input.content) return { error: "Content is required" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("daily_inspirations")
    .update(toRow(input))
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/content/daily-inspirations")
  return { ok: true }
}

export async function toggleInspirationAction(id: string, currentlyActive: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("daily_inspirations")
    .update({ is_active: !currentlyActive })
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/content/daily-inspirations")
  return { ok: true }
}

export async function deleteInspirationAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("daily_inspirations").delete().eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/content/daily-inspirations")
  return { ok: true }
}
