import { createClient } from "@/lib/supabase/server"
import type { Resource } from "@/types/resource"

export async function getCrisisResources(): Promise<Resource[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("is_crisis_resource", true)
      .eq("is_published", true)
      .order("order_index", { ascending: true })

    if (error || !data) return []
    return data as Resource[]
  } catch {
    return []
  }
}

export async function getNonCrisisResources(): Promise<Resource[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("is_crisis_resource", false)
      .eq("is_published", true)
      .order("order_index", { ascending: true })

    if (error || !data) return []
    return data as Resource[]
  } catch {
    return []
  }
}

export async function getAllResources(): Promise<{
  resources: Resource[]
  tableMissing: boolean
  needsMigration: boolean
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("order_index", { ascending: true })

    if (error) {
      const tableMissing = /relation .* does not exist/i.test(error.message)
      const needsMigration =
        /column .* does not exist/i.test(error.message) ||
        /order_index/i.test(error.message)
      return { resources: [], tableMissing, needsMigration }
    }
    return {
      resources: (data || []) as Resource[],
      tableMissing: false,
      needsMigration: false,
    }
  } catch {
    return { resources: [], tableMissing: false, needsMigration: false }
  }
}
