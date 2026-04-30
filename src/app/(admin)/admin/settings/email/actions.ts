"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { sendTestEmail } from "@/lib/email"

const ENCRYPTIONS = ["none", "tls", "ssl"]
const TRANSPORTS = ["smtp", "resend", "auto"]

interface SettingsInput {
  smtp_host: string
  smtp_port: number | null
  smtp_username: string
  /** Empty string => leave existing password unchanged */
  smtp_password: string
  smtp_encryption: string
  from_email: string
  from_name: string
  reply_to_email: string
  resend_api_key: string
  transport: string
}

function nullable(v: string) {
  const t = v.trim()
  return t === "" ? null : t
}

function parseFormData(formData: FormData): SettingsInput | { error: string } {
  const smtp_encryption = (formData.get("smtp_encryption") || "ssl")
    .toString()
    .trim()
  if (!ENCRYPTIONS.includes(smtp_encryption))
    return { error: "Invalid SMTP encryption" }

  const transport = (formData.get("transport") || "auto").toString().trim()
  if (!TRANSPORTS.includes(transport)) return { error: "Invalid transport" }

  const portRaw = (formData.get("smtp_port") || "").toString().trim()
  const port = portRaw === "" ? null : parseInt(portRaw, 10)
  if (port !== null && (!Number.isFinite(port) || port < 1 || port > 65535))
    return { error: "SMTP port must be 1–65535" }

  return {
    smtp_host: (formData.get("smtp_host") || "").toString().trim(),
    smtp_port: port,
    smtp_username: (formData.get("smtp_username") || "").toString().trim(),
    smtp_password: (formData.get("smtp_password") || "").toString(),
    smtp_encryption,
    from_email: (formData.get("from_email") || "").toString().trim(),
    from_name: (formData.get("from_name") || "").toString().trim(),
    reply_to_email: (formData.get("reply_to_email") || "").toString().trim(),
    resend_api_key: (formData.get("resend_api_key") || "").toString().trim(),
    transport,
  }
}

export async function saveEmailSettingsAction(
  existingId: string | null,
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  const parsed = parseFormData(formData)
  if ("error" in parsed) return { error: parsed.error }

  const supabase = await createClient()

  // Build the update/insert row. Empty password keeps the existing one.
  const row: Record<string, unknown> = {
    smtp_host: nullable(parsed.smtp_host),
    smtp_port: parsed.smtp_port,
    smtp_username: nullable(parsed.smtp_username),
    smtp_encryption: parsed.smtp_encryption,
    from_email: nullable(parsed.from_email),
    from_name: nullable(parsed.from_name),
    reply_to_email: nullable(parsed.reply_to_email),
    transport: parsed.transport,
  }
  if (parsed.smtp_password !== "") {
    row.smtp_password = parsed.smtp_password
  }
  if (parsed.resend_api_key !== "") {
    row.resend_api_key = parsed.resend_api_key
  }

  const { error } = existingId
    ? await supabase.from("email_settings").update(row).eq("id", existingId)
    : await supabase.from("email_settings").insert(row)

  if (error) return { error: error.message }
  revalidatePath("/admin/settings/email")
  return { ok: true }
}

export async function clearSmtpPasswordAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("email_settings")
    .update({ smtp_password: null })
    .eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/settings/email")
  return { ok: true }
}

export async function clearResendKeyAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("email_settings")
    .update({ resend_api_key: null })
    .eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/settings/email")
  return { ok: true }
}

export async function sendTestEmailAction(to: string) {
  const trimmed = to.trim()
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { error: "Enter a valid email address" }
  }
  const result = await sendTestEmail(trimmed)
  return result
}
