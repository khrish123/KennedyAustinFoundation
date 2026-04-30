"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { sendTransactionalEmail } from "@/lib/resend"
import { getSiteSettings } from "@/lib/queries/settings"

const STATUSES = ["new", "in_progress", "resolved"]

export async function replyAction(
  requestId: string,
  formData: FormData
): Promise<{ ok?: boolean; error?: string; emailStatus?: string; emailError?: string }> {
  const body = (formData.get("body") || "").toString().trim()
  if (!body) return { error: "Reply cannot be empty" }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Look up the request to get the recipient + subject
  const { data: request, error: reqErr } = await supabase
    .from("support_requests")
    .select("id, name, email, subject, message, status")
    .eq("id", requestId)
    .maybeSingle()

  if (reqErr || !request) return { error: reqErr?.message || "Request not found" }

  // Send the email via Resend
  const settings = await getSiteSettings()
  const siteName = settings.site_name || "Kennedy Austin Foundation"
  const subject = request.subject
    ? `Re: ${request.subject}`
    : `${siteName} — reply to your message`
  const userMessageUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/messages/${request.id}`
    : `/messages/${request.id}`

  const emailResult = await sendTransactionalEmail({
    to: request.email,
    subject,
    text:
      `Hi ${request.name},\n\n` +
      `${body}\n\n` +
      `---\n` +
      `View this conversation in your account: ${userMessageUrl}\n` +
      `${siteName}\n` +
      (settings.primary_phone ? `${settings.primary_phone}\n` : ""),
  })

  // Log the message regardless of email status (so admin sees it in the thread)
  const { error: msgErr } = await supabase.from("support_messages").insert({
    support_request_id: requestId,
    direction: "outbound",
    body,
    sent_by_admin_id: user.id,
    email_provider_id: emailResult.id ?? null,
    email_status: emailResult.status === "skipped" ? null : emailResult.status,
    email_error: emailResult.error ?? null,
    email_sent_at: emailResult.ok ? new Date().toISOString() : null,
  })

  if (msgErr) return { error: msgErr.message }

  // Move status from "new" to "in_progress" on first reply
  if (request.status === "new") {
    await supabase
      .from("support_requests")
      .update({ status: "in_progress" })
      .eq("id", requestId)
  }

  revalidatePath("/admin/support")
  revalidatePath(`/admin/support/${requestId}`)
  revalidatePath("/messages")
  revalidatePath(`/messages/${requestId}`)

  return {
    ok: true,
    emailStatus: emailResult.status,
    emailError: emailResult.error,
  }
}

export async function setStatusAction(requestId: string, status: string) {
  if (!STATUSES.includes(status)) return { error: "Invalid status" }
  const supabase = await createClient()
  const { error } = await supabase
    .from("support_requests")
    .update({ status })
    .eq("id", requestId)
  if (error) return { error: error.message }
  revalidatePath("/admin/support")
  revalidatePath(`/admin/support/${requestId}`)
  return { ok: true }
}
