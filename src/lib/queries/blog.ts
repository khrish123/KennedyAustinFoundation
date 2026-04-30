import { createClient } from "@/lib/supabase/server"
import type { BlogPost } from "@/types/blog"

export async function getPublishedPosts(limit?: number): Promise<BlogPost[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from("blog_posts")
      .select("*, author:profiles(full_name, avatar_url)")
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })

    if (limit) query = query.limit(limit)

    const { data, error } = await query
    if (error || !data) return []
    return data as BlogPost[]
  } catch {
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, author:profiles(full_name, avatar_url)")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle()

    if (error || !data) return null
    return data as BlogPost
  } catch {
    return null
  }
}

export async function getAllPostsForAdmin(): Promise<{
  posts: BlogPost[]
  tableMissing: boolean
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, author:profiles(full_name, avatar_url)")
      .order("created_at", { ascending: false })

    if (error) {
      const tableMissing = /relation .* does not exist/i.test(error.message)
      return { posts: [], tableMissing }
    }
    return { posts: (data || []) as BlogPost[], tableMissing: false }
  } catch {
    return { posts: [], tableMissing: false }
  }
}

export async function getPostByIdForAdmin(id: string): Promise<BlogPost | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, author:profiles(full_name, avatar_url)")
      .eq("id", id)
      .maybeSingle()
    if (error || !data) return null
    return data as BlogPost
  } catch {
    return null
  }
}
