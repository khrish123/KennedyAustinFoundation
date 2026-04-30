"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { postFollowUpAction } from "./actions"

interface FollowUpFormProps {
  requestId: string
}

export function FollowUpForm({ requestId }: FollowUpFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [body, setBody] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (formData: FormData) => {
    setError(null)
    if (!body.trim()) return
    formData.set("body", body)

    startTransition(async () => {
      const result = await postFollowUpAction(requestId, formData)
      if (result?.error) {
        setError(result.error)
        return
      }
      setBody("")
      router.refresh()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <Label htmlFor="body">Reply</Label>
      <Textarea
        id="body"
        rows={5}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a follow-up to the foundation…"
      />
      <p className="text-xs text-muted-foreground">
        Please don&apos;t share medical, insurance, or other sensitive health
        information here. For emergencies, call 988 or 911.
      </p>
      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      <Button type="submit" disabled={pending || !body.trim()}>
        <Send className="mr-2 h-4 w-4" />
        {pending ? "Sending…" : "Send"}
      </Button>
    </form>
  )
}
