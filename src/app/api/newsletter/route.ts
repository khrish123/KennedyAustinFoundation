import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendTransactionalEmail } from "@/lib/email"
import { getSiteSettings } from "@/lib/queries/settings"

export async function POST(request: Request) {
  let body: { email?: string; name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const email = (body.email || "").trim().toLowerCase()
  const name = (body.name || "").trim() || null

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // If a profile with the same email exists, attach it
  const { data: authUser } = await supabase.auth.getUser()
  const userId = authUser.user?.email === email ? authUser.user.id : null

  // Check for an existing subscriber (we want idempotent signup)
  const { data: existing } = await supabase
    .from("subscribers")
    .select("id, is_active")
    .eq("email", email)
    .maybeSingle()

  if (existing) {
    if (!existing.is_active) {
      // Reactivate
      await supabase
        .from("subscribers")
        .update({ is_active: true, unsubscribed_at: null })
        .eq("id", existing.id)
      return NextResponse.json({ ok: true, status: "reactivated" })
    }
    return NextResponse.json({ ok: true, status: "already-subscribed" })
  }

  const { error } = await supabase.from("subscribers").insert({
    email,
    name,
    user_id: userId,
    is_active: true,
    subscribed_categories: [],
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Best-effort welcome + admin notification
  const settings = await getSiteSettings()
  const siteName = settings.site_name || "Kennedy Austin Foundation"

  void sendTransactionalEmail({
    to: email,
    subject: `Welcome to ${siteName}`,
    text:
      `Thanks for subscribing to ${siteName}.\n\n` +
      `You'll receive occasional updates, resources, and inspiration. ` +
      `If you ever want to stop, just reply with "unsubscribe".\n`,
  })

  const adminTo =
    process.env.EMAIL_NOTIFICATIONS_TO || settings.primary_email
  if (adminTo) {
    void sendTransactionalEmail({
      to: adminTo,
      subject: `[${siteName}] New subscriber: ${email}`,
      text: `${name || "(no name)"} <${email}> just subscribed to the newsletter.`,
    })
  }

  return NextResponse.json({ ok: true, status: "subscribed" })
}
