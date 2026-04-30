import { createClient } from "@/lib/supabase/server"
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/types/settings"

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error || !data) return DEFAULT_SITE_SETTINGS
    return data as SiteSettings
  } catch {
    return DEFAULT_SITE_SETTINGS
  }
}

export async function getSiteSettingsForAdmin(): Promise<{
  settings: SiteSettings | null
  tableMissing: boolean
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) {
      const tableMissing = /relation .* does not exist/i.test(error.message)
      return { settings: null, tableMissing }
    }
    return { settings: (data as SiteSettings) || null, tableMissing: false }
  } catch {
    return { settings: null, tableMissing: false }
  }
}
