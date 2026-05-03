import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendTransactionalEmail } from "@/lib/email"
import { getSiteSettings } from "@/lib/queries/settings"
import type { ChildEntry } from "@/types/events"

interface RegisterBody {
  full_name?: string
  email?: string
  phone?: string
  address?: string
  guests_count?: number
  children?: ChildEntry[]
  notes?: string
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params

  let body: RegisterBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: event, error: eventErr } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle()
  if (eventErr || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }
  if (!event.is_published) {
    return NextResponse.json({ error: "Event is not open for signup" }, { status: 400 })
  }
  if (event.registration_type === "none") {
    return NextResponse.json(
      { error: "This event does not accept online registration" },
      { status: 400 }
    )
  }
  if (event.registration_deadline) {
    if (new Date(event.registration_deadline).getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Registration deadline has passed" },
        { status: 400 }
      )
    }
  }

  const fullName = (body.full_name || "").trim()
  const email = (body.email || "").trim().toLowerCase()
  const phone = (body.phone || "").trim() || null
  const address = (body.address || "").trim() || null
  const notes = (body.notes || "").trim() || null
  const guestsCount = Math.max(1, Math.min(20, Number(body.guests_count) || 1))

  if (!fullName) return NextResponse.json({ error: "Name is required" }, { status: 400 })
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 })
  }

  // Children validation for toy_request
  let children: ChildEntry[] = []
  if (event.registration_type === "toy_request") {
    const incoming = Array.isArray(body.children) ? body.children : []
    children = incoming
      .map((c) => ({
        name: (c?.name || "").toString().trim(),
        age: Number(c?.age),
        gender: (c?.gender || "").toString().trim() || undefined,
        gift_idea: (c?.gift_idea || "").toString().trim() || undefined,
      }))
      .filter((c) => c.name && Number.isFinite(c.age))

    if (children.length === 0) {
      return NextResponse.json(
        { error: "At least one child (with name and age) is required for toy requests" },
        { status: 400 }
      )
    }
    for (const c of children) {
      if (c.age < 0 || c.age > 17) {
        return NextResponse.json(
          { error: `Child age must be between 0 and 17 (got ${c.age} for ${c.name})` },
          { status: 400 }
        )
      }
    }
  }

  // Capacity check: at-cap signups go to waitlist
  let status: "pending" | "waitlist" = "pending"
  if (event.max_attendees) {
    const { count } = await supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .neq("status", "canceled")
    if ((count || 0) >= event.max_attendees) status = "waitlist"
  }

  const { data: authUser } = await supabase.auth.getUser()
  const userId = authUser.user?.id ?? null

  const { data: created, error: insertErr } = await supabase
    .from("event_registrations")
    .insert({
      event_id: eventId,
      user_id: userId,
      registration_type: event.registration_type,
      full_name: fullName,
      email,
      phone,
      address,
      guests_count: guestsCount,
      children,
      notes,
      status,
    })
    .select("id, status")
    .single()

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  // Best-effort confirmation + admin notification
  const settings = await getSiteSettings()
  const siteName = settings.site_name || "Kennedy Austin Foundation"
  const eventTitle = event.title || "the event"

  const childSummary =
    children.length > 0
      ? `\n\nChildren registered:\n` +
        children
          .map(
            (c) =>
              `- ${c.name}, age ${c.age}${c.gender ? ` (${c.gender})` : ""}` +
              (c.gift_idea ? ` — gift idea: ${c.gift_idea}` : "")
          )
          .join("\n")
      : ""

  void sendTransactionalEmail({
    to: email,
    subject: `[${siteName}] We received your signup for ${eventTitle}`,
    text:
      `Hi ${fullName},\n\n` +
      `Thanks for signing up for "${eventTitle}".\n\n` +
      (status === "waitlist"
        ? `The event has reached capacity, so you're on the waitlist. We'll reach out if a spot opens up.\n`
        : `Your signup is logged. We'll be in touch with details soon.\n`) +
      childSummary +
      `\n---\nIf you need to make changes, just reply to this email.\n`,
  })

  const adminTo = process.env.EMAIL_NOTIFICATIONS_TO || settings.primary_email
  if (adminTo) {
    void sendTransactionalEmail({
      to: adminTo,
      replyTo: email,
      subject: `[${siteName}] New ${event.registration_type} signup: ${eventTitle}`,
      text:
        `New ${event.registration_type} signup for "${eventTitle}"\n\n` +
        `From: ${fullName} <${email}>${phone ? ` · ${phone}` : ""}\n` +
        (address ? `Address: ${address}\n` : "") +
        (event.registration_type === "rsvp"
          ? `Guests: ${guestsCount}\n`
          : "") +
        childSummary +
        (notes ? `\nNotes: ${notes}\n` : "") +
        `\nStatus: ${status}\n`,
    })
  }

  return NextResponse.json({ ok: true, id: created.id, status: created.status })
}
