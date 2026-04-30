"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Resource } from "@/types/resource"
import { createResourceAction, updateResourceAction } from "./actions"

interface ResourceFormProps {
  resource?: Resource
  onDone?: () => void
}

const TYPES = [
  { value: "article", label: "Article" },
  { value: "video", label: "Video" },
  { value: "pdf", label: "PDF / Download" },
  { value: "link", label: "External Link" },
]

const CATEGORIES = [
  { value: "crisis", label: "Crisis (hotline)" },
  { value: "grief", label: "Grief & Loss" },
  { value: "dv", label: "Domestic Violence" },
  { value: "wellness", label: "Mental Wellness" },
  { value: "youth", label: "Youth" },
  { value: "self_help", label: "Self-Help" },
  { value: "therapy", label: "Therapy" },
]

export function ResourceForm({ resource, onDone }: ResourceFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState<string>(resource?.type || "article")
  const [category, setCategory] = useState<string>(resource?.category || "wellness")
  const [isCrisis, setIsCrisis] = useState(resource?.is_crisis_resource ?? false)
  const [published, setPublished] = useState(resource?.is_published ?? true)

  const handleSubmit = (formData: FormData) => {
    setError(null)
    formData.set("type", type)
    formData.set("category", category)
    formData.set("is_crisis_resource", isCrisis ? "true" : "false")
    formData.set("is_published", published ? "true" : "false")

    startTransition(async () => {
      const result = resource
        ? await updateResourceAction(resource.id, formData)
        : await createResourceAction(formData)

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
          defaultValue={resource?.title || ""}
          placeholder="Understanding the Grief Process"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={resource?.description || ""}
          placeholder="Short summary shown on the card."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>
            Category <span className="text-rose-600">*</span>
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Pick a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-muted-foreground">
            For crisis hotlines, also turn on the &quot;Crisis hotline&quot; switch
            below.
          </p>
        </div>
        <div>
          <Label>
            Type <span className="text-rose-600">*</span>
          </Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            name="url"
            type="url"
            defaultValue={resource?.url || ""}
            placeholder="https://..."
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone (for hotlines)</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={resource?.phone || ""}
            placeholder="909-808-6866"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 pt-1">
        <div className="flex items-center gap-3">
          <Switch checked={isCrisis} onCheckedChange={setIsCrisis} />
          <div>
            <p className="text-sm font-medium">Crisis hotline</p>
            <p className="text-xs text-muted-foreground">
              Shown in the top &quot;Crisis Hotlines&quot; section.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={published} onCheckedChange={setPublished} />
          <div>
            <p className="text-sm font-medium">Published</p>
            <p className="text-xs text-muted-foreground">
              {published ? "Visible on /resources" : "Hidden — admins only"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="order_index">Display order</Label>
        <Input
          id="order_index"
          name="order_index"
          type="number"
          min={0}
          defaultValue={resource?.order_index ?? 0}
        />
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : resource ? "Save changes" : "Add resource"}
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
