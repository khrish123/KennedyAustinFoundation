"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ListChecks } from "lucide-react"
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
import { FileUpload } from "@/components/admin/file-upload"
import type { Event } from "@/types"
import {
  EVENT_TYPE_LABELS,
  REGISTRATION_TYPE_LABELS,
  type RegistrationType,
} from "@/types/events"
import { createEventAction, updateEventAction } from "./actions"

interface EventFormProps {
  eventData?: Event & {
    event_type?: string
    registration_type?: RegistrationType
    registration_deadline?: string | null
    is_published?: boolean
    featured_on_home?: boolean
    allow_flyer_download?: boolean
  }
}

function toLocalInputValue(iso: string | null | undefined) {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const REGISTRATION_TYPE_OPTIONS = Object.entries(REGISTRATION_TYPE_LABELS).map(
  ([value, label]) => ({ value: value as RegistrationType, label })
)

export function EventForm({ eventData }: EventFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [eventType, setEventType] = useState<string>(
    eventData?.event_type || "general"
  )
  const [registrationType, setRegistrationType] = useState<RegistrationType>(
    eventData?.registration_type || "none"
  )
  const [imageUrl, setImageUrl] = useState(eventData?.image_url || "")
  const [published, setPublished] = useState(eventData?.is_published ?? true)
  const [featuredOnHome, setFeaturedOnHome] = useState(
    eventData?.featured_on_home ?? false
  )
  const [allowFlyerDownload, setAllowFlyerDownload] = useState(
    eventData?.allow_flyer_download ?? true
  )
  const [registrationRequired, setRegistrationRequired] = useState(
    eventData?.registration_required ?? false
  )

  const isEdit = !!eventData

  const handleSubmit = (formData: FormData) => {
    setError(null)
    setSuccess(false)
    formData.set("event_type", eventType)
    formData.set("registration_type", registrationType)
    formData.set("image_url", imageUrl)
    formData.set("is_published", published ? "true" : "false")
    formData.set(
      "featured_on_home",
      published && featuredOnHome ? "true" : "false"
    )
    formData.set("allow_flyer_download", allowFlyerDownload ? "true" : "false")
    formData.set(
      "registration_required",
      registrationType !== "none" || registrationRequired ? "true" : "false"
    )

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
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEdit ? "Edit event" : "Create event"}
            </h1>
            <p className="text-muted-foreground">
              Public events appear on /events and the homepage upcoming strip.
            </p>
          </div>
          {isEdit && (
            <Button asChild type="button" variant="outline" size="sm">
              <Link href={`/admin/events/${eventData!.id}/registrations`}>
                <ListChecks className="h-4 w-4 mr-2" />
                Registrations
              </Link>
            </Button>
          )}
        </div>
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
              placeholder="Annual Toy Drive"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Event type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                Used as a filter chip on the public /events page.
              </p>
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
                defaultValue={toLocalInputValue(eventData?.date)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={eventData?.description || ""}
              placeholder="What attendees will experience and how they can help."
            />
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
            <Label>Cover image</Label>
            <FileUpload
              value={imageUrl}
              onChange={setImageUrl}
              folder="events"
              accept="image"
              previewClassName="h-40"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Shown whole (never cropped) on the event page and cards, so a
              flyer stays readable.
            </p>
            {imageUrl && (
              <div className="mt-3 flex items-start gap-3 rounded-lg border bg-slate-50/60 p-3">
                <Switch
                  checked={allowFlyerDownload}
                  onCheckedChange={setAllowFlyerDownload}
                />
                <div>
                  <p className="text-sm font-medium">
                    Let visitors download this image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Adds a &quot;Download flyer&quot; button to the event page
                    so people can save and share it.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registration / sign-up sheet</CardTitle>
          <CardDescription>
            Pick a registration mode and the public event page will show the
            matching sign-up form. Submissions land in the event&apos;s
            Registrations tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Registration type</Label>
            <Select
              value={registrationType}
              onValueChange={(v) => setRegistrationType(v as RegistrationType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGISTRATION_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">
              <strong>None</strong> shows just &quot;Learn More&quot;.{" "}
              <strong>RSVP</strong> captures attendee + guest count.{" "}
              <strong>Volunteer</strong> captures contact + notes.{" "}
              <strong>Toy request</strong> captures parent contact + a list of
              children (name, age) — at least one child is required.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="registration_deadline">
                Registration deadline (optional)
              </Label>
              <Input
                id="registration_deadline"
                name="registration_deadline"
                type="datetime-local"
                defaultValue={toLocalInputValue(eventData?.registration_deadline)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Form is hidden after this time. Leave blank to allow signups
                until the event date.
              </p>
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
              <p className="mt-1 text-xs text-muted-foreground">
                Once reached, new signups go to the waitlist (admin still sees
                them).
              </p>
            </div>
          </div>

          {registrationType === "none" && (
            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={registrationRequired}
                onCheckedChange={setRegistrationRequired}
              />
              <div>
                <p className="text-sm font-medium">CTA labelled as &quot;Register&quot;</p>
                <p className="text-xs text-muted-foreground">
                  Display only — visitors are pointed at /contact for offline
                  signup.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={published} onCheckedChange={setPublished} />
            <div>
              <p className="font-medium text-sm">
                {published ? "Published" : "Draft"}
              </p>
              <p className="text-xs text-muted-foreground">
                {published
                  ? "Visible on /events and the homepage."
                  : "Hidden from the public site."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t pt-4">
            <Switch
              checked={published && featuredOnHome}
              disabled={!published}
              onCheckedChange={setFeaturedOnHome}
            />
            <div>
              <p className="font-medium text-sm">Feature in the homepage hero</p>
              <p className="text-xs text-muted-foreground">
                {published
                  ? "Adds this event as a slide at the front of the homepage hero slider, using its cover image. The slide disappears on its own once the event date passes."
                  : "Publish the event first to feature it."}
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
