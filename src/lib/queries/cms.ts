import { createClient } from "@/lib/supabase/server"
import type { ServiceItem, AboutValue, AboutMilestone } from "@/types/cms"

// ----- Services -----

export async function getPublishedServices(): Promise<ServiceItem[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_published", true)
      .order("order_index", { ascending: true })
    if (error || !data) return []
    return data as ServiceItem[]
  } catch {
    return []
  }
}

export async function getAllServices(): Promise<{
  services: ServiceItem[]
  tableMissing: boolean
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("order_index", { ascending: true })
    if (error) {
      const tableMissing = /relation .* does not exist/i.test(error.message)
      return { services: [], tableMissing }
    }
    return { services: (data || []) as ServiceItem[], tableMissing: false }
  } catch {
    return { services: [], tableMissing: false }
  }
}

export async function getServiceById(id: string): Promise<ServiceItem | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .maybeSingle()
    return (data as ServiceItem) || null
  } catch {
    return null
  }
}

// ----- About values -----

export async function getPublishedValues(): Promise<AboutValue[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("about_values")
      .select("*")
      .eq("is_published", true)
      .order("order_index", { ascending: true })
    if (error || !data) return []
    return data as AboutValue[]
  } catch {
    return []
  }
}

export async function getAllValues(): Promise<{
  values: AboutValue[]
  tableMissing: boolean
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("about_values")
      .select("*")
      .order("order_index", { ascending: true })
    if (error) {
      const tableMissing = /relation .* does not exist/i.test(error.message)
      return { values: [], tableMissing }
    }
    return { values: (data || []) as AboutValue[], tableMissing: false }
  } catch {
    return { values: [], tableMissing: false }
  }
}

// ----- About milestones -----

export async function getPublishedMilestones(): Promise<AboutMilestone[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("about_milestones")
      .select("*")
      .eq("is_published", true)
      .order("order_index", { ascending: true })
    if (error || !data) return []
    return data as AboutMilestone[]
  } catch {
    return []
  }
}

export async function getAllMilestones(): Promise<{
  milestones: AboutMilestone[]
  tableMissing: boolean
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("about_milestones")
      .select("*")
      .order("order_index", { ascending: true })
    if (error) {
      const tableMissing = /relation .* does not exist/i.test(error.message)
      return { milestones: [], tableMissing }
    }
    return { milestones: (data || []) as AboutMilestone[], tableMissing: false }
  } catch {
    return { milestones: [], tableMissing: false }
  }
}
