export type SmtpEncryption = "none" | "tls" | "ssl"
export type EmailTransport = "smtp" | "resend" | "auto"

export interface EmailSettings {
  id: string
  smtp_host: string | null
  smtp_port: number | null
  smtp_username: string | null
  /** Stored encrypted-at-rest is a future improvement. Never sent to the client; the form shows a masked placeholder. */
  smtp_password: string | null
  smtp_encryption: SmtpEncryption
  from_email: string | null
  from_name: string | null
  reply_to_email: string | null
  resend_api_key: string | null
  transport: EmailTransport
  created_at: string
  updated_at: string
}

/**
 * The version of EmailSettings safe to send to the client/admin form —
 * sensitive credentials are replaced with a flag indicating whether they're set.
 */
export interface EmailSettingsForAdmin {
  id: string
  smtp_host: string | null
  smtp_port: number | null
  smtp_username: string | null
  smtp_password_set: boolean
  smtp_encryption: SmtpEncryption
  from_email: string | null
  from_name: string | null
  reply_to_email: string | null
  resend_api_key_set: boolean
  transport: EmailTransport
}

export const SMTP_PRESETS = [
  {
    label: "GoDaddy (SSL, port 465)",
    host: "smtpout.secureserver.net",
    port: 465,
    encryption: "ssl" as const,
  },
  {
    label: "Gmail (TLS, port 587)",
    host: "smtp.gmail.com",
    port: 587,
    encryption: "tls" as const,
  },
  {
    label: "Zoho Mail (SSL, port 465)",
    host: "smtp.zoho.com",
    port: 465,
    encryption: "ssl" as const,
  },
  {
    label: "Outlook 365 (TLS, port 587)",
    host: "smtp.office365.com",
    port: 587,
    encryption: "tls" as const,
  },
  {
    label: "Custom",
    host: "",
    port: 587,
    encryption: "tls" as const,
  },
]
