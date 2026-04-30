import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendTransactionalEmail } from "@/lib/resend"
import { getSiteSettings } from "@/lib/queries/settings"

const REQUEST_TYPES = ["general", "crisis", "class_inquiry", "donation"] as const
type RequestType = (typeof REQUEST_TYPES)[number]

interface SubmitBody {
  name?: string
  email?: string
  phone?: string
  type?: string
  subject?: string
  message?: string
}

export async function POST(request: Request) {
  let body: SubmitBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const name = (body.name || "").trim()
  const email = (body.email || "").trim()
  const phone = (body.phone || "").trim() || null
  const subject = (body.subject || "").trim() || null
  const message = (body.message || "").trim()
  const typeRaw = (body.type || "general").trim()
  const type: RequestType = (REQUEST_TYPES as readonly string[]).includes(typeRaw)
    ? (typeRaw as RequestType)
    : "general"

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 })
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 })
  }
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 })
  }

  // Use service role to bypass RLS for guest writes (no user_id)
  const supabase = await createClient()
  const { data: authUser } = await supabase.auth.getUser()
  const userId = authUser.user?.id ?? null

  // Insert the request
  const { data: req, error: reqErr } = await supabase
    .from("support_requests")
    .insert({
      user_id: userId,
      name,
      email,
      phone,
      type,
      subject,
      message,
      status: "new",
    })
    .select("id")
    .single()

  if (reqErr || !req) {
    return NextResponse.json(
      { error: reqErr?.message || "Could not create request" },
      { status: 500 }
    )
  }

  // Insert the first inbound message (mirrors the request body for thread display)
  const { error: msgErr } = await supabase.from("support_messages").insert({
    support_request_id: req.id,
    direction: "inbound",
    body: message,
    from_name: name,
    from_email: email,
  })

  if (msgErr) {
    // Non-fatal — the request still exists
    console.error("Failed to insert first message:", msgErr.message)
  }

  // Confirmation email to the submitter (best-effort)
  const settings = await getSiteSettings()
  const siteName = settings.site_name || "Kennedy Austin Foundation"
  const subjectLine = subject || "Your message has been received"
  await sendTransactionalEmail({
    to: email,
    subject: `[${siteName}] We received your message`,
    text: `Hi ${name},\n\nThanks for reaching out to ${siteName}. We've received your message and a member of our team will be in touch soon.\n\nA copy of what you sent:\n\n${subjectLine}\n\n${message}\n\n---\nIf this is an emergency, please call 988 (US Suicide & Crisis Lifeline) or 911.`,
  })

  return NextResponse.json({ ok: true, id: req.id }, { status: 201 })
}
