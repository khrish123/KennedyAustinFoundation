import { createClient } from "@/lib/supabase/server"
import type { EcmProvider } from "@/types/ecm"

export async function getVisibleEcmProviders(): Promise<EcmProvider[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("ecm_providers")
      .select("*")
      .eq("is_visible", true)
      .order("order_index", { ascending: true })

    if (error || !data) return []
    return data as EcmProvider[]
  } catch {
    return []
  }
}

export async function getAllEcmProviders(): Promise<{
  providers: EcmProvider[]
  tableMissing: boolean
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("ecm_providers")
      .select("*")
      .order("order_index", { ascending: true })

    if (error) {
      const tableMissing = /relation .* does not exist/i.test(error.message)
      return { providers: [], tableMissing }
    }
    return { providers: (data || []) as EcmProvider[], tableMissing: false }
  } catch {
    return { providers: [], tableMissing: false }
  }
}
