import { NextResponse } from "next/server"
import { sendTransactionalEmail } from "@/lib/email"
import { getSiteSettings } from "@/lib/queries/settings"

/**
 * Triggered by the /register flow after Supabase signUp succeeds.
 * Sends a branded welcome email to the new user via our own SMTP/Resend
 * (more reliable than Supabase's default email) and a notification to the
 * admin inbox.
 */
export async function POST(request: Request) {
  let body: { email?: string; full_name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const email = (body.email || "").trim()
  const fullName = (body.full_name || "").trim() || "there"

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  const settings = await getSiteSettings()
  const siteName = settings.site_name || "Kennedy Austin Foundation"
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""

  // Welcome email to the new user
  await sendTransactionalEmail({
    to: email,
    subject: `Welcome to ${siteName}`,
    text:
      `Hi ${fullName},\n\n` +
      `Thanks for creating an account at ${siteName}. You can now access classes, ` +
      `your journal, the community space, and your message thread with our team.\n\n` +
      (appUrl ? `Sign in: ${appUrl}/login\n\n` : "") +
      `If you didn't create this account, just ignore this email.\n\n` +
      `— ${siteName}\n` +
      (settings.primary_phone ? `Crisis line: ${settings.primary_phone}\n` : ""),
  })

  // Admin notification
  const adminTo =
    process.env.EMAIL_NOTIFICATIONS_TO || settings.primary_email
  if (adminTo) {
    await sendTransactionalEmail({
      to: adminTo,
      subject: `[${siteName}] New account: ${email}`,
      text:
        `${fullName} just registered an account.\n\n` +
        `Email: ${email}\n` +
        (appUrl ? `\nManage users: ${appUrl}/admin/users\n` : ""),
    })
  }

  return NextResponse.json({ ok: true })
}
