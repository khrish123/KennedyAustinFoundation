"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { replyAction } from "./actions"

interface ReplyFormProps {
  requestId: string
  recipientEmail: string
  recipientName: string
}

export function ReplyForm({
  requestId,
  recipientEmail,
  recipientName,
}: ReplyFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [body, setBody] = useState("")

  const handleSubmit = (formData: FormData) => {
    setError(null)
    setWarning(null)
    setSuccess(false)
    if (!body.trim()) {
      setError("Reply cannot be empty")
      return
    }
    formData.set("body", body)

    startTransition(async () => {
      const result = await replyAction(requestId, formData)
      if (result?.error) {
        setError(result.error)
        return
      }
      if (result?.emailStatus === "skipped") {
        setWarning(
          "Reply saved, but no email was sent — RESEND_API_KEY isn't set in .env.local. Add the key to enable email delivery."
        )
      } else if (result?.emailStatus === "failed") {
        setWarning(
          `Reply saved, but email delivery failed: ${result.emailError || "unknown error"}.`
        )
      } else {
        setSuccess(true)
      }
      setBody("")
      router.refresh()
      setTimeout(() => setSuccess(false), 4000)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="body">
          Reply to {recipientName} ({recipientEmail})
        </Label>
        <Textarea
          id="body"
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your reply…"
          className="mt-1"
        />
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      {warning && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
          {warning}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
          Reply sent and email delivered.
        </div>
      )}

      <Button type="submit" disabled={pending || !body.trim()}>
        <Send className="mr-2 h-4 w-4" />
        {pending ? "Sending…" : "Send reply"}
      </Button>
    </form>
  )
}
