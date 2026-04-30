"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { IconPicker } from "@/components/admin/icon-picker"
import type { AboutValue } from "@/types/cms"
import { createValueAction, updateValueAction } from "./actions"

interface ValueFormProps {
  value?: AboutValue
  onDone?: () => void
}

export function ValueForm({ value, onDone }: ValueFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [icon, setIcon] = useState(value?.icon_name || "Heart")
  const [published, setPublished] = useState(value?.is_published ?? true)

  const handleSubmit = (formData: FormData) => {
    setError(null)
    formData.set("icon_name", icon)
    formData.set("is_published", published ? "true" : "false")

    startTransition(async () => {
      const result = value
        ? await updateValueAction(value.id, formData)
        : await createValueAction(formData)
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
        <Label htmlFor="title">
          Title <span className="text-rose-600">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={value?.title || ""}
          placeholder="Compassion"
        />
      </div>
      <div>
        <Label htmlFor="description">
          Description <span className="text-rose-600">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          required
          rows={3}
          defaultValue={value?.description || ""}
          placeholder="We meet everyone with empathy and understanding…"
        />
      </div>
      <div>
        <Label>Icon</Label>
        <IconPicker value={icon} onChange={setIcon} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="order_index">Display order</Label>
          <Input
            id="order_index"
            name="order_index"
            type="number"
            min={0}
            defaultValue={value?.order_index ?? 0}
          />
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
          {pending ? "Saving…" : value ? "Save changes" : "Add value"}
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
