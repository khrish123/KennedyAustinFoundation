import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import type { EmailSettings, EmailSettingsForAdmin } from "@/types/email"

/**
 * Load email settings for the email helper to actually send a message.
 * RLS on email_settings is admin-only, so this uses a plain Supabase
 * client (no cookies) initialized with the service-role key to
 * guarantee RLS bypass.
 *
 * Why not the @supabase/ssr server client? Even when initialized with
 * the service-role key, the SSR client merges in auth cookies, which
 * can override the apikey for queries and re-enable RLS. The plain
 * client has no cookie context, so the service role is always used.
 *
 * Falls back to the cookie-bound client if the service key is missing
 * (so the admin "Send test email" still works in dev).
 */
export async function getEmailSettings(): Promise<EmailSettings | null> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (url && serviceKey) {
      const admin = createSupabaseAdminClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const { data, error } = await admin
        .from("email_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()
      if (error || !data) return null
      return data as EmailSettings
    }

    // Fallback: cookie-bound server client (only works in admin sessions)
    const cookieClient = await createClient()
    const { data, error } = await cookieClient
      .from("email_settings")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()
    if (error || !data) return null
    return data as EmailSettings
  } catch {
    return null
  }
}

/**
 * Same data, but with sensitive fields masked. Safe to render in the admin form.
 */
export async function getEmailSettingsForAdmin(): Promise<{
  settings: EmailSettingsForAdmin | null
  tableMissing: boolean
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("email_settings")
      .select(
        "id, smtp_host, smtp_port, smtp_username, smtp_password, smtp_encryption, from_email, from_name, reply_to_email, resend_api_key, transport"
      )
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) {
      const tableMissing = /relation .* does not exist/i.test(error.message)
      return { settings: null, tableMissing }
    }
    if (!data) return { settings: null, tableMissing: false }

    const masked: EmailSettingsForAdmin = {
      id: data.id,
      smtp_host: data.smtp_host ?? null,
      smtp_port: data.smtp_port ?? null,
      smtp_username: data.smtp_username ?? null,
      smtp_password_set: !!data.smtp_password,
      smtp_encryption: data.smtp_encryption,
      from_email: data.from_email ?? null,
      from_name: data.from_name ?? null,
      reply_to_email: data.reply_to_email ?? null,
      resend_api_key_set: !!data.resend_api_key,
      transport: data.transport,
    }
    return { settings: masked, tableMissing: false }
  } catch {
    return { settings: null, tableMissing: false }
  }
}
