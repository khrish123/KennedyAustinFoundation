import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  AlertCircle,
} from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  getEventById,
  getRegistrationCountForEvent,
} from "@/lib/queries/events"
import {
  eventTypeBadgeClass,
  eventTypeLabel,
} from "@/types/events"
import { RegistrationForm } from "@/components/events/registration-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const event = await getEventById(id)
  if (!event) return { title: "Event not found" }
  return {
    title: event.title,
    description: event.description ?? undefined,
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params
  const event = await getEventById(id)
  if (!event) notFound()
  if (!event.is_published) notFound()

  const signupCount = await getRegistrationCountForEvent(id)
  const remaining = event.max_attendees
    ? Math.max(0, event.max_attendees - signupCount)
    : null

  const deadlinePassed =
    event.registration_deadline &&
    new Date(event.registration_deadline).getTime() < Date.now()

  const acceptsRegistrations =
    event.registration_type !== "none" && !deadlinePassed

  const typeLabel = eventTypeLabel(event.event_type)
  const typeBadge = eventTypeBadgeClass(event.event_type)

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {event.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.image_url}
            alt=""
            className="w-full h-64 sm:h-80 object-cover"
          />
        )}

        <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/events"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-3"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            All events
          </Link>

          <Badge className={`${typeBadge} text-xs border mb-3`}>{typeLabel}</Badge>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-700 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-700" />
              {formatDate(event.date)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-700" />
              {formatTime(event.date)}
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-teal-700" />
                {event.location}
              </div>
            )}
            {event.max_attendees && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-700" />
                {remaining ?? 0} of {event.max_attendees} spots open
              </div>
            )}
          </div>

          {event.description && (
            <p className="text-slate-700 leading-7 whitespace-pre-line mb-8">
              {event.description}
            </p>
          )}

          <Separator className="my-8" />

          {acceptsRegistrations && (
            <RegistrationForm
              eventId={event.id}
              eventTitle={event.title}
              registrationType={
                event.registration_type as "rsvp" | "volunteer" | "toy_request"
              }
            />
          )}

          {event.registration_type !== "none" && deadlinePassed && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900 text-lg">
                  <AlertCircle className="h-5 w-5" />
                  Registration is closed
                </CardTitle>
                <CardDescription className="text-amber-900/80">
                  The signup deadline for this event has passed. Get in touch
                  with the foundation if you&apos;d like to participate.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/contact">Contact us</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {event.registration_type === "none" && event.registration_required && (
            <Card>
              <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>
                  Reach out to reserve your spot — we&apos;ll get back to you
                  within one business day.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/contact">Contact us to register</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
