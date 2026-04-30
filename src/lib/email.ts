import nodemailer from "nodemailer"
import { Resend } from "resend"
import { getEmailSettings } from "@/lib/queries/email-settings"
import { getSiteSettings } from "@/lib/queries/settings"
import type { EmailSettings } from "@/types/email"

export interface SendEmailParams {
  to: string
  subject: string
  text: string
  html?: string
  /** Defaults to email_settings.from_email + from_name, then site settings. */
  from?: string
  /** Defaults to email_settings.reply_to_email. */
  replyTo?: string
}

export interface SendEmailResult {
  ok: boolean
  /** Provider-side message id, when one is returned. */
  id?: string
  /** "smtp" or "resend" or "skipped" or "failed". */
  status: "sent" | "skipped" | "failed"
  transport?: "smtp" | "resend"
  error?: string
}

function smtpConfigured(s: EmailSettings | null) {
  return !!(s?.smtp_host && s?.smtp_username && s?.smtp_password)
}

function resendKey(s: EmailSettings | null) {
  return s?.resend_api_key || process.env.RESEND_API_KEY || ""
}

async function buildFrom(settings: EmailSettings | null): Promise<string> {
  if (settings?.from_email) {
    const name =
      settings.from_name ||
      (await getSiteSettings()).site_name ||
      "Kennedy Austin Foundation"
    return `${name} <${settings.from_email}>`
  }
  // Fallback to env / site settings
  const site = await getSiteSettings()
  const name = site.site_name || "Kennedy Austin Foundation"
  const addr =
    process.env.EMAIL_FROM ||
    site.primary_email ||
    "noreply@kennedyaustinfoundation.com"
  return `${name} <${addr}>`
}

async function sendViaSmtp(
  s: EmailSettings,
  params: SendEmailParams
): Promise<SendEmailResult> {
  const transporter = nodemailer.createTransport({
    host: s.smtp_host!,
    port: s.smtp_port || 465,
    secure: s.smtp_encryption === "ssl",
    requireTLS: s.smtp_encryption === "tls",
    auth: {
      user: s.smtp_username!,
      pass: s.smtp_password!,
    },
  })

  try {
    const info = await transporter.sendMail({
      from: params.from || (await buildFrom(s)),
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html ?? params.text.replace(/\n/g, "<br />"),
      replyTo: params.replyTo || s.reply_to_email || undefined,
    })
    return { ok: true, status: "sent", transport: "smtp", id: info.messageId }
  } catch (e) {
    return {
      ok: false,
      status: "failed",
      transport: "smtp",
      error: e instanceof Error ? e.message : "SMTP send failed",
    }
  }
}

async function sendViaResend(
  s: EmailSettings | null,
  params: SendEmailParams
): Promise<SendEmailResult> {
  const key = resendKey(s)
  if (!key) {
    return {
      ok: false,
      status: "skipped",
      error: "No SMTP configured and no RESEND_API_KEY available",
    }
  }
  try {
    const client = new Resend(key)
    const result = await client.emails.send({
      from: params.from || (await buildFrom(s)),
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html ?? params.text.replace(/\n/g, "<br />"),
      replyTo: params.replyTo || s?.reply_to_email || undefined,
    })
    if (result.error) {
      return {
        ok: false,
        status: "failed",
        transport: "resend",
        error: result.error.message || "Resend returned an error",
      }
    }
    return {
      ok: true,
      status: "sent",
      transport: "resend",
      id: result.data?.id,
    }
  } catch (e) {
    return {
      ok: false,
      status: "failed",
      transport: "resend",
      error: e instanceof Error ? e.message : "Unknown Resend error",
    }
  }
}

/**
 * Send a transactional email. Picks transport based on email_settings.transport:
 *   - "smtp": SMTP only (fails if SMTP not configured)
 *   - "resend": Resend only (fails if no API key)
 *   - "auto" (default): SMTP first, fall back to Resend if SMTP isn't configured
 *
 * Always degrades gracefully — if nothing is configured, returns
 * { status: "skipped" } so the caller can still log the message.
 */
export async function sendTransactionalEmail(
  params: SendEmailParams
): Promise<SendEmailResult> {
  const s = await getEmailSettings()
  const transport = s?.transport || "auto"

  if (transport === "smtp") {
    if (!smtpConfigured(s)) {
      return {
        ok: false,
        status: "skipped",
        error: "Transport set to SMTP but SMTP not configured",
      }
    }
    return sendViaSmtp(s!, params)
  }

  if (transport === "resend") {
    return sendViaResend(s, params)
  }

  // auto: prefer SMTP, then Resend
  if (smtpConfigured(s)) {
    return sendViaSmtp(s!, params)
  }
  if (resendKey(s)) {
    return sendViaResend(s, params)
  }
  return {
    ok: false,
    status: "skipped",
    error:
      "Email not configured. Set up SMTP at /admin/settings/email or add RESEND_API_KEY.",
  }
}

/**
 * Quick connectivity test — used by the "Send test email" button in admin.
 * Returns { ok, transport, error? }.
 */
export async function sendTestEmail(to: string): Promise<SendEmailResult> {
  return sendTransactionalEmail({
    to,
    subject: "Email test from Kennedy Austin Foundation",
    text:
      "This is a test email from your Kennedy Austin Foundation site.\n\n" +
      "If you received this, your transactional email is wired up correctly.\n",
  })
}
