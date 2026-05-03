"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { IconPicker } from "@/components/admin/icon-picker"
import { FileUpload } from "@/components/admin/file-upload"
import type { ServiceItem } from "@/types/cms"
import { createServiceAction, updateServiceAction } from "./actions"

interface ServiceFormProps {
  service?: ServiceItem
}

const COLOR_PRESETS = [
  { label: "Teal", color: "text-teal-700", bg: "bg-teal-50" },
  { label: "Rose", color: "text-rose-500", bg: "bg-rose-50" },
  { label: "Purple", color: "text-purple-500", bg: "bg-purple-50" },
  { label: "Blue", color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Amber", color: "text-amber-500", bg: "bg-amber-50" },
  { label: "Emerald", color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "Cyan", color: "text-cyan-500", bg: "bg-cyan-50" },
]

export function ServiceForm({ service }: ServiceFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [icon, setIcon] = useState(service?.icon_name || "")
  const [colorClass, setColorClass] = useState(service?.color_class || "text-teal-700")
  const [bgClass, setBgClass] = useState(service?.bg_color_class || "bg-teal-50")
  const [imageUrl, setImageUrl] = useState(service?.image_url || "")
  const [published, setPublished] = useState(service?.is_published ?? true)

  const isEdit = !!service

  const applyPreset = (label: string) => {
    const preset = COLOR_PRESETS.find((p) => p.label === label)
    if (!preset) return
    setColorClass(preset.color)
    setBgClass(preset.bg)
  }

  const handleSubmit = (formData: FormData) => {
    setError(null)
    setSuccess(false)
    formData.set("icon_name", icon)
    formData.set("color_class", colorClass)
    formData.set("bg_color_class", bgClass)
    formData.set("image_url", imageUrl)
    formData.set("is_published", published ? "true" : "false")

    startTransition(async () => {
      const result = isEdit
        ? await updateServiceAction(service!.id, formData)
        : await createServiceAction(formData)
      if (result?.error) {
        setError(result.error)
        return
      }
      if (isEdit) {
        setSuccess(true)
        router.refresh()
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div>
        <Link
          href="/admin/content/services"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          All services
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEdit ? "Edit service" : "New service"}
        </h1>
        <p className="text-muted-foreground">
          Services appear on the homepage and the /services page.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">
              Title <span className="text-rose-600">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={service?.title || ""}
              placeholder="Crisis Intervention"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={service?.slug || ""}
                placeholder="auto-generated"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Used as the anchor on /services (e.g. /services#crisis).
              </p>
            </div>
            <div>
              <Label htmlFor="href_anchor">Anchor override</Label>
              <Input
                id="href_anchor"
                name="href_anchor"
                defaultValue={service?.href_anchor || ""}
                placeholder="defaults to slug"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="short_description">Short description</Label>
            <Textarea
              id="short_description"
              name="short_description"
              rows={2}
              defaultValue={service?.short_description || ""}
              placeholder="One- or two-sentence summary shown on cards."
            />
          </div>
          <div>
            <Label htmlFor="long_description">Long description</Label>
            <Textarea
              id="long_description"
              name="long_description"
              rows={4}
              defaultValue={service?.long_description || ""}
              placeholder="Longer paragraph shown on the /services detail block."
            />
          </div>
          <div>
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea
              id="features"
              name="features"
              rows={5}
              defaultValue={service?.features?.join("\n") || ""}
              placeholder={`24/7 crisis hotline\nSafety planning\nFollow-up care`}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visual</CardTitle>
          <CardDescription>
            Optional photo, plus an icon + color preset used as a fallback and
            on the small homepage cards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Photo (optional)</Label>
            <FileUpload
              value={imageUrl}
              onChange={setImageUrl}
              folder="services"
              accept="image"
              previewClassName="h-40"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Shown on the /services detail block. If omitted, the icon below is
              used instead.
            </p>
          </div>

          <div>
            <Label>Icon</Label>
            <IconPicker value={icon} onChange={setIcon} />
          </div>

          <div>
            <Label>Color preset</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {COLOR_PRESETS.map((p) => (
                <Button
                  key={p.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(p.label)}
                  className={
                    colorClass === p.color && bgClass === p.bg
                      ? "ring-2 ring-teal-500"
                      : ""
                  }
                >
                  <span className={`mr-2 inline-block h-3 w-3 rounded-full ${p.bg}`} />
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="color_class">Icon color (Tailwind class)</Label>
              <Input
                id="color_class"
                value={colorClass}
                onChange={(e) => setColorClass(e.target.value)}
                placeholder="text-teal-700"
              />
            </div>
            <div>
              <Label htmlFor="bg_color_class">Icon background (Tailwind class)</Label>
              <Input
                id="bg_color_class"
                value={bgClass}
                onChange={(e) => setBgClass(e.target.value)}
                placeholder="bg-teal-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={published} onCheckedChange={setPublished} />
            <span className="text-sm text-muted-foreground">
              {published ? "Visible on the public site" : "Hidden — admins only"}
            </span>
          </div>
          <div>
            <Label htmlFor="order_index">Display order</Label>
            <Input
              id="order_index"
              name="order_index"
              type="number"
              min={0}
              defaultValue={service?.order_index ?? 0}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
          Service saved.
        </div>
      )}

      <div className="sticky bottom-4 flex gap-2 justify-end">
        <Button asChild type="button" variant="outline">
          <Link href="/admin/content/services">Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending} size="lg">
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create service"}
        </Button>
      </div>
    </form>
  )
}
