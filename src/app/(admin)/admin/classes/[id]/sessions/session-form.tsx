"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ClassSession } from "@/types/attendance"
import { createSessionAction, updateSessionAction } from "./actions"

function toLocalInputValue(iso: string | null | undefined) {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface SessionFormProps {
  classId: string
  session?: ClassSession
  onDone?: () => void
}

export function SessionForm({ classId, session, onDone }: SessionFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!session

  const handleSubmit = (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = isEdit
        ? await updateSessionAction(classId, session!.id, formData)
        : await createSessionAction(classId, formData)
      if (result?.error) {
        setError(result.error)
        return
      }
      onDone?.()
      router.refresh()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="session_date">
          Session date &amp; time <span className="text-rose-600">*</span>
        </Label>
        <Input
          id="session_date"
          name="session_date"
          type="datetime-local"
          required
          defaultValue={toLocalInputValue(session?.session_date)}
        />
      </div>

      <div>
        <Label htmlFor="title">Session title (optional)</Label>
        <Input
          id="title"
          name="title"
          defaultValue={session?.title || ""}
          placeholder="Week 3 — Working through anger"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Leave blank to just use the date.
        </p>
      </div>

      <div>
        <Label htmlFor="location_override">Location override (optional)</Label>
        <Input
          id="location_override"
          name="location_override"
          defaultValue={session?.location_override || ""}
          placeholder="Override the class default for this one session"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional, internal)</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={session?.notes || ""}
          placeholder="Anything to remember about this specific session."
        />
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create session"}
        </Button>
        {onDone && (
          <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
