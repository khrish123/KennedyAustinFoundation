import { createClient } from "@/lib/supabase/server"
import { getEmailSettings } from "@/lib/queries/email-settings"
import type { Campaign } from "@/types"

export async function getAllCampaigns(): Promise<{
  campaigns: Campaign[]
  tableMissing: boolean
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) {
      const tableMissing = /relation .* does not exist/i.test(error.message)
      return { campaigns: [], tableMissing }
    }
    return { campaigns: (data || []) as Campaign[], tableMissing: false }
  } catch {
    return { campaigns: [], tableMissing: false }
  }
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .maybeSingle()
    return (data as Campaign) || null
  } catch {
    return null
  }
}

export async function getActiveSubscriberCount(): Promise<number> {
  try {
    const supabase = await createClient()
    const { count } = await supabase
      .from("subscribers")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
    return count || 0
  } catch {
    return 0
  }
}

export async function isEmailReady(): Promise<boolean> {
  const s = await getEmailSettings()
  const smtpReady = !!(s?.smtp_host && s?.smtp_username && s?.smtp_password)
  const resendReady = !!(s?.resend_api_key || process.env.RESEND_API_KEY)
  return smtpReady || resendReady
}
