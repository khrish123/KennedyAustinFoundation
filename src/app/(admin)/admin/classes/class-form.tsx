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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Class } from "@/types"
import { createClassAction, updateClassAction } from "./actions"

interface InstructorOption {
  id: string
  full_name: string | null
  role: string
}

interface ClassFormProps {
  classData?: Class
  instructors: InstructorOption[]
}

const CATEGORIES = [
  { value: "grief", label: "Grief & Loss" },
  { value: "dv", label: "Domestic Violence" },
  { value: "self_help", label: "Self-Help" },
  { value: "therapy", label: "Therapy" },
  { value: "wellness", label: "Wellness" },
]

const TYPES = [
  { value: "live", label: "Live (online via Zoom)" },
  { value: "recorded", label: "Recorded (on-demand video)" },
  { value: "in_person", label: "In-Person" },
]

export function ClassForm({ classData, instructors }: ClassFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [type, setType] = useState<string>(classData?.type || "recorded")
  const [category, setCategory] = useState<string>(classData?.category || "wellness")
  const [instructorId, setInstructorId] = useState<string>(
    classData?.instructor_id || ""
  )
  const [published, setPublished] = useState(classData?.is_published ?? false)

  const isEdit = !!classData

  const handleSubmit = (formData: FormData) => {
    setError(null)
    setSuccess(false)

    formData.set("type", type)
    formData.set("category", category)
    formData.set("instructor_id", instructorId)
    formData.set("is_published", published ? "true" : "false")

    startTransition(async () => {
      const result = isEdit
        ? await updateClassAction(classData!.id, formData)
        : await createClassAction(formData)

      if (result?.error) {
        setError(result.error)
        return
      }
      if (isEdit) {
        setSuccess(true)
        router.refresh()
        setTimeout(() => setSuccess(false), 3000)
      }
      // For create, the action redirects to /admin/classes/[id]/edit
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div>
        <Link
          href="/admin/classes"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          All classes
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEdit ? "Edit class" : "Create class"}
        </h1>
        <p className="text-muted-foreground">
          {isEdit
            ? "Update class details. Toggle Published when you're ready to make it public."
            : "Fill in the details. The class is created as a draft — you can publish later."}
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
              defaultValue={classData?.title || ""}
              placeholder="Healing Through Grief"
            />
          </div>

          <div>
            <Label htmlFor="slug">URL slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={classData?.slug || ""}
              placeholder="auto-generated from title"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Public URL: /classes/<em>your-slug</em>. Leave blank to auto-generate.
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={classData?.description || ""}
              placeholder="What members will learn or experience in this class."
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
            </div>
            <div>
              <Label>
                Type <span className="text-rose-600">*</span>
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick a type" />
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

          <div>
            <Label>Instructor</Label>
            <Select
              value={instructorId || "__none__"}
              onValueChange={(v) => setInstructorId(v === "__none__" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="No instructor assigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No instructor assigned</SelectItem>
                {instructors.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.full_name || "Unnamed"} ({i.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">
              Only users with role <code>instructor</code>, <code>admin</code>, or{" "}
              <code>super_admin</code> are listed.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Logistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min={0}
                defaultValue={classData?.price ?? 0}
                placeholder="0 for free"
              />
            </div>
            <div>
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min={0}
                defaultValue={classData?.duration_minutes ?? 60}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="max_participants">Max participants</Label>
            <Input
              id="max_participants"
              name="max_participants"
              type="number"
              min={0}
              defaultValue={classData?.max_participants ?? ""}
              placeholder="Leave blank for unlimited"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Media &amp; Delivery</CardTitle>
          <CardDescription>
            Provide the URL appropriate to the class type.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="thumbnail_url">Thumbnail image URL</Label>
            <Input
              id="thumbnail_url"
              name="thumbnail_url"
              type="url"
              defaultValue={classData?.thumbnail_url || ""}
              placeholder="https://..."
            />
          </div>

          {type === "live" && (
            <div>
              <Label htmlFor="zoom_link">Zoom link</Label>
              <Input
                id="zoom_link"
                name="zoom_link"
                type="url"
                defaultValue={classData?.zoom_link || ""}
                placeholder="https://zoom.us/j/..."
              />
            </div>
          )}

          {type === "recorded" && (
            <div>
              <Label htmlFor="video_url">Video URL (Mux or other)</Label>
              <Input
                id="video_url"
                name="video_url"
                type="url"
                defaultValue={classData?.video_url || ""}
                placeholder="https://stream.mux.com/..."
              />
            </div>
          )}

          {type === "in_person" && (
            <div>
              <Label htmlFor="location">Location / address</Label>
              <Input
                id="location"
                name="location"
                defaultValue={classData?.location || ""}
                placeholder="123 Main St, Pomona, CA"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch checked={published} onCheckedChange={setPublished} />
            <div>
              <p className="font-medium text-sm">
                {published ? "Published" : "Draft"}
              </p>
              <p className="text-xs text-muted-foreground">
                {published
                  ? "This class is visible on the public /classes page."
                  : "Drafts are not visible to the public."}
              </p>
            </div>
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
          Class saved.
        </div>
      )}

      <div className="sticky bottom-4 flex gap-2 justify-end">
        <Button asChild type="button" variant="outline">
          <Link href="/admin/classes">Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending} size="lg">
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create class"}
        </Button>
      </div>
    </form>
  )
}
