"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { sendTransactionalEmail } from "@/lib/email"
import { getSiteSettings } from "@/lib/queries/settings"

interface CampaignInput {
  title: string
  subject: string
  body: string
  cta_text: string
  cta_url: string
}

function nullable(v: string) {
  const t = v.trim()
  return t === "" ? null : t
}

function parseFormData(formData: FormData): CampaignInput | { error: string } {
  const title = (formData.get("title") || "").toString().trim()
  if (!title) return { error: "Internal title is required" }

  const subject = (formData.get("subject") || "").toString().trim()
  if (!subject) return { error: "Email subject is required" }

  const body = (formData.get("body") || "").toString().trim()
  if (!body) return { error: "Body is required" }

  return {
    title,
    subject,
    body,
    cta_text: (formData.get("cta_text") || "").toString().trim(),
    cta_url: (formData.get("cta_url") || "").toString().trim(),
  }
}

function buildContent(input: CampaignInput) {
  return {
    subject: input.subject,
    body: input.body,
    cta_text: nullable(input.cta_text) || undefined,
    cta_url: nullable(input.cta_url) || undefined,
  }
}

export async function createCampaignAction(formData: FormData) {
  const parsed = parseFormData(formData)
  if ("error" in parsed) return { error: parsed.error }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      title: parsed.title,
      type: "email",
      status: "draft",
      content: buildContent(parsed),
      target_audience: { all_subscribers: true },
      created_by: user.id,
      stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, unsubscribed: 0 },
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath("/admin/campaigns")
  redirect(`/admin/campaigns/${data.id}/edit`)
}

export async function updateCampaignAction(id: string, formData: FormData) {
  const parsed = parseFormData(formData)
  if ("error" in parsed) return { error: parsed.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from("campaigns")
    .update({
      title: parsed.title,
      content: buildContent(parsed),
    })
    .eq("id", id)
    .eq("status", "draft")

  if (error) return { error: error.message }

  revalidatePath("/admin/campaigns")
  revalidatePath(`/admin/campaigns/${id}/edit`)
  return { ok: true }
}

export async function deleteCampaignAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("campaigns")
    .delete()
    .eq("id", id)
    .eq("status", "draft")
  if (error) return { error: error.message }
  revalidatePath("/admin/campaigns")
  return { ok: true }
}

export interface SendCampaignResult {
  ok?: boolean
  error?: string
  attempted?: number
  sent?: number
  failed?: number
}

export async function sendCampaignAction(id: string): Promise<SendCampaignResult> {
  const supabase = await createClient()

  const { data: campaign, error: fetchErr } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (fetchErr || !campaign) return { error: "Campaign not found" }
  if (campaign.status !== "draft" && campaign.status !== "scheduled") {
    return { error: `Campaign is already ${campaign.status}` }
  }

  const { data: subs, error: subsErr } = await supabase
    .from("subscribers")
    .select("id, email, name")
    .eq("is_active", true)
  if (subsErr) return { error: subsErr.message }
  if (!subs || subs.length === 0) {
    return { error: "No active subscribers to send to" }
  }

  const settings = await getSiteSettings()
  const siteName = settings.site_name || "Kennedy Austin Foundation"
  const content = (campaign.content || {}) as {
    subject?: string
    body?: string
    cta_text?: string
    cta_url?: string
  }

  // Mark as in-flight by setting sent_at provisionally; we'll finalize stats
  // at the end. status moves to "sent" after the loop.
  const startedAt = new Date().toISOString()

  let sent = 0
  let failed = 0

  for (const sub of subs as { id: string; email: string; name: string | null }[]) {
    const greeting = sub.name ? `Hi ${sub.name},` : "Hi,"
    const ctaLine =
      content.cta_text && content.cta_url
        ? `\n\n${content.cta_text}: ${content.cta_url}\n`
        : ""

    const text =
      `${greeting}\n\n` +
      `${content.body || ""}\n` +
      `${ctaLine}` +
      `\n---\n` +
      `${siteName}\n` +
      `To unsubscribe, reply to this email with "unsubscribe".\n`

    const result = await sendTransactionalEmail({
      to: sub.email,
      subject: content.subject || campaign.title,
      text,
    })
    if (result.ok) sent++
    else failed++
  }

  await supabase
    .from("campaigns")
    .update({
      status: "sent",
      sent_at: startedAt,
      stats: {
        sent,
        delivered: sent,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        failed,
        attempted: subs.length,
      },
    })
    .eq("id", id)

  revalidatePath("/admin/campaigns")
  revalidatePath(`/admin/campaigns/${id}/edit`)
  return { ok: true, attempted: subs.length, sent, failed }
}
