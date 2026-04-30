import { createClient } from "@/lib/supabase/server"
import type { DailyInspiration } from "@/types"

export async function getRandomInspiration(): Promise<DailyInspiration | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("daily_inspirations")
      .select("*")
      .eq("is_active", true)
      .limit(50)

    if (error || !data || data.length === 0) return null
    return data[Math.floor(Math.random() * data.length)] as DailyInspiration
  } catch {
    return null
  }
}

export async function getAllInspirations(): Promise<{
  inspirations: DailyInspiration[]
  tableMissing: boolean
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("daily_inspirations")
      .select("*")
      .order("generated_at", { ascending: false })

    if (error) {
      const tableMissing = /relation .* does not exist/i.test(error.message)
      return { inspirations: [], tableMissing }
    }
    return {
      inspirations: (data || []) as DailyInspiration[],
      tableMissing: false,
    }
  } catch {
    return { inspirations: [], tableMissing: false }
  }
}
