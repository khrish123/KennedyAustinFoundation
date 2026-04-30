"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

type FaqInput = {
  question: string
  answer: string
  category: string
  order_index: number
  is_published: boolean
}

function nullable(v: string) {
  const t = v.trim()
  return t === "" ? null : t
}

function parseFormData(formData: FormData): FaqInput {
  const orderRaw = formData.get("order_index")
  const order = orderRaw ? parseInt(orderRaw.toString(), 10) : 0
  return {
    question: (formData.get("question") || "").toString().trim(),
    answer: (formData.get("answer") || "").toString().trim(),
    category: (formData.get("category") || "").toString().trim(),
    order_index: Number.isFinite(order) ? order : 0,
    is_published: formData.get("is_published") === "on" || formData.get("is_published") === "true",
  }
}

function toRow(input: FaqInput) {
  return {
    question: input.question,
    answer: input.answer,
    category: nullable(input.category),
    order_index: input.order_index,
    is_published: input.is_published,
  }
}

export async function createFaqAction(formData: FormData) {
  const input = parseFormData(formData)
  if (!input.question || !input.answer) return { error: "Question and answer are required" }

  const supabase = await createClient()
  const { error } = await supabase.from("faqs").insert(toRow(input))

  if (error) return { error: error.message }
  revalidatePath("/admin/content/faqs")
  revalidatePath("/faq")
  return { ok: true }
}

export async function updateFaqAction(id: string, formData: FormData) {
  const input = parseFormData(formData)
  if (!input.question || !input.answer) return { error: "Question and answer are required" }

  const supabase = await createClient()
  const { error } = await supabase.from("faqs").update(toRow(input)).eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/content/faqs")
  revalidatePath("/faq")
  return { ok: true }
}

export async function toggleFaqAction(id: string, currentlyPublished: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("faqs")
    .update({ is_published: !currentlyPublished })
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/content/faqs")
  revalidatePath("/faq")
  return { ok: true }
}

export async function deleteFaqAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("faqs").delete().eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/content/faqs")
  revalidatePath("/faq")
  return { ok: true }
}
