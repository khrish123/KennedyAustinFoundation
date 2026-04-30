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
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Event } from "@/types"
import { createEventAction, updateEventAction } from "./actions"

interface EventFormProps {
  eventData?: Event
}

function toLocalInputValue(iso: string) {
  // datetime-local needs `YYYY-MM-DDTHH:MM`
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function EventForm({ eventData }: EventFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [registrationRequired, setRegistrationRequired] = useState(
    eventData?.registration_required ?? false
  )

  const isEdit = !!eventData

  const handleSubmit = (formData: FormData) => {
    setError(null)
    setSuccess(false)
    formData.set("registration_required", registrationRequired ? "true" : "false")

    startTransition(async () => {
      const result = isEdit
        ? await updateEventAction(eventData!.id, formData)
        : await createEventAction(formData)

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
          href="/admin/events"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          All events
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEdit ? "Edit event" : "Create event"}
        </h1>
        <p className="text-muted-foreground">
          Events appear on the public /events page and the homepage Upcoming Events
          strip (next 3 by date).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
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
              defaultValue={eventData?.title || ""}
              placeholder="Annual Wellness Workshop"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={eventData?.description || ""}
              placeholder="What attendees will experience."
            />
          </div>

          <div>
            <Label htmlFor="date">
              Date &amp; time <span className="text-rose-600">*</span>
            </Label>
            <Input
              id="date"
              name="date"
              type="datetime-local"
              required
              defaultValue={
                eventData?.date ? toLocalInputValue(eventData.date) : ""
              }
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Times use your local timezone.
            </p>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue={eventData?.location || ""}
              placeholder="Foundation Center, Pomona"
            />
          </div>

          <div>
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              name="image_url"
              type="url"
              defaultValue={eventData?.image_url || ""}
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={registrationRequired}
              onCheckedChange={setRegistrationRequired}
            />
            <div>
              <p className="font-medium text-sm">
                Registration required
              </p>
              <p className="text-xs text-muted-foreground">
                {registrationRequired
                  ? "Public CTA reads 'Register'."
                  : "Public CTA reads 'Learn More'."}
              </p>
            </div>
          </div>
          <div>
            <Label htmlFor="max_attendees">Max attendees</Label>
            <Input
              id="max_attendees"
              name="max_attendees"
              type="number"
              min={0}
              defaultValue={eventData?.max_attendees ?? ""}
              placeholder="Leave blank for unlimited"
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
          Event saved.
        </div>
      )}

      <div className="sticky bottom-4 flex gap-2 justify-end">
        <Button asChild type="button" variant="outline">
          <Link href="/admin/events">Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending} size="lg">
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create event"}
        </Button>
      </div>
    </form>
  )
}
