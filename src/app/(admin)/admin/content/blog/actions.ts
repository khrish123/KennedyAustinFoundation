"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

interface PostInput {
  title: string
  slug: string
  excerpt: string
  body: string
  cover_image_url: string
  category: string
  tags: string[]
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
    .slice(0, 80)
}

function parseFormData(formData: FormData): PostInput | { error: string } {
  const title = (formData.get("title") || "").toString().trim()
  if (!title) return { error: "Title is required" }
  const body = (formData.get("body") || "").toString().trim()
  if (!body) return { error: "Body is required" }

  const slugRaw = (formData.get("slug") || "").toString().trim()
  const slug = slugRaw ? slugify(slugRaw) : slugify(title)
  if (!slug) return { error: "Could not derive a URL slug from the title" }

  const tagsRaw = (formData.get("tags") || "").toString().trim()
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : []

  return {
    title,
    slug,
    excerpt: (formData.get("excerpt") || "").toString().trim(),
    body,
    cover_image_url: (formData.get("cover_image_url") || "").toString().trim(),
    category: (formData.get("category") || "").toString().trim(),
    tags,
    is_published:
      formData.get("is_published") === "on" ||
      formData.get("is_published") === "true",
  }
}

function toRow(input: PostInput, options: { setPublishedAt?: boolean } = {}) {
  const row: Record<string, unknown> = {
    title: input.title,
    slug: input.slug,
    excerpt: nullable(input.excerpt),
    body: input.body,
    cover_image_url: nullable(input.cover_image_url),
    category: nullable(input.category),
    tags: input.tags.length ? input.tags : null,
    is_published: input.is_published,
  }
  if (options.setPublishedAt) {
    row.published_at = input.is_published ? new Date().toISOString() : null
  }
  return row
}

export async function createPostAction(formData: FormData) {
  const parsed = parseFormData(formData)
  if ("error" in parsed) return { error: parsed.error }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const row = toRow(parsed, { setPublishedAt: true })
  if (user) row.author_id = user.id

  const { data, error } = await supabase
    .from("blog_posts")
    .insert(row)
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath("/admin/content/blog")
  revalidatePath("/blog")
  redirect(`/admin/content/blog/${data.id}/edit`)
}

export async function updatePostAction(id: string, formData: FormData) {
  const parsed = parseFormData(formData)
  if ("error" in parsed) return { error: parsed.error }

  const supabase = await createClient()

  // Determine whether published_at should change. We only set it when the post
  // moves from unpublished -> published; we never clear it on subsequent edits.
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("is_published, published_at, slug")
    .eq("id", id)
    .maybeSingle()

  const row = toRow(parsed)
  if (parsed.is_published && (!existing?.published_at || !existing.is_published)) {
    row.published_at = new Date().toISOString()
  }

  const { error } = await supabase.from("blog_posts").update(row).eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/admin/content/blog")
  revalidatePath(`/admin/content/blog/${id}/edit`)
  revalidatePath("/blog")
  if (existing?.slug) revalidatePath(`/blog/${existing.slug}`)
  revalidatePath(`/blog/${parsed.slug}`)
  return { ok: true }
}

export async function togglePublishedAction(
  id: string,
  currentlyPublished: boolean
) {
  const supabase = await createClient()
  const next = !currentlyPublished
  const update: Record<string, unknown> = { is_published: next }
  if (next) {
    const { data } = await supabase
      .from("blog_posts")
      .select("published_at")
      .eq("id", id)
      .maybeSingle()
    if (!data?.published_at) update.published_at = new Date().toISOString()
  }
  const { error } = await supabase.from("blog_posts").update(update).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/content/blog")
  revalidatePath("/blog")
  return { ok: true }
}

export async function deletePostAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("blog_posts").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/content/blog")
  revalidatePath("/blog")
  return { ok: true }
}
