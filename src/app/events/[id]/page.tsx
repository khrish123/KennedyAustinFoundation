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
  Download,
  Hourglass,
  Maximize2,
  Tag,
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

function formatDateTime(iso: string) {
  return `${formatDate(iso)} at ${formatTime(iso)}`
}

function hasPassed(iso: string) {
  return new Date(iso).getTime() < new Date().getTime()
}

function mapsUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
}

const REGISTRATION_BLURBS: Record<string, string> = {
  rsvp: "RSVP below so we know to save you a seat.",
  volunteer: "Sign up below to volunteer at this event.",
  toy_request: "Parents can request gifts for their children using the form below.",
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

  const isPast = hasPassed(event.date)

  const deadlinePassed =
    isPast || (!!event.registration_deadline && hasPassed(event.registration_deadline))

  const acceptsRegistrations =
    event.registration_type !== "none" && !deadlinePassed

  const typeLabel = eventTypeLabel(event.event_type)
  const typeBadge = eventTypeBadgeClass(event.event_type)

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {event.image_url && (
          <div className="relative overflow-hidden bg-slate-100">
            {/* Blurred copy fills the band so the flyer itself is never cropped */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.image_url}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl opacity-60"
            />
            <div className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
              <a
                href={event.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl overflow-hidden bg-white shadow-warm-lg"
                title="Open the full-size flyer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.image_url}
                  alt={`${event.title} flyer`}
                  className="w-full max-h-[36rem] object-contain"
                />
              </a>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Button asChild size="sm" variant="secondary">
                  <a href={`/api/events/${event.id}/flyer`} download>
                    <Download className="h-4 w-4 mr-2" />
                    Download flyer
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a
                    href={event.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    View full size
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}

        <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <Link
              href="/events"
              className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              All events
            </Link>
            <Badge className={`${typeBadge} text-xs border`}>{typeLabel}</Badge>
            {isPast && <Badge variant="secondary" className="text-xs">Past event</Badge>}
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-6">
            {event.title}
          </h1>

          <Card className="mb-8 border-slate-100 shadow-warm">
            <CardContent className="grid gap-4 py-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-0.5 text-teal-700 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Date</p>
                  <p className="text-sm text-slate-800">{formatDate(event.date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 mt-0.5 text-teal-700 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Time</p>
                  <p className="text-sm text-slate-800">{formatTime(event.date)}</p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 text-teal-700 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Location
                    </p>
                    <p className="text-sm text-slate-800">{event.location}</p>
                    <a
                      href={mapsUrl(event.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-teal-700 hover:underline"
                    >
                      Get directions
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Tag className="h-4 w-4 mt-0.5 text-teal-700 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Event type
                  </p>
                  <p className="text-sm text-slate-800">{typeLabel}</p>
                </div>
              </div>

              {event.max_attendees && (
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 mt-0.5 text-teal-700 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Capacity
                    </p>
                    <p className="text-sm text-slate-800">
                      {remaining ?? 0} of {event.max_attendees} spots open
                    </p>
                  </div>
                </div>
              )}

              {event.registration_deadline && (
                <div className="flex items-start gap-3">
                  <Hourglass className="h-4 w-4 mt-0.5 text-teal-700 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {deadlinePassed ? "Signups closed" : "Sign up by"}
                    </p>
                    <p className="text-sm text-slate-800">
                      {formatDateTime(event.registration_deadline)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {event.description ? (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                About this event
              </h2>
              <p className="text-slate-700 leading-7 whitespace-pre-line">
                {event.description}
              </p>
            </div>
          ) : (
            <p className="text-slate-600 leading-7 mb-8">
              {event.image_url
                ? "Full details are on the flyer above."
                : "More details are coming soon."}{" "}
              Questions? <Link href="/contact" className="text-teal-700 font-medium hover:underline">Get in touch</Link> or call{" "}
              <a href="tel:909-808-6866" className="text-teal-700 font-medium hover:underline">
                909-808-6866
              </a>
              .
            </p>
          )}

          {acceptsRegistrations && REGISTRATION_BLURBS[event.registration_type] && (
            <p className="text-sm text-slate-600 mb-2">
              {REGISTRATION_BLURBS[event.registration_type]}
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
                  {isPast
                    ? "This event has already taken place. Get in touch to hear about the next one."
                    : "The signup deadline for this event has passed. Get in touch with the foundation if you'd like to participate."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/contact">Contact us</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {event.registration_type === "none" &&
            event.registration_required &&
            !isPast && (
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
