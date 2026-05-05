"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Campaign } from "@/types"
import {
  createCampaignAction,
  updateCampaignAction,
  sendCampaignAction,
  deleteCampaignAction,
} from "./actions"

interface CampaignFormProps {
  campaign?: Campaign
  subscriberCount: number
  emailReady: boolean
}

export function CampaignForm({
  campaign,
  subscriberCount,
  emailReady,
}: CampaignFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [sending, startSendTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [sendResult, setSendResult] = useState<
    | { kind: "ok"; attempted: number; sent: number; failed: number }
    | null
  >(null)

  const isEdit = !!campaign
  const isDraft = !campaign || campaign.status === "draft"

  const initialContent = (campaign?.content || {}) as {
    subject?: string
    body?: string
    cta_text?: string
    cta_url?: string
  }

  const handleSubmit = (formData: FormData) => {
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const result = isEdit
        ? await updateCampaignAction(campaign!.id, formData)
        : await createCampaignAction(formData)
      if (result?.error) {
        setError(result.error)
        return
      }
      if (isEdit) {
        setSuccess("Saved.")
        router.refresh()
        setTimeout(() => setSuccess(null), 3000)
      }
    })
  }

  const handleSend = () => {
    if (!campaign) return
    const subjectPreview = initialContent.subject || campaign.title
    if (
      !confirm(
        `Send "${subjectPreview}" to all ${subscriberCount} active subscribers? This cannot be undone.`
      )
    )
      return
    setError(null)
    setSendResult(null)
    startSendTransition(async () => {
      const result = await sendCampaignAction(campaign.id)
      if (result.error) {
        setError(result.error)
        return
      }
      setSendResult({
        kind: "ok",
        attempted: result.attempted ?? 0,
        sent: result.sent ?? 0,
        failed: result.failed ?? 0,
      })
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (!campaign) return
    if (!confirm("Delete this draft? This cannot be undone.")) return
    startTransition(async () => {
      await deleteCampaignAction(campaign.id)
      router.push("/admin/campaigns")
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div>
        <Link
          href="/admin/campaigns"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          All campaigns
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEdit ? "Edit campaign" : "New campaign"}
            </h1>
            <p className="text-muted-foreground">
              Send a one-off email to all active newsletter subscribers.
            </p>
          </div>
          {campaign && (
            <Badge
              className={
                campaign.status === "sent"
                  ? "bg-emerald-500"
                  : campaign.status === "scheduled"
                    ? "bg-blue-500"
                    : "bg-slate-300 text-slate-800"
              }
            >
              {campaign.status}
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Campaign details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">
              Internal title <span className="text-rose-600">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={campaign?.title || ""}
              placeholder="May newsletter — grief group launch"
              disabled={!isDraft}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Just for your reference — not shown to recipients.
            </p>
          </div>

          <div>
            <Label htmlFor="subject">
              Email subject <span className="text-rose-600">*</span>
            </Label>
            <Input
              id="subject"
              name="subject"
              required
              defaultValue={initialContent.subject || ""}
              placeholder="A new grief group starts next week"
              disabled={!isDraft}
            />
          </div>

          <div>
            <Label htmlFor="body">
              Body <span className="text-rose-600">*</span>
            </Label>
            <Textarea
              id="body"
              name="body"
              required
              rows={12}
              defaultValue={initialContent.body || ""}
              placeholder={
                "Write the body of the email here.\n\n" +
                "Blank lines start new paragraphs.\n\n" +
                "Each subscriber's email is greeted with their name automatically."
              }
              disabled={!isDraft}
              className="font-mono text-sm"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Plain text. Each subscriber sees a personalized greeting + an
              unsubscribe note appended automatically.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cta_text">Call-to-action text (optional)</Label>
              <Input
                id="cta_text"
                name="cta_text"
                defaultValue={initialContent.cta_text || ""}
                placeholder="Register now"
                disabled={!isDraft}
              />
            </div>
            <div>
              <Label htmlFor="cta_url">Call-to-action URL (optional)</Label>
              <Input
                id="cta_url"
                name="cta_url"
                type="url"
                defaultValue={initialContent.cta_url || ""}
                placeholder="https://kennedyaustinfoundation.com/classes"
                disabled={!isDraft}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recipients</CardTitle>
          <CardDescription>
            All active subscribers from your newsletter list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Active subscribers
            </span>
            <Badge variant="outline" className="text-base">
              {subscriberCount.toLocaleString()}
            </Badge>
          </div>
          {!emailReady && (
            <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              Email is not configured yet — set up SMTP at{" "}
              <Link
                href="/admin/settings/email"
                className="underline font-medium"
              >
                /admin/settings/email
              </Link>{" "}
              before sending. Saving as draft still works.
            </p>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
          {success}
        </div>
      )}
      {sendResult && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
          Sent to {sendResult.sent} of {sendResult.attempted} subscribers.
          {sendResult.failed > 0 && (
            <> {sendResult.failed} failed — check Email Settings.</>
          )}
        </div>
      )}

      <div className="sticky bottom-4 flex gap-2 justify-end flex-wrap">
        {isDraft && (
          <>
            <Button asChild type="button" variant="outline">
              <Link href="/admin/campaigns">Cancel</Link>
            </Button>
            <Button type="submit" disabled={pending} variant="outline">
              {pending ? "Saving…" : isEdit ? "Save draft" : "Save draft"}
            </Button>
            {isEdit && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                disabled={pending}
                className="text-rose-700 hover:text-rose-800 hover:bg-rose-50"
              >
                Delete draft
              </Button>
            )}
            {isEdit && (
              <Button
                type="button"
                onClick={handleSend}
                disabled={sending || subscriberCount === 0 || !emailReady}
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? "Sending…" : `Send to ${subscriberCount}`}
              </Button>
            )}
          </>
        )}
      </div>
    </form>
  )
}
