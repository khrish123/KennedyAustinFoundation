import { createClient } from "@/lib/supabase/server"
import type {
  SupportMessage,
  SupportRequestWithSubject,
  SupportThread,
} from "@/types/messaging"

export async function getMyRequests(): Promise<SupportRequestWithSubject[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from("support_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data as SupportRequestWithSubject[]
  } catch {
    return []
  }
}

export async function getThread(requestId: string): Promise<SupportThread | null> {
  try {
    const supabase = await createClient()
    const [{ data: req }, { data: msgs }] = await Promise.all([
      supabase
        .from("support_requests")
        .select("*")
        .eq("id", requestId)
        .maybeSingle(),
      supabase
        .from("support_messages")
        .select("*")
        .eq("support_request_id", requestId)
        .order("created_at", { ascending: true }),
    ])

    if (!req) return null

    return {
      request: req as SupportRequestWithSubject,
      messages: (msgs || []) as SupportMessage[],
    }
  } catch {
    return null
  }
}

export async function getAllRequests(): Promise<{
  requests: SupportRequestWithSubject[]
  tableMissing: boolean
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("support_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      const tableMissing = /relation .* does not exist/i.test(error.message)
      return { requests: [], tableMissing }
    }
    return { requests: (data || []) as SupportRequestWithSubject[], tableMissing: false }
  } catch {
    return { requests: [], tableMissing: false }
  }
}
