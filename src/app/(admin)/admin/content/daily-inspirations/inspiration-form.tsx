"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import type { DailyInspiration } from "@/types"
import {
  createInspirationAction,
  updateInspirationAction,
} from "./actions"

interface InspirationFormProps {
  inspiration?: DailyInspiration
  onDone?: () => void
}

export function InspirationForm({ inspiration, onDone }: InspirationFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [active, setActive] = useState(inspiration?.is_active ?? true)

  const handleSubmit = (formData: FormData) => {
    setError(null)
    formData.set("is_active", active ? "true" : "false")

    startTransition(async () => {
      const result = inspiration
        ? await updateInspirationAction(inspiration.id, formData)
        : await createInspirationAction(formData)

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
        <Label htmlFor="content">
          Quote / message <span className="text-rose-600">*</span>
        </Label>
        <Textarea
          id="content"
          name="content"
          required
          rows={4}
          defaultValue={inspiration?.content || ""}
          placeholder="Every sunrise brings new hope. Every step forward is a victory."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            defaultValue={inspiration?.category || ""}
            placeholder="Hope, Healing, Strength…"
          />
        </div>
        <div>
          <Label htmlFor="language">Language</Label>
          <Input
            id="language"
            name="language"
            defaultValue={inspiration?.language || "en"}
            placeholder="en"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            ISO code, e.g. <code>en</code>, <code>es</code>.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={active} onCheckedChange={setActive} />
        <span className="text-sm text-muted-foreground">
          {active ? "In rotation" : "Inactive"}
        </span>
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : inspiration ? "Save changes" : "Add inspiration"}
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
