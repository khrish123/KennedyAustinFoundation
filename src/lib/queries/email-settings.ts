import { createClient, createServiceClient } from "@/lib/supabase/server"
import type { EmailSettings, EmailSettingsForAdmin } from "@/types/email"

/**
 * Load email settings for the email helper to actually send a message.
 * RLS on email_settings is admin-only, so this uses the service-role
 * client to bypass RLS — needed for non-admin contexts like newsletter
 * signup, contact form, event registration, and account welcome emails.
 *
 * Falls back to the regular cookie client if the service key is missing,
 * which still works when called from an admin-authenticated session
 * (e.g. the "Send test email" button).
 */
export async function getEmailSettings(): Promise<EmailSettings | null> {
  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createServiceClient()
      : await createClient()
    const { data, error } = await supabase
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
