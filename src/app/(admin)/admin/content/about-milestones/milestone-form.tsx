"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import type { AboutMilestone } from "@/types/cms"
import { createMilestoneAction, updateMilestoneAction } from "./actions"

interface MilestoneFormProps {
  milestone?: AboutMilestone
  onDone?: () => void
}

export function MilestoneForm({ milestone, onDone }: MilestoneFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [published, setPublished] = useState(milestone?.is_published ?? true)

  const handleSubmit = (formData: FormData) => {
    setError(null)
    formData.set("is_published", published ? "true" : "false")

    startTransition(async () => {
      const result = milestone
        ? await updateMilestoneAction(milestone.id, formData)
        : await createMilestoneAction(formData)
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
      <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
        <div>
          <Label htmlFor="year">
            Year <span className="text-rose-600">*</span>
          </Label>
          <Input
            id="year"
            name="year"
            required
            defaultValue={milestone?.year || ""}
            placeholder="1993"
          />
        </div>
        <div>
          <Label htmlFor="title">
            Title <span className="text-rose-600">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={milestone?.title || ""}
            placeholder="Foundation Established"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={milestone?.description || ""}
          placeholder="Ms. Ethel Gardner founded the Kennedy Austin Foundation…"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="order_index">Display order</Label>
          <Input
            id="order_index"
            name="order_index"
            type="number"
            min={0}
            defaultValue={milestone?.order_index ?? 0}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Lower numbers appear first on the timeline.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch checked={published} onCheckedChange={setPublished} />
          <span className="text-sm text-muted-foreground">
            {published ? "Visible on /about" : "Hidden"}
          </span>
        </div>
      </div>
      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : milestone ? "Save changes" : "Add milestone"}
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
