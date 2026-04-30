"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { sendTransactionalEmail } from "@/lib/email"
import { getSiteSettings } from "@/lib/queries/settings"

export async function postFollowUpAction(
  requestId: string,
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  const body = (formData.get("body") || "").toString().trim()
  if (!body) return { error: "Message cannot be empty" }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Confirm user owns this request
  const { data: request } = await supabase
    .from("support_requests")
    .select("id, user_id, name, email, subject, status")
    .eq("id", requestId)
    .maybeSingle()

  if (!request) return { error: "Conversation not found" }
  if (request.user_id !== user.id)
    return { error: "You don't have access to this conversation" }

  const { error: msgErr } = await supabase.from("support_messages").insert({
    support_request_id: requestId,
    direction: "inbound",
    body,
    from_name: request.name,
    from_email: request.email,
  })
  if (msgErr) return { error: msgErr.message }

  // Reopen if previously resolved
  if (request.status === "resolved") {
    await supabase
      .from("support_requests")
      .update({ status: "in_progress" })
      .eq("id", requestId)
  }

  // Best-effort notification to the admin team. Sent to site_settings.primary_email
  // (or EMAIL_NOTIFICATIONS_TO env var). Failures don't block the user's reply.
  void notifyAdminsOfFollowUp({
    requestId,
    requesterName: request.name,
    requesterEmail: request.email,
    subject: request.subject,
    body,
  })

  revalidatePath(`/messages/${requestId}`)
  revalidatePath("/messages")
  revalidatePath("/admin/support")
  revalidatePath(`/admin/support/${requestId}`)

  return { ok: true }
}

async function notifyAdminsOfFollowUp(params: {
  requestId: string
  requesterName: string
  requesterEmail: string
  subject: string | null
  body: string
}) {
  try {
    const settings = await getSiteSettings()
    const recipient =
      process.env.EMAIL_NOTIFICATIONS_TO || settings.primary_email
    if (!recipient) return

    const siteName = settings.site_name || "Kennedy Austin Foundation"
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""
    const link = `${appUrl}/admin/support/${params.requestId}`
    const subjectLine = params.subject
      ? `New reply on "${params.subject}"`
      : "New message from a member"

    await sendTransactionalEmail({
      to: recipient,
      replyTo: params.requesterEmail,
      subject: `[${siteName}] ${subjectLine}`,
      text:
        `${params.requesterName} (${params.requesterEmail}) just replied on ${siteName}.\n\n` +
        `Subject: ${params.subject || "(no subject)"}\n\n` +
        `${params.body}\n\n` +
        `---\n` +
        `Open the conversation: ${link}\n`,
    })
  } catch {
    // Notifications are best-effort; we already saved the message.
  }
}
